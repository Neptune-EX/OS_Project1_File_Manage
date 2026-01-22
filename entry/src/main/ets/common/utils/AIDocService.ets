/**
 * AI 文档分析服务
 * 提供文档分类、摘要生成、关键词提取等 AI 分析功能
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { DeepSeekService, AICallResult } from './DeepSeekService';
import {
  DocumentMetadata,
  DocumentCategory,
  AIDocumentIndex,
  FullAnalysisResult,
  ClassificationResult,
  KeywordIndexEntry
} from '../types/AIDocTypes';

// 分析进度回调接口
export interface AnalysisProgressCallback {
  onProgress: (current: number, total: number, filename: string) => void;
  onFileAnalyzed: (metadata: DocumentMetadata) => void;
  onComplete: (results: DocumentMetadata[]) => void;
  onError: (error: string) => void;
}

// 首先，定义解析后的数据类型接口（根据你返回的数据结构）
interface GeneratedTypeLiteralInterface_1 {
  category: string;
  confidence?: number;
}

interface GeneratedTypeLiteralInterface_2 {
  summary?: string;
}

interface GeneratedTypeLiteralInterface_3 {
  keywords?: string[];
}

interface ParsedAnalysis {
  classification?: GeneratedTypeLiteralInterface_1;
  summary?: string | GeneratedTypeLiteralInterface_2;
  keywords?: string[] | GeneratedTypeLiteralInterface_3;
}


interface GeneratedTypeLiteralInterface_4 {
  totalAnalyzed: number;
  categoryStats: Map<DocumentCategory, number>;
  totalKeywords: number;
}

interface GeneratedObjectLiteralInterface_1 {
  totalAnalyzed: number;
  categoryStats: Map<DocumentCategory, number>;
  totalKeywords: number;
}

export class AIDocService {
  private static instance: AIDocService | null = null;
  private context: common.UIAbilityContext;
  private filesDir: string;
  private indexFilePath: string;
  private documentIndex: AIDocumentIndex | null = null;

  private constructor(context: Context) {
    this.context = context as common.UIAbilityContext;
    this.filesDir = this.context.filesDir;
    this.indexFilePath = `${this.filesDir}/.ai_index.json`;
    this.loadIndex();
  }

  static getInstance(context: Context): AIDocService {
    if (!AIDocService.instance) {
      AIDocService.instance = new AIDocService(context);
    }
    return AIDocService.instance;
  }

  /**
   * 加载 AI 索引文件
   */
  private loadIndex(): void {
    try {
      const exists = this.fileExists(this.indexFilePath);
      if (exists) {
        const file = fileIo.openSync(this.indexFilePath, fileIo.OpenMode.READ_ONLY);
        const stat = fileIo.statSync(this.indexFilePath);
        const buffer = new ArrayBuffer(stat.size);
        fileIo.readSync(file.fd, buffer);
        fileIo.closeSync(file);

        const content = this.arrayBufferToString(buffer);
        this.documentIndex = JSON.parse(content) as AIDocumentIndex;
        console.log('[AIDocService] 索引加载成功，文档数:', this.documentIndex.documents.length);
      } else {
        this.documentIndex = this.createEmptyIndex();
        console.log('[AIDocService] 创建新索引');
      }
    } catch (error) {
      console.error('[AIDocService] 加载索引失败:', error);
      this.documentIndex = this.createEmptyIndex();
    }
  }

  /**
   * 创建空索引
   */
  private createEmptyIndex(): AIDocumentIndex {
    return {
      version: 1,
      lastUpdated: Date.now(),
      documents: [],
      keywordIndex: []
    };
  }

  /**
   * 保存索引到文件
   */
  private saveIndex(): void {
    try {
      if (!this.documentIndex) return;

      this.documentIndex.lastUpdated = Date.now();
      const content = JSON.stringify(this.documentIndex, null, 2);
      const buffer = this.stringToArrayBuffer(content);

      const file = fileIo.openSync(this.indexFilePath, fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY | fileIo.OpenMode.TRUNC);
      fileIo.writeSync(file.fd, buffer);
      fileIo.closeSync(file);

      console.log('[AIDocService] 索引保存成功');
    } catch (error) {
      console.error('[AIDocService] 保存索引失败:', error);
    }
  }

  /**
   * 检查文件是否存在
   */
  private fileExists(path: string): boolean {
    try {
      fileIo.accessSync(path);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * ArrayBuffer 转字符串
   */
  private arrayBufferToString(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer);
    let result = '';
    for (let i = 0; i < uint8Array.length; i++) {
      result += String.fromCharCode(uint8Array[i]);
    }
    return decodeURIComponent(escape(result));
  }

  /**
   * 字符串转 ArrayBuffer
   */
  private stringToArrayBuffer(str: string): ArrayBuffer {
    const utf8Str = unescape(encodeURIComponent(str));
    const buffer = new ArrayBuffer(utf8Str.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < utf8Str.length; i++) {
      view[i] = utf8Str.charCodeAt(i);
    }
    return buffer;
  }

  /**
   * 计算内容哈希（简单版）
   */
  private calculateContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 读取文件内容
   */
  async readFileContent(filename: string): Promise<string> {
    try {
      const filePath = `${this.filesDir}/${filename}`;
      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(filePath);

      // 限制读取大小
      const maxSize = 100 * 1024; // 100KB
      const readSize = Math.min(stat.size, maxSize);
      const buffer = new ArrayBuffer(readSize);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      return this.arrayBufferToString(buffer);
    } catch (error) {
      console.error('[AIDocService] 读取文件失败:', filename, error);
      return '';
    }
  }

  /**
   * 分析单个文档
   */
  async analyzeDocument(filename: string, apiKey: string): Promise<DocumentMetadata | null> {
    try {
      console.log('[AIDocService] 开始分析文档:', filename);

      // 读取文件内容
      const content = await this.readFileContent(filename);
      if (!content || content.length === 0) {
        console.log('[AIDocService] 文件内容为空:', filename);
        return null;
      }

      // 计算内容哈希
      const contentHash = this.calculateContentHash(content);

      // 检查是否已分析过且内容未变化
      const existingMeta = this.getDocumentMetadata(filename);
      if (existingMeta && existingMeta.contentHash === contentHash) {
        console.log('[AIDocService] 文档未变化，跳过分析:', filename);
        return existingMeta;
      }

      // 调用 AI 进行完整分析
      const result = await DeepSeekService.fullDocumentAnalysis(content, apiKey);

      if (!result.success) {
        console.error('[AIDocService] AI 分析失败:', result.error);
        return null;
      }

      // 解析 AI 响应
      const analysisResult = this.parseAnalysisResult(result.content);
      if (!analysisResult) {
        console.error('[AIDocService] 解析 AI 响应失败');
        return null;
      }

      // 创建文档元数据
      const metadata: DocumentMetadata = {
        filename: filename,
        category: analysisResult.classification.category,
        categoryConfidence: analysisResult.classification.confidence,
        keywords: analysisResult.keywords.keywords,
        summary: analysisResult.summary.summary,
        wordCount: content.length,
        lastAnalyzedAt: Date.now(),
        relatedDocs: [],
        contentHash: contentHash
      };

      // 更新索引
      this.updateDocumentInIndex(metadata);
      this.saveIndex();

      console.log('[AIDocService] 文档分析完成:', filename);
      return metadata;
    } catch (error) {
      console.error('[AIDocService] 分析文档失败:', filename, error);
      return null;
    }
  }

  /**
   * 解析 AI 分析结果
   */
  // 首先，定义解析后的数据类型接口（根据你返回的数据结构）

  // 然后修改函数
  private parseAnalysisResult(content: string): FullAnalysisResult | null {
    try {
      // 尝试提取 JSON
      let jsonStr = content.trim();

      // 如果响应包含 markdown 代码块，提取 JSON
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        // 尝试找到 JSON 对象
        const startIndex = content.indexOf('{');
        const endIndex = content.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
          jsonStr = content.substring(startIndex, endIndex + 1);
        }
      }

      // 明确指定 parsed 的类型
      let parsed: ParsedAnalysis | null = null;

      try {
        // 使用类型断言
        parsed = JSON.parse(jsonStr) as ParsedAnalysis;
      } catch (error) {
        console.error('JSON解析失败:', error);
        parsed = null;
      }

      // 如果解析失败，直接返回 null
      if (!parsed) {
        console.error('[AIDocService] JSON解析失败，无法继续分析');
        return null;
      }

      // 验证并提取分类
      let category = DocumentCategory.OTHER;
      let confidence = 0.5;

      if (parsed.classification && parsed.classification.category) {
        const catStr = parsed.classification.category;
        category = this.stringToCategory(catStr);
        confidence = parsed.classification.confidence || 0.5;
      }

      // 提取摘要
      let summary = '';
      if (parsed.summary) {
        if (typeof parsed.summary === 'string') {
          summary = parsed.summary;
        } else if (typeof parsed.summary === 'object' && parsed.summary.summary) {
          summary = parsed.summary.summary;
        }
      }

      // 提取关键词
      let keywords: string[] = [];
      if (parsed.keywords) {
        if (Array.isArray(parsed.keywords)) {
          keywords = parsed.keywords;
        } else if (typeof parsed.keywords === 'object' && Array.isArray(parsed.keywords.keywords)) {
          keywords = parsed.keywords.keywords;
        }
      }

      return {
        classification: {
          category: category,
          confidence: confidence
        },
        summary: {
          summary: summary,
          wordCount: summary.length
        },
        keywords: {
          keywords: keywords
        }
      };
    } catch (error) {
      console.error('[AIDocService] 解析分析结果失败:', error);
      return null;
    }
  }


  // private parseAnalysisResult(content: string): FullAnalysisResult | null {
  //   try {
  //     // 尝试提取 JSON
  //     let jsonStr = content.trim();
  //
  //     // 如果响应包含 markdown 代码块，提取 JSON
  //     const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  //     if (jsonMatch) {
  //       jsonStr = jsonMatch[1];
  //     } else {
  //       // 尝试找到 JSON 对象
  //       const startIndex = content.indexOf('{');
  //       const endIndex = content.lastIndexOf('}');
  //       if (startIndex !== -1 && endIndex !== -1) {
  //         jsonStr = content.substring(startIndex, endIndex + 1);
  //       }
  //     }
  //
  //     // const parsed = JSON.parse(jsonStr);
  //     let parsed;
  //     try {
  //       parsed = JSON.parse(jsonStr);
  //     } catch (error) {
  //       console.error('JSON解析失败:', error);
  //       // 根据业务逻辑处理错误
  //       parsed = null; // 或返回默认值
  //     }
  //
  //     // 验证并提取分类
  //     let category = DocumentCategory.OTHER;
  //     let confidence = 0.5;
  //
  //     if (parsed.classification) {
  //       const catStr = parsed.classification.category;
  //       category = this.stringToCategory(catStr);
  //       confidence = parsed.classification.confidence || 0.5;
  //     }
  //
  //     // 提取摘要
  //     let summary = '';
  //     if (parsed.summary) {
  //       summary = typeof parsed.summary === 'string' ? parsed.summary : (parsed.summary.summary || '');
  //     }
  //
  //     // 提取关键词
  //     let keywords: string[] = [];
  //     if (parsed.keywords) {
  //       if (Array.isArray(parsed.keywords)) {
  //         keywords = parsed.keywords;
  //       } else if (parsed.keywords.keywords) {
  //         keywords = parsed.keywords.keywords;
  //       }
  //     }
  //
  //     return {
  //       classification: {
  //         category: category,
  //         confidence: confidence
  //       },
  //       summary: {
  //         summary: summary,
  //         wordCount: summary.length
  //       },
  //       keywords: {
  //         keywords: keywords
  //       }
  //     };
  //   } catch (error) {
  //     console.error('[AIDocService] 解析分析结果失败:', error);
  //     return null;
  //   }
  // }

  /**
   * 字符串转类别枚举
   */
  private stringToCategory(str: string): DocumentCategory {
    switch (str) {
      case 'meeting_notes':
        return DocumentCategory.MEETING_NOTES;
      case 'study_notes':
        return DocumentCategory.STUDY_NOTES;
      case 'project_report':
        return DocumentCategory.PROJECT_REPORT;
      case 'personal_diary':
        return DocumentCategory.PERSONAL_DIARY;
      case 'todo_list':
        return DocumentCategory.TODO_LIST;
      case 'technical_doc':
        return DocumentCategory.TECHNICAL_DOC;
      default:
        return DocumentCategory.OTHER;
    }
  }

  /**
   * 更新索引中的文档
   */
  private updateDocumentInIndex(metadata: DocumentMetadata): void {
    if (!this.documentIndex) return;

    // 查找是否已存在
    const existingIndex = this.documentIndex.documents.findIndex(
      (doc: DocumentMetadata) => doc.filename === metadata.filename
    );

    if (existingIndex >= 0) {
      // 更新现有记录
      this.documentIndex.documents[existingIndex] = metadata;
    } else {
      // 添加新记录
      this.documentIndex.documents.push(metadata);
    }

    // 更新关键词索引
    this.updateKeywordIndex(metadata);
  }

  /**
   * 更新关键词倒排索引
   */
  private updateKeywordIndex(metadata: DocumentMetadata): void {
    if (!this.documentIndex) return;

    // 遍历文档关键词
    metadata.keywords.forEach((keyword: string) => {
      const existingEntry = this.documentIndex!.keywordIndex.find(
        (entry: KeywordIndexEntry) => entry.keyword === keyword
      );

      if (existingEntry) {
        // 检查文档是否已在列表中
        if (!existingEntry.documents.includes(metadata.filename)) {
          existingEntry.documents.push(metadata.filename);
          existingEntry.frequency += 1;
        }
      } else {
        // 创建新条目
        const newEntry: KeywordIndexEntry = {
          keyword: keyword,
          documents: [metadata.filename],
          frequency: 1
        };
        this.documentIndex!.keywordIndex.push(newEntry);
      }
    });
  }

  /**
   * 批量分析文档
   */
  async batchAnalyze(
    filenames: string[],
    apiKey: string,
    callback: AnalysisProgressCallback
  ): Promise<void> {
    const results: DocumentMetadata[] = [];
    const total = filenames.length;

    for (let i = 0; i < filenames.length; i++) {
      const filename = filenames[i];
      callback.onProgress(i + 1, total, filename);

      try {
        const metadata = await this.analyzeDocument(filename, apiKey);
        if (metadata) {
          results.push(metadata);
          callback.onFileAnalyzed(metadata);
        }
      } catch (error) {
        console.error('[AIDocService] 批量分析文档失败:', filename, error);
      }

      // 添加延迟避免 API 限流
      if (i < filenames.length - 1) {
        await this.delay(1000);
      }
    }

    callback.onComplete(results);
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), ms);
    });
  }

  /**
   * 获取文档元数据
   */
  getDocumentMetadata(filename: string): DocumentMetadata | null {
    if (!this.documentIndex) return null;

    const found = this.documentIndex.documents.find(
      (doc: DocumentMetadata) => doc.filename === filename
    );
    return found || null;
  }

  /**
   * 获取所有已分析的文档
   */
  getAllAnalyzedDocuments(): DocumentMetadata[] {
    if (!this.documentIndex) return [];
    return this.documentIndex.documents;
  }

  /**
   * 按类别获取文档
   */
  getDocumentsByCategory(category: DocumentCategory): DocumentMetadata[] {
    if (!this.documentIndex) return [];
    return this.documentIndex.documents.filter(
      (doc: DocumentMetadata) => doc.category === category
    );
  }

  /**
   * 搜索文档（基于关键词索引）
   */
  searchDocuments(query: string): DocumentMetadata[] {
    if (!this.documentIndex || !query || query.trim() === '') {
      return [];
    }

    const searchTerms = query.toLowerCase().split(' ').filter((t: string) => t.length > 0);
    const matchedDocs: Map<string, number> = new Map();

    // 遍历搜索词
    searchTerms.forEach((term: string) => {
      // 在关键词索引中搜索
      this.documentIndex!.keywordIndex.forEach((entry: KeywordIndexEntry) => {
        if (entry.keyword.toLowerCase().includes(term)) {
          entry.documents.forEach((docName: string) => {
            const currentScore = matchedDocs.get(docName) || 0;
            matchedDocs.set(docName, currentScore + 1);
          });
        }
      });

      // 在文档摘要中搜索
      this.documentIndex!.documents.forEach((doc: DocumentMetadata) => {
        if (doc.summary.toLowerCase().includes(term)) {
          const currentScore = matchedDocs.get(doc.filename) || 0;
          matchedDocs.set(doc.filename, currentScore + 0.5);
        }
        if (doc.filename.toLowerCase().includes(term)) {
          const currentScore = matchedDocs.get(doc.filename) || 0;
          matchedDocs.set(doc.filename, currentScore + 0.3);
        }
      });
    });

    // 转换结果并排序
    const results: DocumentMetadata[] = [];
    matchedDocs.forEach((score: number, filename: string) => {
      const doc = this.getDocumentMetadata(filename);
      if (doc) {
        results.push(doc);
      }
    });

    // 按匹配分数排序（这里简化为按关键词数量）
    return results;
  }

  /**
   * 获取相关文档
   */
  getRelatedDocuments(filename: string): DocumentMetadata[] {
    const sourceMeta = this.getDocumentMetadata(filename);
    if (!sourceMeta || !this.documentIndex) return [];

    const relatedDocs: DocumentMetadata[] = [];
    const sourceKeywords = sourceMeta.keywords;

    this.documentIndex.documents.forEach((doc: DocumentMetadata) => {
      if (doc.filename === filename) return;

      // 计算共同关键词数量
      let sharedCount = 0;
      sourceKeywords.forEach((keyword: string) => {
        if (doc.keywords.includes(keyword)) {
          sharedCount++;
        }
      });

      if (sharedCount > 0) {
        relatedDocs.push(doc);
      }
    });

    // 按共同关键词数量排序（这里简化处理）
    return relatedDocs;
  }

  /**
   * 删除文档的分析数据
   */
  removeDocumentAnalysis(filename: string): void {
    if (!this.documentIndex) return;

    // 从文档列表中移除
    this.documentIndex.documents = this.documentIndex.documents.filter(
      (doc: DocumentMetadata) => doc.filename !== filename
    );

    // 从关键词索引中移除
    this.documentIndex.keywordIndex.forEach((entry: KeywordIndexEntry) => {
      entry.documents = entry.documents.filter((name: string) => name !== filename);
      entry.frequency = entry.documents.length;
    });

    // 清理空的关键词条目
    this.documentIndex.keywordIndex = this.documentIndex.keywordIndex.filter(
      (entry: KeywordIndexEntry) => entry.documents.length > 0
    );

    this.saveIndex();
  }

  /**
   * 清空所有分析数据
   */
  clearAllAnalysis(): void {
    this.documentIndex = this.createEmptyIndex();
    this.saveIndex();
  }

  /**
   * 获取分析统计信息
   */
  getAnalysisStats(): GeneratedTypeLiteralInterface_4 {
    const stats: GeneratedObjectLiteralInterface_1 = {
      totalAnalyzed: 0,
      categoryStats: new Map<DocumentCategory, number>(),
      totalKeywords: 0
    };

    if (!this.documentIndex) return stats;

    stats.totalAnalyzed = this.documentIndex.documents.length;
    stats.totalKeywords = this.documentIndex.keywordIndex.length;

    // 统计各类别数量
    this.documentIndex.documents.forEach((doc: DocumentMetadata) => {
      const currentCount = stats.categoryStats.get(doc.category) || 0;
      stats.categoryStats.set(doc.category, currentCount + 1);
    });

    return stats;
  }
}
