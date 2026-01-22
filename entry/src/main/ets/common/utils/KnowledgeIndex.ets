/**
 * 知识索引服务
 * 提供文档索引、搜索、知识关联分析功能
 * 完全本地运行，无需 API
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { SimilarityCalculator, SimilarityResult, SimilarityMethod } from './SimilarityCalculator';

// 文档索引条目
export interface IndexedDocument {
  filename: string;
  content: string;
  keywords: string[];
  wordCount: number;
  indexedAt: number;
}

// 搜索结果
export interface SearchResult {
  filename: string;
  score: number;
  matchedTerms: string[];
  snippet: string;
}

// 知识关联
export interface KnowledgeLink {
  source: string;
  target: string;
  strength: number;
  sharedKeywords: string[];
}

// 知识图谱节点
export interface KnowledgeNode {
  filename: string;
  keywords: string[];
  connections: number;
}

// 持久化索引结构
interface PersistentIndex {
  version: number;
  lastUpdated: number;
  documents: IndexedDocument[];
  invertedIndex: InvertedIndexEntry[];
}

// 倒排索引条目
interface InvertedIndexEntry {
  term: string;
  documents: DocumentTermInfo[];
}

// 文档词频信息
interface DocumentTermInfo {
  filename: string;
  frequency: number;
  positions: number[];
}

interface GeneratedTypeLiteralInterface_1 {
  score: number;
  matchedTerms: string[];
}

interface GeneratedTypeLiteralInterface_2 {
  score: number;
  matchedTerms: string[];
}

interface GeneratedTypeLiteralInterface_3 {
  keyword: string;
  count: number;
}

interface GeneratedTypeLiteralInterface_4 {
  keyword: string;
  count: number;
}

interface GeneratedTypeLiteralInterface_5 {
  documentCount: number;
  termCount: number;
  totalWords: number;
  lastUpdated: number;
}

export class KnowledgeIndex {
  private static instance: KnowledgeIndex | null = null;
  private context: common.UIAbilityContext;
  private filesDir: string;
  private indexFilePath: string;

  private documents: Map<string, IndexedDocument> = new Map();
  private invertedIndex: Map<string, DocumentTermInfo[]> = new Map();
  private similarityCalculator: SimilarityCalculator;

  private constructor(context: Context) {
    this.context = context as common.UIAbilityContext;
    this.filesDir = this.context.filesDir;
    this.indexFilePath = `${this.filesDir}/.knowledge_index.json`;
    this.similarityCalculator = SimilarityCalculator.getInstance(context);
    this.loadIndex();
  }

  static getInstance(context: Context): KnowledgeIndex {
    if (!KnowledgeIndex.instance) {
      KnowledgeIndex.instance = new KnowledgeIndex(context);
    }
    return KnowledgeIndex.instance;
  }

  /**
   * 加载索引
   */
  private loadIndex(): void {
    try {
      if (this.fileExists(this.indexFilePath)) {
        const file = fileIo.openSync(this.indexFilePath, fileIo.OpenMode.READ_ONLY);
        const stat = fileIo.statSync(this.indexFilePath);
        const buffer = new ArrayBuffer(stat.size);
        fileIo.readSync(file.fd, buffer);
        fileIo.closeSync(file);

        const content = this.arrayBufferToString(buffer);
        const index = JSON.parse(content) as PersistentIndex;

        // 重建内存索引
        index.documents.forEach((doc: IndexedDocument) => {
          this.documents.set(doc.filename, doc);
        });

        index.invertedIndex.forEach((entry: InvertedIndexEntry) => {
          this.invertedIndex.set(entry.term, entry.documents);
        });

        console.log('[KnowledgeIndex] 索引加载成功，文档数:', this.documents.size);
      }
    } catch (error) {
      console.error('[KnowledgeIndex] 加载索引失败:', error);
    }
  }

  /**
   * 保存索引
   */
  private saveIndex(): void {
    try {
      const documents: IndexedDocument[] = [];
      this.documents.forEach((doc: IndexedDocument) => {
        documents.push(doc);
      });

      const invertedIndex: InvertedIndexEntry[] = [];
      this.invertedIndex.forEach((docs: DocumentTermInfo[], term: string) => {
        invertedIndex.push({
          term: term,
          documents: docs
        });
      });

      const index: PersistentIndex = {
        version: 1,
        lastUpdated: Date.now(),
        documents: documents,
        invertedIndex: invertedIndex
      };

      const content = JSON.stringify(index, null, 2);
      const buffer = this.stringToArrayBuffer(content);

      const file = fileIo.openSync(
        this.indexFilePath,
        fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY | fileIo.OpenMode.TRUNC
      );
      fileIo.writeSync(file.fd, buffer);
      fileIo.closeSync(file);

      console.log('[KnowledgeIndex] 索引保存成功');
    } catch (error) {
      console.error('[KnowledgeIndex] 保存索引失败:', error);
    }
  }

  /**
   * 索引单个文档
   */
  indexDocument(filename: string, content: string): void {
    // 提取关键词
    const terms = this.similarityCalculator.extractTerms(content);
    const keywords = this.similarityCalculator.getTopKeywords(terms, 15);

    // 创建文档索引
    const doc: IndexedDocument = {
      filename: filename,
      content: content.substring(0, 5000), // 保留部分内容用于搜索
      keywords: keywords,
      wordCount: content.length,
      indexedAt: Date.now()
    };

    // 更新文档索引
    this.documents.set(filename, doc);

    // 更新倒排索引
    terms.forEach((frequency: number, term: string) => {
      let docList = this.invertedIndex.get(term);
      if (!docList) {
        docList = [];
        this.invertedIndex.set(term, docList);
      }

      // 查找是否已存在
      const existingIndex = docList.findIndex((d: DocumentTermInfo) => d.filename === filename);
      if (existingIndex >= 0) {
        docList[existingIndex].frequency = frequency;
      } else {
        docList.push({
          filename: filename,
          frequency: frequency,
          positions: []
        });
      }
    });

    console.log('[KnowledgeIndex] 文档已索引:', filename);
  }

  /**
   * 批量索引文档
   */
  async indexAllDocuments(
    onProgress?: (current: number, total: number, filename: string) => void
  ): Promise<number> {
    const allFiles = fileIo.listFileSync(this.filesDir);
    const txtFiles = allFiles.filter((f: string) => !f.startsWith('.') && f.endsWith('.txt'));

    let indexed = 0;
    for (let i = 0; i < txtFiles.length; i++) {
      const filename = txtFiles[i];

      if (onProgress) {
        onProgress(i + 1, txtFiles.length, filename);
      }

      try {
        const content = this.readFileContent(filename);
        if (content && content.length > 0) {
          this.indexDocument(filename, content);
          indexed++;
        }
      } catch (error) {
        console.error('[KnowledgeIndex] 索引文件失败:', filename, error);
      }
    }

    this.saveIndex();
    return indexed;
  }

  /**
   * 读取文件内容
   */
  private readFileContent(filename: string): string {
    try {
      const filePath = `${this.filesDir}/${filename}`;
      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(filePath);

      const maxSize = 100 * 1024;
      const readSize = Math.min(stat.size, maxSize);
      const buffer = new ArrayBuffer(readSize);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      return this.arrayBufferToString(buffer);
    } catch (error) {
      console.error('[KnowledgeIndex] 读取文件失败:', filename, error);
      return '';
    }
  }

  /**
   * 搜索文档
   */
  search(query: string, limit: number = 20): SearchResult[] {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const queryTerms = this.tokenize(query.toLowerCase());
    const scores = new Map<string, GeneratedTypeLiteralInterface_1>();

    // 对每个查询词进行搜索
    queryTerms.forEach((term: string) => {
      const docList = this.invertedIndex.get(term);
      if (docList) {
        docList.forEach((docInfo: DocumentTermInfo) => {
          const existing = scores.get(docInfo.filename);
          if (existing) {
            existing.score += docInfo.frequency;
            if (!existing.matchedTerms.includes(term)) {
              existing.matchedTerms.push(term);
            }
          } else {
            scores.set(docInfo.filename, {
              score: docInfo.frequency,
              matchedTerms: [term]
            });
          }
        });
      }
    });

    // 也搜索文档内容
    this.documents.forEach((doc: IndexedDocument, filename: string) => {
      const contentLower = doc.content.toLowerCase();
      let contentScore = 0;
      const matchedInContent: string[] = [];

      queryTerms.forEach((term: string) => {
        if (contentLower.includes(term)) {
          contentScore += 1;
          matchedInContent.push(term);
        }
      });

      if (contentScore > 0) {
        const existing = scores.get(filename);
        if (existing) {
          existing.score += contentScore * 0.5;
          matchedInContent.forEach((t: string) => {
            if (!existing.matchedTerms.includes(t)) {
              existing.matchedTerms.push(t);
            }
          });
        } else {
          scores.set(filename, {
            score: contentScore * 0.5,
            matchedTerms: matchedInContent
          });
        }
      }
    });

    // 转换为结果列表
    const results: SearchResult[] = [];
    scores.forEach((info: GeneratedTypeLiteralInterface_2, filename: string) => {
      const doc = this.documents.get(filename);
      const snippet = doc ? this.extractSnippet(doc.content, info.matchedTerms[0]) : '';

      results.push({
        filename: filename,
        score: info.score,
        matchedTerms: info.matchedTerms,
        snippet: snippet
      });
    });

    // 排序并限制数量
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * 提取摘要片段
   */
  private extractSnippet(content: string, term: string): string {
    const lowerContent = content.toLowerCase();
    const termIndex = lowerContent.indexOf(term.toLowerCase());

    if (termIndex === -1) {
      return content.substring(0, 100) + '...';
    }

    const start = Math.max(0, termIndex - 50);
    const end = Math.min(content.length, termIndex + term.length + 50);

    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * 分词
   */
  private tokenize(text: string): string[] {
    const words: string[] = [];

    // 中文
    const chineseMatches = text.match(/[\u4e00-\u9fa5]+/g);
    if (chineseMatches) {
      chineseMatches.forEach((match: string) => {
        for (let i = 0; i < match.length - 1; i++) {
          words.push(match.substring(i, i + 2));
        }
      });
    }

    // 英文
    const englishMatches = text.match(/[a-zA-Z]+/g);
    if (englishMatches) {
      englishMatches.forEach((word: string) => {
        if (word.length >= 2) {
          words.push(word.toLowerCase());
        }
      });
    }

    return words;
  }

  /**
   * 获取文档的关联文档
   */
  getRelatedDocuments(filename: string, limit: number = 5): KnowledgeLink[] {
    const doc = this.documents.get(filename);
    if (!doc) return [];

    const results: KnowledgeLink[] = [];

    this.documents.forEach((otherDoc: IndexedDocument, otherFilename: string) => {
      if (otherFilename === filename) return;

      // 计算关键词重叠
      const sharedKeywords: string[] = [];
      doc.keywords.forEach((keyword: string) => {
        if (otherDoc.keywords.includes(keyword)) {
          sharedKeywords.push(keyword);
        }
      });

      if (sharedKeywords.length > 0) {
        const strength = sharedKeywords.length / Math.max(doc.keywords.length, otherDoc.keywords.length);
        results.push({
          source: filename,
          target: otherFilename,
          strength: strength,
          sharedKeywords: sharedKeywords
        });
      }
    });

    // 排序并限制
    results.sort((a, b) => b.strength - a.strength);
    return results.slice(0, limit);
  }

  /**
   * 获取所有知识关联
   */
  getAllKnowledgeLinks(minStrength: number = 0.2): KnowledgeLink[] {
    const links: KnowledgeLink[] = [];
    const processed = new Set<string>();

    this.documents.forEach((doc: IndexedDocument, filename: string) => {
      this.documents.forEach((otherDoc: IndexedDocument, otherFilename: string) => {
        if (filename === otherFilename) return;

        const pairKey = [filename, otherFilename].sort().join('|');
        if (processed.has(pairKey)) return;
        processed.add(pairKey);

        // 计算关键词重叠
        const sharedKeywords: string[] = [];
        doc.keywords.forEach((keyword: string) => {
          if (otherDoc.keywords.includes(keyword)) {
            sharedKeywords.push(keyword);
          }
        });

        if (sharedKeywords.length > 0) {
          const strength = sharedKeywords.length / Math.max(doc.keywords.length, otherDoc.keywords.length);
          if (strength >= minStrength) {
            links.push({
              source: filename,
              target: otherFilename,
              strength: strength,
              sharedKeywords: sharedKeywords
            });
          }
        }
      });
    });

    links.sort((a, b) => b.strength - a.strength);
    return links;
  }

  /**
   * 获取知识图谱节点
   */
  getKnowledgeNodes(): KnowledgeNode[] {
    const links = this.getAllKnowledgeLinks(0.1);
    const connectionCount = new Map<string, number>();

    links.forEach((link: KnowledgeLink) => {
      connectionCount.set(link.source, (connectionCount.get(link.source) || 0) + 1);
      connectionCount.set(link.target, (connectionCount.get(link.target) || 0) + 1);
    });

    const nodes: KnowledgeNode[] = [];
    this.documents.forEach((doc: IndexedDocument, filename: string) => {
      nodes.push({
        filename: filename,
        keywords: doc.keywords,
        connections: connectionCount.get(filename) || 0
      });
    });

    nodes.sort((a, b) => b.connections - a.connections);
    return nodes;
  }

  /**
   * 获取热门关键词
   */
  getTopKeywords(limit: number = 20): Array<GeneratedTypeLiteralInterface_3> {
    const keywordCount = new Map<string, number>();

    this.documents.forEach((doc: IndexedDocument) => {
      doc.keywords.forEach((keyword: string) => {
        keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + 1);
      });
    });

    const results: Array<GeneratedTypeLiteralInterface_4> = [];
    keywordCount.forEach((count: number, keyword: string) => {
      results.push({ keyword: keyword, count: count });
    });

    results.sort((a, b) => b.count - a.count);
    return results.slice(0, limit);
  }

  /**
   * 获取索引统计
   */
  getStats(): GeneratedTypeLiteralInterface_5 {
    let totalWords = 0;
    this.documents.forEach((doc: IndexedDocument) => {
      totalWords += doc.wordCount;
    });

    return {
      documentCount: this.documents.size,
      termCount: this.invertedIndex.size,
      totalWords: totalWords,
      lastUpdated: Date.now()
    };
  }

  /**
   * 获取已索引的文档列表
   */
  getIndexedDocuments(): IndexedDocument[] {
    const docs: IndexedDocument[] = [];
    this.documents.forEach((doc: IndexedDocument) => {
      docs.push(doc);
    });
    return docs;
  }

  /**
   * 移除文档索引
   */
  removeDocument(filename: string): void {
    this.documents.delete(filename);

    // 清理倒排索引
    this.invertedIndex.forEach((docs: DocumentTermInfo[], term: string) => {
      const filtered = docs.filter((d: DocumentTermInfo) => d.filename !== filename);
      if (filtered.length === 0) {
        this.invertedIndex.delete(term);
      } else {
        this.invertedIndex.set(term, filtered);
      }
    });

    this.saveIndex();
  }

  /**
   * 清空索引
   */
  clearIndex(): void {
    this.documents.clear();
    this.invertedIndex.clear();
    this.saveIndex();
  }

  // 工具函数
  private fileExists(path: string): boolean {
    try {
      fileIo.accessSync(path);
      return true;
    } catch (e) {
      return false;
    }
  }

  private arrayBufferToString(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer);
    let result = '';
    for (let i = 0; i < uint8Array.length; i++) {
      result += String.fromCharCode(uint8Array[i]);
    }
    try {
      return decodeURIComponent(escape(result));
    } catch (e) {
      return result;
    }
  }

  private stringToArrayBuffer(str: string): ArrayBuffer {
    const utf8Str = unescape(encodeURIComponent(str));
    const buffer = new ArrayBuffer(utf8Str.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < utf8Str.length; i++) {
      view[i] = utf8Str.charCodeAt(i);
    }
    return buffer;
  }
}
