/*
 * 文件去重管理器 - 实现重复文件检测与删除
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { util } from '@kit.ArkTS';

/**
 * 文件信息接口
 */
export interface FileItem {
  path: string;           // 完整路径
  filename: string;       // 文件名
  size: number;           // 文件大小（字节）
  sizeReadable: string;   // 可读的文件大小
  selected: boolean;      // 是否被选中保留
}

/**
 * 重复文件组接口
 */
export interface DuplicateGroup {
  hash: string;           // 文件哈希值
  size: number;           // 文件大小
  sizeReadable: string;   // 可读的文件大小
  files: FileItem[];      // 重复文件列表
  expanded: boolean;      // UI展开状态
}

/**
 * 扫描结果接口
 */
export interface ScanResult {
  totalFiles: number;           // 总文件数
  duplicateGroups: number;      // 重复组数量
  duplicateFiles: number;       // 重复文件数量
  savableSpace: number;         // 可节省空间（字节）
  savableSpaceReadable: string; // 可读的可节省空间
}

/**
 * 目录信息接口
 */
export interface DirectoryInfo {
  path: string;
  name: string;
  selected: boolean;
}

/**
 * 回收站文件信息
 */
export interface TrashItem {
  trashPath: string;      // 回收站中的路径
  originalPath: string;   // 原始路径
  filename: string;       // 文件名
  size: number;           // 文件大小
  sizeReadable: string;   // 可读大小
  deleteTime: number;     // 删除时间戳
  deleteTimeReadable: string; // 可读删除时间
}

/**
 * 增量扫描结果接口
 */
export interface IncrementalScanResult extends ScanResult {
  isIncremental: boolean;       // 是否增量扫描
  scannedFiles: number;         // 本次扫描文件数
  newDuplicateGroups: number;   // 新增重复组数
}

/**
 * 文件夹导入结果
 */
export interface ImportDirectoryResult {
  totalFiles: number;     // 发现文件数
  importedFiles: number;  // 成功导入数
  skippedFiles: number;   // 失败或跳过数
}

interface FileStatInfo {
  mtime: number;
  size: number;
  ctime: number;
}

interface TrashPathInfo {
  trashPath: string;
  finalName: string;
}

interface FileEntry {
  path: string;
  size: number;
  mtime: number;
  ctime: number;
  hash: string;
}

/**
 * 文件去重管理器
 */
export class DeduplicationManager {
  private context: Context;
  private filesDir: string;
  private trashDir: string;
  private duplicateGroups: DuplicateGroup[] = [];
  private trashItems: TrashItem[] = [];
  private lastScanTime: number = 0;
  private lastScanFileHashes: Map<string, string> = new Map(); // path -> hash
  private lastScanFileStats: Map<string, FileStatInfo> = new Map(); // path -> stat

  constructor(context: Context) {
    this.context = context;
    this.filesDir = this.getFilesDir();
    this.trashDir = `${this.filesDir}/.trash`;
    this.initTrashDir();
    this.loadTrashItems();
  }

  /**
   * 获取沙箱文件目录
   */
  private getFilesDir(): string {
    try {
      const uiAbilityContext = this.context as common.UIAbilityContext;
      return uiAbilityContext.filesDir;
    } catch (error) {
      console.error('获取文件目录失败:', error);
      return '';
    }
  }

  /**
   * 初始化回收站目录
   */
  private initTrashDir(): void {
    try {
      try {
        fileIo.statSync(this.trashDir);
      } catch (e) {
        fileIo.mkdirSync(this.trashDir);
        console.log('创建回收站目录:', this.trashDir);
      }
    } catch (error) {
      console.error('初始化回收站失败:', error);
    }
  }

