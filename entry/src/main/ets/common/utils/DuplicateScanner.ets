/*
 * 文件去重扫描工具类 - 实现重复文件检测和分组
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { TrashManager } from './TrashManager';

// 重复文件组
export interface DuplicateGroup {
  hash: string;              // 文件内容hash
  files: DuplicateFileInfo[]; // 该组中的文件列表
  totalSize: number;         // 该组总大小
  wasteSize: number;         // 浪费的空间（总大小 - 单文件大小）
  changeStatus?: string;     // 变更状态：'new' | 'increased' | 'decreased' | null
  changeCount?: number;      // 变更数量
}

// 重复文件信息
export interface DuplicateFileInfo {
  filename: string;
  size: number;
  sizeReadable: string;
  mtime: number;
  mtimeFormatted: string;
  path: string;
  isNew?: boolean;           // 是否为新增文件
}

// 扫描结果
export interface ScanResult {
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;   // 重复文件总数
  totalWasteSize: number;    // 总浪费空间
  totalWasteSizeReadable: string;
  scannedFiles: number;      // 扫描的文件总数
  scanTime: number;          // 扫描耗时（毫秒）
  isIncremental: boolean;    // 是否为增量扫描
  changedFiles: number;      // 变更的文件数量
}

// 文件指纹（用于增量扫描）
interface FileFingerprint {
  filename: string;
  size: number;
  mtime: number;
  hash: string;
}

// 扫描状态（用于持久化）
export interface ScanState {
  lastScanTime: number;
  fingerprints: FileFingerprint[];
  duplicateGroups: DuplicateGroup[];
}

export class DuplicateScanner {
  private context: Context;
  private filesDir: string;
  private stateFilePath: string;
  private static instance: DuplicateScanner | null = null;

  constructor(context: Context) {
    this.context = context;
    const uiAbilityContext = context as common.UIAbilityContext;
    this.filesDir = uiAbilityContext.filesDir;
    this.stateFilePath = this.filesDir + '/.scan_state.json';
  }

  // 获取单例实例
  static getInstance(context: Context): DuplicateScanner {
    if (!DuplicateScanner.instance) {
      DuplicateScanner.instance = new DuplicateScanner(context);
    }
    return DuplicateScanner.instance;
  }

  /**
   * 计算文件内容的简单hash
   * 使用文件内容的字符码累加和作为hash（简化版本）
   */
  private calculateHash(filePath: string): string {
    try {
      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(filePath);

      // 对于大文件，只读取部分内容来计算hash
      const maxReadSize = 1024 * 1024; // 最大读取1MB
      const readSize = Math.min(stat.size, maxReadSize);
      const buffer = new ArrayBuffer(readSize);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      // 计算简单hash
      const uint8Array = new Uint8Array(buffer);
      let hash1 = 0;
      let hash2 = 0;
      let hash3 = 0;

      for (let i = 0; i < uint8Array.length; i++) {
        hash1 = (hash1 + uint8Array[i]) >>> 0;
        hash2 = (hash2 + uint8Array[i] * (i + 1)) >>> 0;
        hash3 = (hash3 ^ (uint8Array[i] << (i % 24))) >>> 0;
      }

      // 组合hash值和文件大小
      return `${stat.size}_${hash1.toString(16)}_${hash2.toString(16)}_${hash3.toString(16)}`;
    } catch (error) {
      console.error(`计算文件hash失败: ${filePath}, ${error}`);
      return '';
    }
  }

  // 格式化文件大小
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  // 格式化时间
  private formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  /**
   * 读取保存的扫描状态
   */
  private readScanState(): ScanState | null {
    try {
      if (!fileIo.accessSync(this.stateFilePath)) {
        return null;
      }

      const file = fileIo.openSync(this.stateFilePath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(this.stateFilePath);
      const buffer = new ArrayBuffer(stat.size);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      const uint8Array = new Uint8Array(buffer);
      let content = '';
      for (let i = 0; i < uint8Array.length; i++) {
        content += String.fromCharCode(uint8Array[i]);
      }

      return JSON.parse(content) as ScanState;
    } catch (error) {
      console.error(`读取扫描状态失败: ${error}`);
      return null;
    }
  }

  /**
   * 保存扫描状态
   */
  private saveScanState(state: ScanState): void {
    try {
      const content = JSON.stringify(state, null, 2);
      const stream = fileIo.createStreamSync(this.stateFilePath, 'w+');
      stream.writeSync(content);
      stream.closeSync();
    } catch (error) {
      console.error(`保存扫描状态失败: ${error}`);
    }
  }

  /**
   * 获取所有文件列表（排除系统文件）
   */
  private getAllFiles(): string[] {
    try {
      const files = fileIo.listFileSync(this.filesDir);
      // 排除隐藏文件和系统文件
      return files.filter(f => !f.startsWith('.') && !f.startsWith('_'));
    } catch (error) {
      console.error(`获取文件列表失败: ${error}`);
      return [];
    }
  }

  /**
   * 执行全量扫描
   */
  fullScan(): ScanResult {
    const startTime = Date.now();
    const files = this.getAllFiles();
    const hashMap: Map<string, DuplicateFileInfo[]> = new Map();
    const fingerprints: FileFingerprint[] = [];

    // 计算每个文件的hash并分组
    for (const filename of files) {
      const filePath = `${this.filesDir}/${filename}`;
      try {
        const stat = fileIo.statSync(filePath);
        const hash = this.calculateHash(filePath);

        if (!hash) continue;

        const fileInfo: DuplicateFileInfo = {
          filename: filename,
          size: stat.size,
          sizeReadable: this.formatFileSize(stat.size),
          mtime: stat.mtime,
          mtimeFormatted: this.formatDate(stat.mtime),
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
      } catch (error) {
        console.warn(`处理文件失败: ${filename}, ${error}`);
      }
    }

    // 构建重复组（只包含有重复的文件）
    const duplicateGroups: DuplicateGroup[] = [];
    let totalDuplicates = 0;
    let totalWasteSize = 0;

    hashMap.forEach((files, hash) => {
      if (files.length > 1) {
        const totalSize = files.reduce((sum, f) => sum + f.size, 0);
        const wasteSize = totalSize - files[0].size; // 浪费空间 = 总大小 - 保留一份的大小

        duplicateGroups.push({
          hash: hash,
          files: files.sort((a, b) => a.mtime - b.mtime), // 按创建时间排序，最早的在前
          totalSize: totalSize,
          wasteSize: wasteSize
        });

        totalDuplicates += files.length;
        totalWasteSize += wasteSize;
      }
    });

    // 按浪费空间排序
    duplicateGroups.sort((a, b) => b.wasteSize - a.wasteSize);

    const scanTime = Date.now() - startTime;

    // 保存扫描状态
    this.saveScanState({
      lastScanTime: Date.now(),
      fingerprints: fingerprints,
      duplicateGroups: duplicateGroups
    });

    return {
      duplicateGroups: duplicateGroups,
      totalDuplicates: totalDuplicates,
      totalWasteSize: totalWasteSize,
      totalWasteSizeReadable: this.formatFileSize(totalWasteSize),
      scannedFiles: files.length,
      scanTime: scanTime,
      isIncremental: false,
      changedFiles: 0
    };
  }

  /**
   * 执行增量扫描
   * 只扫描自上次扫描后变更的文件
   */
  incrementalScan(): ScanResult {
    const previousState = this.readScanState();

    if (!previousState) {
      // 如果没有之前的扫描状态，执行全量扫描
      return this.fullScan();
    }

    const startTime = Date.now();
    const currentFiles = this.getAllFiles();

    // 手动构建 Map
    const previousFingerprints: Map<string, FileFingerprint> = new Map();
    for (const f of previousState.fingerprints) {
      previousFingerprints.set(f.filename, f);
    }

    const previousGroups: Map<string, DuplicateGroup> = new Map();
    for (const g of previousState.duplicateGroups) {
      previousGroups.set(g.hash, g);
    }

    const changedFiles: string[] = [];
    const newFiles: string[] = [];
    const deletedFiles: string[] = [];

    // 检测新增和修改的文件
    for (const filename of currentFiles) {
      const filePath = `${this.filesDir}/${filename}`;
      try {
        const stat = fileIo.statSync(filePath);
        const prevFingerprint = previousFingerprints.get(filename);

        if (!prevFingerprint) {
          // 新增文件
          newFiles.push(filename);
          changedFiles.push(filename);
        } else if (stat.size !== prevFingerprint.size || stat.mtime !== prevFingerprint.mtime) {
          // 修改的文件
          changedFiles.push(filename);
        }
      } catch (error) {
        console.warn(`检查文件变更失败: ${filename}`);
      }
    }

    // 检测删除的文件
    previousFingerprints.forEach((value, filename) => {
      if (!currentFiles.includes(filename)) {
        deletedFiles.push(filename);
        changedFiles.push(filename);
      }
    });

    // 如果没有变更，返回之前的结果
    if (changedFiles.length === 0) {
      return {
        duplicateGroups: previousState.duplicateGroups,
        totalDuplicates: previousState.duplicateGroups.reduce((sum, g) => sum + g.files.length, 0),
        totalWasteSize: previousState.duplicateGroups.reduce((sum, g) => sum + g.wasteSize, 0),
        totalWasteSizeReadable: this.formatFileSize(
          previousState.duplicateGroups.reduce((sum, g) => sum + g.wasteSize, 0)
        ),
        scannedFiles: currentFiles.length,
        scanTime: Date.now() - startTime,
        isIncremental: true,
        changedFiles: 0
      };
    }

    // 执行全量扫描但保留变更信息
    const fullResult = this.fullScan();

    // 标记变更状态
    for (const group of fullResult.duplicateGroups) {
      const prevGroup = previousGroups.get(group.hash);

      // 标记新增的文件
      for (const file of group.files) {
        if (newFiles.includes(file.filename)) {
          file.isNew = true;
        }
      }

      if (!prevGroup) {
        // 新的重复组
        group.changeStatus = 'new';
        group.changeCount = group.files.length;
      } else if (group.files.length > prevGroup.files.length) {
        // 重复数增加
        group.changeStatus = 'increased';
        group.changeCount = group.files.length - prevGroup.files.length;
      } else if (group.files.length < prevGroup.files.length) {
        // 重复数减少
        group.changeStatus = 'decreased';
        group.changeCount = prevGroup.files.length - group.files.length;
      }
    }

    return {
      duplicateGroups: fullResult.duplicateGroups,
      totalDuplicates: fullResult.totalDuplicates,
      totalWasteSize: fullResult.totalWasteSize,
      totalWasteSizeReadable: fullResult.totalWasteSizeReadable,
      scannedFiles: fullResult.scannedFiles,
      scanTime: fullResult.scanTime,
      isIncremental: true,
      changedFiles: changedFiles.length
    };
  }

  /**
   * 一键去重 - 删除每组中除第一个以外的所有文件
   * @returns 删除的文件数量
   */
  deduplicateAll(): number {
    const trashManager = TrashManager.getInstance(this.context);
    const scanResult = this.fullScan();
    let deletedCount = 0;

    for (const group of scanResult.duplicateGroups) {
      // 保留第一个（最早的），删除其他的
      for (let i = 1; i < group.files.length; i++) {
        const success = trashManager.moveToTrash(group.files[i].filename, 'dedup');
        if (success) {
          deletedCount++;
        }
      }
    }

    // 删除后重新扫描以更新状态
    this.fullScan();

    return deletedCount;
  }

  /**
   * 删除指定重复组中除保留文件外的所有文件
   * @param hash 重复组的hash
   * @param keepFilename 要保留的文件名
   * @returns 删除的文件数量
   */
  deduplicateGroup(hash: string, keepFilename: string): number {
    const trashManager = TrashManager.getInstance(this.context);
    const scanResult = this.fullScan();
    const group = scanResult.duplicateGroups.find(g => g.hash === hash);

    if (!group) {
      console.error(`未找到重复组: ${hash}`);
      return 0;
    }

    let deletedCount = 0;
    for (const file of group.files) {
      if (file.filename !== keepFilename) {
        const success = trashManager.moveToTrash(file.filename, 'dedup');
        if (success) {
          deletedCount++;
        }
      }
    }

    // 删除后重新扫描以更新状态
    this.fullScan();

    return deletedCount;
  }

  /**
   * 获取上次扫描时间
   */
  getLastScanTime(): number | null {
    const state = this.readScanState();
    if (state && state.lastScanTime) {
      return state.lastScanTime;
    }
    return null;
  }

  /**
   * 格式化上次扫描时间
   */
  getLastScanTimeFormatted(): string {
    const lastScanTime = this.getLastScanTime();
    if (!lastScanTime) {
      return '从未扫描';
    }
    return this.formatDate(lastScanTime);
  }

  /**
   * 清除扫描状态
   */
  clearScanState(): void {
    try {
      if (fileIo.accessSync(this.stateFilePath)) {
        fileIo.unlinkSync(this.stateFilePath);
      }
    } catch (error) {
      console.error(`清除扫描状态失败: ${error}`);
    }
  }
}
