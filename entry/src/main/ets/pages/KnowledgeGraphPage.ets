/**
 * 知识图谱页面
 * 全屏展示文档关联关系，支持拖拽节点
 */

import { router } from '@kit.ArkUI';
import { common } from '@kit.AbilityKit';
import { KnowledgeIndex, KnowledgeNode, KnowledgeLink } from '../common/utils/KnowledgeIndex';
import { GraphLayout, GraphNode, GraphEdge } from '../common/utils/GraphLayout';
import {
  DocumentCategory,
  getCategoryDisplayName
} from '../common/types/AIDocTypes';

// 路由参数
interface GraphParams {
  fileAnalysisList: string; // JSON string of FileAnalysis[]
}

// 文件分析结果
interface FileAnalysis {
  filename: string;
  category: DocumentCategory;
  categoryName: string;
  keywords: string[];
  summary: string;
}

@Entry
@Component
struct KnowledgeGraphPage {
  @State graphNodes: GraphNode[] = [];
  @State graphEdges: GraphEdge[] = [];
  @State selectedNode: GraphNode | null = null;
  @State canvasWidth: number = 0;
  @State canvasHeight: number = 0;
  private fileAnalysisMap: Map<string, FileAnalysis> = new Map();
  private knowledgeIndex: KnowledgeIndex | null = null;
  private categoryColors: Map<DocumentCategory, string> = new Map();
  private draggingNodeId: string = '';
  private canvasSettings: RenderingContextSettings = new RenderingContextSettings(true);
  private canvasContext: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.canvasSettings);

  aboutToAppear(): void {
    this.initCategoryColors();

    const context = this.getUIContext().getHostContext() as Context;
    const uiAbilityContext = context as common.UIAbilityContext;
    this.knowledgeIndex = KnowledgeIndex.getInstance(context);

    // 获取路由参数
    const params = router.getParams() as GraphParams;
    if (params && params.fileAnalysisList) {
      try {
        const list: FileAnalysis[] = JSON.parse(params.fileAnalysisList);
        list.forEach((f: FileAnalysis) => {
          this.fileAnalysisMap.set(f.filename, f);
        });
      } catch (e) {
        console.error('[KnowledgeGraphPage] 解析参数失败:', e);
      }
    }
  }

  private initCategoryColors(): void {
    this.categoryColors.set(DocumentCategory.MEETING_NOTES, '#FF9500');
    this.categoryColors.set(DocumentCategory.STUDY_NOTES, '#007AFF');
    this.categoryColors.set(DocumentCategory.PROJECT_REPORT, '#5856D6');
    this.categoryColors.set(DocumentCategory.PERSONAL_DIARY, '#FF2D55');
    this.categoryColors.set(DocumentCategory.TODO_LIST, '#34C759');
    this.categoryColors.set(DocumentCategory.TECHNICAL_DOC, '#00C7BE');
    this.categoryColors.set(DocumentCategory.OTHER, '#8E8E93');
  }

  private buildGraph(): void {
    if (!this.knowledgeIndex || this.canvasWidth === 0) return;

    const nodes = this.knowledgeIndex.getKnowledgeNodes();
    const links = this.knowledgeIndex.getAllKnowledgeLinks(0.15);

    if (nodes.length < 2) return;

    const layout = new GraphLayout(this.canvasWidth, this.canvasHeight - 100);
    layout.init(nodes, links, 80);
    const result = layout.run(60);

    this.graphNodes = result.nodes;
    this.graphEdges = result.edges;
  }

  private getNodeColor(filename: string): string {
    const file = this.fileAnalysisMap.get(filename);
    if (file) {
      const color = this.categoryColors.get(file.category);
      return color || '#8E8E93';
    }
    return '#8E8E93';
  }

  private findNodeById(id: string): GraphNode | null {
    for (let i = 0; i < this.graphNodes.length; i++) {
      if (this.graphNodes[i].id === id) return this.graphNodes[i];
    }
    return null;
  }

  private getSelectedSummary(): string {
    if (this.selectedNode) {
      const file = this.fileAnalysisMap.get(this.selectedNode.id);
      if (file) return file.summary;
    }
    return '暂无摘要';
  }

  private getSelectedCategoryName(): string {
    if (this.selectedNode) {
      const file = this.fileAnalysisMap.get(this.selectedNode.id);
      if (file) return file.categoryName;
    }
    return '未分类';
  }

  // 绘制所有连线
  private drawEdges(): void {
    if (!this.canvasContext || this.canvasWidth === 0) return;

    this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.graphEdges.forEach((edge: GraphEdge) => {
      const sourceNode = this.findNodeById(edge.source);
      const targetNode = this.findNodeById(edge.target);
      if (!sourceNode || !targetNode) return;

      const isHighlight = this.selectedNode &&
        (this.selectedNode.id === edge.source || this.selectedNode.id === edge.target);

      this.canvasContext.beginPath();
      this.canvasContext.moveTo(sourceNode.x, sourceNode.y);
      this.canvasContext.lineTo(targetNode.x, targetNode.y);

      if (isHighlight) {
        this.canvasContext.strokeStyle = '#5856D6';
        this.canvasContext.globalAlpha = 1;
      } else {
        this.canvasContext.strokeStyle = '#CCCCCC';
        this.canvasContext.globalAlpha = this.selectedNode ? 0.15 : (0.4 + edge.strength * 0.5);
      }

      this.canvasContext.lineWidth = 1 + edge.strength * 2;
      this.canvasContext.stroke();
    });

    this.canvasContext.globalAlpha = 1;
  }

  build() {
    Column() {
      // 顶部安全区域
      Row()
        .width('100%')
        .height(48)
        .backgroundColor(Color.White)

      // 顶部导航栏
      Row() {
        Button('返回')
          .fontSize(14)
          .fontColor('#007AFF')
          .backgroundColor(Color.Transparent)
          .onClick(() => {
            router.back();
          })

        Text('知识图谱')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .layoutWeight(1)
          .textAlign(TextAlign.Center)

        Text(`${this.graphNodes.length}节点`)
          .fontSize(12)
          .fontColor('#8E8E93')
          .width(60)
      }
      .width('100%')
      .height(44)
      .padding({ left: 12, right: 12 })
      .backgroundColor(Color.White)

      // 图谱区域
      Stack() {
        // Canvas 绘制连线
        Canvas(this.canvasContext)
          .width('100%')
          .height('100%')
          .onReady(() => {
            this.drawEdges();
          })

        // 绘制节点
        ForEach(this.graphNodes, (node: GraphNode, index: number) => {
          Column() {
            Text(node.id.length > 6 ? node.id.substring(0, 6) + '..' : node.id)
              .fontSize(10)
              .fontColor('#FFFFFF')
              .maxLines(1)
              .textAlign(TextAlign.Center)
          }
          .width(node.radius * 2)
          .height(node.radius * 2)
          .borderRadius(node.radius)
          .backgroundColor(this.getNodeColor(node.id))
          .justifyContent(FlexAlign.Center)
          .border({
            width: this.selectedNode && this.selectedNode.id === node.id ? 3 : 0,
            color: '#FFFFFF'
          })
          .shadow({ radius: 6, color: 'rgba(0,0,0,0.25)', offsetX: 2, offsetY: 2 })
          .position({ x: node.x - node.radius, y: node.y - node.radius })
          .gesture(
            PanGesture()
              .onActionStart(() => {
                this.draggingNodeId = node.id;
              })
              .onActionUpdate((event: GestureEvent) => {
                if (this.draggingNodeId === node.id) {
                  const newNodes = this.graphNodes.slice();
                  const newNode: GraphNode = {
                    id: node.id,
                    x: Math.max(node.radius, Math.min(this.canvasWidth - node.radius, node.x + event.offsetX)),
                    y: Math.max(node.radius, Math.min(this.canvasHeight - node.radius, node.y + event.offsetY)),
                    vx: 0,
                    vy: 0,
                    radius: node.radius,
                    keywords: node.keywords,
                    connections: node.connections
                  };
                  newNodes[index] = newNode;
                  this.graphNodes = newNodes;
                  this.drawEdges();
                }
              })
              .onActionEnd(() => {
                this.draggingNodeId = '';
              })
          )
          .onClick(() => {
            if (this.selectedNode && this.selectedNode.id === node.id) {
              this.selectedNode = null;
            } else {
              this.selectedNode = node;
            }
            this.drawEdges();
          })
        })
      }
      .width('100%')
      .layoutWeight(1)
      .backgroundColor('#F8F8F8')
      .onAreaChange((oldArea: Area, newArea: Area) => {
        const w = newArea.width as number;
        const h = newArea.height as number;
        if (w > 0 && h > 0 && (this.canvasWidth !== w || this.canvasHeight !== h)) {
          this.canvasWidth = w;
          this.canvasHeight = h;
          this.buildGraph();
          setTimeout(() => {
            this.drawEdges();
          }, 100);
        }
      })

      // 底部详情面板
      Column() {
        if (this.selectedNode) {
          Row() {
            Column() {
              Text(this.selectedNode.id)
                .fontSize(15)
                .fontWeight(FontWeight.Bold)
                .fontColor('#333333')
                .maxLines(1)
                .textOverflow({ overflow: TextOverflow.Ellipsis })

              Row() {
                Text(this.getSelectedCategoryName())
                  .fontSize(11)
                  .fontColor(Color.White)
                  .backgroundColor(this.getNodeColor(this.selectedNode.id))
                  .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                  .borderRadius(4)

                Text(`${this.selectedNode.connections} 个关联`)
                  .fontSize(11)
                  .fontColor('#8E8E93')
                  .margin({ left: 8 })
              }
              .margin({ top: 4 })
            }
            .alignItems(HorizontalAlign.Start)
            .layoutWeight(1)
          }
          .width('100%')
          .margin({ bottom: 6 })

          // 关键词
          if (this.selectedNode.keywords.length > 0) {
            Flex({ wrap: FlexWrap.Wrap }) {
              ForEach(this.selectedNode.keywords.slice(0, 6), (keyword: string) => {
                Text(keyword)
                  .fontSize(11)
                  .fontColor('#5856D6')
                  .backgroundColor('#F0EFFF')
                  .padding({ left: 8, right: 8, top: 3, bottom: 3 })
                  .borderRadius(4)
                  .margin({ right: 6, bottom: 4 })
              })
            }
            .width('100%')
          }

          // 摘要
          Text(this.getSelectedSummary())
            .fontSize(13)
            .fontColor('#666666')
            .maxLines(2)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .width('100%')
            .margin({ top: 6 })
        } else {
          Text('点击节点查看详情，拖拽可移动节点位置')
            .fontSize(13)
            .fontColor('#8E8E93')
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 30 })
      .backgroundColor(Color.White)
      .border({ width: { top: 1 }, color: '#E0E0E0' })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8F8F8')
  }
}
