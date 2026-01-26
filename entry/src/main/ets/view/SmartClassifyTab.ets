/**
 * 智能分类 Tab 页面
 * 提供文档智能分类、摘要生成、关键词提取功能
 * 支持本地分类（基于关键词匹配）+ DeepSeek AI 摘要
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { util } from '@kit.ArkTS';
import { router } from '@kit.ArkUI';
import {
  DocumentCategory,
  getCategoryDisplayName
} from '../common/types/AIDocTypes';
import { SimilarityCalculator } from '../common/utils/SimilarityCalculator';
import { ContentParser, DocumentFormat } from '../common/utils/ContentParser';
import { DeepSeekService, AICallResult } from '../common/utils/DeepSeekService';
import { DiffUtils, DiffLine, DiffType, DiffResult } from '../common/utils/DiffUtils';
import { TrashManager } from '../common/utils/TrashManager';
import { KnowledgeIndex } from '../common/utils/KnowledgeIndex';

// API Key 存储文件名
const API_KEY_FILE = '.deepseek_api_key';

// 文件分析结果
interface FileAnalysis {
  filename: string;
  category: DocumentCategory;
  categoryName: string;
  confidence: number;
  keywords: string[];
  summary: string;
  wordCount: number;
  isAnalyzed: boolean;
}

// 相似文档结果
interface SimilarDoc {
  file1: string;
  file2: string;
  score: number;
  sharedTerms: string[];
}

// 类别统计
interface CategoryStat {
  category: DocumentCategory;
  name: string;
  count: number;
  color: string;
}

// 关键词规则（用于本地分类）
interface CategoryKeywords {
  category: DocumentCategory;
  keywords: string[];
}

// 分类结果
interface ClassificationResult {
  category: DocumentCategory;
  confidence: number;
}

// 图谱数据传递
interface GraphFileData {
  filename: string;
  category: DocumentCategory;
  categoryName: string;
  keywords: string[];
  summary: string;
}

@Component
export struct SmartClassifyTab {
  @State fileList: FileAnalysis[] = [];
  @State isLoading: boolean = false;
  @State isAnalyzing: boolean = false;
  @State selectedCategory: DocumentCategory | null = null;
  @State searchKeyword: string = '';
  @State showFileDetail: boolean = false;
  @State selectedFile: FileAnalysis | null = null;
  @State analysisProgress: number = 0;
  @State analysisProgressText: string = '';
  @State showMessage: boolean = false;
  @State messageText: string = '';
  @State messageType: string = 'info';
  @State analyzedCount: number = 0;
  @State similarDocs: SimilarDoc[] = [];
  @State showSimilarPanel: boolean = false;
  @State apiKey: string = '';
  @State showApiKeyInput: boolean = false;
  @State apiKeyInput: string = '';
  @State useAISummary: boolean = true;
  // 差异对比相关状态
  @State showDiffPanel: boolean = false;
  @State diffFile1: string = '';
  @State diffFile2: string = '';
  @State diffResult: DiffResult | null = null;
  @State isDeleting: boolean = false;
  private knowledgeIndex: KnowledgeIndex | null = null;
  private contentParser: ContentParser | null = null;
  private documentContents: Map<string, string> = new Map();
  private trashManager: TrashManager | null = null;

  private filesDir: string = '';
  private similarityCalculator: SimilarityCalculator | null = null;
  private categoryColors: Map<DocumentCategory, string> = new Map();
  private categoryRules: CategoryKeywords[] = [];

  aboutToAppear(): void {
    const context = this.getUIContext().getHostContext() as Context;
    const uiAbilityContext = context as common.UIAbilityContext;
    this.filesDir = uiAbilityContext.filesDir;
    this.similarityCalculator = SimilarityCalculator.getInstance(context);
    // 初始化 ContentParser
    this.contentParser = ContentParser.getInstance(context);
    // 初始化 TrashManager
    this.trashManager = TrashManager.getInstance(context);
    // 初始化 KnowledgeIndex
    this.knowledgeIndex = KnowledgeIndex.getInstance(context);

    // 初始化类别颜色
    this.initCategoryColors();

    // 初始化类别规则
    this.initCategoryRules();

    // 加载保存的 API Key
    this.loadApiKey();

    // 延迟加载文件列表
    setTimeout((): void => {
      this.loadFilesAsync();
    }, 200);
  }

  // 加载 API Key
  private loadApiKey(): void {
    try {
      const keyPath = `${this.filesDir}/${API_KEY_FILE}`;
      if (fileIo.accessSync(keyPath)) {
        const file = fileIo.openSync(keyPath, fileIo.OpenMode.READ_ONLY);
        const stat = fileIo.statSync(keyPath);
        const buffer = new ArrayBuffer(stat.size);
        fileIo.readSync(file.fd, buffer);
        fileIo.closeSync(file);
        const decoder = new util.TextDecoder('utf-8');
        this.apiKey = decoder.decodeWithStream(new Uint8Array(buffer), { stream: false }).trim();
        console.info('[SmartClassifyTab] API Key 已加载');
      }
    } catch (error) {
      console.warn('[SmartClassifyTab] 加载 API Key 失败:', error);
    }
  }

  // 保存 API Key
  private saveApiKey(key: string): void {
    try {
      const keyPath = `${this.filesDir}/${API_KEY_FILE}`;
      const file = fileIo.openSync(keyPath, fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.CREATE | fileIo.OpenMode.TRUNC);
      const encoder = new util.TextEncoder();
      const data = encoder.encodeInto(key);
      fileIo.writeSync(file.fd, data.buffer);
      fileIo.closeSync(file);
      this.apiKey = key;
      this.showApiKeyInput = false;
      this.showToast('API Key 已保存', 'success');
      console.info('[SmartClassifyTab] API Key 已保存');
    } catch (error) {
      console.error('[SmartClassifyTab] 保存 API Key 失败:', error);
      this.showToast('保存失败', 'error');
    }
  }

  // 初始化类别颜色
  private initCategoryColors(): void {
    this.categoryColors.set(DocumentCategory.MEETING_NOTES, '#FF9500');
    this.categoryColors.set(DocumentCategory.STUDY_NOTES, '#007AFF');
    this.categoryColors.set(DocumentCategory.PROJECT_REPORT, '#5856D6');
    this.categoryColors.set(DocumentCategory.PERSONAL_DIARY, '#FF2D55');
    this.categoryColors.set(DocumentCategory.TODO_LIST, '#34C759');
    this.categoryColors.set(DocumentCategory.TECHNICAL_DOC, '#00C7BE');
    this.categoryColors.set(DocumentCategory.OTHER, '#8E8E93');
  }

  // 初始化类别规则
  private initCategoryRules(): void {
    this.categoryRules = [
      {
        category: DocumentCategory.MEETING_NOTES,
        keywords: ['会议', '讨论', '决议', '参会', '议题', '会议纪要', '纪要', '出席', '主持',
          'meeting', 'minutes', 'discussion', 'attendees', 'agenda']
      },
      {
        category: DocumentCategory.STUDY_NOTES,
        keywords: ['学习', '笔记', '知识点', '总结', '复习', '课程', '教程', '概念', '定义',
          'study', 'notes', 'learn', 'course', 'lesson', 'chapter']
      },
      {
        category: DocumentCategory.PROJECT_REPORT,
        keywords: ['项目', '报告', '进度', '计划', '里程碑', '需求', '设计', '开发', '测试',
          'project', 'report', 'progress', 'milestone', 'requirement', 'development']
      },
      {
        category: DocumentCategory.PERSONAL_DIARY,
        keywords: ['日记', '心情', '感想', '今天', '生活', '感受', '记录', '日志',
          'diary', 'journal', 'today', 'feeling', 'life', 'mood']
      },
      {
        category: DocumentCategory.TODO_LIST,
        keywords: ['待办', '任务', '清单', '计划', '事项', '完成', '进行中', '优先级',
          'todo', 'task', 'list', 'plan', 'priority', 'done', 'pending']
      },
      {
        category: DocumentCategory.TECHNICAL_DOC,
        keywords: ['技术', '文档', '接口', 'API', '函数', '方法', '参数', '返回值', '代码',
          'technical', 'documentation', 'interface', 'function', 'method', 'parameter']
      }
    ];
  }

  // =============== 文件操作 ===============

  // 异步加载文件列表
  private async loadFilesAsync(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.fileList = [];
    this.analyzedCount = 0;

    try {
      const maxFiles = 50;
      let allFiles: string[] = fileIo.listFileSync(this.filesDir);
      allFiles=allFiles.filter(f => !f.startsWith('.'));
      // const txtFiles: string[] = allFiles.filter((f: string): boolean => {
      //   return !f.startsWith('.') && f.endsWith('.txt');
      // }).slice(0, maxFiles);

      if (allFiles.length > maxFiles) {
        this.showToast(`文件过多，仅显示前${maxFiles}个`, 'warning');
      }

      // 分批创建文件对象
      const batchSize = 5;
      const tempList: FileAnalysis[] = [];

      for (let i = 0; i < allFiles.length; i += batchSize) {
        const batch: string[] = allFiles.slice(i, i + batchSize);
        batch.forEach((filename: string): void => {
          tempList.push({
            filename: filename,
            category: DocumentCategory.OTHER,
            categoryName: '未分类',
            confidence: 0,
            keywords: [],
            summary: '',
            wordCount: 0,
            isAnalyzed: false
          });
        });

        this.fileList = tempList.slice();
        await this.delay(50);
      }

      console.info('[SmartClassifyTab] 文件加载完成:', this.fileList.length);
    } catch (error) {
      console.error('[SmartClassifyTab] 加载文件失败:', JSON.stringify(error));
      this.showToast('加载文件失败', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // 读取文件内容（优化版）
  // 重点实现docx文件的context和pdf的context的读取！

  // private readFileContent(filename: string): string {
  //   try {
  //     const filePath = `${this.filesDir}/${filename}`;
  //     const stat = fileIo.statSync(filePath);
  //     const maxSize = 20 * 1024;
  //     const readSize = Math.min(stat.size, maxSize);
  //
  //     if (readSize === 0) {
  //       return '';
  //     }
  //
  //     // const arrayBuffer = new ArrayBuffer(readSize);
  //     // const fd = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
  //     // fileIo.readSync(fd, arrayBuffer);
  //     // fileIo.closeSync(fd);
  //
  //     const arrayBuffer = new ArrayBuffer(readSize);
  //     // 打开文件，获取文件对象
  //     const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
  //     // 从文件对象中获取文件描述符（fd）
  //     const fd = file.fd;
  //
  //     // 使用文件描述符读取文件
  //     fileIo.readSync(fd, arrayBuffer);
  //     // 使用文件描述符关闭文件
  //     fileIo.closeSync(fd);
  //
  //     const decoder = new util.TextDecoder('utf-8');
  //     return decoder.decodeWithStream(new Uint8Array(arrayBuffer), { stream: false });
  //   } catch (error) {
  //     console.error('[SmartClassifyTab] 读取文件失败:', filename, JSON.stringify(error));
  //     return '';
  //   }
  // }

  // 修改：读取文件内容（使用 ContentParser）
  private async readFileContent(filename: string): Promise<string> {
    if (!this.contentParser) {
      console.error('[SmartClassifyTab] ContentParser 未初始化');
      return '';
    }

    try {
      // 检查文件是否支持
      if (!this.contentParser.isSupported(filename)) {
        const extension = filename.toLowerCase().split('.').pop() || '';
        console.warn(`[SmartClassifyTab] 不支持的文件格式: ${extension}`);
        return '';
      }

      // 使用 ContentParser 解析文档
      const result = await this.contentParser.parseDocument(filename);

      if (result.success) {
        console.info(`[SmartClassifyTab] 成功读取文件: ${filename}, 字数: ${result.wordCount}`);
        return result.content;
      } else {
        console.error(`[SmartClassifyTab] 读取文件失败: ${filename}, 错误: ${result.error}`);
        return '';
      }
    } catch (error) {
      console.error('[SmartClassifyTab] 读取文件失败:', filename, JSON.stringify(error));
      return '';
    }
  }


  // =============== 分析功能 ===============

  // 本地分类
  private classifyLocal(content: string): ClassificationResult {
    if (content.length === 0) {
      return { category: DocumentCategory.OTHER, confidence: 0.5 };
    }

    const contentLower = content.toLowerCase();
    let bestCategory = DocumentCategory.OTHER;
    let bestScore = 0;

    this.categoryRules.forEach((rule: CategoryKeywords): void => {
      let score = 0;
      rule.keywords.forEach((keyword: string): void => {
        if (contentLower.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });

      const normalizedScore = score / rule.keywords.length;
      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestCategory = rule.category;
      }
    });

    if (bestScore < 0.1) {
      bestCategory = DocumentCategory.OTHER;
      bestScore = 0.5;
    }

    return {
      category: bestCategory,
      confidence: Math.min(bestScore * 2, 1)
    };
  }

  // 提取关键词
  private extractKeywords(content: string): string[] {
    if (!this.similarityCalculator || content.length === 0) {
      return [];
    }

    try {
      const terms = this.similarityCalculator.extractTerms(content);
      return this.similarityCalculator.getTopKeywords(terms, 6);
    } catch (error) {
      console.error('[SmartClassifyTab] 提取关键词失败:', JSON.stringify(error));
      return [];
    }
  }

  // 生成摘要（支持 AI 和本地两种模式）
  private async generateSummaryAsync(content: string): Promise<string> {
    if (content.length === 0) {
      return '';
    }

    // 如果启用 AI 摘要且有 API Key，使用 DeepSeek
    if (this.useAISummary && this.apiKey && this.apiKey.length > 0) {
      try {
        const result: AICallResult = await DeepSeekService.summarizeDocument(content, this.apiKey);
        if (result.success && result.content.length > 0) {
          return result.content;
        }
      } catch (error) {
        console.warn('[SmartClassifyTab] AI 摘要失败，使用本地摘要:', error);
      }
    }

    // 本地摘要作为后备
    return this.generateLocalSummary(content);
  }

  // 本地生成摘要
  private generateLocalSummary(content: string): string {
    if (content.length === 0) {
      return '';
    }

    // 清理内容，移除多余空白
    const cleanContent = content.replace(/\s+/g, ' ').trim();

    // 按句子分割（支持中英文标点）
    const sentences: string[] = cleanContent.split(/[。！？；\.\!\?\;]+/);
    const validSentences: string[] = sentences.filter((s: string): boolean => {
      const trimmed = s.trim();
      // 过滤太短或包含乱码的句子
      return trimmed.length > 8 && this.isReadableText(trimmed);
    });

    if (validSentences.length === 0) {
      // 如果没有有效句子，直接截取前200字
      const fallback = cleanContent.substring(0, 200);
      return this.isReadableText(fallback) ? fallback + '...' : '';
    }

    // 取前3-4句话，目标200-300字
    const summaryParts: string[] = [];
    let totalLength = 0;
    const maxLength = 280;
    const maxSentences = 4;

    for (let i = 0; i < validSentences.length && summaryParts.length < maxSentences; i++) {
      const sentence = validSentences[i].trim();
      if (totalLength + sentence.length <= maxLength) {
        summaryParts.push(sentence);
        totalLength += sentence.length;
      } else if (summaryParts.length === 0) {
        // 第一句太长，截取部分
        summaryParts.push(sentence.substring(0, maxLength));
        break;
      } else {
        break;
      }
    }

    let summary = summaryParts.join('。');
    // 确保以标点结尾
    if (summary.length > 0 && !summary.match(/[。！？；\.\!\?\;]$/)) {
      summary += '。';
    }

    return summary;
  }

  // 检查文本是否可读（非乱码）
  private isReadableText(text: string): boolean {
    if (text.length === 0) return false;

    // 统计可读字符比例
    let readableCount = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      // 中文字符、英文字母、数字、常见标点
      if ((code >= 0x4E00 && code <= 0x9FFF) || // 中文
        (code >= 0x0041 && code <= 0x005A) || // A-Z
        (code >= 0x0061 && code <= 0x007A) || // a-z
        (code >= 0x0030 && code <= 0x0039) || // 0-9
        code === 0x0020 || // 空格
        (code >= 0x3000 && code <= 0x303F) || // 中文标点
        (code >= 0xFF00 && code <= 0xFFEF)) { // 全角字符
        readableCount++;
      }
    }

    // 可读字符占比超过60%认为是有效文本
    return (readableCount / text.length) > 0.6;
  }

  // 修改：分析单个文件（需要改为 async）
  private async analyzeFile(index: number): Promise<FileAnalysis | null> {
    const file = this.fileList[index];
    if (!file) {
      return null;
    }

    try {
      const content = await this.readFileContent(file.filename);
      if (!content || content.length < 10) {
        return null;
      }

      // 存储内容用于相似度计算
      this.documentContents.set(file.filename, content);

      const classification = this.classifyLocal(content);
      const keywords = this.extractKeywords(content);
      const summary = await this.generateSummaryAsync(content);

      return {
        filename: file.filename,
        category: classification.category,
        categoryName: getCategoryDisplayName(classification.category),
        confidence: classification.confidence,
        keywords: keywords,
        summary: summary,
        wordCount: content.length,
        isAnalyzed: true
      };
    } catch (error) {
      console.error('[SmartClassifyTab] 分析文件失败:', file.filename, JSON.stringify(error));
      return null;
    }
  }

  // 计算文档相似度
  private async calculateSimilarity(): Promise<void> {
    if (!this.similarityCalculator || this.documentContents.size < 2) {
      return;
    }

    try {
      this.showToast('正在计算文档相似度...', 'info');

      const results = await this.similarityCalculator.batchCalculateSimilarity(
        this.documentContents,
        0.25 // 相似度阈值
      );

      // 转换为 SimilarDoc 格式
      const similarResults: SimilarDoc[] = [];
      results.forEach((r): void => {
        similarResults.push({
          file1: r.file1,
          file2: r.file2,
          score: r.score,
          sharedTerms: r.sharedTerms
        });
      });

      this.similarDocs = similarResults.slice(0, 20); // 最多显示20对

      if (this.similarDocs.length > 0) {
        this.showToast(`发现 ${this.similarDocs.length} 对相似文档`, 'success');
        this.showSimilarPanel = true;
      }
    } catch (error) {
      console.error('[SmartClassifyTab] 相似度计算失败:', JSON.stringify(error));
    }
  }

  // 显示差异对比
  private async showDiff(file1: string, file2: string): Promise<void> {
    const content1 = this.documentContents.get(file1) || '';
    const content2 = this.documentContents.get(file2) || '';

    if (!content1 || !content2) {
      this.showToast('无法读取文件内容', 'error');
      return;
    }

    this.diffFile1 = file1;
    this.diffFile2 = file2;
    this.diffResult = DiffUtils.diff(content1, content2);
    this.showDiffPanel = true;
  }


  // 清理合并后的内容
  private cleanMergedContent(content: string): string {
    if (!content) return '';

    // 移除连续的空行
    let cleaned = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    // 移除开头和结尾的空白
    cleaned = cleaned.trim();

    // 确保句子以标点结尾
    if (cleaned.length > 0) {
      const lastChar = cleaned.charAt(cleaned.length - 1);
      const punctuation = '。！？.!?;；';
      if (!punctuation.includes(lastChar)) {
        cleaned += '。';
      }
    }

    return cleaned;
  }



  // 合并两个文档，去除重复部分，保留所有非重复内容
  private async mergeDocuments(file1: string, file2: string): Promise<string> {
    try {
      const content1 = this.documentContents.get(file1) || '';
      const content2 = this.documentContents.get(file2) || '';

      if (!content1 || !content2) {
        this.showToast('无法读取文件内容', 'error');
        return '';
      }

      // 计算差异
      const diffResult = DiffUtils.diff(content1, content2);

      if (diffResult.similarity >= 0.99) {
        // 如果几乎完全相同，返回任一文档即可
        return content1;
      }

      // 智能合并策略
      const mergedContent = await this.smartMergeContent(diffResult);
      return mergedContent;
    } catch (error) {
      console.error('[SmartClassifyTab] 合并文档失败:', error);
      this.showToast('合并失败', 'error');
      return '';
    }
  }

  // 智能合并内容
  private async smartMergeContent(diffResult: DiffResult): Promise<string> {
    // 策略1：基于行的智能合并
    const lineBased = this.mergeByLine(diffResult);

    // 策略2：基于段落的重构（更高级）
    const paragraphBased = await this.mergeByParagraph(diffResult);

    // 选择更好的合并结果（按字数或质量）
    // return lineBased
    return lineBased.length > paragraphBased.length ? lineBased : paragraphBased;
  }

  // 基于行的合并策略
  private mergeByLine(diffResult: DiffResult): string {
    const mergedLines: string[] = [];
    let inSameBlock = false;

    diffResult.lines.forEach((line: DiffLine, index: number): void => {
      switch (line.type) {
        case DiffType.SAME:
          // 相同内容只保留一次
          if (!inSameBlock) {
            mergedLines.push(line.content);
            inSameBlock = true;
          }
          break;

        case DiffType.REMOVED:
          // file1独有的内容
          mergedLines.push(line.content);
          inSameBlock = false;
          break;

        case DiffType.ADDED:
          // file2独有的内容
          mergedLines.push(line.content);
          inSameBlock = false;
          break;
      }

      // // 检查是否需要添加换行（保持段落结构）
      // if (this.shouldAddLineBreak(line, diffResult.lines[index + 1])) {
      //   mergedLines.push('');
      // }
    });

    return this.cleanMergedContent(mergedLines.join('\n'));
  }

  // 基于段落的合并策略（更智能）
  private async mergeByParagraph(diffResult: DiffResult): Promise<string> {
    // 将内容按段落分割
    const paragraphs1 = this.extractParagraphsFromDiff(diffResult, DiffType.REMOVED, DiffType.SAME);
    const paragraphs2 = this.extractParagraphsFromDiff(diffResult, DiffType.ADDED, DiffType.SAME);

    // 合并段落（去除重复段落）
    const uniqueParagraphs = this.mergeUniqueParagraphs(paragraphs1, paragraphs2);

    // 重排序段落（基于语义相似度）
    const reorderedParagraphs = await this.reorderParagraphs(uniqueParagraphs);

    return reorderedParagraphs.join('\n\n');
  }

  // 从差异结果中提取段落
  private extractParagraphsFromDiff(diffResult: DiffResult, ...types: DiffType[]): string[] {
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    diffResult.lines.forEach((line: DiffLine): void => {
      if (types.includes(line.type)) {
        currentParagraph.push(line.content);
      } else if (currentParagraph.length > 0) {
        // 段落结束
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    });

    // 处理最后一个段落
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }

    return paragraphs.filter(p => p.trim().length > 0);
  }

  // 合并独特段落
  private mergeUniqueParagraphs(paragraphs1: string[], paragraphs2: string[]): string[] {
    const allParagraphs = [...paragraphs1, ...paragraphs2];
    const uniqueParagraphs: string[] = [];
    const seenParagraphs = new Set<string>();

    // 基于内容哈希去重
    allParagraphs.forEach((paragraph: string): void => {
      const normalized = this.normalizeText(paragraph);
      if (!seenParagraphs.has(normalized) && paragraph.trim().length > 10) {
        uniqueParagraphs.push(paragraph);
        seenParagraphs.add(normalized);
      }
    });

    return uniqueParagraphs;
  }

  // 重排序段落（基于相似度）
  private async reorderParagraphs(paragraphs: string[]): Promise<string[]> {
    if (paragraphs.length <= 1) return paragraphs;

    // 简单策略：按长度排序（长的在前，短的在后）
    return paragraphs.sort((a: string, b: string): number => {
      return b.length - a.length;
    });

    // 高级策略：可以使用AI或更复杂的算法来重排序
    // 例如：基于主题连贯性、时间顺序等
  }

  // 规范化文本（用于比较）
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\u4e00-\u9fa5]/g, '')
      .trim();
  }

  // 判断是否应该添加换行
  private shouldAddLineBreak(currentLine: DiffLine, nextLine?: DiffLine): boolean {
    if (!nextLine) return false;

    // 当前行以句号结尾且下一行不以空白开头
    const endsWithPunctuation = /[。！？.!?;；]$/.test(currentLine.content.trim());
    const nextStartsWithNewTopic = /^(第[一二三四五六七八九十]|[0-9]+\.|•|-)/
      .test(nextLine.content.trim());

    return endsWithPunctuation || nextStartsWithNewTopic;
  }

  // 保存合并后的文档（增强版）
  private async saveMergedDocument(file1: string, file2: string, content: string): Promise<string> {
    try {
      if (!content || content.trim().length < 20) {
        this.showToast('合并内容过少，无法保存', 'warning');
        return '';
      }

      // 生成更有意义的文件名
      const baseName1 = this.extractBaseName(file1);
      const baseName2 = this.extractBaseName(file2);

      // 分析合并后文档的主题
      const keywords = this.extractKeywords(content).slice(0, 3);
      const mainTopic = keywords.length > 0 ? keywords[0] : '合并';

      const timestamp = new Date().getTime();
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');

      const newFilename = `Merge_${baseName1}_${baseName2}_at_${dateStr}.txt`;

      // 保存文件
      const filePath = `${this.filesDir}/${newFilename}`;
      const file = fileIo.openSync(
        filePath,
        fileIo.OpenMode.CREATE | fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.TRUNC
      );

      const encoder = new util.TextEncoder();
      const encodedContent = encoder.encodeInto(content);
      fileIo.writeSync(file.fd, encodedContent.buffer);
      fileIo.closeSync(file);

      // 添加元信息头部
      const enhancedContent = this.addMetadataHeader(content, file1, file2, newFilename);
      // 重新写入增强的内容
      const file2write = fileIo.openSync(
        filePath,
        fileIo.OpenMode.WRITE_ONLY | fileIo.OpenMode.TRUNC
      );
      const encodedEnhanced = encoder.encodeInto(enhancedContent);
      fileIo.writeSync(file2write.fd, encodedEnhanced.buffer);
      fileIo.closeSync(file2write);

      this.showToast(`合并完成: ${newFilename}`, 'success');

      // 将新文件添加到列表并自动分析
      await this.addAndAnalyzeNewFile(newFilename, enhancedContent);

      return newFilename;
    }catch (error) {
      console.error('[SmartClassifyTab] 保存合并文档失败:', error);
      this.showToast('保存失败', 'error');
      return '';
    }
  }

  // 添加元信息头部
  private addMetadataHeader(content: string, source1: string, source2: string, newFilename: string): string {
    const header = [
      `合并文档: ${newFilename}`,
      `来源文件:`,
      `- ${source1}`,
      `- ${source2}`,
      `合并时间: ${new Date().toLocaleString()}`,
      `总字数: ${content.length}`,
      `---`,
      ''
    ].join('\n');

    return header + content;
  }

  // 提取基础名称
  private extractBaseName(filename: string): string {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    // 截取前10个字符，避免文件名过长
    return nameWithoutExt.substring(0, 10);
  }

  // 添加并分析新文件
  private async addAndAnalyzeNewFile(filename: string, content: string): Promise<void> {
    // 添加到内容映射
    this.documentContents.set(filename, content);

    // 创建文件分析对象
    const newFile: FileAnalysis = {
      filename: filename,
      category: DocumentCategory.OTHER,
      categoryName: '未分类',
      confidence: 0,
      keywords: [],
      summary: '',
      wordCount: content.length,
      isAnalyzed: false
    };

    // 添加到文件列表
    this.fileList = [...this.fileList, newFile];

    // 异步分析新文件
    setTimeout(async (): Promise<void> => {
      const index = this.fileList.findIndex(f => f.filename === filename);
      if (index >= 0) {
        const analyzed = await this.analyzeFile(index);
        if (analyzed) {
          this.fileList[index] = analyzed;
          this.fileList = this.fileList.slice();
        }
      }
    }, 500);
  }


  // 删除重复文件（移动到回收站）
  private async deleteDuplicate(fileToDelete: string): Promise<void> {
    if (this.isDeleting || !this.trashManager) return;
    this.isDeleting = true;

    try {
      if (this.trashManager.moveToTrash(fileToDelete)) {
        // 从列表中移除
        this.fileList = this.fileList.filter((f: FileAnalysis): boolean => f.filename !== fileToDelete);
        this.documentContents.delete(fileToDelete);

        // 从相似文档中移除相关项
        this.similarDocs = this.similarDocs.filter((doc: SimilarDoc): boolean =>
          doc.file1 !== fileToDelete && doc.file2 !== fileToDelete
        );

        this.showToast(`已移至回收站: ${fileToDelete}`, 'success');
        this.showDiffPanel = false;
      } else {
        this.showToast('删除失败', 'error');
      }
    } catch (error) {
      console.error('[SmartClassifyTab] 删除文件失败:', JSON.stringify(error));
      this.showToast('删除失败', 'error');
    } finally {
      this.isDeleting = false;
    }
  }

  // 一键删除所有100%重复文件（移动到回收站）
  private async deleteAllDuplicates(): Promise<void> {
    if (this.isDeleting || !this.trashManager) return;

    const duplicates = this.similarDocs.filter((doc: SimilarDoc): boolean => doc.score >= 0.99);
    if (duplicates.length === 0) {
      this.showToast('没有完全重复的文件', 'info');
      return;
    }

    this.isDeleting = true;
    let deleted = 0;
    const toDelete = new Set<string>();

    // 收集要删除的文件（每对保留第一个）
    duplicates.forEach((doc: SimilarDoc): void => {
      if (!toDelete.has(doc.file1)) {
        toDelete.add(doc.file2);
      }
    });

    // 执行删除（移动到回收站）
    toDelete.forEach((filename: string): void => {
      if (this.trashManager && this.trashManager.moveToTrash(filename)) {
        deleted++;
      }
    });

    // 更新列表
    this.fileList = this.fileList.filter((f: FileAnalysis): boolean => !toDelete.has(f.filename));
    toDelete.forEach((filename: string): void => {
      this.documentContents.delete(filename);
    });

    // 更新相似文档列表
    this.similarDocs = this.similarDocs.filter((doc: SimilarDoc): boolean =>
      !toDelete.has(doc.file1) && !toDelete.has(doc.file2)
    );

    this.showToast(`已移至回收站 ${deleted} 个文件`, 'success');
    this.isDeleting = false;
  }

  // 构建知识图谱
  private buildKnowledgeGraph(): void {
    if (!this.knowledgeIndex) return;

    // 索引已分析的文档
    this.fileList.forEach((file: FileAnalysis) => {
      if (file.isAnalyzed) {
        const content = this.documentContents.get(file.filename);
        if (content) {
          this.knowledgeIndex!.indexDocument(file.filename, content);
        }
      }
    });

    // 检查节点数量
    const nodes = this.knowledgeIndex.getKnowledgeNodes();
    if (nodes.length < 2) {
      this.showToast('文档数量不足，至少需要2个已分析文档', 'warning');
      return;
    }

    // 准备传递给图谱页面的数据
    const analysisData: GraphFileData[] = [];
    this.fileList.forEach((f: FileAnalysis) => {
      if (f.isAnalyzed) {
        const item: GraphFileData = {
          filename: f.filename,
          category: f.category,
          categoryName: f.categoryName,
          keywords: f.keywords,
          summary: f.summary
        };
        analysisData.push(item);
      }
    });

    // 跳转到图谱页面
    router.pushUrl({
      url: 'pages/KnowledgeGraphPage',
      params: {
        fileAnalysisList: JSON.stringify(analysisData)
      }
    });
  }


  // 批量分析文件
  private async analyzeAllFiles(): Promise<void> {
    if (this.isAnalyzing) {
      return;
    }

    this.isAnalyzing = true;
    this.analysisProgress = 0;
    this.analyzedCount = 0;
    this.showToast('开始分析文档...', 'info');

    const total = this.fileList.length;
    if (total === 0) {
      this.isAnalyzing = false;
      return;
    }

    try {
      const batchSize = 2;
      const delayBetweenBatches = 150;
      let analyzed = 0;

      for (let i = 0; i < total; i += batchSize) {
        const endIndex = Math.min(i + batchSize, total);

        for (let j = i; j < endIndex; j++) {
          const result = await this.analyzeFile(j); // 改为 await
          if (result) {
            this.fileList[j] = result;
            analyzed++;
            this.analyzedCount = analyzed;
          }

          this.analysisProgress = Math.floor(((j + 1) / total) * 100);
          this.analysisProgressText = `${j + 1}/${total}`;
        }

        this.fileList = this.fileList.slice();
        await this.delay(delayBetweenBatches);
      }

      this.showToast(`分析完成！共分析 ${analyzed} 个文件`, 'success');

      // 计算相似度
      if (analyzed >= 2) {
        await this.calculateSimilarity();
      }
    } catch (error) {
      console.error('[SmartClassifyTab] 分析过程出错:', JSON.stringify(error));
      this.showToast('分析过程出错', 'error');
    } finally {
      this.isAnalyzing = false;
    }
  }

  // =============== UI辅助方法 ===============

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise<void>((resolve: (value: void) => void): void => {
      setTimeout((): void => {
        resolve();
      }, ms);
    });
  }

  // 显示提示消息
  private showToast(message: string, type: string): void {
    this.messageText = message;
    this.messageType = type;
    this.showMessage = true;
    setTimeout((): void => {
      this.showMessage = false;
    }, 3000);
  }

  // 获取过滤后的文件列表
  private getFilteredFiles(): FileAnalysis[] {
    let filtered: FileAnalysis[] = this.fileList;

    if (this.selectedCategory !== null) {
      filtered = filtered.filter((f: FileAnalysis): boolean => {
        return f.category === this.selectedCategory;
      });
    }

    if (this.searchKeyword.trim().length > 0) {
      const keyword = this.searchKeyword.toLowerCase();
      filtered = filtered.filter((f: FileAnalysis): boolean => {
        const nameMatch: boolean = f.filename.toLowerCase().includes(keyword);
        const keywordMatch: boolean = f.keywords.some((k: string): boolean => {
          return k.toLowerCase().includes(keyword);
        });
        const summaryMatch: boolean = f.summary.toLowerCase().includes(keyword);
        return nameMatch || keywordMatch || summaryMatch;
      });
    }

    return filtered;
  }

  // 获取类别统计
  private getCategoryStats(): CategoryStat[] {
    const stats: Map<DocumentCategory, number> = new Map<DocumentCategory, number>();

    this.fileList.forEach((file: FileAnalysis): void => {
      if (file.isAnalyzed) {
        const count: number | undefined = stats.get(file.category);
        stats.set(file.category, (count || 0) + 1);
      }
    });

    const result: CategoryStat[] = [];
    stats.forEach((count: number, category: DocumentCategory): void => {
      const color: string | undefined = this.categoryColors.get(category);
      result.push({
        category: category,
        name: getCategoryDisplayName(category),
        count: count,
        color: color || '#8E8E93'
      });
    });

    result.sort((a: CategoryStat, b: CategoryStat): number => {
      return b.count - a.count;
    });

    return result;
  }

  // 获取已分析文件数
  private getAnalyzedCount(): number {
    return this.analyzedCount;
  }

  // 获取类别颜色
  private getCategoryColor(category: DocumentCategory): string {
    const color: string | undefined = this.categoryColors.get(category);
    return color || '#8E8E93';
  }

  build() {
    Column() {
      // 顶部标题
      Column() {
        Text('智能分类')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ bottom: 8 })

        Text(`共 ${this.fileList.length} 个文件，已分析 ${this.getAnalyzedCount()} 个`)
          .fontSize(12)
          .fontColor('#8E8E93')
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 8 })
      .alignItems(HorizontalAlign.Start)

      // AI 设置行
      Row({ space: 8 }) {
        Toggle({ type: ToggleType.Switch, isOn: this.useAISummary })
          .onChange((isOn: boolean): void => {
            this.useAISummary = isOn;
          })
          .width(45)
          .height(26)

        Text('AI摘要')
          .fontSize(13)
          .fontColor('#333333')

        Blank()

        Text(this.apiKey ? 'API已设置' : '未设置API')
          .fontSize(12)
          .fontColor(this.apiKey ? '#34C759' : '#FF9500')

        Button('设置')
          .onClick((): void => {
            this.apiKeyInput = this.apiKey;
            this.showApiKeyInput = true;
          })
          .height(28)
          .fontSize(12)
          .backgroundColor('#E0E0E0')
          .fontColor('#333333')
          .borderRadius(6)
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 8 })

      // 操作按钮
      Row({ space: 10 }) {
        Button(this.isAnalyzing ? '分析中...' : '开始分析')
          .onClick((): void => {
            this.analyzeAllFiles();
          })
          .enabled(!this.isAnalyzing && this.fileList.length > 0)
          .height(40)
          .fontSize(14)
          .backgroundColor(this.isAnalyzing ? '#C7C7CC' : '#007AFF')
          .fontColor(Color.White)
          .borderRadius(8)
          .layoutWeight(1)

        Button('刷新列表')
          .onClick((): void => {
            this.loadFilesAsync();
          })
          .enabled(!this.isLoading && !this.isAnalyzing)
          .height(40)
          .fontSize(14)
          .backgroundColor('#34C759')
          .fontColor(Color.White)
          .borderRadius(8)
          .layoutWeight(1)

        // 相似文档按钮
        if (this.similarDocs.length > 0 && !this.showSimilarPanel) {
          Button(`相似(${this.similarDocs.length})`)
            .onClick((): void => {
              this.showSimilarPanel = true;
            })
            .height(40)
            .fontSize(14)
            .backgroundColor('#FF9500')
            .fontColor(Color.White)
            .borderRadius(8)
            .width(80)
        }

        // 知识图谱按钮
        if (this.getAnalyzedCount() >= 2) {
          Button('图谱')
            .onClick((): void => {
              this.buildKnowledgeGraph();
            })
            .height(40)
            .fontSize(14)
            .backgroundColor('#5856D6')
            .fontColor(Color.White)
            .borderRadius(8)
            .width(60)
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 12 })

      // 分析进度
      if (this.isAnalyzing) {
        Column() {
          Row() {
            Text('分析进度')
              .fontSize(14)
              .fontColor('#333333')
              .layoutWeight(1)
            Text(`${this.analysisProgress}%`)
              .fontSize(14)
              .fontColor('#007AFF')
              .fontWeight(FontWeight.Bold)
          }
          .width('100%')
          .margin({ bottom: 8 })

          Progress({ value: this.analysisProgress, total: 100, type: ProgressType.Linear })
            .color('#007AFF')
            .backgroundColor('#E0E0E0')
            .height(8)
            .width('100%')
            .borderRadius(4)

          if (this.analysisProgressText) {
            Text(`已分析: ${this.analysisProgressText}`)
              .fontSize(12)
              .fontColor('#8E8E93')
              .margin({ top: 6 })
          }
        }
        .width('100%')
        .padding(16)
        .backgroundColor('#F8F8F8')
        .borderRadius(12)
        .margin({ left: 16, right: 16, bottom: 12 })
      }

      // 消息提示
      if (this.showMessage) {
        Text(this.messageText)
          .fontSize(14)
          .fontColor('#FFFFFF')
          .backgroundColor(
            this.messageType === 'success' ? '#34C759' :
              (this.messageType === 'error' ? '#FF3B30' : '#007AFF')
          )
          .padding({ left: 16, right: 16, top: 8, bottom: 8 })
          .borderRadius(8)
          .margin({ left: 16, right: 16, bottom: 8 })
      }

      // 类别统计卡片
      if (this.getAnalyzedCount() > 0) {
        Scroll() {
          Row({ space: 8 }) {
            // 全部按钮
            Column() {
              Text(`${this.getAnalyzedCount()}`)
                .fontSize(18)
                .fontWeight(FontWeight.Bold)
                .fontColor(this.selectedCategory === null ? '#FFFFFF' : '#333333')
              Text('全部')
                .fontSize(11)
                .fontColor(this.selectedCategory === null ? '#FFFFFF' : '#666666')
            }
            .width(70)
            .height(60)
            .backgroundColor(this.selectedCategory === null ? '#007AFF' : '#F0F0F0')
            .borderRadius(10)
            .justifyContent(FlexAlign.Center)
            .onClick((): void => {
              this.selectedCategory = null;
            })

            ForEach(this.getCategoryStats(), (stat: CategoryStat) => {
              Column() {
                Text(`${stat.count}`)
                  .fontSize(18)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(this.selectedCategory === stat.category ? '#FFFFFF' : '#333333')
                Text(stat.name)
                  .fontSize(10)
                  .fontColor(this.selectedCategory === stat.category ? '#FFFFFF' : '#666666')
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
              }
              .width(70)
              .height(60)
              .backgroundColor(this.selectedCategory === stat.category ? stat.color : '#F0F0F0')
              .borderRadius(10)
              .justifyContent(FlexAlign.Center)
              .onClick((): void => {
                if (this.selectedCategory === stat.category) {
                  this.selectedCategory = null;
                } else {
                  this.selectedCategory = stat.category;
                }
              })
            })
          }
          .padding({ left: 16, right: 16 })
        }
        .scrollable(ScrollDirection.Horizontal)
        .scrollBar(BarState.Off)
        .width('100%')
        .height(70)
        .margin({ bottom: 12 })
      }

      // 相似文档面板
      if (this.showSimilarPanel && this.similarDocs.length > 0) {
        Column() {
          Row() {
            Text('相似文档')
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .fontColor('#333333')
            Blank()
            Text(`${this.similarDocs.length} 对`)
              .fontSize(12)
              .fontColor('#8E8E93')

            // 一键去重按钮
            if (this.similarDocs.some((d: SimilarDoc): boolean => d.score >= 0.99)) {
              Button('一键去重')
                .height(28)
                .fontSize(12)
                .backgroundColor('#FF3B30')
                .fontColor(Color.White)
                .borderRadius(6)
                .margin({ left: 8 })
                .enabled(!this.isDeleting)
                .onClick((): void => {
                  this.deleteAllDuplicates();
                })
            }

            Button('收起')
              .height(28)
              .fontSize(12)
              .backgroundColor('#E0E0E0')
              .fontColor('#666666')
              .borderRadius(6)
              .margin({ left: 8 })
              .onClick((): void => {
                this.showSimilarPanel = false;
              })
          }
          .width('100%')
          .margin({ bottom: 8 })

          List({ space: 6 }) {
            ForEach(this.similarDocs.slice(0, 10), (doc: SimilarDoc) => {
              ListItem() {
                Column() {
                  Row() {
                    // 相似度标签
                    Text(`${(doc.score * 100).toFixed(0)}%`)
                      .fontSize(14)
                      .fontWeight(FontWeight.Bold)
                      .fontColor(doc.score >= 0.99 ? '#FF3B30' : '#FF9500')
                      .width(45)

                    Column() {
                      Text(doc.file1)
                        .fontSize(12)
                        .fontColor('#333333')
                        .maxLines(1)
                        .textOverflow({ overflow: TextOverflow.Ellipsis })
                      Text(doc.file2)
                        .fontSize(12)
                        .fontColor('#666666')
                        .maxLines(1)
                        .textOverflow({ overflow: TextOverflow.Ellipsis })
                        .margin({ top: 2 })
                    }
                    .layoutWeight(1)
                    .alignItems(HorizontalAlign.Start)

                    // 操作按钮
                    Row({ space: 4 }) {
                      Button('对比')
                        .height(26)
                        .fontSize(11)
                        .backgroundColor('#007AFF')
                        .fontColor(Color.White)
                        .borderRadius(4)
                        .onClick((): void => {
                          this.showDiff(doc.file1, doc.file2);
                        })

                      if (doc.score >= 0.99) {
                        Button('删除')
                          .height(26)
                          .fontSize(11)
                          .backgroundColor('#FF3B30')
                          .fontColor(Color.White)
                          .borderRadius(4)
                          .onClick((): void => {
                            this.deleteDuplicate(doc.file2);
                          })
                      }
                    }
                  }
                  .width('100%')

                  if (doc.sharedTerms.length > 0) {
                    Row() {
                      Text('共同词: ')
                        .fontSize(10)
                        .fontColor('#8E8E93')
                      Text(doc.sharedTerms.slice(0, 3).join(', '))
                        .fontSize(10)
                        .fontColor('#007AFF')
                    }
                    .width('100%')
                    .margin({ top: 4 })
                  }
                }
                .padding(8)
                .backgroundColor('#FAFAFA')
                .borderRadius(8)
              }
            })
          }
          .width('100%')
          .height(this.similarDocs.length > 3 ? 180 : this.similarDocs.length * 65)
        }
        .width('100%')
        .padding(12)
        .backgroundColor('#FFF8E1')
        .borderRadius(12)
        .margin({ left: 16, right: 16, bottom: 12 })
      }

      // 搜索框
      Row() {
        TextInput({ placeholder: '搜索文件名或关键词...', text: this.searchKeyword })
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#F0F0F0')
          .borderRadius(8)
          .padding({ left: 12, right: 12 })
          .onChange((value: string): void => {
            this.searchKeyword = value;
          })
          .type(InputType.Normal)

        if (this.searchKeyword.length > 0) {
          Button('清除')
            .height(40)
            .fontSize(14)
            .backgroundColor('#E0E0E0')
            .fontColor('#333333')
            .borderRadius(8)
            .margin({ left: 8 })
            .onClick((): void => {
              this.searchKeyword = '';
            })
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 12 })

      // 文件列表
      if (this.isLoading) {
        Column() {
          LoadingProgress()
            .width(48)
            .height(48)
            .color('#007AFF')
          Text('加载中...')
            .fontSize(14)
            .fontColor('#8E8E93')
            .margin({ top: 12 })
        }
        .width('100%')
        .height(200)
        .justifyContent(FlexAlign.Center)
      } else if (this.fileList.length === 0) {
        Column() {
          Text('暂无文件')
            .fontSize(16)
            .fontColor('#8E8E93')
        }
        .width('100%')
        .height(200)
        .justifyContent(FlexAlign.Center)
      } else {
        List({ space: 8 }) {
          ForEach(this.getFilteredFiles(), (file: FileAnalysis) => {
            ListItem() {
              Column() {
                Row() {
                  if (file.isAnalyzed) {
                    Text(file.categoryName)
                      .fontSize(10)
                      .fontColor(Color.White)
                      .backgroundColor(this.getCategoryColor(file.category))
                      .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                      .borderRadius(4)
                      .margin({ right: 8 })
                  }

                  Text(file.filename)
                    .fontSize(15)
                    .fontWeight(FontWeight.Medium)
                    .fontColor('#333333')
                    .maxLines(1)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                    .layoutWeight(1)

                  if (file.isAnalyzed && file.confidence > 0) {
                    Text(`${(file.confidence * 100).toFixed(0)}%`)
                      .fontSize(12)
                      .fontColor('#8E8E93')
                  }
                }
                .width('100%')

                if (file.isAnalyzed && file.keywords.length > 0) {
                  Row() {
                    ForEach(file.keywords.slice(0, 4), (keyword: string) => {
                      Text(keyword)
                        .fontSize(10)
                        .fontColor('#666666')
                        .backgroundColor('#F0F0F0')
                        .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                        .borderRadius(4)
                        .margin({ right: 4 })
                    })
                    if (file.keywords.length > 4) {
                      Text(`+${file.keywords.length - 4}`)
                        .fontSize(10)
                        .fontColor('#8E8E93')
                    }
                  }
                  .width('100%')
                  .margin({ top: 6 })
                }

                if (file.isAnalyzed && file.summary.length > 0) {
                  Text(file.summary)
                    .fontSize(12)
                    .fontColor('#666666')
                    .maxLines(2)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                    .margin({ top: 6 })
                    .width('100%')
                }

                if (file.isAnalyzed) {
                  Row() {
                    Text(`${file.wordCount} 字`)
                      .fontSize(11)
                      .fontColor('#8E8E93')
                  }
                  .width('100%')
                  .margin({ top: 6 })
                }
              }
              .width('100%')
              .padding(12)
              .backgroundColor(Color.White)
              .borderRadius(12)
              .border({ width: 1, color: '#E0E0E0' })
              .onClick((): void => {
                this.selectedFile = file;
                this.showFileDetail = true;
              })
            }
          })
        }
        .width('100%')
        .layoutWeight(1)
        .padding({ left: 16, right: 16 })
      }

      // 文件详情弹窗
      if (this.showFileDetail && this.selectedFile) {
        Stack()
          .width('100%')
          .height('100%')
          .backgroundColor('rgba(0, 0, 0, 0.5)')
          .onClick((): void => {
            this.showFileDetail = false;
          })
          .position({ x: 0, y: 0 })

        Column() {
          Row() {
            Text('文件详情')
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .fontColor('#333333')
              .layoutWeight(1)

            Button('×')
              .fontSize(24)
              .fontColor('#666666')
              .backgroundColor(Color.Transparent)
              .onClick((): void => {
                this.showFileDetail = false;
              })
          }
          .width('100%')
          .padding({ left: 20, right: 20, top: 15, bottom: 15 })
          .border({ width: { bottom: 1 }, color: '#E0E0E0' })

          Scroll() {
            Column() {
              Row() {
                Text('文件名')
                  .fontSize(14)
                  .fontColor('#666666')
                  .width(80)
                if (this.selectedFile) {
                  Text(this.selectedFile.filename)
                    .fontSize(14)
                    .fontColor('#333333')
                    .layoutWeight(1)
                }
              }
              .width('100%')
              .margin({ bottom: 12 })

              Row() {
                Text('分类')
                  .fontSize(14)
                  .fontColor('#666666')
                  .width(80)
                if (this.selectedFile) {
                  Text(this.selectedFile.categoryName)
                    .fontSize(14)
                    .fontColor(Color.White)
                    .backgroundColor(this.getCategoryColor(this.selectedFile.category))
                    .padding({ left: 8, right: 8, top: 4, bottom: 4 })
                    .borderRadius(6)
                }
              }
              .width('100%')
              .margin({ bottom: 12 })

              Row() {
                Text('置信度')
                  .fontSize(14)
                  .fontColor('#666666')
                  .width(80)
                if (this.selectedFile) {
                  Text(`${(this.selectedFile.confidence * 100).toFixed(1)}%`)
                    .fontSize(14)
                    .fontColor('#007AFF')
                }
              }
              .width('100%')
              .margin({ bottom: 12 })

              Row() {
                Text('字数')
                  .fontSize(14)
                  .fontColor('#666666')
                  .width(80)
                if (this.selectedFile) {
                  Text(`${this.selectedFile.wordCount}`)
                    .fontSize(14)
                    .fontColor('#333333')
                }
              }
              .width('100%')
              .margin({ bottom: 12 })

              Text('关键词')
                .fontSize(14)
                .fontColor('#666666')
                .width('100%')
                .margin({ bottom: 8 })

              Flex({ wrap: FlexWrap.Wrap }) {
                if (this.selectedFile) {
                  ForEach(this.selectedFile.keywords, (keyword: string) => {
                    Text(keyword)
                      .fontSize(12)
                      .fontColor('#333333')
                      .backgroundColor('#F0F0F0')
                      .padding({ left: 10, right: 10, top: 6, bottom: 6 })
                      .borderRadius(16)
                      .margin({ right: 8, bottom: 8 })
                  })
                }
              }
              .width('100%')
              .margin({ bottom: 12 })

              Text('摘要')
                .fontSize(14)
                .fontColor('#666666')
                .width('100%')
                .margin({ bottom: 8 })

              if (this.selectedFile) {
                Text(this.selectedFile.summary || '暂无摘要')
                  .fontSize(14)
                  .fontColor('#333333')
                  .width('100%')
                  .padding(12)
                  .backgroundColor('#F8F8F8')
                  .borderRadius(8)
              }
            }
            .width('100%')
            .padding(20)
          }
          .layoutWeight(1)

          Button('关闭')
            .onClick((): void => {
              this.showFileDetail = false;
            })
            .width('90%')
            .height(44)
            .fontSize(16)
            .backgroundColor('#007AFF')
            .fontColor(Color.White)
            .borderRadius(10)
            .margin({ bottom: 20 })
        }
        .width('90%')
        .height('70%')
        .backgroundColor(Color.White)
        .borderRadius(16)
        .position({ x: '5%', y: '15%' })
      }

      // API Key 设置弹窗
      if (this.showApiKeyInput) {
        Stack()
          .width('100%')
          .height('100%')
          .backgroundColor('rgba(0, 0, 0, 0.5)')
          .onClick((): void => {
            this.showApiKeyInput = false;
          })
          .position({ x: 0, y: 0 })

        Column() {
          Text('设置 DeepSeek API Key')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
            .margin({ bottom: 16 })

          TextInput({ placeholder: '请输入 API Key (sk-...)', text: this.apiKeyInput })
            .width('100%')
            .height(44)
            .backgroundColor('#F0F0F0')
            .borderRadius(8)
            .type(InputType.Normal)
            .onChange((value: string): void => {
              this.apiKeyInput = value;
            })
            .margin({ bottom: 12 })

          Text('API Key 将保存在本地，下次启动自动加载')
            .fontSize(12)
            .fontColor('#8E8E93')
            .margin({ bottom: 16 })

          Row({ space: 12 }) {
            Button('取消')
              .layoutWeight(1)
              .height(44)
              .backgroundColor('#E0E0E0')
              .fontColor('#333333')
              .borderRadius(8)
              .onClick((): void => {
                this.showApiKeyInput = false;
              })

            Button('保存')
              .layoutWeight(1)
              .height(44)
              .backgroundColor('#007AFF')
              .fontColor(Color.White)
              .borderRadius(8)
              .onClick((): void => {
                if (DeepSeekService.validateApiKey(this.apiKeyInput)) {
                  this.saveApiKey(this.apiKeyInput);
                } else {
                  this.showToast('API Key 格式不正确，应以 sk- 开头', 'error');
                }
              })
          }
          .width('100%')
        }
        .width('85%')
        .padding(20)
        .backgroundColor(Color.White)
        .borderRadius(16)
        .position({ x: '7.5%', y: '30%' })
      }

      // 差异对比弹窗
      if (this.showDiffPanel && this.diffResult) {
        Stack()
          .width('100%')
          .height('100%')
          .backgroundColor('rgba(0, 0, 0, 0.5)')
          .onClick((): void => {
            this.showDiffPanel = false;
          })
          .position({ x: 0, y: 0 })

        Column() {
          // 标题栏
          Row() {
            Text('文档对比')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#333333')
            Blank()
            Button('×')
              .fontSize(20)
              .fontColor('#666666')
              .backgroundColor(Color.Transparent)
              .onClick((): void => {
                this.showDiffPanel = false;
              })
          }
          .width('100%')
          .padding({ left: 16, right: 16, top: 12, bottom: 8 })

          // 文件名
          Row() {
            Column() {
              Text('文件1')
                .fontSize(11)
                .fontColor('#8E8E93')
              Text(this.diffFile1)
                .fontSize(12)
                .fontColor('#333333')
                .maxLines(1)
                .textOverflow({ overflow: TextOverflow.Ellipsis })
            }
            .layoutWeight(1)
            .alignItems(HorizontalAlign.Start)

            Column() {
              Text('文件2')
                .fontSize(11)
                .fontColor('#8E8E93')
              Text(this.diffFile2)
                .fontSize(12)
                .fontColor('#333333')
                .maxLines(1)
                .textOverflow({ overflow: TextOverflow.Ellipsis })
            }
            .layoutWeight(1)
            .alignItems(HorizontalAlign.End)
          }
          .width('100%')
          .padding({ left: 16, right: 16, bottom: 8 })

          // 统计信息
          Row({ space: 12 }) {
            Text(`相同: ${this.diffResult.sameCount}`)
              .fontSize(12)
              .fontColor('#34C759')
            Text(`删除: ${this.diffResult.removedCount}`)
              .fontSize(12)
              .fontColor('#FF3B30')
            Text(`新增: ${this.diffResult.addedCount}`)
              .fontSize(12)
              .fontColor('#007AFF')
            Text(`相似度: ${(this.diffResult.similarity * 100).toFixed(0)}%`)
              .fontSize(12)
              .fontColor('#FF9500')
              .fontWeight(FontWeight.Bold)
          }
          .width('100%')
          .padding({ left: 16, right: 16, bottom: 8 })

          // 差异内容
          Scroll() {
            Column() {
              ForEach(this.diffResult.lines.slice(0, 100), (line: DiffLine, index: number) => {
                Row() {
                  Text(line.lineNum1 ? `${line.lineNum1}` : ' ')
                    .fontSize(10)
                    .fontColor('#8E8E93')
                    .width(25)
                    .textAlign(TextAlign.End)
                  Text(line.lineNum2 ? `${line.lineNum2}` : ' ')
                    .fontSize(10)
                    .fontColor('#8E8E93')
                    .width(25)
                    .textAlign(TextAlign.End)
                    .margin({ right: 6 })
                  Text(line.type === DiffType.ADDED ? '+' : (line.type === DiffType.REMOVED ? '-' : ' '))
                    .fontSize(12)
                    .fontColor(line.type === DiffType.ADDED ? '#007AFF' : (line.type === DiffType.REMOVED ? '#FF3B30' : '#8E8E93'))
                    .width(14)
                  Text(line.content || ' ')
                    .fontSize(12)
                    .fontColor(line.type === DiffType.SAME ? '#333333' : (line.type === DiffType.ADDED ? '#007AFF' : '#FF3B30'))
                    .layoutWeight(1)
                    .maxLines(2)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                }
                .width('100%')
                .padding({ top: 2, bottom: 2, left: 4, right: 4 })
                .backgroundColor(
                  line.type === DiffType.ADDED ? '#E3F2FD' :
                    (line.type === DiffType.REMOVED ? '#FFEBEE' : Color.Transparent)
                )
              })
            }
            .width('100%')
          }
          .layoutWeight(1)
          .backgroundColor('#FAFAFA')
          .margin({ left: 8, right: 8 })
          .borderRadius(8)

          // 操作按钮
          Row({ space: 12 }) {
            Button('关闭')
              .layoutWeight(1)
              .height(40)
              .backgroundColor('#E0E0E0')
              .fontColor('#333333')
              .borderRadius(8)
              .onClick((): void => {
                this.showDiffPanel = false;
              })

            // 添加合并按钮
            Button('合并去重')
              .layoutWeight(1)
              .height(40)
              .backgroundColor('#34C759')
              .fontColor(Color.White)
              .borderRadius(8)
              .enabled(!this.isDeleting)
              .onClick(async (): Promise<void> => {
                const mergedContent = await this.mergeDocuments(this.diffFile1, this.diffFile2);
                if (mergedContent) {
                  await this.saveMergedDocument(this.diffFile1, this.diffFile2, mergedContent);
                }
              })

            if (this.diffResult.similarity >= 0.99) {
              Button(`删除 ${this.diffFile2}`)
                .layoutWeight(1)
                .height(40)
                .backgroundColor('#FF3B30')
                .fontColor(Color.White)
                .borderRadius(8)
                .enabled(!this.isDeleting)
                .onClick((): void => {
                  this.deleteDuplicate(this.diffFile2);
                })
            }
          }
          .width('100%')
          .padding(12)
        }
        .width('95%')
        .height('80%')
        .backgroundColor(Color.White)
        .borderRadius(16)
        .position({ x: '2.5%', y: '10%' })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}
