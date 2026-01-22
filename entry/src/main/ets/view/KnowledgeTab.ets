/**
 * AI 知识库 Tab 页面
 * 提供智能搜索、知识关联分析、热门关键词展示
 */

import { common } from '@kit.AbilityKit';
import {
  KnowledgeIndex,
  SearchResult,
  KnowledgeLink,
  KnowledgeNode,
  IndexedDocument
} from '../common/utils/KnowledgeIndex';


// 视图模式
enum ViewMode {
  SEARCH = 'search',
  RELATIONS = 'relations',
  KEYWORDS = 'keywords'
}

interface GeneratedTypeLiteralInterface_1 {
  keyword: string;
  count: number;
}


interface GeneratedTypeLiteralInterface_3 {
  keyword: string;
  count: number;
}

interface GeneratedTypeLiteralInterface_5 {
  documentCount: number;
  termCount: number;
  totalWords: number;
  lastUpdated: number;
}

@Component
export struct KnowledgeTab {
  @State viewMode: ViewMode = ViewMode.SEARCH;
  @State searchQuery: string = '';
  @State searchResults: SearchResult[] = [];
  @State isSearching: boolean = false;
  @State isIndexing: boolean = false;
  @State indexProgress: number = 0;
  @State indexProgressText: string = '';

  // 知识关联
  @State knowledgeLinks: KnowledgeLink[] = [];
  @State knowledgeNodes: KnowledgeNode[] = [];
  @State selectedNode: KnowledgeNode | null = null;
  @State nodeRelations: KnowledgeLink[] = [];

  // 关键词
  @State topKeywords: Array<GeneratedTypeLiteralInterface_1> = [];
  @State selectedKeyword: string = '';

  // 统计
  @State stats: GeneratedTypeLiteralInterface_5 = { documentCount: 0, termCount: 0, totalWords: 0, lastUpdated: 0 };


  // 消息
  @State showMessage: boolean = false;
  @State messageText: string = '';
  @State messageType: string = 'info';

  private knowledgeIndex: KnowledgeIndex | null = null;

  aboutToAppear() {
    const context = this.getUIContext().getHostContext() as Context;
    this.knowledgeIndex = KnowledgeIndex.getInstance(context);
    this.loadStats();
    this.loadTopKeywords();
  }

  // 加载统计信息
  private loadStats() {
    if (!this.knowledgeIndex) return;
    this.stats = this.knowledgeIndex.getStats() as GeneratedTypeLiteralInterface_5;
  }

  // 加载热门关键词
  private loadTopKeywords() {
    if (!this.knowledgeIndex) return;
    this.topKeywords = this.knowledgeIndex.getTopKeywords(30);
  }

