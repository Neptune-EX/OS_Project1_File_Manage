/**
 * 智能分类 Tab 页面
 * 提供文档智能分类、摘要生成、关键词提取功能
 * 支持本地分类（基于关键词匹配）和 AI 分类（可选）
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import {
  DocumentCategory,
  DocumentMetadata,
  getCategoryDisplayName
} from '../common/types/AIDocTypes';
import { SimilarityCalculator } from '../common/utils/SimilarityCalculator';

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

interface GeneratedTypeLiteralInterface_1 {
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

  private filesDir: string = '';
  private similarityCalculator: SimilarityCalculator | null = null;

  // 类别关键词规则（本地分类使用）
  private categoryRules: CategoryKeywords[] = [
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

  // 类别颜色映射
  private categoryColors: Map<DocumentCategory, string> = new Map([
    [DocumentCategory.MEETING_NOTES, '#FF9500'],
    [DocumentCategory.STUDY_NOTES, '#007AFF'],
    [DocumentCategory.PROJECT_REPORT, '#5856D6'],
    [DocumentCategory.PERSONAL_DIARY, '#FF2D55'],
    [DocumentCategory.TODO_LIST, '#34C759'],
    [DocumentCategory.TECHNICAL_DOC, '#00C7BE'],
    [DocumentCategory.OTHER, '#8E8E93']
  ]);

  aboutToAppear() {
    const context = this.getUIContext().getHostContext() as Context;
    const uiAbilityContext = context as common.UIAbilityContext;
    this.filesDir = uiAbilityContext.filesDir;
    this.similarityCalculator = SimilarityCalculator.getInstance(context);
    this.loadFiles();
  }

  // 加载文件列表
  private async loadFiles() {
    this.isLoading = true;
    try {
      const allFiles = fileIo.listFileSync(this.filesDir);
      const txtFiles = allFiles.filter((f: string) => !f.startsWith('.') && f.endsWith('.txt'));

      this.fileList = txtFiles.map((filename: string) => {
        return {
          filename: filename,
          category: DocumentCategory.OTHER,
          categoryName: '未分类',
          confidence: 0,
          keywords: [],
          summary: '',
          wordCount: 0,
          isAnalyzed: false
        } as FileAnalysis;
      });

      console.log('[SmartClassifyTab] 加载文件:', this.fileList.length);
    } catch (error) {
      console.error('[SmartClassifyTab] 加载文件失败:', error);
      this.showToast('加载文件失败', 'error');
    }
    this.isLoading = false;
  }

  // 显示消息
  private showToast(message: string, type: string = 'info') {
    this.messageText = message;
    this.messageType = type;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  // 读取文件内容
  private readFileContent(filename: string): string {
    try {
      const filePath = `${this.filesDir}/${filename}`;
      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(filePath);

      const maxSize = 50 * 1024;
      const readSize = Math.min(stat.size, maxSize);
      const buffer = new ArrayBuffer(readSize);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      const uint8Array = new Uint8Array(buffer);
      let content = '';
      for (let i = 0; i < uint8Array.length; i++) {
        content += String.fromCharCode(uint8Array[i]);
      }

      try {
        return decodeURIComponent(escape(content));
      } catch (e) {
        return content;
      }
    } catch (error) {
      console.error('[SmartClassifyTab] 读取文件失败:', filename, error);
      return '';
    }
  }

  // 本地分类（基于关键词匹配）
  private classifyLocal(content: string): GeneratedTypeLiteralInterface_1 {
    const contentLower = content.toLowerCase();
    let bestCategory = DocumentCategory.OTHER;
    let bestScore = 0;

    this.categoryRules.forEach((rule: CategoryKeywords) => {
      let score = 0;
      rule.keywords.forEach((keyword: string) => {
        if (contentLower.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });

      // 归一化分数
      const normalizedScore = score / rule.keywords.length;

      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestCategory = rule.category;
      }
    });

    // 如果没有足够匹配，标记为其他
    if (bestScore < 0.1) {
      bestCategory = DocumentCategory.OTHER;
      bestScore = 0.5;
    }

    return {
      category: bestCategory,
      confidence: Math.min(bestScore * 2, 1)
    };
  }

  // 提取关键词（本地）
  private extractKeywordsLocal(content: string): string[] {
    if (!this.similarityCalculator) return [];

    const terms = this.similarityCalculator.extractTerms(content);
    return this.similarityCalculator.getTopKeywords(terms, 8);
  }

  // 生成摘要（本地 - 取前几句）
  private generateSummaryLocal(content: string): string {
    // 按句子分割
    const sentences = content.split(/[。！？\.\!\?]/);
    const validSentences = sentences.filter((s: string) => s.trim().length > 10);

    // 取前 3 句作为摘要
    const summaryParts: string[] = [];
    for (let i = 0; i < Math.min(3, validSentences.length); i++) {
      summaryParts.push(validSentences[i].trim());
    }

    let summary = summaryParts.join('。');
    if (summary.length > 200) {
      summary = summary.substring(0, 200) + '...';
    }

    return summary;
  }

  // 分析单个文件
  private analyzeFile(index: number): void {
    const file = this.fileList[index];
    const content = this.readFileContent(file.filename);

    if (!content || content.length === 0) {
      return;
    }

    // 本地分类
    const classification = this.classifyLocal(content);
    const keywords = this.extractKeywordsLocal(content);
    const summary = this.generateSummaryLocal(content);

    // 更新文件分析结果
    this.fileList[index] = {
      filename: file.filename,
      category: classification.category,
      categoryName: getCategoryDisplayName(classification.category),
      confidence: classification.confidence,
      keywords: keywords,
      summary: summary,
      wordCount: content.length,
      isAnalyzed: true
    };

    // 触发状态更新
    this.fileList = this.fileList.slice();
  }

  // 分析所有文件
  private async analyzeAllFiles() {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.analysisProgress = 0;
    this.showToast('开始分析文档...', 'info');

    const total = this.fileList.length;

    for (let i = 0; i < total; i++) {
      this.analysisProgress = Math.floor(((i + 1) / total) * 100);
      this.analysisProgressText = `${i + 1}/${total}`;

      this.analyzeFile(i);

      // 小延迟避免 UI 卡顿
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 50));
    }

    this.isAnalyzing = false;
    this.showToast(`分析完成！共分析 ${total} 个文件`, 'success');
  }

  // 获取过滤后的文件列表
  private getFilteredFiles(): FileAnalysis[] {
    let filtered = this.fileList;

    // 按类别过滤
    if (this.selectedCategory !== null) {
      filtered = filtered.filter((f: FileAnalysis) => f.category === this.selectedCategory);
    }

    // 按关键词搜索
    if (this.searchKeyword.trim().length > 0) {
      const keyword = this.searchKeyword.toLowerCase();
      filtered = filtered.filter((f: FileAnalysis) => {
        const nameMatch = f.filename.toLowerCase().includes(keyword);
        const keywordMatch = f.keywords.some((k: string) => k.toLowerCase().includes(keyword));
        const summaryMatch = f.summary.toLowerCase().includes(keyword);
        return nameMatch || keywordMatch || summaryMatch;
      });
    }

    return filtered;
  }

  // 获取类别统计
  private getCategoryStats(): CategoryStat[] {
    const stats = new Map<DocumentCategory, number>();

    this.fileList.forEach((file: FileAnalysis) => {
      if (file.isAnalyzed) {
        const count = stats.get(file.category) || 0;
        stats.set(file.category, count + 1);
      }
    });

    const result: CategoryStat[] = [];
    stats.forEach((count: number, category: DocumentCategory) => {
      result.push({
        category: category,
        name: getCategoryDisplayName(category),
        count: count,
        color: this.categoryColors.get(category) || '#8E8E93'
      });
    });

    // 按数量排序
    result.sort((a, b) => b.count - a.count);
    return result;
  }

  // 获取已分析文件数
  private getAnalyzedCount(): number {
    return this.fileList.filter((f: FileAnalysis) => f.isAnalyzed).length;
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

      // 操作按钮区
      Row({ space: 10 }) {
        Button(this.isAnalyzing ? '分析中...' : '开始分析')
          .onClick(() => this.analyzeAllFiles())
          .enabled(!this.isAnalyzing && this.fileList.length > 0)
          .height(40)
          .fontSize(14)
          .backgroundColor(this.isAnalyzing ? '#C7C7CC' : '#007AFF')
          .fontColor(Color.White)
          .borderRadius(8)
          .layoutWeight(1)

        Button('刷新列表')
          .onClick(() => this.loadFiles())
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
            .onClick(() => {
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
              .onClick(() => {
                this.selectedCategory = this.selectedCategory === stat.category ? null : stat.category;
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
          .onChange((value: string) => {
            this.searchKeyword = value;
          })

        if (this.searchKeyword.length > 0) {
          Button('清除')
            .height(40)
            .fontSize(14)
            .backgroundColor('#E0E0E0')
            .fontColor('#333333')
            .borderRadius(8)
            .margin({ left: 8 })
            .onClick(() => {
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
                  // 类别标签
                  if (file.isAnalyzed) {
                    Text(file.categoryName)
                      .fontSize(10)
                      .fontColor(Color.White)
                      .backgroundColor(this.categoryColors.get(file.category) || '#8E8E93')
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

                // 关键词
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

                // 摘要
                if (file.isAnalyzed && file.summary.length > 0) {
                  Text(file.summary)
                    .fontSize(12)
                    .fontColor('#666666')
                    .maxLines(2)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                    .margin({ top: 6 })
                    .width('100%')
                }

                // 统计信息
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
              .onClick(() => {
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
          .onClick(() => {
            this.showFileDetail = false;
          })
          .position({ x: 0, y: 0 })

        Column() {
          // 标题
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
              .onClick(() => {
                this.showFileDetail = false;
              })
          }
          .width('100%')
          .padding({ left: 20, right: 20, top: 15, bottom: 15 })
          .border({ width: { bottom: 1 }, color: '#E0E0E0' })

          Scroll() {
            Column() {
              // 文件名
              Row() {
                Text('文件名')
                  .fontSize(14)
                  .fontColor('#666666')
                  .width(80)
                Text(this.selectedFile!.filename)
                  .fontSize(14)
                  .fontColor('#333333')
                  .layoutWeight(1)
              }
              .width('100%')
              .margin({ bottom: 12 })

              // 类别
              Row() {
                Text('分类')
                  .fontSize(14)
                  .fontColor('#666666')
                  .width(80)
                Text(this.selectedFile!.categoryName)
                  .fontSize(14)
                  .fontColor(Color.White)
                  .backgroundColor(this.categoryColors.get(this.selectedFile!.category) || '#8E8E93')
                  .padding({ left: 8, right: 8, top: 4, bottom: 4 })
                  .borderRadius(6)
              }
              .width('100%')
              .margin({ bottom: 12 })

              // 置信度
              Row() {
                Text('置信度')
                  .fontSize(14)
                  .fontColor('#666666')
                  .width(80)
                Text(`${(this.selectedFile!.confidence * 100).toFixed(1)}%`)
                  .fontSize(14)
                  .fontColor('#007AFF')
              }
              .width('100%')
              .margin({ bottom: 12 })

              // 字数
              Row() {
                Text('字数')
                  .fontSize(14)
                  .fontColor('#666666')
                  .width(80)
                Text(`${this.selectedFile!.wordCount}`)
                  .fontSize(14)
                  .fontColor('#333333')
              }
              .width('100%')
              .margin({ bottom: 12 })

              // 关键词
              Text('关键词')
                .fontSize(14)
                .fontColor('#666666')
                .width('100%')
                .margin({ bottom: 8 })

              Flex({ wrap: FlexWrap.Wrap }) {
                ForEach(this.selectedFile!.keywords, (keyword: string) => {
                  Text(keyword)
                    .fontSize(12)
                    .fontColor('#333333')
                    .backgroundColor('#F0F0F0')
                    .padding({ left: 10, right: 10, top: 6, bottom: 6 })
                    .borderRadius(16)
                    .margin({ right: 8, bottom: 8 })
                })
              }
              .width('100%')
              .margin({ bottom: 12 })

              // 摘要
              Text('摘要')
                .fontSize(14)
                .fontColor('#666666')
                .width('100%')
                .margin({ bottom: 8 })

              Text(this.selectedFile!.summary || '暂无摘要')
                .fontSize(14)
                .fontColor('#333333')
                .width('100%')
                .padding(12)
                .backgroundColor('#F8F8F8')
                .borderRadius(8)
            }
            .width('100%')
            .padding(20)
          }
          .layoutWeight(1)

          // 关闭按钮
          Button('关闭')
            .onClick(() => {
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