  /**
   * 加载回收站文件列表
   */
  private loadTrashItems(): void {
    try {
      this.trashItems = [];
      const files = fileIo.listFileSync(this.trashDir);

      for (const file of files) {
        if (file.endsWith('.meta')) continue; // 跳过元数据文件

        const trashPath = `${this.trashDir}/${file}`;
        const metaPath = `${trashPath}.meta`;

        try {
          const stat = fileIo.statSync(trashPath);

          // 读取元数据
          let originalPath = '';
          let deleteTime = stat.mtime;
          try {
            const metaFile = fileIo.openSync(metaPath, fileIo.OpenMode.READ_ONLY);
            const buffer = new ArrayBuffer(1024);
            const len = fileIo.readSync(metaFile.fd, buffer);
            fileIo.closeSync(metaFile);
            const decoder = new util.TextDecoder();
            const metaContent = decoder.decodeToString(new Uint8Array(buffer.slice(0, len)));
            const metaParts = metaContent.split('\n');
            if (metaParts.length >= 2) {
              originalPath = metaParts[0];
              deleteTime = parseInt(metaParts[1]) || stat.mtime;
            }
          } catch (e) {
            originalPath = `${this.filesDir}/${file}`;
          }

          const displayName = originalPath ? (originalPath.split('/').pop() || file) : file;
          this.trashItems.push({
            trashPath: trashPath,
            originalPath: originalPath,
            filename: displayName,
            size: stat.size,
            sizeReadable: this.formatFileSize(stat.size),
            deleteTime: deleteTime,
            deleteTimeReadable: this.formatDateTime(deleteTime)
          });
        } catch (e) {
          console.warn('加载回收站项目失败:', file);
        }
      }

      console.log(`回收站中有 ${this.trashItems.length} 个文件`);
    } catch (error) {
      console.error('加载回收站失败:', error);
    }
  }

  /**
   * 移动文件到回收站
   */
  moveToTrash(filePath: string): boolean {
    try {
      const filename = filePath.split('/').pop() || `file_${Date.now()}`;
      const trashInfo = this.buildUniqueTrashPath(filename);
      const trashPath = trashInfo.trashPath;
      const metaPath = `${trashPath}.meta`;

      // 移动文件到回收站
      fileIo.renameSync(filePath, trashPath);

      // 保存元数据（原始路径和删除时间）
      const deleteTime = Date.now();
      const metaContent = `${filePath}\n${deleteTime}`;
      const metaFile = fileIo.openSync(metaPath, fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY);
      fileIo.writeSync(metaFile.fd, metaContent);
      fileIo.closeSync(metaFile);

      // 添加到内存列表
      const stat = fileIo.statSync(trashPath);
      this.trashItems.push({
        trashPath: trashPath,
        originalPath: filePath,
        filename: trashInfo.finalName,
        size: stat.size,
        sizeReadable: this.formatFileSize(stat.size),
        deleteTime: deleteTime,
        deleteTimeReadable: this.formatDateTime(deleteTime)
      });

      console.log(`文件已移动到回收站: ${trashInfo.finalName}`);
      return true;
    } catch (error) {
      console.error('移动到回收站失败:', error);
      return false;
    }
  }

  /**
   * 为回收站生成唯一文件名
   */
  private buildUniqueTrashPath(filename: string): TrashPathInfo {
    let baseName = filename;
    let ext = '';
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex > 0) {
      baseName = filename.substring(0, dotIndex);
      ext = filename.substring(dotIndex);
    }

