/*
 * 回收站管理工具类 - 实现文件的软删除和恢复功能
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';

// 回收站文件信息
export interface TrashFileInfo {
  originalName: string;      // 原文件名
  trashName: string;         // 回收站中的文件名（带时间戳避免冲突）
  originalPath: string;      // 原文件路径
  deleteTime: number;        // 删除时间戳
  deleteTimeFormatted: string; // 格式化的删除时间
  size: number;              // 文件大小
  sizeReadable: string;      // 可读的文件大小
  source: string;            // 删除来源：'manual' | 'dedup'（手动删除或去重删除）
}

// 回收站元数据（持久化存储）
interface TrashMetadata {
  files: TrashFileInfo[];
  lastCleanTime: number;
}

export class TrashManager {
  private context: Context;
  private filesDir: string;
  private trashDir: string;
  private metadataPath: string;
  private static instance: TrashManager | null = null;

  constructor(context: Context) {
    this.context = context;
    const uiAbilityContext = context as common.UIAbilityContext;
    this.filesDir = uiAbilityContext.filesDir;
    this.trashDir = this.filesDir + '/.trash';
    this.metadataPath = this.trashDir + '/.trash_metadata.json';
    this.ensureTrashDir();
  }

  // 获取单例实例
  static getInstance(context: Context): TrashManager {
    if (!TrashManager.instance) {
      TrashManager.instance = new TrashManager(context);
    }
    return TrashManager.instance;
  }

  // 确保回收站目录存在
  private ensureTrashDir(): void {
    try {
      if (!fileIo.accessSync(this.trashDir)) {
        fileIo.mkdirSync(this.trashDir);
        console.log('创建回收站目录成功');
      }
    } catch (error) {
      try {
        fileIo.mkdirSync(this.trashDir);
        console.log('创建回收站目录成功');
      } catch (mkdirError) {
        console.error(`创建回收站目录失败: ${mkdirError}`);
      }
    }
  }

  // 读取回收站元数据
  private readMetadata(): TrashMetadata {
    try {
      if (!fileIo.accessSync(this.metadataPath)) {
        return { files: [], lastCleanTime: Date.now() };
      }

      const file = fileIo.openSync(this.metadataPath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(this.metadataPath);
      const buffer = new ArrayBuffer(stat.size);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      const content = this.arrayBufferToString(buffer);
      return JSON.parse(content) as TrashMetadata;
    } catch (error) {
      console.error(`读取回收站元数据失败: ${error}`);
      return { files: [], lastCleanTime: Date.now() };
    }
  }

  // 写入回收站元数据
  private writeMetadata(metadata: TrashMetadata): void {
    try {
      const content = JSON.stringify(metadata, null, 2);
      const stream = fileIo.createStreamSync(this.metadataPath, 'w+');
      stream.writeSync(content);
      stream.closeSync();
    } catch (error) {
      console.error(`写入回收站元数据失败: ${error}`);
    }
  }

  // ArrayBuffer 转字符串
  private arrayBufferToString(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer);
    let result = '';
    for (let i = 0; i < uint8Array.length; i++) {
      result += String.fromCharCode(uint8Array[i]);
    }
    return result;
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
   * 将文件移动到回收站
   * @param filename 文件名
   * @param source 删除来源：'manual' | 'dedup'
   * @returns 是否成功
   */
  moveToTrash(filename: string, source: string = 'manual'): boolean {
    try {
      const originalPath = `${this.filesDir}/${filename}`;

      // 检查文件是否存在
      if (!fileIo.accessSync(originalPath)) {
        console.error(`文件不存在: ${filename}`);
        return false;
      }

      // 获取文件信息
      const stat = fileIo.statSync(originalPath);

      // 生成回收站文件名（添加时间戳避免冲突）
      const timestamp = Date.now();
      const trashName = `${timestamp}_${filename}`;
      const trashPath = `${this.trashDir}/${trashName}`;

      // 移动文件到回收站
      fileIo.renameSync(originalPath, trashPath);

      // 更新元数据
      const metadata = this.readMetadata();
      const trashInfo: TrashFileInfo = {
        originalName: filename,
        trashName: trashName,
        originalPath: originalPath,
        deleteTime: timestamp,
        deleteTimeFormatted: this.formatDate(timestamp),
        size: stat.size,
        sizeReadable: this.formatFileSize(stat.size),
        source: source
      };
      metadata.files.push(trashInfo);
      this.writeMetadata(metadata);

      console.log(`文件已移入回收站: ${filename}`);
      return true;
    } catch (error) {
      console.error(`移动文件到回收站失败: ${error}`);
      return false;
    }
  }

  /**
   * 从回收站恢复文件
   * @param trashName 回收站中的文件名
   * @returns 是否成功
   */
  restoreFile(trashName: string): boolean {
    try {
      const metadata = this.readMetadata();
      const fileInfo = metadata.files.find(f => f.trashName === trashName);

      if (!fileInfo) {
        console.error(`回收站中未找到文件: ${trashName}`);
        return false;
      }

      const trashPath = `${this.trashDir}/${trashName}`;
      let restorePath = `${this.filesDir}/${fileInfo.originalName}`;

      // 如果原位置已有同名文件，添加后缀
      let counter = 1;
      while (fileIo.accessSync(restorePath)) {
        const nameParts = fileInfo.originalName.split('.');
        if (nameParts.length > 1) {
          const ext = nameParts.pop();
          restorePath = `${this.filesDir}/${nameParts.join('.')}_restored_${counter}.${ext}`;
        } else {
          restorePath = `${this.filesDir}/${fileInfo.originalName}_restored_${counter}`;
        }
        counter++;
      }

      // 移动文件回原位置
      fileIo.renameSync(trashPath, restorePath);

      // 更新元数据
      metadata.files = metadata.files.filter(f => f.trashName !== trashName);
      this.writeMetadata(metadata);

      console.log(`文件已恢复: ${fileInfo.originalName}`);
      return true;
    } catch (error) {
      console.error(`恢复文件失败: ${error}`);
      return false;
    }
  }

  /**
   * 永久删除回收站中的文件
   * @param trashName 回收站中的文件名
   * @returns 是否成功
   */
  permanentDelete(trashName: string): boolean {
    try {
      const trashPath = `${this.trashDir}/${trashName}`;

      if (fileIo.accessSync(trashPath)) {
        fileIo.unlinkSync(trashPath);
      }

      // 更新元数据
      const metadata = this.readMetadata();
      metadata.files = metadata.files.filter(f => f.trashName !== trashName);
      this.writeMetadata(metadata);

      console.log(`文件已永久删除: ${trashName}`);
      return true;
    } catch (error) {
      console.error(`永久删除文件失败: ${error}`);
      return false;
    }
  }

  /**
   * 清空回收站
   * @returns 是否成功
   */
  emptyTrash(): boolean {
    try {
      const metadata = this.readMetadata();

      for (const fileInfo of metadata.files) {
        const trashPath = `${this.trashDir}/${fileInfo.trashName}`;
        try {
          if (fileIo.accessSync(trashPath)) {
            fileIo.unlinkSync(trashPath);
          }
        } catch (e) {
          console.warn(`删除文件失败: ${fileInfo.trashName}`);
        }
      }

      // 清空元数据
      this.writeMetadata({ files: [], lastCleanTime: Date.now() });

      console.log('回收站已清空');
      return true;
    } catch (error) {
      console.error(`清空回收站失败: ${error}`);
      return false;
    }
  }

  /**
   * 获取回收站中的所有文件
   * @returns 回收站文件列表
   */
  getTrashFiles(): TrashFileInfo[] {
    const metadata = this.readMetadata();
    // 按删除时间倒序排列
    return metadata.files.sort((a, b) => b.deleteTime - a.deleteTime);
  }

  /**
   * 获取回收站文件数量
   * @returns 文件数量
   */
  getTrashCount(): number {
    return this.readMetadata().files.length;
  }

  /**
   * 批量恢复文件
   * @param trashNames 回收站文件名数组
   * @returns 成功恢复的数量
   */
  restoreMultiple(trashNames: string[]): number {
    let successCount = 0;
    for (const trashName of trashNames) {
      if (this.restoreFile(trashName)) {
        successCount++;
      }
    }
    return successCount;
  }

  /**
   * 恢复所有文件
   * @returns 成功恢复的数量
   */
  restoreAll(): number {
    const metadata = this.readMetadata();
    const trashNames = metadata.files.map(f => f.trashName);
    return this.restoreMultiple(trashNames);
  }
}
