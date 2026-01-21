/*
 * DuplicateWorker.ets - 文件去重扫描 Worker 线程
 *
 * 该 Worker 负责在后台线程执行耗时的文件扫描和哈希计算操作，
 * 避免阻塞主线程（UI线程），保证界面流畅响应。
 *
 * 通信协议：
 * - 主线程 -> Worker: { type: 'SCAN', filesDir: string }
 * - Worker -> 主线程: { type: 'PROGRESS', current: number, total: number }
 * - Worker -> 主线程: { type: 'GROUP_FOUND', group: DuplicateGroup }
 * - Worker -> 主线程: { type: 'COMPLETE', result: ScanResult }
 * - Worker -> 主线程: { type: 'ERROR', error: string }
 */

import { worker, MessageEvents, ErrorEvent } from '@kit.ArkTS';
import { fileIo } from '@kit.CoreFileKit';

// Worker 端口，用于与主线程通信
const workerPort = worker.workerPort;

// ==================== 数据结构定义 ====================

// 重复文件信息
interface DuplicateFileInfo {
  filename: string;
  size: number;
  sizeReadable: string;
  mtime: number;
  mtimeFormatted: string;
  path: string;
  isNew?: boolean;
}

// 重复文件组
interface DuplicateGroup {
  hash: string;
  files: DuplicateFileInfo[];
  totalSize: number;
  wasteSize: number;
  changeStatus?: string;
  changeCount?: number;
}

// 扫描结果
interface ScanResult {
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;
  totalWasteSize: number;
  totalWasteSizeReadable: string;
  scannedFiles: number;
  scanTime: number;
  isIncremental: boolean;
  changedFiles: number;
}

// 文件指纹
interface FileFingerprint {
  filename: string;
  size: number;
  mtime: number;
  hash: string;
}

// Worker 接收的消息类型
interface WorkerMessage {
  type: string;
  filesDir?: string;
}

// ==================== 工具函数 ====================

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes: string[] = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * 格式化日期时间
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 计算文件内容的哈希值（三重哈希算法）
 *
 * 算法原理：
 * 1. 读取文件前1MB内容（大文件性能优化）
 * 2. 使用三种不同的哈希算法计算：
 *    - hash1: 字节简单累加
 *    - hash2: 带位置权重的累加（位置敏感）
 *    - hash3: 异或运算（位模式敏感）
 * 3. 组合文件大小 + 三个哈希值，形成唯一标识
 */
function calculateHash(filePath: string): string {
  try {
    const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
    const stat = fileIo.statSync(filePath);

    // 对于大文件，只读取前1MB来计算hash（性能优化）
    const maxReadSize = 1024 * 1024;
    const readSize = Math.min(stat.size, maxReadSize);
    const buffer = new ArrayBuffer(readSize);
    fileIo.readSync(file.fd, buffer);
    fileIo.closeSync(file);

    // 三重哈希算法
    const uint8Array = new Uint8Array(buffer);
    let hash1 = 0;  // 简单累加
    let hash2 = 0;  // 带位置权重的累加
    let hash3 = 0;  // 异或运算

    for (let i = 0; i < uint8Array.length; i++) {
      hash1 = (hash1 + uint8Array[i]) >>> 0;
      hash2 = (hash2 + uint8Array[i] * (i + 1)) >>> 0;
      hash3 = (hash3 ^ (uint8Array[i] << (i % 24))) >>> 0;
    }

    // 组合hash值和文件大小
    return `${stat.size}_${hash1.toString(16)}_${hash2.toString(16)}_${hash3.toString(16)}`;
  } catch (error) {
    console.error(`Worker: 计算文件hash失败: ${filePath}, ${error}`);
    return '';
  }
}

/**
 * 获取所有待扫描文件（只获取.txt文件，排除隐藏和系统文件）
 */
function getAllFiles(filesDir: string): string[] {
  try {
    const files = fileIo.listFileSync(filesDir);
    // 过滤条件：排除.开头的隐藏文件、_开头的系统文件，只保留.txt文件
    return files.filter((f: string) => !f.startsWith('.') && !f.startsWith('_') && f.endsWith('.txt'));
  } catch (error) {
    console.error(`Worker: 获取文件列表失败: ${error}`);
    return [];
  }
}

/**
 * 执行全量扫描（Worker线程版本）
 *
 * 核心流程：
 * 1. 获取所有待扫描文件列表
 * 2. 逐个计算文件哈希值
 * 3. 按哈希值分组，发现重复组时立即通知主线程
 * 4. 定期发送进度更新
 * 5. 扫描完成后发送完整结果
 */
