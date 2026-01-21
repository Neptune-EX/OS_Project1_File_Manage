/*
 * 文件管理工具类 - 实现沙箱文件操作
 */

import fs from '@ohos.file.fs';
import { common } from '@kit.AbilityKit';
import Logger from './Logger';
import { fileIo } from '@kit.CoreFileKit';

interface FileInfoType {
  filename: string;
  size: number;
  mtime: number;
  ctime: number;
}

export interface FileInfo {
  filename: string;
  size: number;        // 文件大小（字节）
  sizeReadable: string; // 可读的文件大小（如 "2.5 MB"）
  mtime: number;       // 修改时间（时间戳）
  ctime: number;       // 创建时间（时间戳）
  mtimeFormatted: string; // 格式化的修改时间
  ctimeFormatted: string; // 格式化的创建时间
}

export class FileManager {
  private context: Context;
  private filesDir: string; // 新增 filesDir 属性

  constructor(context: Context) {
    this.context = context;
    // 从 context 中提取 filesDir
    this.filesDir = this.getFilesDir();
  }

  // 获取沙箱文件目录路径 - 根据您的具体实现
  private getFilesDir(): string {
    // HarmonyOS 4.0+ 通常这样获取 filesDir
    try {
      // 尝试从 UIAbilityContext 获取
      const uiAbilityContext = this.context as common.UIAbilityContext;
      return uiAbilityContext.filesDir;
    } catch (error) {
      // 如果不行，尝试其他方式
      return this.context.cacheDir + '/files'; // 或者返回默认路径
    }
  }



  // // 5. 查询文件（根据关键字）
  // async searchFiles(keyword: string): Promise<Array<string>> {
  //   try {
  //     const filesDir = this.getFilesDir();
  //     const list = fs.listFileSync(filesDir);
  //     const result: Array<string> = [];
  //
  //     for (const file of list) {
  //       if (keyword === '' || file.toLowerCase().includes(keyword.toLowerCase())) {
  //         result.push(file);
  //       }
  //     }
  //
  //     return result;
  //   } catch (error) {
  //     Logger.error(`searchFiles failed: ${JSON.stringify(error)}`);
  //     return [];
  //   }
  // }

  // // 6. 获取所有文件列表
  // async getAllFiles(): Promise<Array<string>> {
  //   return this.searchFiles('');
  // }


