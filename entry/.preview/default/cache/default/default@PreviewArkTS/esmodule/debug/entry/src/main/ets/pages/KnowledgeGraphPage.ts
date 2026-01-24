if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface KnowledgeGraphPage_Params {
    graphNodes?: GraphNode[];
    graphEdges?: GraphEdge[];
    selectedNode?: GraphNode | null;
    canvasWidth?: number;
    canvasHeight?: number;
    fileAnalysisMap?: Map<string, FileAnalysis>;
    knowledgeIndex?: KnowledgeIndex | null;
    categoryColors?: Map<DocumentCategory, string>;
    draggingNodeId?: string;
    canvasSettings?: RenderingContextSettings;
    canvasContext?: CanvasRenderingContext2D;
}
import router from "@ohos:router";
import type common from "@ohos:app.ability.common";
import { KnowledgeIndex } from "@bundle:com.example.filesmanger/entry/ets/common/utils/KnowledgeIndex";
import { GraphLayout } from "@bundle:com.example.filesmanger/entry/ets/common/utils/GraphLayout";
import type { GraphNode, GraphEdge } from "@bundle:com.example.filesmanger/entry/ets/common/utils/GraphLayout";
import { DocumentCategory } from "@bundle:com.example.filesmanger/entry/ets/common/types/AIDocTypes";
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
class KnowledgeGraphPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__graphNodes = new ObservedPropertyObjectPU([], this, "graphNodes");
        this.__graphEdges = new ObservedPropertyObjectPU([], this, "graphEdges");
        this.__selectedNode = new ObservedPropertyObjectPU(null, this, "selectedNode");
        this.__canvasWidth = new ObservedPropertySimplePU(0, this, "canvasWidth");
        this.__canvasHeight = new ObservedPropertySimplePU(0, this, "canvasHeight");
        this.fileAnalysisMap = new Map();
        this.knowledgeIndex = null;
        this.categoryColors = new Map();
        this.draggingNodeId = '';
        this.canvasSettings = new RenderingContextSettings(true);
        this.canvasContext = new CanvasRenderingContext2D(this.canvasSettings);
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: KnowledgeGraphPage_Params) {
        if (params.graphNodes !== undefined) {
            this.graphNodes = params.graphNodes;
        }
        if (params.graphEdges !== undefined) {
            this.graphEdges = params.graphEdges;
        }
        if (params.selectedNode !== undefined) {
            this.selectedNode = params.selectedNode;
        }
        if (params.canvasWidth !== undefined) {
            this.canvasWidth = params.canvasWidth;
        }
        if (params.canvasHeight !== undefined) {
            this.canvasHeight = params.canvasHeight;
        }
        if (params.fileAnalysisMap !== undefined) {
            this.fileAnalysisMap = params.fileAnalysisMap;
        }
        if (params.knowledgeIndex !== undefined) {
            this.knowledgeIndex = params.knowledgeIndex;
        }
        if (params.categoryColors !== undefined) {
            this.categoryColors = params.categoryColors;
        }
        if (params.draggingNodeId !== undefined) {
            this.draggingNodeId = params.draggingNodeId;
        }
        if (params.canvasSettings !== undefined) {
            this.canvasSettings = params.canvasSettings;
        }
        if (params.canvasContext !== undefined) {
            this.canvasContext = params.canvasContext;
        }
    }
    updateStateVars(params: KnowledgeGraphPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__graphNodes.purgeDependencyOnElmtId(rmElmtId);
        this.__graphEdges.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedNode.purgeDependencyOnElmtId(rmElmtId);
        this.__canvasWidth.purgeDependencyOnElmtId(rmElmtId);
        this.__canvasHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__graphNodes.aboutToBeDeleted();
        this.__graphEdges.aboutToBeDeleted();
        this.__selectedNode.aboutToBeDeleted();
        this.__canvasWidth.aboutToBeDeleted();
        this.__canvasHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __graphNodes: ObservedPropertyObjectPU<GraphNode[]>;
    get graphNodes() {
        return this.__graphNodes.get();
    }
    set graphNodes(newValue: GraphNode[]) {
        this.__graphNodes.set(newValue);
    }
    private __graphEdges: ObservedPropertyObjectPU<GraphEdge[]>;
    get graphEdges() {
        return this.__graphEdges.get();
    }
    set graphEdges(newValue: GraphEdge[]) {
        this.__graphEdges.set(newValue);
    }
    private __selectedNode: ObservedPropertyObjectPU<GraphNode | null>;
    get selectedNode() {
        return this.__selectedNode.get();
    }
    set selectedNode(newValue: GraphNode | null) {
        this.__selectedNode.set(newValue);
    }
    private __canvasWidth: ObservedPropertySimplePU<number>;
    get canvasWidth() {
        return this.__canvasWidth.get();
    }
    set canvasWidth(newValue: number) {
        this.__canvasWidth.set(newValue);
    }
    private __canvasHeight: ObservedPropertySimplePU<number>;
    get canvasHeight() {
        return this.__canvasHeight.get();
    }
    set canvasHeight(newValue: number) {
        this.__canvasHeight.set(newValue);
    }
    private fileAnalysisMap: Map<string, FileAnalysis>;
    private knowledgeIndex: KnowledgeIndex | null;
    private categoryColors: Map<DocumentCategory, string>;
    private draggingNodeId: string;
    private canvasSettings: RenderingContextSettings;
    private canvasContext: CanvasRenderingContext2D;
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
            }
            catch (e) {
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
        if (!this.knowledgeIndex || this.canvasWidth === 0)
            return;
        const nodes = this.knowledgeIndex.getKnowledgeNodes();
        const links = this.knowledgeIndex.getAllKnowledgeLinks(0.15);
        if (nodes.length < 2)
            return;
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
            if (this.graphNodes[i].id === id)
                return this.graphNodes[i];
        }
        return null;
    }
    private getSelectedSummary(): string {
        if (this.selectedNode) {
            const file = this.fileAnalysisMap.get(this.selectedNode.id);
            if (file)
                return file.summary;
        }
        return '暂无摘要';
    }
    private getSelectedCategoryName(): string {
        if (this.selectedNode) {
            const file = this.fileAnalysisMap.get(this.selectedNode.id);
            if (file)
                return file.categoryName;
        }
        return '未分类';
    }
    // 绘制所有连线
    private drawEdges(): void {
        if (!this.canvasContext || this.canvasWidth === 0)
            return;
        this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.graphEdges.forEach((edge: GraphEdge) => {
            const sourceNode = this.findNodeById(edge.source);
            const targetNode = this.findNodeById(edge.target);
            if (!sourceNode || !targetNode)
                return;
            const isHighlight = this.selectedNode &&
                (this.selectedNode.id === edge.source || this.selectedNode.id === edge.target);
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(sourceNode.x, sourceNode.y);
            this.canvasContext.lineTo(targetNode.x, targetNode.y);
            if (isHighlight) {
                this.canvasContext.strokeStyle = '#5856D6';
                this.canvasContext.globalAlpha = 1;
            }
            else {
                this.canvasContext.strokeStyle = '#CCCCCC';
                this.canvasContext.globalAlpha = this.selectedNode ? 0.15 : (0.4 + edge.strength * 0.5);
            }
            this.canvasContext.lineWidth = 1 + edge.strength * 2;
            this.canvasContext.stroke();
        });
        this.canvasContext.globalAlpha = 1;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(157:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F8F8F8');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部安全区域
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(159:7)", "entry");
            // 顶部安全区域
            Row.width('100%');
            // 顶部安全区域
            Row.height(48);
            // 顶部安全区域
            Row.backgroundColor(Color.White);
        }, Row);
        // 顶部安全区域
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部导航栏
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(165:7)", "entry");
            // 顶部导航栏
            Row.width('100%');
            // 顶部导航栏
            Row.height(44);
            // 顶部导航栏
            Row.padding({ left: 12, right: 12 });
            // 顶部导航栏
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('返回');
            Button.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(166:9)", "entry");
            Button.fontSize(14);
            Button.fontColor('#007AFF');
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => {
                router.back();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('知识图谱');
            Text.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(174:9)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.graphNodes.length}节点`);
            Text.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(181:9)", "entry");
            Text.fontSize(12);
            Text.fontColor('#8E8E93');
            Text.width(60);
        }, Text);
        Text.pop();
        // 顶部导航栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 图谱区域
            Stack.create();
            Stack.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(192:7)", "entry");
            // 图谱区域
            Stack.width('100%');
            // 图谱区域
            Stack.layoutWeight(1);
            // 图谱区域
            Stack.backgroundColor('#F8F8F8');
            // 图谱区域
            Stack.onAreaChange((oldArea: Area, newArea: Area) => {
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
            });
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Canvas 绘制连线
            Canvas.create(this.canvasContext);
            Canvas.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(194:9)", "entry");
            // Canvas 绘制连线
            Canvas.width('100%');
            // Canvas 绘制连线
            Canvas.height('100%');
            // Canvas 绘制连线
            Canvas.onReady(() => {
                this.drawEdges();
            });
        }, Canvas);
        // Canvas 绘制连线
        Canvas.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 绘制节点
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const node = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(203:11)", "entry");
                    Column.width(node.radius * 2);
                    Column.height(node.radius * 2);
                    Column.borderRadius(node.radius);
                    Column.backgroundColor(this.getNodeColor(node.id));
                    Column.justifyContent(FlexAlign.Center);
                    Column.border({
                        width: this.selectedNode && this.selectedNode.id === node.id ? 3 : 0,
                        color: '#FFFFFF'
                    });
                    Column.shadow({ radius: 6, color: 'rgba(0,0,0,0.25)', offsetX: 2, offsetY: 2 });
                    Column.position({ x: node.x - node.radius, y: node.y - node.radius });
                    Gesture.create(GesturePriority.Low);
                    PanGesture.create();
                    PanGesture.onActionStart(() => {
                        this.draggingNodeId = node.id;
                    });
                    PanGesture.onActionUpdate((event: GestureEvent) => {
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
                    });
                    PanGesture.onActionEnd(() => {
                        this.draggingNodeId = '';
                    });
                    PanGesture.pop();
                    Gesture.pop();
                    Column.onClick(() => {
                        if (this.selectedNode && this.selectedNode.id === node.id) {
                            this.selectedNode = null;
                        }
                        else {
                            this.selectedNode = node;
                        }
                        this.drawEdges();
                    });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(node.id.length > 6 ? node.id.substring(0, 6) + '..' : node.id);
                    Text.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(204:13)", "entry");
                    Text.fontSize(10);
                    Text.fontColor('#FFFFFF');
                    Text.maxLines(1);
                    Text.textAlign(TextAlign.Center);
                }, Text);
                Text.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, this.graphNodes, forEachItemGenFunction, undefined, true, false);
        }, ForEach);
        // 绘制节点
        ForEach.pop();
        // 图谱区域
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 底部详情面板
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(275:7)", "entry");
            // 底部详情面板
            Column.width('100%');
            // 底部详情面板
            Column.padding({ left: 16, right: 16, top: 12, bottom: 30 });
            // 底部详情面板
            Column.backgroundColor(Color.White);
            // 底部详情面板
            Column.border({ width: { top: 1 }, color: '#E0E0E0' });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.selectedNode) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(277:11)", "entry");
                        Row.width('100%');
                        Row.margin({ bottom: 6 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(278:13)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.selectedNode.id);
                        Text.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(279:15)", "entry");
                        Text.fontSize(15);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.maxLines(1);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(286:15)", "entry");
                        Row.margin({ top: 4 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.getSelectedCategoryName());
                        Text.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(287:17)", "entry");
                        Text.fontSize(11);
                        Text.fontColor(Color.White);
                        Text.backgroundColor(this.getNodeColor(this.selectedNode.id));
                        Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                        Text.borderRadius(4);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.selectedNode.connections} 个关联`);
                        Text.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(294:17)", "entry");
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                        Text.margin({ left: 8 });
                    }, Text);
                    Text.pop();
                    Row.pop();
                    Column.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 关键词
                        if (this.selectedNode.keywords.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Flex.create({ wrap: FlexWrap.Wrap });
                                    Flex.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(309:13)", "entry");
                                    Flex.width('100%');
                                }, Flex);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = _item => {
                                        const keyword = _item;
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(keyword);
                                            Text.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(311:17)", "entry");
                                            Text.fontSize(11);
                                            Text.fontColor('#5856D6');
                                            Text.backgroundColor('#F0EFFF');
                                            Text.padding({ left: 8, right: 8, top: 3, bottom: 3 });
                                            Text.borderRadius(4);
                                            Text.margin({ right: 6, bottom: 4 });
                                        }, Text);
                                        Text.pop();
                                    };
                                    this.forEachUpdateFunction(elmtId, this.selectedNode.keywords.slice(0, 6), forEachItemGenFunction);
                                }, ForEach);
                                ForEach.pop();
                                Flex.pop();
                            });
                        }
                        // 摘要
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 摘要
                        Text.create(this.getSelectedSummary());
                        Text.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(324:11)", "entry");
                        // 摘要
                        Text.fontSize(13);
                        // 摘要
                        Text.fontColor('#666666');
                        // 摘要
                        Text.maxLines(2);
                        // 摘要
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        // 摘要
                        Text.width('100%');
                        // 摘要
                        Text.margin({ top: 6 });
                    }, Text);
                    // 摘要
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('点击节点查看详情，拖拽可移动节点位置');
                        Text.debugLine("entry/src/main/ets/pages/KnowledgeGraphPage.ets(332:11)", "entry");
                        Text.fontSize(13);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                });
            }
        }, If);
        If.pop();
        // 底部详情面板
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "KnowledgeGraphPage";
    }
}
registerNamedRoute(() => new KnowledgeGraphPage(undefined, {}), "", { bundleName: "com.example.filesmanger", moduleName: "entry", pagePath: "pages/KnowledgeGraphPage", pageFullPath: "entry/src/main/ets/pages/KnowledgeGraphPage", integratedHsp: "false", moduleType: "followWithHap" });