function performFullScan(filesDir: string): void {
  const startTime = Date.now();
  const files = getAllFiles(filesDir);
  const hashMap: Map<string, DuplicateFileInfo[]> = new Map();
  const fingerprints: FileFingerprint[] = [];
  const totalFiles = files.length;
  const reportedGroups: string[] = [];  // 已报告的重复组hash列表

  console.info(`Worker: 开始扫描，共 ${totalFiles} 个文件`);

  // 逐个处理文件
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = `${filesDir}/${filename}`;

    try {
      const stat = fileIo.statSync(filePath);
      const hash = calculateHash(filePath);

      if (hash) {
        const fileInfo: DuplicateFileInfo = {
          filename: filename,
          size: stat.size,
          sizeReadable: formatFileSize(stat.size),
          mtime: stat.mtime,
          mtimeFormatted: formatDate(stat.mtime),
          path: filePath
        };

        // 添加到hash映射
        if (hashMap.has(hash)) {
          hashMap.get(hash)!.push(fileInfo);
        } else {
          hashMap.set(hash, [fileInfo]);
        }

        // 记录指纹
        fingerprints.push({
          filename: filename,
          size: stat.size,
          mtime: stat.mtime,
          hash: hash
        });

        // 检查是否形成新的重复组
        const filesWithSameHash = hashMap.get(hash)!;
        if (filesWithSameHash.length === 2 && reportedGroups.indexOf(hash) === -1) {
          // 刚好形成重复组（第2个相同哈希的文件），立即报告
          const totalSize = filesWithSameHash.reduce((sum, f) => sum + f.size, 0);
          const wasteSize = totalSize - filesWithSameHash[0].size;

          const group: DuplicateGroup = {
            hash: hash,
            files: filesWithSameHash.slice().sort((a, b) => a.mtime - b.mtime),
            totalSize: totalSize,
            wasteSize: wasteSize
          };

          reportedGroups.push(hash);

          // 通知主线程发现了新的重复组
          workerPort.postMessage({
            type: 'GROUP_FOUND',
            group: group
          });
        } else if (filesWithSameHash.length > 2 && reportedGroups.indexOf(hash) >= 0) {
          // 重复组增加了新文件，更新报告
          const totalSize = filesWithSameHash.reduce((sum, f) => sum + f.size, 0);
          const wasteSize = totalSize - filesWithSameHash[0].size;

          const group: DuplicateGroup = {
            hash: hash,
            files: filesWithSameHash.slice().sort((a, b) => a.mtime - b.mtime),
            totalSize: totalSize,
            wasteSize: wasteSize
          };

          workerPort.postMessage({
            type: 'GROUP_FOUND',
            group: group
          });
        }
      }
    } catch (error) {
      console.warn(`Worker: 处理文件失败: ${filename}, ${error}`);
    }

    // 每处理5个文件或最后一个文件时，发送进度更新
    if ((i + 1) % 5 === 0 || i === files.length - 1) {
      workerPort.postMessage({
        type: 'PROGRESS',
        current: i + 1,
        total: totalFiles
      });
    }
  }

  // 构建最终结果
  const duplicateGroups: DuplicateGroup[] = [];
  let totalDuplicates = 0;
  let totalWasteSize = 0;

  hashMap.forEach((files, hash) => {
    if (files.length > 1) {
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      const wasteSize = totalSize - files[0].size;

      duplicateGroups.push({
        hash: hash,
        files: files.sort((a, b) => a.mtime - b.mtime),
        totalSize: totalSize,
        wasteSize: wasteSize
      });

      totalDuplicates += files.length;
      totalWasteSize += wasteSize;
    }
  });

  // 按浪费空间降序排序
  duplicateGroups.sort((a, b) => b.wasteSize - a.wasteSize);

  const scanTime = Date.now() - startTime;

  const result: ScanResult = {
    duplicateGroups: duplicateGroups,
    totalDuplicates: totalDuplicates,
    totalWasteSize: totalWasteSize,
    totalWasteSizeReadable: formatFileSize(totalWasteSize),
    scannedFiles: files.length,
    scanTime: scanTime,
    isIncremental: false,
    changedFiles: 0
  };

  console.info(`Worker: 扫描完成，耗时 ${scanTime}ms，发现 ${duplicateGroups.length} 组重复文件`);

  // 发送完成消息
  workerPort.postMessage({
    type: 'COMPLETE',
    result: result,
    fingerprints: fingerprints
  });
}

// ==================== Worker 消息处理 ====================

/**
 * 监听主线程发来的消息
 */
workerPort.onmessage = (e: MessageEvents): void => {
  const message = e.data as WorkerMessage;
  console.info(`Worker: 收到消息 type=${message.type}`);

  switch (message.type) {
    case 'SCAN':
      // 执行扫描任务
      if (message.filesDir) {
        try {
          performFullScan(message.filesDir);
        } catch (error) {
          workerPort.postMessage({
            type: 'ERROR',
            error: `扫描失败: ${error}`
          });
        }
      } else {
        workerPort.postMessage({
          type: 'ERROR',
          error: '未提供 filesDir 参数'
        });
      }
      break;

    default:
      console.warn(`Worker: 未知消息类型: ${message.type}`);
  }
};

/**
 * 监听错误事件
 */
workerPort.onmessageerror = (e: MessageEvents): void => {
  console.error(`Worker: 消息错误: ${e.data}`);
};
