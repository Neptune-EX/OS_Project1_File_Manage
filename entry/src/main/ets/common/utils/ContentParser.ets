/**
 * 文档内容解析器
 * 支持多种文档格式的内容提取：txt, docx, pdf
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { zlib } from '@kit.BasicServicesKit';
import * as mammoth from "@ohos/mammoth";
//华为原生第三方库，使用 ohpm install @ohos/mammoth 指令安装

// import { pdfService } from '@kit.PDFKit';  // Not working on X86
// import { image } from '@kit.ImageKit';

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
   * 简单的 PDF 文本提取器
   * 通过解析 PDF 二进制格式提取文本内容
   * 注意:这是一个简化实现,适用于包含纯文本的 PDF 文件
   */
  private async extractTextWithPDF(filePath: string): Promise<string> {
    try {
      console.log(`[ContentParser] 开始解析PDF: ${filePath}`);

      // 读取PDF文件
      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(filePath);

      // 限制读取大小(最大 10MB)
      const maxSize = 10 * 1024 * 1024;
      const readSize = Math.min(stat.size, maxSize);
      const buffer = new ArrayBuffer(readSize);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      // 将 PDF 内容转换为字符串
      const pdfContent = this.arrayBufferToString(buffer);

      // 验证是否为有效的 PDF 文件
      if (!pdfContent.startsWith('%PDF')) {
        throw new Error('不是有效的PDF文件');
      }

      console.log(`[ContentParser] PDF文件读取成功,大小: ${readSize} bytes`);

      // 提取文本内容
      let extractedText = '';

      // 方法 1: 提取 BT...ET 块中的文本(文本对象)
      const textBlockPattern = /BT([\s\S]*?)ET/g;
      const textBlocks = pdfContent.match(textBlockPattern);

      if (textBlocks && textBlocks.length > 0) {
        console.log(`[ContentParser] 找到 ${textBlocks.length} 个文本块`);

        textBlocks.forEach((block: string) => {
          // 提取括号内的文本字符串 (...)
          const stringPattern = /\(([^)]*)\)/g;
          let match = stringPattern.exec(block);

          while (match !== null) {
            let text = match[1];

            // 解码 PDF 特殊字符
            text = this.decodePdfString(text);

            if (text.trim().length > 0) {
              extractedText += text + ' ';
            }

            match = stringPattern.exec(block);
          }

          // 提取尖括号内的十六进制字符串 <...>
          const hexPattern = /<([0-9A-Fa-f]+)>/g;
          let hexMatch = hexPattern.exec(block);

          while (hexMatch !== null) {
            const hexText = this.decodeHexString(hexMatch[1]);
            if (hexText.trim().length > 0) {
              extractedText += hexText + ' ';
            }
            hexMatch = hexPattern.exec(block);
          }
        });
      }

      // 方法 2: 如果方法1没有提取到内容,尝试查找所有括号中的文本
      if (extractedText.trim().length === 0) {
        console.log('[ContentParser] 尝试备用提取方法');
        const allStringsPattern = /\(([^)]{2,})\)/g;
        let match = allStringsPattern.exec(pdfContent);

        while (match !== null) {
          let text = match[1];
          text = this.decodePdfString(text);

          // 过滤掉看起来像命令或控制字符的内容
          if (text.trim().length > 0 && !text.match(/^[\/\\]/)) {
            extractedText += text + ' ';
          }

          match = allStringsPattern.exec(pdfContent);
        }
      }

      // 清理提取的文本
      extractedText = extractedText
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\s+/g, ' ')
        .trim();

      console.log(`[ContentParser] PDF文本提取完成,提取字符数: ${extractedText.length}`);

      if (extractedText.length === 0) {
        throw new Error('PDF中未找到可提取的文本内容');
      }

      return extractedText;

    } catch (error) {
      console.error('[ContentParser] PDF文本提取失败:', error);
      // throw error;
    }
    return ''
  }

  /**
   * 解码 PDF 字符串中的转义字符
   */
  private decodePdfString(str: string): string {
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\');
  }

  /**
   * 解码十六进制编码的字符串
   */
  private decodeHexString(hexStr: string): string {
    let result = '';

    // 确保十六进制字符串长度为偶数
    if (hexStr.length % 2 !== 0) {
      hexStr = '0' + hexStr;
    }

    // 每两个字符转换为一个字符
    for (let i = 0; i < hexStr.length; i += 2) {
      const hexByte = hexStr.substring(i, i + 2);
      const charCode = parseInt(hexByte, 16);

      // 只添加可打印字符
      if (charCode >= 32 && charCode <= 126) {
        result += String.fromCharCode(charCode);
      } else if (charCode >= 128) {
        // 处理扩展ASCII或Unicode字符
        result += String.fromCharCode(charCode);
      }
    }

    return result;
  }


  /**
   * 使用 OpenHarmony PDFKit 提取 PDF 文本，X86版本根本用不了！！！
   */
  // private async extractPdfTextWithPDFKit(filePath: string): Promise<string> {
  //   let pdfDocument: pdfService.PdfDocument | null = null;
  //
  //   try {
  //     console.log(`[ContentParser] 使用PDFKit解析: ${filePath}`);
  //
  //     // 创建 PdfDocument 实例
  //     try {
  //       pdfDocument = new pdfService.PdfDocument;
  //       if (!pdfDocument) {
  //         throw new Error('Failed to create PdfDocument instance');
  //       }
  //       console.log('[ContentParser] PdfDocument实例创建成功');
  //     } catch (createError) {
  //       console.error('[ContentParser] 创建PdfDocument实例失败:', createError);
  //       throw new Error(`Failed to initialize PdfDocument: ${createError}`);
  //     }
  //
  //     // 加载PDF文档
  //     const loadResult = pdfDocument.loadDocument(filePath, '');
  //
  //     // 检查加载结果
  //     if (loadResult !== pdfService.ParseResult.PARSE_SUCCESS) {
  //       console.error(`[ContentParser] PDF加载失败，返回码: ${loadResult}`);
  //       throw new Error('PDF文档加载失败');
  //     }
  //
  //     console.log('[ContentParser] PDF文档加载成功');
  //
  //     // 获取总页数
  //     const pageCount = pdfDocument.getPageCount();
  //     console.log(`[ContentParser] PDF总页数: ${pageCount}`);
  //
  //     if (pageCount <= 0) {
  //       throw new Error('PDF没有页面');
  //     }
  //
  //     let extractedText = '';
  //
  //     // 限制解析页数，避免性能问题
  //     const maxPagesToParse = Math.min(pageCount, 50);
  //
  //     // 逐页提取文本
  //     for (let pageIndex = 0; pageIndex < maxPagesToParse; pageIndex++) {
  //       try {
  //         const page: pdfService.PdfPage = pdfDocument.getPage(pageIndex);
  //
  //         if (!page) {
  //           console.warn(`[ContentParser] 第 ${pageIndex + 1} 页获取失败`);
  //           continue;
  //         }
  //
  //         // 获取图形对象
  //         const graphs: Array<pdfService.GraphicsObject> = page.getGraphicsObjects();
  //
  //         if (graphs && graphs.length > 0) {
  //           let pageText = '';
  //
  //           // 遍历图形对象，提取文本
  //           for (let graph of graphs) {
  //             // 使用类型断言来访问text属性
  //             const typedGraph = graph as pdfService.TextObject;
  //             if (typedGraph.type === pdfService.GraphicsObjectType.OBJECT_TEXT && typedGraph.text) {
  //               pageText += typedGraph.text + ' ';
  //             }
  //           }
  //
  //           if (pageText.trim().length > 0) {
  //             extractedText += pageText.trim() + '\n\n';
  //             console.log(`[ContentParser] 第 ${pageIndex + 1} 页提取到 ${pageText.trim().length} 字符`);
  //           }
  //         } else {
  //           console.log(`[ContentParser] 第 ${pageIndex + 1} 页没有图形对象`);
  //         }
  //
  //         // 如果文本已经足够长，可以提前停止
  //         if (extractedText.length > 50000) {
  //           console.log(`[ContentParser] PDF文本提取达到限制，停止在第 ${pageIndex + 1} 页`);
  //           break;
  //         }
  //
  //       } catch (pageError) {
  //         console.error(`[ContentParser] 提取第 ${pageIndex + 1} 页失败:`, pageError);
  //         continue;
  //       }
  //     }
  //
  //     if (extractedText.trim().length === 0) {
  //       throw new Error('未提取到文本内容');
  //     }
  //
  //     return extractedText;
  //
  //   } catch (error) {
  //     console.error('[ContentParser] PDFKit解析失败:', error);
  //
  //
  //
  //     // throw error;
  //   }
  //   return ''
  // }



  private async parsePdfFile(filename: string): Promise<ParseResult> {
    try {
      const filePath = `${this.filesDir}/${filename}`;
      console.log("[ContentParser] 正在读取PDF文件:", filePath);

      // 检查文件是否存在
      try {
        fileIo.accessSync(filePath);
      } catch (e) {
        console.error("[ContentParser] PDF文件不存在:", filePath);
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: '文件不存在',
          format: DocumentFormat.PDF
        };
      }

      // 检查文件大小
      const stat = fileIo.statSync(filePath);
      if (stat.size === 0) {
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: '文件为空',
          format: DocumentFormat.PDF
        };
      }

      console.log(`[ContentParser] PDF文件大小: ${stat.size} bytes`);


      let content: string = '';
      try {
        content = await this.extractTextWithPDF(filePath);
      } catch (pdfError) {
        console.error(`[ContentParser] PDFKit解析失败: ${pdfError}`);
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: `PDF解析失败: ${pdfError.message || pdfError}`,
          format: DocumentFormat.PDF
        };
      }

      if (!content || content.trim().length === 0) {
        console.warn(`[ContentParser] PDF解析结果为空: ${filename}`);
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: 'PDF 文件解析失败，无法提取文本内容',
          format: DocumentFormat.PDF
        };
      }

      const wordCount = this.countWords(content);
      console.log(`[ContentParser] PDF解析成功，提取字符数: ${content.length}, 字数: ${wordCount}`);

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
        error: `解析失败: ${error.message || error}`,
        format: DocumentFormat.PDF
      };
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