  // // 8. 获取文件信息
  // async getFileInfo(filename: string): Promise<FileInfoType> {
  //   try {
  //     const filePath = this.getFilesDir() + '/' + filename;
  //     const stat = await fs.stat(filePath);
  //
  //     return {
  //       filename: filename,
  //       size: stat.size,
  //       mtime: stat.mtime,
  //       ctime: stat.ctime
  //     };
  //   } catch (error) {
  //     Logger.error(`getFileInfo failed: ${JSON.stringify(error)}`);
  //     return {
  //       filename: '',
  //       size: 0,
  //       mtime: 0,
  //       ctime: 0
  //     };
  //   }
  // }
  /**
   * 搜索文件并返回详细信息
   */
  async searchFilesWithInfo(keyword: string): Promise<FileInfo[]> {
    try {
      const allFiles = await this.getAllFilesWithInfo();

      if (!keyword || keyword.trim() === '') {
        return allFiles;
      }

      const searchTerm = keyword.toLowerCase();
      return allFiles.filter(fileInfo =>
      fileInfo.filename.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error(`搜索文件失败: ${error.message}`);
      return [];
    }
  }
  /**
   * 获取单个文件的详细信息
   */
  async getFileInfo(filename: string): Promise<FileInfo | null> {
    try {
      const filePath = this.filesDir + '/' + filename;

      // 检查文件是否存在
      try {
        fileIo.accessSync(filePath);
      } catch (e) {
        console.log(`文件不存在: ${filename}`);
        return null;
      }

      // 获取文件状态信息
      const stat = fileIo.statSync(filePath);

      // 格式化文件大小
      const sizeReadable = this.formatFileSize(stat.size);

      // 格式化时间
      const mtimeFormatted = this.formatDate(stat.mtime);
      const ctimeFormatted = this.formatDate(stat.ctime);

      return {
        filename: filename,
        size: stat.size,
        sizeReadable: sizeReadable,
        mtime: stat.mtime,
        ctime: stat.ctime,
        mtimeFormatted: mtimeFormatted,
        ctimeFormatted: ctimeFormatted
      };
    } catch (error) {
      console.error(`获取文件信息失败: ${error.message}`);
      return null;
    }
  }

  // 修改 getAllFilesWithInfo 方法
  async getAllFilesWithInfo(): Promise<FileInfo[]> {
    try {
      const filesDir = this.getFilesDir();
      console.log(`[getAllFilesWithInfo] 读取目录: ${filesDir}`);

      // 使用 fileIo 而不是 fs（与 getAllFiles 保持一致）
      const allFiles = fileIo.listFileSync(filesDir);
      // 只显示 .txt 文件，过滤掉系统文件（.开头）和非txt文件
      const files = allFiles.filter(f => !f.startsWith('.') && f.endsWith('.txt'));
      console.log(`[getAllFilesWithInfo] 找到txt文件: ${files.length} 个`);

      const fileInfos: FileInfo[] = [];

      for (const file of files) {
        try {
          // 构建完整路径
          const filePath = `${filesDir}/${file}`;

          // 获取文件信息
          const stat = fileIo.statSync(filePath);

          // 跳过目录，只显示文件
          if (stat.isDirectory()) {
            console.log(`[getAllFilesWithInfo] 跳过目录: ${file}`);
            continue;
          }

          // 格式化为可读信息
          const sizeReadable = this.formatFileSize(stat.size);
          const mtimeFormatted = this.formatDate(stat.mtime);
          const ctimeFormatted = this.formatDate(stat.ctime);

          fileInfos.push({
            filename: file,
            size: stat.size,
            sizeReadable: sizeReadable,
            mtime: stat.mtime,
            ctime: stat.ctime,
            mtimeFormatted: mtimeFormatted,
            ctimeFormatted: ctimeFormatted
          });

        } catch (fileError) {
          console.warn(`[getAllFilesWithInfo] 处理文件 ${file} 失败:`, fileError);
          // 即使获取信息失败，也添加基本文件名
          fileInfos.push({
            filename: file,
            size: 0,
            sizeReadable: '0 B',
            mtime: Date.now(),
            ctime: Date.now(),
            mtimeFormatted: '未知',
            ctimeFormatted: '未知'
          });
        }
      }

      console.log(`[getAllFilesWithInfo] 返回文件信息: ${fileInfos.length} 个`);
      return fileInfos;

    } catch (error) {
      console.error(`[getAllFilesWithInfo] 获取文件列表失败:`, error);
      return [];
    }
  }

  // 确保 formatFileSize 和 formatDate 方法正确实现
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  private formatDate(timestamp: number): string {
    try {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      return '未知日期';
    }
  }
  //重命名
  /**
   * 重命名文件
   * @param oldName 原文件名
   * @param newName 新文件名
   * @returns 是否重命名成功
   */
  // 7. 检查文件是否存在
  // async fileExists(filename: string): Promise<boolean> {
  //   try {
  //     const filePath = this.getFilesDir() + '/' + filename;
  //     await fs.access(filePath);
  //     return true;
  //   } catch {
  //     return false;
  //   }
  // }

  // 检查文件是否存在 - 修正版本
  async fileExists(filename: string): Promise<boolean> {
    try {
      const filePath = `${this.filesDir}/${filename}`;

      // 使用 fileIo.statSync 同步方式检查，或者使用异步方式
      try {
        fileIo.statSync(filePath);
        return true;
      } catch (error) {
        // 如果文件不存在，statSync 会抛出错误
        return false;
      }

      // 或者使用异步方式
      // await fileIo.stat(filePath);
      // return true;
    } catch {
      return false;
    }
  }

  async renameFile(oldName: string, newName: string): Promise<boolean> {
    try {
      // 1. 验证参数
      if (!oldName || !newName || oldName.trim() === '' || newName.trim() === '') {
        console.error('重命名失败：文件名不能为空');
        return false;
      }

      // 2. 修剪空格
      oldName = oldName.trim();
      newName = newName.trim();

      // 3. 检查新旧文件名是否相同
      if (oldName === newName) {
        console.error('重命名失败：新旧文件名相同');
        return false;
      }

      // 4. 验证新文件名是否合法
      if (!this.isValidFilename(newName)) {
        console.error(`重命名失败：新文件名不合法 ${newName}`);
        return false;
      }

      // 5. 构建完整路径
      const oldPath = `${this.filesDir}/${oldName}`;
      const newPath = `${this.filesDir}/${newName}`;

      console.log(`重命名文件: ${oldPath} -> ${newPath}`);

      // 6. 检查原文件是否存在
      if (!await this.fileExists(oldName)) {
        console.error(`重命名失败：原文件不存在 ${oldName}`);
        return false;
      }

      // 7. 检查新文件名是否已存在
      if (await this.fileExists(newName)) {
        console.error(`重命名失败：新文件已存在 ${newName}`);
        return false;
      }

      // 8. 执行重命名
      try {
        fileIo.renameSync(oldPath, newPath);
        console.log(`重命名成功: ${oldName} -> ${newName}`);
        return true;
      } catch (error) {
        console.error(`重命名失败: ${error.message || error}`);
        return false;
      }

    } catch (error) {
      console.error(`重命名文件时发生错误: ${error}`);
      return false;
    }
  }

  /**
   * 验证文件名是否合法
   * @param filename 文件名
   * @returns 是否合法
   */
  private isValidFilename(filename: string): boolean {
    if (!filename || filename.trim() === '') {
      return false;
    }

    // 检查非法字符
    const illegalChars = /[<>:"/\\|?*]/;
    if (illegalChars.test(filename)) {
      return false;
    }

    // 检查文件名长度
    if (filename.length > 255) {
      return false;
    }

    // 检查系统保留名称
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4',
      'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2',
      'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const nameUpper = filename.split('.')[0].toUpperCase();
    if (reservedNames.includes(nameUpper)) {
      return false;
    }

    return true;
  }

  async updateFile(filename: string, content: string): Promise<boolean> {
    try {
      const filePath = this.getFilesDir() + '/' + filename;
      if (!await this.fileExists(filename)) {
        return false;
      }

      const file = await fs.open(filePath, fs.OpenMode.WRITE_ONLY | fs.OpenMode.TRUNC);
      const arrayBuffer = new ArrayBuffer(content.length * 2);
      const dataView = new DataView(arrayBuffer);

      for (let i = 0; i < content.length; i++) {
        dataView.setUint16(i * 2, content.charCodeAt(i), true);
      }

      await fs.write(file.fd, arrayBuffer);
      await fs.close(file);

      Logger.info(`File updated: ${filename}`);
      return true;
    } catch (error) {
      Logger.error(`updateFile failed: ${JSON.stringify(error)}`);
      return false;
    }
  }


}
