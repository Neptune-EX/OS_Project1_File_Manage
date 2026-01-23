/**
 * 文档内容解析器
 * 支持多种文档格式的内容提取：txt, docx, pdf
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { zlib } from '@kit.BasicServicesKit';

import * as mammoth from "@ohos/mammoth";
//华为原生第三方库，使用 ohpm install @ohos/mammoth 指令安装


// 解析结果接口
export interface ParseResult {
  success: boolean;
  content: string;
  wordCount: number;
  error?: string;
  format: DocumentFormat;
}

// 文档格式枚举
export enum DocumentFormat {
  TXT = 'txt',
  DOCX = 'docx',
  PDF = 'pdf',
  UNKNOWN = 'unknown'
}

export class ContentParser {
  private static instance: ContentParser | null = null;
  private context: common.UIAbilityContext;
  private filesDir: string;

  private constructor(context: Context) {
    this.context = context as common.UIAbilityContext;
    this.filesDir = this.context.filesDir;
  }

  static getInstance(context: Context): ContentParser {
    if (!ContentParser.instance) {
      ContentParser.instance = new ContentParser(context);
    }
    return ContentParser.instance;
  }

  /**
   * 解析文档内容
   */
  async parseDocument(filename: string): Promise<ParseResult> {
    const format = this.detectFormat(filename);

    switch (format) {
      case DocumentFormat.TXT:
        return await this.parseTxtFile(filename);
      case DocumentFormat.DOCX:
        return await this.parseDocxFile(filename);
      case DocumentFormat.PDF:
        return await this.parsePdfFile(filename);
      default:
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: '不支持的文件格式',
          format: DocumentFormat.UNKNOWN
        };
    }
  }

  /**
   * 检测文件格式
   */
  detectFormat(filename: string): DocumentFormat {
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith('.txt')) {
      return DocumentFormat.TXT;
    } else if (lowerName.endsWith('.docx')) {
      return DocumentFormat.DOCX;
    } else if (lowerName.endsWith('.pdf')) {
      return DocumentFormat.PDF;
    } else {
      return DocumentFormat.UNKNOWN;
    }
  }

  /**
   * 判断是否支持该文件格式
   */
  isSupported(filename: string): boolean {
    const format = this.detectFormat(filename);
    return format !== DocumentFormat.UNKNOWN;
  }

  /**
   * 解析 TXT 文件
   */
  private async parseTxtFile(filename: string): Promise<ParseResult> {
    try {
      const filePath = `${this.filesDir}/${filename}`;

      // 检查文件是否存在
      try {
        fileIo.accessSync(filePath);
      } catch (e) {
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: '文件不存在',
          format: DocumentFormat.TXT
        };
      }

      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(filePath);

      // 限制读取大小
      const maxSize = 500 * 1024; // 500KB
      const readSize = Math.min(stat.size, maxSize);
      const buffer = new ArrayBuffer(readSize);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      const content = this.arrayBufferToString(buffer);
      const wordCount = this.countWords(content);

      return {
        success: true,
        content: content,
        wordCount: wordCount,
        format: DocumentFormat.TXT
      };
    } catch (error) {
      console.error('[ContentParser] 解析 TXT 文件失败:', error);
      return {
        success: false,
        content: '',
        wordCount: 0,
        error: `解析失败: ${error}`,
        format: DocumentFormat.TXT
      };
    }
  }





  /**
   * 解析 DOCX 文件
   * DOCX 是 ZIP 压缩格式，需要解压并解析 word/document.xml
   */
  private async parseDocxFile(filename: string): Promise<ParseResult> {
    try {
      const filePath = `${this.filesDir}/${filename}`;
      console.log("[ContentParser]正在读取docx文件")
      // 检查文件是否存在
      try {
        fileIo.accessSync(filePath);
      } catch (e) {
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: '文件不存在',
          format: DocumentFormat.DOCX
        };
      }

      const res = await mammoth.extractRawText({
        path: filePath
      });
      console.log(`[ContentParser] mammoth解析完成，message: ${res.messages}`);

      // 提取文本内容
      let content = res.value;
      let wordCount=content.length


      if (content.length === 0) {
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: 'DOCX 文件解析失败，内容为空',
          format: DocumentFormat.DOCX
        };
      }

      return {
        success: true,
        content: content,
        wordCount: wordCount,
        format: DocumentFormat.DOCX
      };
    } catch (error) {
      console.error('[ContentParser] 解析 DOCX 文件失败:', error);
      return {
        success: false,
        content: '',
        wordCount: 0,
        error: `解析失败: ${error}`,
        format: DocumentFormat.DOCX
      };
    }
  }

  /**
   * 解析 PDF 文件
   * 注意：PDF 解析较为复杂，这里提供简化实现
   */
  private async parsePdfFile(filename: string): Promise<ParseResult> {
    try {
      const filePath = `${this.filesDir}/${filename}`;

      // 检查文件是否存在
      try {
        fileIo.accessSync(filePath);
      } catch (e) {
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: '文件不存在',
          format: DocumentFormat.PDF
        };
      }

      // 读取文件
      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(filePath);

      // 限制读取大小
      const maxSize = 1024 * 1024; // 1MB
      const readSize = Math.min(stat.size, maxSize);
      const buffer = new ArrayBuffer(readSize);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      // 尝试提取 PDF 文本
      const content = this.extractPdfText(buffer);
      const wordCount = this.countWords(content);

      if (content.length === 0) {
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: 'PDF 文件解析失败，无法提取文本。建议使用 TXT 格式。',
          format: DocumentFormat.PDF
        };
      }

      return {
        success: true,
        content: content,
        wordCount: wordCount,
        format: DocumentFormat.PDF
      };
    } catch (error) {
      console.error('[ContentParser] 解析 PDF 文件失败:', error);
      return {
        success: false,
        content: '',
        wordCount: 0,
        error: `解析失败: ${error}`,
        format: DocumentFormat.PDF
      };
    }
  }

  /**
   * 从 PDF 缓冲区提取文本
   * 简化实现：尝试提取文本流
   */
  private extractPdfText(buffer: ArrayBuffer): string {
    try {
      const uint8Array = new Uint8Array(buffer);
      let rawContent = '';

      for (let i = 0; i < uint8Array.length; i++) {
        const charCode = uint8Array[i];
        // 只保留可打印字符
        if (charCode >= 32 && charCode <= 126) {
          rawContent += String.fromCharCode(charCode);
        } else if (charCode === 10 || charCode === 13) {
          rawContent += '\n';
        }
      }

      // 尝试提取文本内容
      // PDF 中的文本通常在 BT...ET 块内或 Tj/TJ 操作符附近
      const textParts: string[] = [];

      // 提取括号内的文本（PDF 文本字符串格式）
      const matches = rawContent.match(/\(([^)]+)\)/g);
      if (matches) {
        matches.forEach((m: string) => {
          const text = m.substring(1, m.length - 1);
          // 过滤掉太短或明显是元数据的内容
          if (text.length > 2 && !text.startsWith('/') && !text.match(/^[\d\s.]+$/)) {
            textParts.push(text);
          }
        });
      }

      // 清理并合并文本
      let result = textParts.join(' ');

      // 移除多余空白
      result = result.replace(/\s+/g, ' ').trim();

      return result;
    } catch (error) {
      console.error('[ContentParser] PDF 文本提取失败:', error);
      return '';
    }
  }

  /**
   * ArrayBuffer 转字符串（支持 UTF-8）
   */
  private arrayBufferToString(buffer: ArrayBuffer): string {
    try {
      const uint8Array = new Uint8Array(buffer);
      let result = '';

      // 尝试 UTF-8 解码
      for (let i = 0; i < uint8Array.length; i++) {
        result += String.fromCharCode(uint8Array[i]);
      }

      // 尝试解码 UTF-8 编码的内容
      try {
        return decodeURIComponent(escape(result));
      } catch (e) {
        // 如果解码失败，返回原始结果
        return result;
      }
    } catch (error) {
      console.error('[ContentParser] Buffer 转字符串失败:', error);
      return '';
    }
  }

  /**
   * 统计字数
   */
  private countWords(text: string): number {
    if (!text || text.length === 0) {
      return 0;
    }

    // 移除空白字符后计算字符数
    const cleanText = text.replace(/\s/g, '');
    return cleanText.length;
  }

  /**
   * 获取文件预览（前 N 个字符）
   */
  async getPreview(filename: string, maxLength: number = 500): Promise<string> {
    const result = await this.parseDocument(filename);
    if (!result.success) {
      return '';
    }

    if (result.content.length <= maxLength) {
      return result.content;
    }

    return result.content.substring(0, maxLength) + '...';
  }

  /**
   * 批量解析文档
   */
  async batchParse(filenames: string[]): Promise<Map<string, ParseResult>> {
    const results = new Map<string, ParseResult>();

    for (const filename of filenames) {
      const result = await this.parseDocument(filename);
      results.set(filename, result);
    }

    return results;
  }

  /**
   * 获取支持的文件扩展名列表
   */
  getSupportedExtensions(): string[] {
    return ['.txt', '.docx', '.pdf'];
  }

  /**
   * 获取格式显示名称
   */
  getFormatDisplayName(format: DocumentFormat): string {
    switch (format) {
      case DocumentFormat.TXT:
        return '文本文件';
      case DocumentFormat.DOCX:
        return 'Word 文档';
      case DocumentFormat.PDF:
        return 'PDF 文档';
      default:
        return '未知格式';
    }
  }
}
