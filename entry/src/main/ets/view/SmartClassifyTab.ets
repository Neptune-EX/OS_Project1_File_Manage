/**
 * 智能分类 Tab 页面
 * 提供文档智能分类、摘要生成、关键词提取功能
 * 支持本地分类（基于关键词匹配）- 异步处理避免UI卡顿
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { util } from '@kit.ArkTS';
import {
  DocumentCategory,
  getCategoryDisplayName
} from '../common/types/AIDocTypes';
import { SimilarityCalculator } from '../common/utils/SimilarityCalculator';
import { ContentParser, DocumentFormat } from '../common/utils/ContentParser'; // 导入 ContentParser


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
  private contentParser: ContentParser | null = null; // 新增

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

    // 初始化类别颜色
    this.initCategoryColors();

    // 初始化类别规则
    this.initCategoryRules();

    // 延迟加载文件列表
    setTimeout((): void => {
      this.loadFilesAsync();
    }, 200);
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

  // 生成摘要
  private generateSummary(content: string): string {
    if (content.length === 0) {
      return '';
    }

    const sentences: string[] = content.split(/[。！？\.\!\?]/);
    const validSentences: string[] = sentences.filter((s: string): boolean => {
      return s.trim().length > 10;
    });

    const summaryParts: string[] = [];
    const maxSentences = Math.min(2, validSentences.length);
    for (let i = 0; i < maxSentences; i++) {
      summaryParts.push(validSentences[i].trim());
    }

    let summary = summaryParts.join('。');
    if (summary.length > 150) {
      summary = summary.substring(0, 150) + '...';
    }

    return summary;
  }

  // 修改：分析单个文件（需要改为 async）
  private async analyzeFile(index: number): Promise<FileAnalysis | null> {
    const file = this.fileList[index];
    if (!file) {
      return null;
    }

    try {
      const content = await this.readFileContent(file.filename); // 改为 await
      if (!content || content.length < 10) {
        return null;
      }

      const classification = this.classifyLocal(content);
      const keywords = this.extractKeywords(content);
      const summary = this.generateSummary(content);

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
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}