    let candidate = filename;
    let counter = 1;
    while (true) {
      const candidatePath = `${this.trashDir}/${candidate}`;
      try {
        fileIo.statSync(candidatePath);
        candidate = `${baseName}_${counter}${ext}`;
        counter++;
      } catch (e) {
        const info: TrashPathInfo = { trashPath: candidatePath, finalName: candidate };
        return info;
      }
    }
  }

  /**
   * 从回收站恢复文件
   */
  restoreFromTrash(trashItem: TrashItem): boolean {
    try {
      // 移动文件回原位置
      fileIo.renameSync(trashItem.trashPath, trashItem.originalPath);

      // 删除元数据文件
      try {
        fileIo.unlinkSync(`${trashItem.trashPath}.meta`);
      } catch (e) {
        // 元数据可能不存在
      }

      // 从列表中移除
      this.trashItems = this.trashItems.filter(item => item.trashPath !== trashItem.trashPath);

      console.log(`文件已恢复: ${trashItem.filename}`);
      return true;
    } catch (error) {
      console.error('恢复文件失败:', error);
      return false;
    }
  }

  /**
   * 获取回收站文件列表
   */
  getTrashItems(): TrashItem[] {
    this.loadTrashItems();
    return this.trashItems;
  }

  /**
   * 清空回收站（永久删除）
   */
  clearTrash(): number {
    let deletedCount = 0;
    for (const item of this.trashItems) {
      try {
        fileIo.unlinkSync(item.trashPath);
        try {
          fileIo.unlinkSync(`${item.trashPath}.meta`);
        } catch (e) {}
        deletedCount++;
      } catch (e) {
        console.warn('永久删除失败:', item.filename);
      }
    }
    this.trashItems = [];
    console.log(`已永久删除 ${deletedCount} 个文件`);
    return deletedCount;
  }

  /**
   * 永久删除单个回收站文件
   */
  permanentDelete(trashItem: TrashItem): boolean {
    try {
      fileIo.unlinkSync(trashItem.trashPath);
      try {
        fileIo.unlinkSync(`${trashItem.trashPath}.meta`);
      } catch (e) {}
      this.trashItems = this.trashItems.filter(item => item.trashPath !== trashItem.trashPath);
      console.log(`已永久删除: ${trashItem.filename}`);
      return true;
    } catch (error) {
      console.error('永久删除失败:', error);
      return false;
    }
  }

  /**
   * 格式化日期时间
   */
  private formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  }

  /**
   * 获取上次扫描时间
   */
  getLastScanTime(): number {
    return this.lastScanTime;
  }

  /**
   * 获取可读的上次扫描时间
   */
  getLastScanTimeReadable(): string {
    if (this.lastScanTime === 0) {
      return '从未扫描';
    }
    return this.formatDateTime(this.lastScanTime);
  }

  /**
   * 获取可扫描的目录列表
   * 由于沙箱限制，只能扫描应用自己的目录
   */
  getAvailableDirectories(): DirectoryInfo[] {
    const dirs: DirectoryInfo[] = [];

    try {
      // 主文件目录
      dirs.push({
        path: this.filesDir,
        name: '应用文件目录',
        selected: true
      });

      // 列出子目录
      const files = fileIo.listFileSync(this.filesDir);
      for (const file of files) {
        const fullPath = `${this.filesDir}/${file}`;
        try {
          const stat = fileIo.statSync(fullPath);
          if (stat.isDirectory()) {
            dirs.push({
              path: fullPath,
              name: file,
              selected: false
            });
          }
        } catch (e) {
          // 跳过无法访问的项
        }
      }
    } catch (error) {
      console.error('获取目录列表失败:', error);
    }

    return dirs;
  }

  /**
   * 获取测试文件夹路径
   */
  getTestFolderPath(): string {
    return `${this.filesDir}/测试数据`;
  }

  /**
   * 创建测试文件夹（如果不存在）
   */
  createTestFolder(): boolean {
    try {
      const testFolderPath = this.getTestFolderPath();

      // 检查是否已存在
      try {
        const stat = fileIo.statSync(testFolderPath);
        if (stat.isDirectory()) {
          console.log('测试文件夹已存在');
          return true;
        }
      } catch (e) {
        // 不存在，继续创建
      }

      // 创建文件夹
      fileIo.mkdirSync(testFolderPath);
      console.log('测试文件夹创建成功:', testFolderPath);
      return true;
    } catch (error) {
      console.error('创建测试文件夹失败:', error);
      return false;
    }
  }

  /**
   * 将选中的文件复制到测试文件夹
   * @param sourceUri 源文件URI
   * @param fileName 目标文件名
   */
  async importFileToTestFolder(sourceUri: string, fileName: string): Promise<boolean> {
    try {
      // 确保测试文件夹存在
      this.createTestFolder();

      const testFolderPath = this.getTestFolderPath();
      const targetPath = `${testFolderPath}/${fileName}`;

      console.log(`导入文件: ${sourceUri} -> ${targetPath}`);

      // 打开源文件
      const sourceFile = fileIo.openSync(sourceUri, fileIo.OpenMode.READ_ONLY);

      // 使用文件描述符获取文件大小
      const sourceStat = fileIo.statSync(sourceFile.fd);
      const fileSize = sourceStat.size;

      console.log(`源文件大小: ${fileSize} 字节`);

      if (fileSize === 0) {
        // 创建空文件
        const targetFile = fileIo.openSync(targetPath, fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY | fileIo.OpenMode.TRUNC);
        fileIo.closeSync(targetFile);
        fileIo.closeSync(sourceFile);
        console.log(`创建空文件成功: ${fileName}`);
        return true;
      }

      // 读取源文件内容
      const buffer = new ArrayBuffer(fileSize);
      const bytesRead = fileIo.readSync(sourceFile.fd, buffer);
      fileIo.closeSync(sourceFile);

      console.log(`读取字节数: ${bytesRead}`);

      // 创建并写入目标文件
      const targetFile = fileIo.openSync(targetPath, fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY | fileIo.OpenMode.TRUNC);
      const bytesWritten = fileIo.writeSync(targetFile.fd, buffer);
      fileIo.closeSync(targetFile);

      console.log(`写入字节数: ${bytesWritten}`);
      console.log(`文件导入成功: ${fileName}`);
      return true;
    } catch (error) {
      console.error(`文件导入失败 ${fileName}:`, JSON.stringify(error));
      return false;
    }
  }

  /**
   * 清空测试文件夹
   */
  clearTestFolder(): number {
    try {
      const testFolderPath = this.getTestFolderPath();
      let deletedCount = 0;

      console.log(`开始清空测试文件夹: ${testFolderPath}`);

      // 检查文件夹是否存在
      try {
        const stat = fileIo.statSync(testFolderPath);
        if (!stat.isDirectory()) {
          console.log('测试数据不是文件夹');
          return 0;
        }
      } catch (e) {
        console.log('测试文件夹不存在');
        return 0;
      }

      // 列出所有文件并删除
      const files = fileIo.listFileSync(testFolderPath);
      console.log(`测试文件夹中有 ${files.length} 个文件`);

      for (const file of files) {
        const filePath = `${testFolderPath}/${file}`;
        try {
          // 检查是文件还是目录
          const fileStat = fileIo.statSync(filePath);
          if (fileStat.isDirectory()) {
            // 递归删除子目录
            console.log(`跳过子目录: ${file}`);
            continue;
          }

          // 删除文件
          fileIo.unlinkSync(filePath);
          deletedCount++;
          console.log(`已删除: ${file}`);
        } catch (e) {
          console.error(`删除文件失败 ${file}:`, JSON.stringify(e));
        }
      }

      console.log(`清空测试文件夹完成，删除 ${deletedCount} 个文件`);
      return deletedCount;
    } catch (error) {
      console.error('清空测试文件夹失败:', JSON.stringify(error));
      return 0;
    }
  }

  /**
   * 获取测试文件夹中的文件数量
   */
  getTestFolderFileCount(): number {
    try {
      const testFolderPath = this.getTestFolderPath();
      const files = fileIo.listFileSync(testFolderPath);
      return files.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 扫描指定目录，只获取该目录下的文件（不递归子目录）
   * 如果需要扫描子目录，需要单独选择该子目录
   */
  private async scanDirectoryRecursive(dirPath: string): Promise<string[]> {
    const allFiles: string[] = [];

    try {
      console.log(`[扫描] 开始扫描目录: ${dirPath}`);
      const items = fileIo.listFileSync(dirPath);
      console.log(`[扫描] 目录 ${dirPath} 中有 ${items.length} 个项目`);

      for (const item of items) {
        const fullPath = `${dirPath}/${item}`;
        try {
          const stat = fileIo.statSync(fullPath);

          if (stat.isDirectory()) {
            // 不递归扫描子目录，子目录需要单独选择
            console.log(`[扫描] 跳过子目录: ${item}（请单独选择该目录进行扫描）`);
          } else if (stat.isFile()) {
            console.log(`[扫描] 发现文件: ${item} (${stat.size} 字节)`);
            allFiles.push(fullPath);
          }
        } catch (e) {
          console.warn(`[扫描] 无法访问: ${fullPath}`, JSON.stringify(e));
        }
      }
    } catch (error) {
      console.error(`[扫描] 扫描目录失败 ${dirPath}:`, JSON.stringify(error));
    }

    console.log(`[扫描] 目录 ${dirPath} 扫描完成，共 ${allFiles.length} 个文件`);
    return allFiles;
  }

  /**
   * 计算文件哈希值（使用内容采样 + 大小作为快速哈希）
   * 由于性能考虑，对于小文件读取全部内容，大文件采样
   */
  private calculateFileHash(filePath: string, fileSize: number): string {
    try {
      const SAMPLE_SIZE = 4096; // 采样大小 4KB

      if (fileSize === 0) {
        return 'empty_file';
      }

      let sampleData: ArrayBuffer;

      if (fileSize <= SAMPLE_SIZE * 2) {
        // 小文件：读取全部内容
        sampleData = new ArrayBuffer(fileSize);
        const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
        fileIo.readSync(file.fd, sampleData);
        fileIo.closeSync(file);
      } else {
        // 大文件：采样开头和结尾
        sampleData = new ArrayBuffer(SAMPLE_SIZE * 2);
        const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);

        // 读取开头
        const headBuffer = new ArrayBuffer(SAMPLE_SIZE);
        fileIo.readSync(file.fd, headBuffer, { offset: 0 });

        // 读取结尾
        const tailBuffer = new ArrayBuffer(SAMPLE_SIZE);
        fileIo.readSync(file.fd, tailBuffer, { offset: fileSize - SAMPLE_SIZE });

        fileIo.closeSync(file);

        // 合并数据
        const headView = new Uint8Array(headBuffer);
        const tailView = new Uint8Array(tailBuffer);
        const sampleView = new Uint8Array(sampleData);
        sampleView.set(headView, 0);
        sampleView.set(tailView, SAMPLE_SIZE);
      }

      // 计算简单哈希（DJB2 算法变体）
      const dataView = new Uint8Array(sampleData);
      let hashValue = 5381;
      for (let i = 0; i < dataView.length; i++) {
        hashValue = ((hashValue << 5) + hashValue) + dataView[i];
        hashValue = hashValue & 0xFFFFFFFF; // 保持32位
      }

      // 组合文件大小和内容哈希
      return `${fileSize}_${hashValue.toString(16)}`;

    } catch (error) {
      console.error(`计算文件哈希失败 ${filePath}:`, error);
      return `error_${Date.now()}`;
    }
  }

  /**
   * 导入文件到应用文件目录
   * @param sourceUri 源文件URI
   * @param fileName 目标文件名
   */
  async importFileToFilesDir(sourceUri: string, fileName: string): Promise<boolean> {
    try {
      const safeName = this.resolveUniqueFilename(fileName);
      const targetPath = `${this.filesDir}/${safeName}`;

      console.log(`导入文件: ${sourceUri} -> ${targetPath}`);

      // 打开源文件
      const sourceFile = fileIo.openSync(sourceUri, fileIo.OpenMode.READ_ONLY);
      const targetFile = fileIo.openSync(targetPath,
        fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY | fileIo.OpenMode.TRUNC);

      const sourceStat = fileIo.statSync(sourceFile.fd);
      const fileSize = sourceStat.size;
      console.log(`源文件大小: ${fileSize} 字节`);

      if (fileSize === 0) {
        fileIo.closeSync(targetFile);
        fileIo.closeSync(sourceFile);
        console.log(`创建空文件成功: ${safeName}`);
        return true;
      }

      const bufferSize = 64 * 1024;
      const buffer = new ArrayBuffer(bufferSize);
      while (true) {
        const bytesRead = fileIo.readSync(sourceFile.fd, buffer);
        if (bytesRead <= 0) break;
        if (bytesRead === bufferSize) {
          fileIo.writeSync(targetFile.fd, buffer);
        } else {
          const slice = buffer.slice(0, bytesRead);
          fileIo.writeSync(targetFile.fd, slice);
        }
      }

      fileIo.closeSync(targetFile);
      fileIo.closeSync(sourceFile);

      console.log(`文件导入成功: ${safeName}`);
      return true;
    } catch (error) {
      console.error(`文件导入失败 ${fileName}:`, JSON.stringify(error));
      return false;
    }
  }

  /**
   * 导入文件夹中的所有文件到应用文件目录（递归）
   */
  async importDirectoryToFilesDir(sourceDirUri: string): Promise<ImportDirectoryResult | null> {
    try {
      let dirPath = sourceDirUri;
      const stat = fileIo.statSync(sourceDirUri);
      if (!stat.isDirectory()) {
        const lastSlash = sourceDirUri.lastIndexOf('/');
        if (lastSlash > 0) {
          dirPath = sourceDirUri.substring(0, lastSlash);
        }
      }

      const dirStat = fileIo.statSync(dirPath);
      if (!dirStat.isDirectory()) {
        console.warn('选择的不是文件夹:', sourceDirUri);
        return null;
      }

      const result: ImportDirectoryResult = {
        totalFiles: 0,
        importedFiles: 0,
        skippedFiles: 0
      };

      await this.importDirectoryRecursive(dirPath, result);
      return result;
    } catch (error) {
      console.error('导入文件夹失败:', JSON.stringify(error));
      return null;
    }
  }

  /**
   * 递归导入目录
   */
  private async importDirectoryRecursive(dirPath: string, result: ImportDirectoryResult): Promise<void> {
    let items: string[] = [];
    try {
      items = fileIo.listFileSync(dirPath);
    } catch (e) {
      console.warn('读取目录失败:', dirPath);
      return;
    }

    for (const item of items) {
      const fullPath = `${dirPath}/${item}`;
      try {
        const stat = fileIo.statSync(fullPath);
        if (stat.isDirectory()) {
          await this.importDirectoryRecursive(fullPath, result);
        } else if (stat.isFile()) {
          result.totalFiles++;
          const success = await this.importFileToFilesDir(fullPath, item);
          if (success) {
            result.importedFiles++;
          } else {
            result.skippedFiles++;
          }
        }
      } catch (e) {
        result.skippedFiles++;
      }
    }
  }

  /**
   * 解决导入文件名冲突
   */
  private resolveUniqueFilename(fileName: string): string {
    let baseName = fileName;
    let ext = '';
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex > 0) {
      baseName = fileName.substring(0, dotIndex);
      ext = fileName.substring(dotIndex);
    }

    let candidate = fileName;
    let counter = 1;
    while (true) {
      const targetPath = `${this.filesDir}/${candidate}`;
      try {
        fileIo.statSync(targetPath);
        candidate = `${baseName}_${counter}${ext}`;
        counter++;
      } catch (e) {
        return candidate;
      }
    }
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * 扫描应用主文件目录（支持增量扫描）
   * @param incremental 是否增量扫描（只扫描上次扫描后变更的文件）
   */
  async scanFilesDir(incremental: boolean = false): Promise<IncrementalScanResult> {
    console.log(`开始${incremental ? '增量' : '全量'}扫描应用文件目录:`, this.filesDir);

    const previousGroupCount = this.duplicateGroups.length;

    const fileEntries: FileEntry[] = [];
    let scannedCount = 0;
    let fileListUnchanged = true;

    try {
      const items = fileIo.listFileSync(this.filesDir);
      console.log(`目录中有 ${items.length} 个项目`);

      for (const item of items) {
        // 跳过回收站目录
        if (item === '.trash') continue;

        const fullPath = `${this.filesDir}/${item}`;
        try {
          const stat = fileIo.statSync(fullPath);
          if (stat.isFile()) {
            const cachedStat = this.lastScanFileStats.get(fullPath);
            const cachedHash = this.lastScanFileHashes.get(fullPath);
            const isUnchanged = incremental &&
              cachedStat &&
              cachedHash &&
              cachedStat.mtime === stat.mtime &&
              cachedStat.ctime === stat.ctime &&
              cachedStat.size === stat.size;

            let fileHash = cachedHash || '';
            if (!isUnchanged) {
              fileHash = this.calculateFileHash(fullPath, stat.size);
              scannedCount++;
            }

            console.log(`发现文件: ${item} (${stat.size} 字节)`);
            const entry: FileEntry = { path: fullPath, size: stat.size, mtime: stat.mtime, ctime: stat.ctime, hash: fileHash };
            fileEntries.push(entry);
            if (incremental && cachedStat === undefined) {
              fileListUnchanged = false;
            }
          } else {
            console.log(`跳过目录: ${item}`);
          }
        } catch (e) {
          console.warn(`无法访问: ${fullPath}`);
        }
      }
    } catch (error) {
      console.error('扫描目录失败:', error);
    }

    console.log(`本次重新扫描 ${scannedCount} 个文件`);
    if (incremental && fileEntries.length !== this.lastScanFileStats.size) {
      fileListUnchanged = false;
    }
    if (incremental && fileListUnchanged) {
      for (const entry of fileEntries) {
        if (!this.lastScanFileStats.has(entry.path)) {
          fileListUnchanged = false;
          break;
        }
      }
    }

    // 如果是增量扫描且没有变更文件，保持原结果
    if (incremental && scannedCount === 0 && fileListUnchanged) {
      console.log('增量扫描：没有变更文件');
      return {
        totalFiles: fileEntries.length,
        duplicateGroups: this.duplicateGroups.length,
        duplicateFiles: this.getDuplicateFilesCount(),
        savableSpace: this.getSavableSpace(),
        savableSpaceReadable: this.formatFileSize(this.getSavableSpace()),
        isIncremental: true,
        scannedFiles: 0,
        newDuplicateGroups: 0
      };
    }

    // 更新缓存
    const newHashMap: Map<string, string> = new Map();
    const newStatMap: Map<string, FileStatInfo> = new Map();
    for (const entry of fileEntries) {
      newHashMap.set(entry.path, entry.hash);
      const statInfo: FileStatInfo = { mtime: entry.mtime, size: entry.size, ctime: entry.ctime };
      newStatMap.set(entry.path, statInfo);
    }
    this.lastScanFileHashes = newHashMap;
    this.lastScanFileStats = newStatMap;

    // 构建重复组
    const hashMap: Map<string, FileItem[]> = new Map();
    for (const entry of fileEntries) {
      const filename = entry.path.split('/').pop() || entry.path;
      const fileItem: FileItem = {
        path: entry.path,
        filename: filename,
        size: entry.size,
        sizeReadable: this.formatFileSize(entry.size),
        selected: false
      };

      if (!hashMap.has(entry.hash)) {
        hashMap.set(entry.hash, []);
      }
      hashMap.get(entry.hash)!.push(fileItem);
    }

    this.duplicateGroups = [];
    let duplicateFileCount = 0;
    let savableSpace = 0;

    hashMap.forEach((files: FileItem[], hashKey: string) => {
      if (files.length > 1) {
        files[0].selected = true;

        const group: DuplicateGroup = {
          hash: hashKey,
          size: files[0].size,
          sizeReadable: files[0].sizeReadable,
          files: files,
          expanded: false
        };

        this.duplicateGroups.push(group);
        duplicateFileCount += files.length;
        savableSpace += (files.length - 1) * files[0].size;
      }
    });

    // 更新扫描时间
    this.lastScanTime = Date.now();

    const newGroups = this.duplicateGroups.length - (incremental ? previousGroupCount : 0);
    console.log(`发现 ${this.duplicateGroups.length} 组重复文件，新增 ${Math.max(0, newGroups)} 组`);

    return {
      totalFiles: fileEntries.length,
      duplicateGroups: this.duplicateGroups.length,
      duplicateFiles: duplicateFileCount,
      savableSpace: savableSpace,
      savableSpaceReadable: this.formatFileSize(savableSpace),
      isIncremental: incremental,
      scannedFiles: scannedCount,
      newDuplicateGroups: Math.max(0, newGroups)
    };
  }

  /**
   * 获取当前文件总数
   */
  private getFilesCount(): number {
    try {
      const items = fileIo.listFileSync(this.filesDir);
      let count = 0;
      for (const item of items) {
        if (item === '.trash') continue;
        const fullPath = `${this.filesDir}/${item}`;
        try {
          const stat = fileIo.statSync(fullPath);
          if (stat.isFile()) count++;
        } catch (e) {}
      }
      return count;
    } catch (e) {
      return 0;
    }
  }

  /**
   * 获取重复文件总数
   */
  private getDuplicateFilesCount(): number {
    let count = 0;
    for (const group of this.duplicateGroups) {
      count += group.files.length;
    }
    return count;
  }

  /**
   * 获取可节省空间
   */
  private getSavableSpace(): number {
    let space = 0;
    for (const group of this.duplicateGroups) {
      space += (group.files.length - 1) * group.size;
    }
    return space;
  }

  /**
   * 执行扫描并查找重复文件
   */
  async scanForDuplicates(directories: string[]): Promise<ScanResult> {
    console.log('开始扫描目录:', directories);

    // 收集所有文件（使用 Set 避免重复扫描同一文件）
    const fileSet: Set<string> = new Set();
    for (const dir of directories) {
      const files = await this.scanDirectoryRecursive(dir);
      for (const file of files) {
        fileSet.add(file);
      }
    }

    // 转换为数组
    const allFiles: string[] = Array.from(fileSet);
    console.log(`共发现 ${allFiles.length} 个不重复文件路径`);

    // 按文件大小分组（第一轮快速过滤）
    const sizeMap: Map<number, string[]> = new Map();
    for (const filePath of allFiles) {
      try {
        const stat = fileIo.statSync(filePath);
        const size = stat.size;

        if (!sizeMap.has(size)) {
          sizeMap.set(size, []);
        }
        sizeMap.get(size)!.push(filePath);
      } catch (e) {
        console.warn(`无法获取文件信息: ${filePath}`);
      }
    }

    // 对相同大小的文件计算哈希并分组
    const hashMap: Map<string, FileItem[]> = new Map();

    sizeMap.forEach((files: string[], size: number) => {
      // 只有多个相同大小的文件才需要进一步检查
      if (files.length > 1) {
        for (const filePath of files) {
          const fileHash = this.calculateFileHash(filePath, size);
          const filename = filePath.split('/').pop() || filePath;

          const fileItem: FileItem = {
            path: filePath,
            filename: filename,
            size: size,
            sizeReadable: this.formatFileSize(size),
            selected: false
          };

          if (!hashMap.has(fileHash)) {
            hashMap.set(fileHash, []);
          }
          hashMap.get(fileHash)!.push(fileItem);
        }
      }
    });

    // 构建重复组（只保留有多个文件的组）
    this.duplicateGroups = [];
    let duplicateFileCount = 0;
    let savableSpace = 0;

    hashMap.forEach((files: FileItem[], hashKey: string) => {
      if (files.length > 1) {
        // 默认选中第一个文件保留
        files[0].selected = true;

        const group: DuplicateGroup = {
          hash: hashKey,
          size: files[0].size,
          sizeReadable: files[0].sizeReadable,
          files: files,
          expanded: false
        };

        this.duplicateGroups.push(group);
        duplicateFileCount += files.length;
        // 可节省空间 = (文件数 - 1) * 文件大小
        savableSpace += (files.length - 1) * files[0].size;
      }
    });

    console.log(`发现 ${this.duplicateGroups.length} 组重复文件`);

    return {
      totalFiles: allFiles.length,
      duplicateGroups: this.duplicateGroups.length,
      duplicateFiles: duplicateFileCount,
      savableSpace: savableSpace,
      savableSpaceReadable: this.formatFileSize(savableSpace)
    };
  }

  /**
   * 获取重复文件组列表
   */
  getDuplicateGroups(): DuplicateGroup[] {
    return this.duplicateGroups;
  }

  /**
   * 删除单个文件（移动到回收站，支持恢复）
   */
  deleteFile(filePath: string): boolean {
    try {
      try {
        fileIo.statSync(filePath);
      } catch (e) {
        console.log(`文件不存在: ${filePath}`);
        return false;
      }

      // 移动到回收站而非永久删除
      return this.moveToTrash(filePath);
    } catch (error) {
      console.error(`删除文件失败 ${filePath}:`, error);
      return false;
    }
  }

  /**
   * 执行去重操作
   * 删除每个重复组中未被选中（selected=false）的文件
   * @returns 删除的文件数量
   */
  executeDeduplicate(): number {
    let deletedCount = 0;

    for (const group of this.duplicateGroups) {
      for (const file of group.files) {
        if (!file.selected) {
          if (this.deleteFile(file.path)) {
            deletedCount++;
          }
        }
      }
    }

    console.log(`去重完成，共删除 ${deletedCount} 个文件`);
    return deletedCount;
  }

  /**
   * 一键去重：每组保留第一个文件
   */
  autoSelectForDeduplicate(): void {
    for (const group of this.duplicateGroups) {
      for (let i = 0; i < group.files.length; i++) {
        group.files[i].selected = (i === 0); // 只保留第一个
      }
    }
  }

  /**
   * 切换文件选中状态
   */
  toggleFileSelection(groupHash: string, filePath: string): void {
    for (const group of this.duplicateGroups) {
      if (group.hash === groupHash) {
        for (const file of group.files) {
          if (file.path === filePath) {
            file.selected = !file.selected;
            break;
          }
        }
        break;
      }
    }
  }

  /**
   * 切换组展开状态
   */
  toggleGroupExpanded(groupHash: string): void {
    for (const group of this.duplicateGroups) {
      if (group.hash === groupHash) {
        group.expanded = !group.expanded;
        break;
      }
    }
  }

  /**
   * 清空扫描结果
   */
  clearResults(): void {
    this.duplicateGroups = [];
  }
}
