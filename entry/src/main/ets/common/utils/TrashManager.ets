/**
 * 回收站管理器
 * 提供软删除、恢复、永久删除功能
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { util } from '@kit.ArkTS';

// 回收站文件信息
export interface TrashItem {
  originalName: string;    // 原文件名
  trashName: string;       // 回收站中的文件名
  deletedTime: number;     // 删除时间戳
  size: number;            // 文件大小
}

// 回收站元数据
interface TrashMetadata {
  items: TrashItem[];
}

const TRASH_DIR = '.trash';
const METADATA_FILE = '.trash_metadata.json';

export class TrashManager {
  private static instance: TrashManager | null = null;
  private filesDir: string = '';
  private trashDir: string = '';
  private metadataPath: string = '';

  private constructor(context: Context) {
    const uiContext = context as common.UIAbilityContext;
    this.filesDir = uiContext.filesDir;
    this.trashDir = `${this.filesDir}/${TRASH_DIR}`;
    this.metadataPath = `${this.filesDir}/${METADATA_FILE}`;
    this.ensureTrashDir();
  }

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
      }
    } catch (e) {
      fileIo.mkdirSync(this.trashDir);
    }
  }

  // 读取元数据
  private loadMetadata(): TrashMetadata {
    try {
      if (fileIo.accessSync(this.metadataPath)) {
        const file = fileIo.openSync(this.metadataPath, fileIo.OpenMode.READ_ONLY);
        const stat = fileIo.statSync(this.metadataPath);
        const buffer = new ArrayBuffer(stat.size);
        fileIo.readSync(file.fd, buffer);
        fileIo.closeSync(file);
        const decoder = new util.TextDecoder('utf-8');
        const json = decoder.decodeWithStream(new Uint8Array(buffer), { stream: false });
        return JSON.parse(json) as TrashMetadata;
      }
    } catch (e) {
      console.warn('[TrashManager] 加载元数据失败');
    }
    return { items: [] };
  }

  // 保存元数据
  private saveMetadata(metadata: TrashMetadata): void {
    try {
      const json = JSON.stringify(metadata);
      const encoder = new util.TextEncoder();
      const data = encoder.encodeInto(json);
      const file = fileIo.openSync(this.metadataPath,
        fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.CREATE | fileIo.OpenMode.TRUNC);
      fileIo.writeSync(file.fd, data.buffer);
      fileIo.closeSync(file);
    } catch (e) {
      console.error('[TrashManager] 保存元数据失败');
    }
  }

  // 移动文件到回收站
  moveToTrash(filename: string): boolean {
    try {
      const srcPath = `${this.filesDir}/${filename}`;
      if (!fileIo.accessSync(srcPath)) {
        return false;
      }

      const stat = fileIo.statSync(srcPath);
      const trashName = `${Date.now()}_${filename}`;
      const dstPath = `${this.trashDir}/${trashName}`;

      // 移动文件
      fileIo.moveFileSync(srcPath, dstPath);

      // 更新元数据
      const metadata = this.loadMetadata();
      metadata.items.push({
        originalName: filename,
        trashName: trashName,
        deletedTime: Date.now(),
        size: stat.size
      });
      this.saveMetadata(metadata);

      return true;
    } catch (e) {
      console.error('[TrashManager] 移动到回收站失败:', filename);
      return false;
    }
  }

  // 从回收站恢复文件
  restore(trashName: string): boolean {
    try {
      const metadata = this.loadMetadata();
      const item = metadata.items.find((i: TrashItem): boolean => i.trashName === trashName);
      if (!item) return false;

      const srcPath = `${this.trashDir}/${trashName}`;
      let dstPath = `${this.filesDir}/${item.originalName}`;

      // 如果原文件名已存在，添加后缀
      if (fileIo.accessSync(dstPath)) {
        const parts = item.originalName.split('.');
        const ext = parts.length > 1 ? `.${parts.pop()}` : '';
        const name = parts.join('.');
        dstPath = `${this.filesDir}/${name}_restored${ext}`;
      }

      // 移动文件
      fileIo.moveFileSync(srcPath, dstPath);

      // 更新元数据
      metadata.items = metadata.items.filter((i: TrashItem): boolean => i.trashName !== trashName);
      this.saveMetadata(metadata);

      return true;
    } catch (e) {
      console.error('[TrashManager] 恢复文件失败:', trashName);
      return false;
    }
  }

  // 永久删除
  deletePermanently(trashName: string): boolean {
    try {
      const filePath = `${this.trashDir}/${trashName}`;
      fileIo.unlinkSync(filePath);

      const metadata = this.loadMetadata();
      metadata.items = metadata.items.filter((i: TrashItem): boolean => i.trashName !== trashName);
      this.saveMetadata(metadata);

      return true;
    } catch (e) {
      console.error('[TrashManager] 永久删除失败:', trashName);
      return false;
    }
  }

  // 清空回收站
  emptyTrash(): number {
    let deleted = 0;
    const metadata = this.loadMetadata();

    metadata.items.forEach((item: TrashItem): void => {
      try {
        const filePath = `${this.trashDir}/${item.trashName}`;
        fileIo.unlinkSync(filePath);
        deleted++;
      } catch (e) {
        // ignore
      }
    });

    this.saveMetadata({ items: [] });
    return deleted;
  }

  // 获取回收站列表
  getTrashItems(): TrashItem[] {
    return this.loadMetadata().items;
  }

  // 获取回收站文件数量
  getTrashCount(): number {
    return this.loadMetadata().items.length;
  }
}
