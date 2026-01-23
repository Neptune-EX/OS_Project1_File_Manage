/**
 * 文档内容解析器
 * 支持多种文档格式的内容提取：txt, docx, pdf
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { zlib } from '@kit.BasicServicesKit';
import * as mammoth from "@ohos/mammoth";
import { pdfService } from '@kit.PDFKit';  // ARM 真机可用

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

  // 初始化 PDF 文档
  private initPdfDocument(): void {

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
   * 增强的 PDF 文本提取器
   * 支持多种文本提取策略
   */
  private async extractTextWithPDF(filePath: string): Promise<string> {
    try {
      console.log(`[ContentParser] 开始解析PDF: ${filePath}`);

      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(filePath);

      const maxSize = 10 * 1024 * 1024;
      const readSize = Math.min(stat.size, maxSize);
      const buffer = new ArrayBuffer(readSize);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      const uint8Array = new Uint8Array(buffer);
      const pdfContent = this.arrayBufferToString(buffer);

      if (!pdfContent.startsWith('%PDF')) {
        throw new Error('不是有效的PDF文件');
      }

      console.log(`[ContentParser] PDF文件读取成功,大小: ${readSize} bytes`);

      let allExtractedTexts: string[] = [];

      // 方法 1: 提取 BT...ET 文本块
      const btText = this.extractFromTextBlocks(pdfContent);
      if (btText.length > 0) {
        allExtractedTexts.push(btText);
      }

      // 方法 2: 提取 Unicode/UTF-16 文本 (针对中文 PDF)
      const unicodeText = this.extractUnicodeText(pdfContent);
      if (unicodeText.length > 0) {
        allExtractedTexts.push(unicodeText);
      }

      // 方法 3: 尝试解压 FlateDecode 流
      const streamText = await this.extractFromStreams(uint8Array, pdfContent);
      if (streamText.length > 0) {
        allExtractedTexts.push(streamText);
      }

      // 方法 4: 提取所有括号内文本（最后手段）
      if (allExtractedTexts.length === 0) {
        const fallbackText = this.extractFallbackText(pdfContent);
        if (fallbackText.length > 0) {
          allExtractedTexts.push(fallbackText);
        }
      }

      // 合并所有提取的文本
      let extractedText = allExtractedTexts.join(' ');

      // 清理文本
      extractedText = this.cleanExtractedText(extractedText);

      // 验证提取的文本是否有效（非乱码）
      if (!this.isValidPdfText(extractedText)) {
        console.warn('[ContentParser] PDF提取的文本无效或为乱码');
        // 尝试只保留中文和英文
        extractedText = this.extractOnlyReadableChars(extractedText);
      }

      console.log(`[ContentParser] PDF文本提取完成,提取字符数: ${extractedText.length}`);

      if (extractedText.length < 10) {
        throw new Error('PDF中未找到可提取的文本内容，可能是扫描版或加密PDF');
      }

      return extractedText;

    } catch (error) {
      console.error('[ContentParser] PDF文本提取失败:', error);
    }
    return '';
  }

  /**
   * 只提取可读字符（中文、英文、数字）
   */
  private extractOnlyReadableChars(text: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if ((code >= 0x4E00 && code <= 0x9FFF) || // 中文
        (code >= 0x0041 && code <= 0x005A) || // A-Z
        (code >= 0x0061 && code <= 0x007A) || // a-z
        (code >= 0x0030 && code <= 0x0039) || // 0-9
        code === 0x0020 || code === 0x000A) { // 空格、换行
        result += text[i];
      }
    }
    return result.replace(/\s+/g, ' ').trim();
  }

  /**
   * 从压缩流中提取文本 (FlateDecode)
   */
  private async extractFromStreams(data: Uint8Array, pdfContent: string): Promise<string> {
    let extractedText = '';

    try {
      // 查找所有 stream...endstream 块
      const streamPattern = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
      let match = streamPattern.exec(pdfContent);

      while (match !== null) {
        const streamContent = match[1];
        const streamStart = match.index + match[0].indexOf(streamContent);

        // 检查是否为 FlateDecode 压缩
        const beforeStream = pdfContent.substring(Math.max(0, match.index - 200), match.index);
        const isFlate = beforeStream.includes('/FlateDecode') || beforeStream.includes('/Fl');

        if (isFlate && streamContent.length > 10) {
          try {
            const decompressed = await this.decompressFlate(data, streamStart, streamContent.length);
            if (decompressed && decompressed.length > 0) {
              const text = this.extractTextFromDecompressed(decompressed);
              if (text.length > 0) {
                extractedText += text + ' ';
              }
            }
          } catch (e) {
            // 解压失败，继续尝试下一个流
          }
        }

        match = streamPattern.exec(pdfContent);
      }
    } catch (error) {
      console.warn('[ContentParser] 流提取失败:', error);
    }

    return extractedText;
  }

  /**
   * 解压 FlateDecode 数据 (通过临时文件使用 zlib)
   */
  private async decompressFlate(data: Uint8Array, offset: number, length: number): Promise<string> {
    try {
      // 提取压缩数据
      const compressedData = data.slice(offset, offset + length);

      // 创建临时文件路径
      const timestamp = Date.now();
      const compressedPath = `${this.filesDir}/.temp_compressed_${timestamp}.bin`;
      const decompressedPath = `${this.filesDir}/.temp_decompressed_${timestamp}.bin`;

      // 写入压缩数据到临时文件
      const compFile = fileIo.openSync(compressedPath, fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.CREATE | fileIo.OpenMode.TRUNC);
      fileIo.writeSync(compFile.fd, compressedData.buffer);
      fileIo.closeSync(compFile);

      // 使用 zlib 解压
      try {
        await zlib.decompressFile(compressedPath, decompressedPath);

        // 读取解压后的数据
        const decompFile = fileIo.openSync(decompressedPath, fileIo.OpenMode.READ_ONLY);
        const stat = fileIo.statSync(decompressedPath);
        const buffer = new ArrayBuffer(Math.min(stat.size, 500 * 1024)); // 最多读取500KB
        fileIo.readSync(decompFile.fd, buffer);
        fileIo.closeSync(decompFile);

        // 清理临时文件
        fileIo.unlinkSync(compressedPath);
        fileIo.unlinkSync(decompressedPath);

        return this.arrayBufferToString(buffer);
      } catch (zlibError) {
        // 解压失败，清理临时文件
        try { fileIo.unlinkSync(compressedPath); } catch (e) {}
        try { fileIo.unlinkSync(decompressedPath); } catch (e) {}
        return '';
      }
    } catch (error) {
      return '';
    }
  }

  /**
   * 从解压后的数据中提取文本
   */
  private extractTextFromDecompressed(content: string): string {
    let text = '';

    // 提取 BT...ET 块
    const btPattern = /BT([\s\S]*?)ET/g;
    let btMatch = btPattern.exec(content);

    while (btMatch !== null) {
      const block = btMatch[1];

      // 提取 Tj 操作符的文本
      const tjPattern = /\(([^)]*)\)\s*Tj/g;
      let tjMatch = tjPattern.exec(block);
      while (tjMatch !== null) {
        text += this.decodePdfString(tjMatch[1]) + ' ';
        tjMatch = tjPattern.exec(block);
      }

      // 提取 TJ 数组中的文本
      const tjArrayPattern = /\[(.*?)\]\s*TJ/g;
      let tjArrayMatch = tjArrayPattern.exec(block);
      while (tjArrayMatch !== null) {
        const arrayContent = tjArrayMatch[1];
        const strPattern = /\(([^)]*)\)/g;
        let strMatch = strPattern.exec(arrayContent);
        while (strMatch !== null) {
          text += this.decodePdfString(strMatch[1]);
          strMatch = strPattern.exec(arrayContent);
        }
        text += ' ';
        tjArrayMatch = tjArrayPattern.exec(block);
      }

      btMatch = btPattern.exec(content);
    }

    return text;
  }

  /**
   * 从 BT...ET 文本块提取
   */
  private extractFromTextBlocks(pdfContent: string): string {
    let extractedText = '';
    const textBlockPattern = /BT([\s\S]*?)ET/g;
    const textBlocks = pdfContent.match(textBlockPattern);

    if (textBlocks && textBlocks.length > 0) {
      textBlocks.forEach((block: string) => {
        // 提取括号内文本
        const stringPattern = /\(([^)]*)\)/g;
        let match = stringPattern.exec(block);
        while (match !== null) {
          const text = this.decodePdfString(match[1]);
          if (text.trim().length > 0) {
            extractedText += text + ' ';
          }
          match = stringPattern.exec(block);
        }

        // 提取十六进制文本
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

    return extractedText;
  }

  /**
   * 备用文本提取方法
   */
  private extractFallbackText(pdfContent: string): string {
    let extractedText = '';
    // 匹配更长的文本串，过滤掉短的控制序列
    const allStringsPattern = /\(([^)]{3,})\)/g;
    let match = allStringsPattern.exec(pdfContent);

    while (match !== null) {
      let text = this.decodePdfString(match[1]);
      // 更严格的过滤条件
      if (text.trim().length > 2 &&
        !text.match(/^[\/\\]/) &&
        !text.match(/^\d+\s+\d+/) &&
        !text.match(/^[A-Z]{1,3}\d/) &&
        this.hasReadableContent(text)) {
        extractedText += text + ' ';
      }
      match = allStringsPattern.exec(pdfContent);
    }

    return extractedText;
  }

  /**
   * 检查文本是否包含可读内容
   */
  private hasReadableContent(text: string): boolean {
    let readableCount = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if ((code >= 0x4E00 && code <= 0x9FFF) || // 中文
        (code >= 0x0041 && code <= 0x005A) || // A-Z
        (code >= 0x0061 && code <= 0x007A)) { // a-z
        readableCount++;
      }
    }
    return readableCount >= 2 || (readableCount > 0 && text.length <= 5);
  }

  /**
   * 提取 Unicode 编码文本 (针对中文 PDF)
   */
  private extractUnicodeText(pdfContent: string): string {
    let text = '';

    // 提取 UTF-16BE 编码的文本 (以 FEFF 开头)
    const unicodePattern = /<FEFF([0-9A-Fa-f]+)>/gi;
    let match = unicodePattern.exec(pdfContent);

    while (match !== null) {
      const hexStr = match[1];
      let decoded = '';
      for (let i = 0; i < hexStr.length; i += 4) {
        if (i + 4 <= hexStr.length) {
          const charCode = parseInt(hexStr.substring(i, i + 4), 16);
          if (charCode > 0x001F && charCode < 0xFFFF && charCode !== 0xFFFE && charCode !== 0xFFFF) {
            decoded += String.fromCharCode(charCode);
          }
        }
      }
      if (decoded.trim().length > 0) {
        text += decoded + ' ';
      }
      match = unicodePattern.exec(pdfContent);
    }

    // 提取普通 UTF-16 十六进制文本（更宽松的匹配）
    const hex16Pattern = /<([0-9A-Fa-f]{8,})>/g;
    let hex16Match = hex16Pattern.exec(pdfContent);

    while (hex16Match !== null) {
      const hexStr = hex16Match[1];
      if (hexStr.length % 4 === 0) {
        let decoded = '';
        let validCharCount = 0;
        for (let i = 0; i < hexStr.length; i += 4) {
          const charCode = parseInt(hexStr.substring(i, i + 4), 16);
          // 中文字符范围
          if (charCode >= 0x4E00 && charCode <= 0x9FFF) {
            decoded += String.fromCharCode(charCode);
            validCharCount++;
          }
          // 常用标点和字母数字
          else if ((charCode >= 0x0020 && charCode <= 0x007E) ||
            (charCode >= 0x3000 && charCode <= 0x303F) ||
            (charCode >= 0xFF00 && charCode <= 0xFFEF)) {
            decoded += String.fromCharCode(charCode);
          }
        }
        // 至少有2个有效中文字符才添加
        if (validCharCount >= 2 && decoded.trim().length > 0) {
          text += decoded + ' ';
        }
      }
      hex16Match = hex16Pattern.exec(pdfContent);
    }

    // 尝试提取 CID 字体映射的文本
    const cidText = this.extractCIDText(pdfContent);
    if (cidText.length > 0) {
      text += ' ' + cidText;
    }

    return text;
  }

  /**
   * 提取 CID 字体文本（针对使用 CID 字体的中文 PDF）
   */
  private extractCIDText(pdfContent: string): string {
    let text = '';

    // 查找 ToUnicode CMap 中的映射
    const cmapPattern = /beginbfchar([\s\S]*?)endbfchar/g;
    let cmapMatch = cmapPattern.exec(pdfContent);

    // 构建字符映射表
    const charMap = new Map<string, string>();

    while (cmapMatch !== null) {
      const mapContent = cmapMatch[1];
      // 匹配 <srcCode> <destCode> 格式
      const mappingPattern = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
      let mapping = mappingPattern.exec(mapContent);

      while (mapping !== null) {
        const srcCode = mapping[1];
        const destHex = mapping[2];
        // 解码目标 Unicode
        if (destHex.length === 4) {
          const charCode = parseInt(destHex, 16);
          if (charCode > 0x001F) {
            charMap.set(srcCode.toUpperCase(), String.fromCharCode(charCode));
          }
        }
        mapping = mappingPattern.exec(mapContent);
      }
      cmapMatch = cmapPattern.exec(pdfContent);
    }

    // 如果找到了映射，尝试应用到文本
    if (charMap.size > 0) {
      console.log(`[ContentParser] 找到 ${charMap.size} 个 CID 字符映射`);
    }

    return text;
  }

  /**
   * 清理提取的文本
   */
  private cleanExtractedText(text: string): string {
    let cleaned = text
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 移除控制字符
      .replace(/\s+/g, ' ')
      .trim();

    // 过滤乱码：只保留可读字符
    cleaned = this.filterReadableText(cleaned);

    return cleaned;
  }

  /**
   * 过滤保留可读文本
   */
  private filterReadableText(text: string): string {
    let result = '';
    let consecutiveGarbage = 0;

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);

      // 判断是否为可读字符
      const isReadable =
        (code >= 0x4E00 && code <= 0x9FFF) || // 中文
        (code >= 0x3400 && code <= 0x4DBF) || // 中文扩展A
        (code >= 0x0020 && code <= 0x007E) || // ASCII可打印字符
        (code >= 0x3000 && code <= 0x303F) || // 中文标点
        (code >= 0xFF00 && code <= 0xFFEF) || // 全角字符
        code === 0x000A || code === 0x000D;   // 换行

      if (isReadable) {
        result += text[i];
        consecutiveGarbage = 0;
      } else {
        consecutiveGarbage++;
        // 连续乱码超过3个，插入空格分隔
        if (consecutiveGarbage <= 1) {
          result += ' ';
        }
      }
    }

    // 清理多余空格
    return result.replace(/\s+/g, ' ').trim();
  }

  /**
   * 检查文本是否主要为可读内容
   */
  private isValidPdfText(text: string): boolean {
    if (text.length < 10) return false;

    let readableCount = 0;
    for (let i = 0; i < Math.min(text.length, 500); i++) {
      const code = text.charCodeAt(i);
      if ((code >= 0x4E00 && code <= 0x9FFF) ||
        (code >= 0x0041 && code <= 0x005A) ||
        (code >= 0x0061 && code <= 0x007A) ||
        (code >= 0x0030 && code <= 0x0039)) {
        readableCount++;
      }
    }

    return (readableCount / Math.min(text.length, 500)) > 0.3;
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

      // 优先使用 PDFKit（ARM 真机）
      try {
        content = await this.extractPdfTextWithPDFKit(filePath);
        console.log(`[ContentParser] PDFKit 解析成功，字符数: ${content.length}`);
      } catch (pdfKitError) {
        console.warn(`[ContentParser] PDFKit 解析失败，尝试备用方法: ${pdfKitError}`);
        // 备用：自定义解析
        try {
          content = await this.extractTextWithPDF(filePath);
        } catch (fallbackError) {
          console.error(`[ContentParser] 备用解析也失败: ${fallbackError}`);
        }
      }

      if (!content || content.trim().length === 0) {
        console.warn(`[ContentParser] PDF解析结果为空: ${filename}`);
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: 'PDF 文件解析失败，可能是扫描版或加密PDF',
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
        error: `解析失败: ${error}`,
        format: DocumentFormat.PDF
      };
    }
  }

  /**
   * 使用 PDFKit 提取 PDF 文本（ARM 真机可用）
   */
  private async extractPdfTextWithPDFKit(filePath: string): Promise<string> {
    let pdfDocument: pdfService.PdfDocument | null = null;

    try {
      console.log(`[ContentParser] 使用PDFKit解析: ${filePath}`);

      pdfDocument = new pdfService.PdfDocument();
      if (!pdfDocument) {
        throw new Error('创建 PdfDocument 实例失败');
      }

      const loadResult = pdfDocument.loadDocument(filePath, '');
      if (loadResult !== pdfService.ParseResult.PARSE_SUCCESS) {
        throw new Error(`PDF加载失败，错误码: ${loadResult}`);
      }

      const pageCount = pdfDocument.getPageCount();
      console.log(`[ContentParser] PDF总页数: ${pageCount}`);

      if (pageCount <= 0) {
        throw new Error('PDF没有页面');
      }

      let extractedText = '';
      const maxPages = Math.min(pageCount, 50);

      for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
        try {
          const page = pdfDocument.getPage(pageIndex);
          if (!page) continue;

          const graphs = page.getGraphicsObjects();
          if (graphs && graphs.length > 0) {
            for (const graph of graphs) {
              const textObj = graph as pdfService.TextObject;
              if (textObj.type === pdfService.GraphicsObjectType.OBJECT_TEXT && textObj.text) {
                extractedText += textObj.text + ' ';
              }
            }
          }

          if (extractedText.length > 100000) break;
        } catch (pageError) {
          console.warn(`[ContentParser] 第 ${pageIndex + 1} 页提取失败`);
        }
      }

      if (extractedText.trim().length === 0) {
        throw new Error('未提取到文本');
      }

      return extractedText.trim();
    } finally {
      // PdfDocument 无需手动关闭
      pdfDocument = null;
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