  // 加载知识关联
  private loadKnowledgeLinks() {
    if (!this.knowledgeIndex) return;
    this.knowledgeLinks = this.knowledgeIndex.getAllKnowledgeLinks(0.15);
    this.knowledgeNodes = this.knowledgeIndex.getKnowledgeNodes();
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

  // 构建索引
  private async buildIndex() {
    if (!this.knowledgeIndex || this.isIndexing) return;

    this.isIndexing = true;
    this.indexProgress = 0;
    this.showToast('正在构建知识索引...', 'info');

    try {
      const count = await this.knowledgeIndex.indexAllDocuments(
        (current: number, total: number, filename: string) => {
          this.indexProgress = Math.floor((current / total) * 100);
          this.indexProgressText = `${current}/${total}: ${filename}`;
        }
      );

      this.loadStats();
      this.loadTopKeywords();
      this.loadKnowledgeLinks();
      this.showToast(`索引构建完成！共索引 ${count} 个文档`, 'success');
    } catch (error) {
      console.error('[KnowledgeTab] 构建索引失败:', error);
      this.showToast('索引构建失败', 'error');
    }

    this.isIndexing = false;
  }

  // 执行搜索
  private performSearch() {
    if (!this.knowledgeIndex || !this.searchQuery.trim()) return;

    this.isSearching = true;
    this.searchResults = this.knowledgeIndex.search(this.searchQuery, 20);
    this.isSearching = false;

    if (this.searchResults.length === 0) {
      this.showToast('未找到相关文档', 'info');
    }
  }

  // 按关键词搜索
  private searchByKeyword(keyword: string) {
    this.selectedKeyword = keyword;
    this.searchQuery = keyword;
    this.viewMode = ViewMode.SEARCH;
    this.performSearch();
  }

  // 查看节点关联
  private viewNodeRelations(node: KnowledgeNode) {
    if (!this.knowledgeIndex) return;
    this.selectedNode = node;
    this.nodeRelations = this.knowledgeIndex.getRelatedDocuments(node.filename, 10);
  }

  // 格式化日期
  private formatDate(timestamp: number): string {
    if (timestamp === 0) return '从未更新';
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  build() {
    Column() {
      // 顶部标题和统计
      Column() {
        Text('AI 知识库')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ bottom: 8 })

        Row({ space: 16 }) {
          Column() {
            Text(`${this.stats.documentCount}`)
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#007AFF')
            Text('文档')
              .fontSize(11)
              .fontColor('#8E8E93')
          }

          Column() {
            Text(`${this.stats.termCount}`)
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#34C759')
            Text('词条')
              .fontSize(11)
              .fontColor('#8E8E93')
          }

          Column() {
            Text(`${(this.stats.totalWords / 1000).toFixed(1)}K`)
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FF9500')
            Text('总字数')
              .fontSize(11)
              .fontColor('#8E8E93')
          }
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 8 })
      .alignItems(HorizontalAlign.Start)

      // 操作按钮
      Row({ space: 10 }) {
        Button(this.isIndexing ? '索引中...' : '重建索引')
          .onClick(() => this.buildIndex())
          .enabled(!this.isIndexing)
          .height(40)
          .fontSize(14)
          .backgroundColor(this.isIndexing ? '#C7C7CC' : '#007AFF')
          .fontColor(Color.White)
          .borderRadius(8)
          .layoutWeight(1)
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 12 })

      // 索引进度
      if (this.isIndexing) {
        Column() {
          Row() {
            Text('索引进度')
              .fontSize(14)
              .fontColor('#333333')
              .layoutWeight(1)
            Text(`${this.indexProgress}%`)
              .fontSize(14)
              .fontColor('#007AFF')
              .fontWeight(FontWeight.Bold)
          }
          .width('100%')
          .margin({ bottom: 8 })

          Progress({ value: this.indexProgress, total: 100, type: ProgressType.Linear })
            .color('#007AFF')
            .backgroundColor('#E0E0E0')
            .height(8)
            .width('100%')
            .borderRadius(4)

          if (this.indexProgressText) {
            Text(this.indexProgressText)
              .fontSize(11)
              .fontColor('#8E8E93')
              .margin({ top: 6 })
              .maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
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

      // 视图切换标签
      Row({ space: 0 }) {
        Text('搜索')
          .fontSize(14)
          .fontColor(this.viewMode === ViewMode.SEARCH ? '#007AFF' : '#666666')
          .fontWeight(this.viewMode === ViewMode.SEARCH ? FontWeight.Bold : FontWeight.Normal)
          .padding({ left: 16, right: 16, top: 10, bottom: 10 })
          .backgroundColor(this.viewMode === ViewMode.SEARCH ? '#E3F2FD' : Color.Transparent)
          .borderRadius(8)
          .onClick(() => {
            this.viewMode = ViewMode.SEARCH;
          })

        Text('知识关联')
          .fontSize(14)
          .fontColor(this.viewMode === ViewMode.RELATIONS ? '#007AFF' : '#666666')
          .fontWeight(this.viewMode === ViewMode.RELATIONS ? FontWeight.Bold : FontWeight.Normal)
          .padding({ left: 16, right: 16, top: 10, bottom: 10 })
          .backgroundColor(this.viewMode === ViewMode.RELATIONS ? '#E3F2FD' : Color.Transparent)
          .borderRadius(8)
          .onClick(() => {
            this.viewMode = ViewMode.RELATIONS;
            this.loadKnowledgeLinks();
          })

        Text('热门关键词')
          .fontSize(14)
          .fontColor(this.viewMode === ViewMode.KEYWORDS ? '#007AFF' : '#666666')
          .fontWeight(this.viewMode === ViewMode.KEYWORDS ? FontWeight.Bold : FontWeight.Normal)
          .padding({ left: 16, right: 16, top: 10, bottom: 10 })
          .backgroundColor(this.viewMode === ViewMode.KEYWORDS ? '#E3F2FD' : Color.Transparent)
          .borderRadius(8)
          .onClick(() => {
            this.viewMode = ViewMode.KEYWORDS;
            this.loadTopKeywords();
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 12 })
      .justifyContent(FlexAlign.Start)

      // 内容区域
      if (this.viewMode === ViewMode.SEARCH) {
        this.buildSearchView()
      } else if (this.viewMode === ViewMode.RELATIONS) {
        this.buildRelationsView()
      } else {
        this.buildKeywordsView()
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }

  // 搜索视图
  @Builder
  buildSearchView() {
    Column() {
      // 搜索框
      Row() {
        TextInput({ placeholder: '输入关键词搜索文档...', text: this.searchQuery })
          .height(44)
          .layoutWeight(1)
          .backgroundColor(Color.White)
          .borderRadius(8)
          .padding({ left: 12, right: 12 })
          .onChange((value: string) => {
            this.searchQuery = value;
          })
          .onSubmit(() => {
            this.performSearch();
          })

        Button('搜索')
          .height(44)
          .fontSize(14)
          .backgroundColor('#007AFF')
          .fontColor(Color.White)
          .borderRadius(8)
          .margin({ left: 8 })
          .onClick(() => {
            this.performSearch();
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 12 })

      // 搜索结果
      if (this.searchResults.length > 0) {
        Text(`找到 ${this.searchResults.length} 个结果`)
          .fontSize(12)
          .fontColor('#8E8E93')
          .padding({ left: 16, right: 16, bottom: 8 })
          .width('100%')

        List({ space: 8 }) {
          ForEach(this.searchResults, (result: SearchResult) => {
            ListItem() {
              Column() {
                Row() {
                  Text(result.filename)
                    .fontSize(15)
                    .fontWeight(FontWeight.Medium)
                    .fontColor('#333333')
                    .layoutWeight(1)
                    .maxLines(1)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })

                  Text(`${result.score.toFixed(1)}`)
                    .fontSize(12)
                    .fontColor('#007AFF')
                    .backgroundColor('#E3F2FD')
                    .padding({ left: 8, right: 8, top: 2, bottom: 2 })
                    .borderRadius(10)
                }
                .width('100%')

                // 匹配词
                if (result.matchedTerms.length > 0) {
                  Row() {
                    Text('匹配: ')
                      .fontSize(11)
                      .fontColor('#8E8E93')
                    ForEach(result.matchedTerms.slice(0, 5), (term: string) => {
                      Text(term)
                        .fontSize(11)
                        .fontColor('#007AFF')
                        .margin({ right: 6 })
                    })
                  }
                  .width('100%')
                  .margin({ top: 6 })
                }

                // 摘要
                if (result.snippet) {
                  Text(result.snippet)
                    .fontSize(12)
                    .fontColor('#666666')
                    .maxLines(2)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                    .margin({ top: 6 })
                    .width('100%')
                }
              }
              .width('100%')
              .padding(12)
              .backgroundColor(Color.White)
              .borderRadius(10)
            }
          })
        }
        .width('100%')
        .layoutWeight(1)
        .padding({ left: 16, right: 16 })
      } else if (!this.isSearching && this.searchQuery.length > 0) {
        Column() {
          Text('未找到相关文档')
            .fontSize(14)
            .fontColor('#8E8E93')
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        Column() {
          Text('输入关键词开始搜索')
            .fontSize(14)
            .fontColor('#8E8E93')
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      }
    }
    .width('100%')
    .layoutWeight(1)
  }

  // 知识关联视图
  @Builder
  buildRelationsView() {
    Column() {
      if (this.knowledgeNodes.length === 0) {
        Column() {
          Text('暂无知识关联数据')
            .fontSize(14)
            .fontColor('#8E8E93')
          Text('请先构建索引')
            .fontSize(12)
            .fontColor('#C7C7CC')
            .margin({ top: 8 })
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        // 节点列表（按连接数排序）
        Text('知识节点（按关联度排序）')
          .fontSize(14)
          .fontColor('#666666')
          .padding({ left: 16, right: 16, bottom: 8 })
          .width('100%')

        List({ space: 8 }) {
          ForEach(this.knowledgeNodes, (node: KnowledgeNode) => {
            ListItem() {
              Column() {
                Row() {
                  Text(node.filename)
                    .fontSize(14)
                    .fontWeight(FontWeight.Medium)
                    .fontColor('#333333')
                    .layoutWeight(1)
                    .maxLines(1)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })

                  Text(`${node.connections} 关联`)
                    .fontSize(11)
                    .fontColor(Color.White)
                    .backgroundColor(node.connections > 3 ? '#FF9500' : '#8E8E93')
                    .padding({ left: 8, right: 8, top: 2, bottom: 2 })
                    .borderRadius(10)
                }
                .width('100%')

                // 关键词
                if (node.keywords.length > 0) {
                  Row() {
                    ForEach(node.keywords.slice(0, 5), (keyword: string) => {
                      Text(keyword)
                        .fontSize(10)
                        .fontColor('#666666')
                        .backgroundColor('#F0F0F0')
                        .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                        .borderRadius(4)
                        .margin({ right: 4 })
                    })
                  }
                  .width('100%')
                  .margin({ top: 6 })
                }

                // 显示关联文档
                if (this.selectedNode && this.selectedNode.filename === node.filename && this.nodeRelations.length > 0) {
                  Column() {
                    Text('关联文档:')
                      .fontSize(12)
                      .fontColor('#666666')
                      .margin({ top: 8, bottom: 4 })
                      .width('100%')

                    ForEach(this.nodeRelations, (link: KnowledgeLink) => {
                      Row() {
                        Text(link.target)
                          .fontSize(12)
                          .fontColor('#007AFF')
                          .layoutWeight(1)
                        Text(`${(link.strength * 100).toFixed(0)}%`)
                          .fontSize(11)
                          .fontColor('#34C759')
                      }
                      .width('100%')
                      .padding({ top: 4, bottom: 4 })
                      .backgroundColor('#F8F8F8')
                      .borderRadius(4)
                      .padding({ left: 8, right: 8 })
                      .margin({ bottom: 4 })
                    })
                  }
                  .width('100%')
                }
              }
              .width('100%')
              .padding(12)
              .backgroundColor(Color.White)
              .borderRadius(10)
              .onClick(() => {
                if (this.selectedNode && this.selectedNode.filename === node.filename) {
                  this.selectedNode = null;
                  this.nodeRelations = [];
                } else {
                  this.viewNodeRelations(node);
                }
              })
            }
          })
        }
        .width('100%')
        .layoutWeight(1)
        .padding({ left: 16, right: 16 })
      }
    }
    .width('100%')
    .layoutWeight(1)
  }

  // 热门关键词视图
  @Builder
  buildKeywordsView() {
    Column() {
      if (this.topKeywords.length === 0) {
        Column() {
          Text('暂无关键词数据')
            .fontSize(14)
            .fontColor('#8E8E93')
          Text('请先构建索引')
            .fontSize(12)
            .fontColor('#C7C7CC')
            .margin({ top: 8 })
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        Text('点击关键词进行搜索')
          .fontSize(12)
          .fontColor('#8E8E93')
          .padding({ left: 16, right: 16, bottom: 12 })
          .width('100%')

        Scroll() {
          Flex({ wrap: FlexWrap.Wrap }) {
            ForEach(this.topKeywords, (item: GeneratedTypeLiteralInterface_3, index: number) => {
              Row() {
                Text(item.keyword)
                  .fontSize(index < 5 ? 14 : (index < 10 ? 13 : 12))
                  .fontColor(index < 5 ? '#FFFFFF' : '#333333')

                Text(`${item.count}`)
                  .fontSize(10)
                  .fontColor(index < 5 ? '#FFFFFF' : '#8E8E93')
                  .margin({ left: 4 })
              }
              .padding({ left: 12, right: 12, top: 8, bottom: 8 })
              .backgroundColor(
                index < 3 ? '#007AFF' :
                  (index < 5 ? '#34C759' :
                    (index < 10 ? '#E3F2FD' : '#F0F0F0'))
              )
              .borderRadius(20)
              .margin({ right: 8, bottom: 8 })
              .onClick(() => {
                this.searchByKeyword(item.keyword);
              })
            })
          }
          .width('100%')
          .padding({ left: 16, right: 16 })
        }
        .layoutWeight(1)
      }
    }
    .width('100%')
    .layoutWeight(1)
  }
}
