if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface KnowledgeTab_Params {
    viewMode?: ViewMode;
    searchQuery?: string;
    searchResults?: SearchResult[];
    isSearching?: boolean;
    isIndexing?: boolean;
    indexProgress?: number;
    indexProgressText?: string;
    knowledgeLinks?: KnowledgeLink[];
    knowledgeNodes?: KnowledgeNode[];
    selectedNode?: KnowledgeNode | null;
    nodeRelations?: KnowledgeLink[];
    topKeywords?: Array<GeneratedTypeLiteralInterface_1>;
    selectedKeyword?: string;
    stats?: GeneratedTypeLiteralInterface_5;
    showMessage?: boolean;
    messageText?: string;
    messageType?: string;
    knowledgeIndex?: KnowledgeIndex | null;
}
import { KnowledgeIndex } from "@bundle:com.example.filesmanger/entry/ets/common/utils/KnowledgeIndex";
import type { SearchResult, KnowledgeLink, KnowledgeNode } from "@bundle:com.example.filesmanger/entry/ets/common/utils/KnowledgeIndex";
// 视图模式
enum ViewMode {
    SEARCH = "search",
    RELATIONS = "relations",
    KEYWORDS = "keywords"
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
export class KnowledgeTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__viewMode = new ObservedPropertySimplePU(ViewMode.SEARCH, this, "viewMode");
        this.__searchQuery = new ObservedPropertySimplePU('', this, "searchQuery");
        this.__searchResults = new ObservedPropertyObjectPU([], this, "searchResults");
        this.__isSearching = new ObservedPropertySimplePU(false, this, "isSearching");
        this.__isIndexing = new ObservedPropertySimplePU(false, this, "isIndexing");
        this.__indexProgress = new ObservedPropertySimplePU(0, this, "indexProgress");
        this.__indexProgressText = new ObservedPropertySimplePU('', this, "indexProgressText");
        this.__knowledgeLinks = new ObservedPropertyObjectPU([], this, "knowledgeLinks");
        this.__knowledgeNodes = new ObservedPropertyObjectPU([], this, "knowledgeNodes");
        this.__selectedNode = new ObservedPropertyObjectPU(null, this, "selectedNode");
        this.__nodeRelations = new ObservedPropertyObjectPU([], this, "nodeRelations");
        this.__topKeywords = new ObservedPropertyObjectPU([], this, "topKeywords");
        this.__selectedKeyword = new ObservedPropertySimplePU('', this, "selectedKeyword");
        this.__stats = new ObservedPropertyObjectPU({ documentCount: 0, termCount: 0, totalWords: 0, lastUpdated: 0 }, this, "stats");
        this.__showMessage = new ObservedPropertySimplePU(false, this, "showMessage");
        this.__messageText = new ObservedPropertySimplePU('', this, "messageText");
        this.__messageType = new ObservedPropertySimplePU('info', this, "messageType");
        this.knowledgeIndex = null;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: KnowledgeTab_Params) {
        if (params.viewMode !== undefined) {
            this.viewMode = params.viewMode;
        }
        if (params.searchQuery !== undefined) {
            this.searchQuery = params.searchQuery;
        }
        if (params.searchResults !== undefined) {
            this.searchResults = params.searchResults;
        }
        if (params.isSearching !== undefined) {
            this.isSearching = params.isSearching;
        }
        if (params.isIndexing !== undefined) {
            this.isIndexing = params.isIndexing;
        }
        if (params.indexProgress !== undefined) {
            this.indexProgress = params.indexProgress;
        }
        if (params.indexProgressText !== undefined) {
            this.indexProgressText = params.indexProgressText;
        }
        if (params.knowledgeLinks !== undefined) {
            this.knowledgeLinks = params.knowledgeLinks;
        }
        if (params.knowledgeNodes !== undefined) {
            this.knowledgeNodes = params.knowledgeNodes;
        }
        if (params.selectedNode !== undefined) {
            this.selectedNode = params.selectedNode;
        }
        if (params.nodeRelations !== undefined) {
            this.nodeRelations = params.nodeRelations;
        }
        if (params.topKeywords !== undefined) {
            this.topKeywords = params.topKeywords;
        }
        if (params.selectedKeyword !== undefined) {
            this.selectedKeyword = params.selectedKeyword;
        }
        if (params.stats !== undefined) {
            this.stats = params.stats;
        }
        if (params.showMessage !== undefined) {
            this.showMessage = params.showMessage;
        }
        if (params.messageText !== undefined) {
            this.messageText = params.messageText;
        }
        if (params.messageType !== undefined) {
            this.messageType = params.messageType;
        }
        if (params.knowledgeIndex !== undefined) {
            this.knowledgeIndex = params.knowledgeIndex;
        }
    }
    updateStateVars(params: KnowledgeTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__viewMode.purgeDependencyOnElmtId(rmElmtId);
        this.__searchQuery.purgeDependencyOnElmtId(rmElmtId);
        this.__searchResults.purgeDependencyOnElmtId(rmElmtId);
        this.__isSearching.purgeDependencyOnElmtId(rmElmtId);
        this.__isIndexing.purgeDependencyOnElmtId(rmElmtId);
        this.__indexProgress.purgeDependencyOnElmtId(rmElmtId);
        this.__indexProgressText.purgeDependencyOnElmtId(rmElmtId);
        this.__knowledgeLinks.purgeDependencyOnElmtId(rmElmtId);
        this.__knowledgeNodes.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedNode.purgeDependencyOnElmtId(rmElmtId);
        this.__nodeRelations.purgeDependencyOnElmtId(rmElmtId);
        this.__topKeywords.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedKeyword.purgeDependencyOnElmtId(rmElmtId);
        this.__stats.purgeDependencyOnElmtId(rmElmtId);
        this.__showMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__messageText.purgeDependencyOnElmtId(rmElmtId);
        this.__messageType.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__viewMode.aboutToBeDeleted();
        this.__searchQuery.aboutToBeDeleted();
        this.__searchResults.aboutToBeDeleted();
        this.__isSearching.aboutToBeDeleted();
        this.__isIndexing.aboutToBeDeleted();
        this.__indexProgress.aboutToBeDeleted();
        this.__indexProgressText.aboutToBeDeleted();
        this.__knowledgeLinks.aboutToBeDeleted();
        this.__knowledgeNodes.aboutToBeDeleted();
        this.__selectedNode.aboutToBeDeleted();
        this.__nodeRelations.aboutToBeDeleted();
        this.__topKeywords.aboutToBeDeleted();
        this.__selectedKeyword.aboutToBeDeleted();
        this.__stats.aboutToBeDeleted();
        this.__showMessage.aboutToBeDeleted();
        this.__messageText.aboutToBeDeleted();
        this.__messageType.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __viewMode: ObservedPropertySimplePU<ViewMode>;
    get viewMode() {
        return this.__viewMode.get();
    }
    set viewMode(newValue: ViewMode) {
        this.__viewMode.set(newValue);
    }
    private __searchQuery: ObservedPropertySimplePU<string>;
    get searchQuery() {
        return this.__searchQuery.get();
    }
    set searchQuery(newValue: string) {
        this.__searchQuery.set(newValue);
    }
    private __searchResults: ObservedPropertyObjectPU<SearchResult[]>;
    get searchResults() {
        return this.__searchResults.get();
    }
    set searchResults(newValue: SearchResult[]) {
        this.__searchResults.set(newValue);
    }
    private __isSearching: ObservedPropertySimplePU<boolean>;
    get isSearching() {
        return this.__isSearching.get();
    }
    set isSearching(newValue: boolean) {
        this.__isSearching.set(newValue);
    }
    private __isIndexing: ObservedPropertySimplePU<boolean>;
    get isIndexing() {
        return this.__isIndexing.get();
    }
    set isIndexing(newValue: boolean) {
        this.__isIndexing.set(newValue);
    }
    private __indexProgress: ObservedPropertySimplePU<number>;
    get indexProgress() {
        return this.__indexProgress.get();
    }
    set indexProgress(newValue: number) {
        this.__indexProgress.set(newValue);
    }
    private __indexProgressText: ObservedPropertySimplePU<string>;
    get indexProgressText() {
        return this.__indexProgressText.get();
    }
    set indexProgressText(newValue: string) {
        this.__indexProgressText.set(newValue);
    }
    // 知识关联
    private __knowledgeLinks: ObservedPropertyObjectPU<KnowledgeLink[]>;
    get knowledgeLinks() {
        return this.__knowledgeLinks.get();
    }
    set knowledgeLinks(newValue: KnowledgeLink[]) {
        this.__knowledgeLinks.set(newValue);
    }
    private __knowledgeNodes: ObservedPropertyObjectPU<KnowledgeNode[]>;
    get knowledgeNodes() {
        return this.__knowledgeNodes.get();
    }
    set knowledgeNodes(newValue: KnowledgeNode[]) {
        this.__knowledgeNodes.set(newValue);
    }
    private __selectedNode: ObservedPropertyObjectPU<KnowledgeNode | null>;
    get selectedNode() {
        return this.__selectedNode.get();
    }
    set selectedNode(newValue: KnowledgeNode | null) {
        this.__selectedNode.set(newValue);
    }
    private __nodeRelations: ObservedPropertyObjectPU<KnowledgeLink[]>;
    get nodeRelations() {
        return this.__nodeRelations.get();
    }
    set nodeRelations(newValue: KnowledgeLink[]) {
        this.__nodeRelations.set(newValue);
    }
    // 关键词
    private __topKeywords: ObservedPropertyObjectPU<Array<GeneratedTypeLiteralInterface_1>>;
    get topKeywords() {
        return this.__topKeywords.get();
    }
    set topKeywords(newValue: Array<GeneratedTypeLiteralInterface_1>) {
        this.__topKeywords.set(newValue);
    }
    private __selectedKeyword: ObservedPropertySimplePU<string>;
    get selectedKeyword() {
        return this.__selectedKeyword.get();
    }
    set selectedKeyword(newValue: string) {
        this.__selectedKeyword.set(newValue);
    }
    // 统计
    private __stats: ObservedPropertyObjectPU<GeneratedTypeLiteralInterface_5>;
    get stats() {
        return this.__stats.get();
    }
    set stats(newValue: GeneratedTypeLiteralInterface_5) {
        this.__stats.set(newValue);
    }
    // 消息
    private __showMessage: ObservedPropertySimplePU<boolean>;
    get showMessage() {
        return this.__showMessage.get();
    }
    set showMessage(newValue: boolean) {
        this.__showMessage.set(newValue);
    }
    private __messageText: ObservedPropertySimplePU<string>;
    get messageText() {
        return this.__messageText.get();
    }
    set messageText(newValue: string) {
        this.__messageText.set(newValue);
    }
    private __messageType: ObservedPropertySimplePU<string>;
    get messageType() {
        return this.__messageType.get();
    }
    set messageType(newValue: string) {
        this.__messageType.set(newValue);
    }
    private knowledgeIndex: KnowledgeIndex | null;
    aboutToAppear() {
        const context = this.getUIContext().getHostContext() as Context;
        this.knowledgeIndex = KnowledgeIndex.getInstance(context);
        this.loadStats();
        this.loadTopKeywords();
    }
    // 加载统计信息
    private loadStats() {
        if (!this.knowledgeIndex)
            return;
        this.stats = this.knowledgeIndex.getStats() as GeneratedTypeLiteralInterface_5;
    }
    // 加载热门关键词
    private loadTopKeywords() {
        if (!this.knowledgeIndex)
            return;
        this.topKeywords = this.knowledgeIndex.getTopKeywords(30);
    }
    // 加载知识关联
    private loadKnowledgeLinks() {
        if (!this.knowledgeIndex)
            return;
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
        if (!this.knowledgeIndex || this.isIndexing)
            return;
        this.isIndexing = true;
        this.indexProgress = 0;
        this.showToast('正在构建知识索引...', 'info');
        try {
            const count = await this.knowledgeIndex.indexAllDocuments((current: number, total: number, filename: string) => {
                this.indexProgress = Math.floor((current / total) * 100);
                this.indexProgressText = `${current}/${total}: ${filename}`;
            });
            this.loadStats();
            this.loadTopKeywords();
            this.loadKnowledgeLinks();
            this.showToast(`索引构建完成！共索引 ${count} 个文档`, 'success');
        }
        catch (error) {
            console.error('[KnowledgeTab] 构建索引失败:', error);
            this.showToast('索引构建失败', 'error');
        }
        this.isIndexing = false;
    }
    // 执行搜索
    private performSearch() {
        if (!this.knowledgeIndex || !this.searchQuery.trim())
            return;
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
        if (!this.knowledgeIndex)
            return;
        this.selectedNode = node;
        this.nodeRelations = this.knowledgeIndex.getRelatedDocuments(node.filename, 10);
    }
    // 格式化日期
    private formatDate(timestamp: number): string {
        if (timestamp === 0)
            return '从未更新';
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(172:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部标题和统计
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(174:7)", "entry");
            // 顶部标题和统计
            Column.width('100%');
            // 顶部标题和统计
            Column.padding({ left: 16, right: 16, top: 12, bottom: 8 });
            // 顶部标题和统计
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('AI 知识库');
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(175:9)", "entry");
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 16 });
            Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(181:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(182:11)", "entry");
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.stats.documentCount}`);
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(183:13)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#007AFF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('文档');
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(187:13)", "entry");
            Text.fontSize(11);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(192:11)", "entry");
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.stats.termCount}`);
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(193:13)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#34C759');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('词条');
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(197:13)", "entry");
            Text.fontSize(11);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(202:11)", "entry");
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${(this.stats.totalWords / 1000).toFixed(1)}K`);
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(203:13)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FF9500');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('总字数');
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(207:13)", "entry");
            Text.fontSize(11);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        // 顶部标题和统计
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 操作按钮
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(218:7)", "entry");
            // 操作按钮
            Row.width('100%');
            // 操作按钮
            Row.padding({ left: 16, right: 16, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isIndexing ? '索引中...' : '重建索引');
            Button.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(219:9)", "entry");
            Button.onClick(() => this.buildIndex());
            Button.enabled(!this.isIndexing);
            Button.height(40);
            Button.fontSize(14);
            Button.backgroundColor(this.isIndexing ? '#C7C7CC' : '#007AFF');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
            Button.layoutWeight(1);
        }, Button);
        Button.pop();
        // 操作按钮
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 索引进度
            if (this.isIndexing) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(234:9)", "entry");
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor('#F8F8F8');
                        Column.borderRadius(12);
                        Column.margin({ left: 16, right: 16, bottom: 12 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(235:11)", "entry");
                        Row.width('100%');
                        Row.margin({ bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('索引进度');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(236:13)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#333333');
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.indexProgress}%`);
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(240:13)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#007AFF');
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Progress.create({ value: this.indexProgress, total: 100, type: ProgressType.Linear });
                        Progress.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(248:11)", "entry");
                        Progress.color('#007AFF');
                        Progress.backgroundColor('#E0E0E0');
                        Progress.height(8);
                        Progress.width('100%');
                        Progress.borderRadius(4);
                    }, Progress);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.indexProgressText) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.indexProgressText);
                                    Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(256:13)", "entry");
                                    Text.fontSize(11);
                                    Text.fontColor('#8E8E93');
                                    Text.margin({ top: 6 });
                                    Text.maxLines(1);
                                    Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                }, Text);
                                Text.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    Column.pop();
                });
            }
            // 消息提示
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 消息提示
            if (this.showMessage) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.messageText);
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(273:9)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#FFFFFF');
                        Text.backgroundColor(this.messageType === 'success' ? '#34C759' :
                            (this.messageType === 'error' ? '#FF3B30' : '#007AFF'));
                        Text.padding({ left: 16, right: 16, top: 8, bottom: 8 });
                        Text.borderRadius(8);
                        Text.margin({ left: 16, right: 16, bottom: 8 });
                    }, Text);
                    Text.pop();
                });
            }
            // 视图切换标签
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 视图切换标签
            Row.create({ space: 0 });
            Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(286:7)", "entry");
            // 视图切换标签
            Row.width('100%');
            // 视图切换标签
            Row.padding({ left: 16, right: 16, bottom: 12 });
            // 视图切换标签
            Row.justifyContent(FlexAlign.Start);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('搜索');
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(287:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(this.viewMode === ViewMode.SEARCH ? '#007AFF' : '#666666');
            Text.fontWeight(this.viewMode === ViewMode.SEARCH ? FontWeight.Bold : FontWeight.Normal);
            Text.padding({ left: 16, right: 16, top: 10, bottom: 10 });
            Text.backgroundColor(this.viewMode === ViewMode.SEARCH ? '#E3F2FD' : Color.Transparent);
            Text.borderRadius(8);
            Text.onClick(() => {
                this.viewMode = ViewMode.SEARCH;
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('知识关联');
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(298:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(this.viewMode === ViewMode.RELATIONS ? '#007AFF' : '#666666');
            Text.fontWeight(this.viewMode === ViewMode.RELATIONS ? FontWeight.Bold : FontWeight.Normal);
            Text.padding({ left: 16, right: 16, top: 10, bottom: 10 });
            Text.backgroundColor(this.viewMode === ViewMode.RELATIONS ? '#E3F2FD' : Color.Transparent);
            Text.borderRadius(8);
            Text.onClick(() => {
                this.viewMode = ViewMode.RELATIONS;
                this.loadKnowledgeLinks();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('热门关键词');
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(310:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(this.viewMode === ViewMode.KEYWORDS ? '#007AFF' : '#666666');
            Text.fontWeight(this.viewMode === ViewMode.KEYWORDS ? FontWeight.Bold : FontWeight.Normal);
            Text.padding({ left: 16, right: 16, top: 10, bottom: 10 });
            Text.backgroundColor(this.viewMode === ViewMode.KEYWORDS ? '#E3F2FD' : Color.Transparent);
            Text.borderRadius(8);
            Text.onClick(() => {
                this.viewMode = ViewMode.KEYWORDS;
                this.loadTopKeywords();
            });
        }, Text);
        Text.pop();
        // 视图切换标签
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 内容区域
            if (this.viewMode === ViewMode.SEARCH) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.buildSearchView.bind(this)();
                });
            }
            else if (this.viewMode === ViewMode.RELATIONS) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.buildRelationsView.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.buildKeywordsView.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    // 搜索视图
    buildSearchView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(343:5)", "entry");
            Column.width('100%');
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 搜索框
            Row.create();
            Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(345:7)", "entry");
            // 搜索框
            Row.width('100%');
            // 搜索框
            Row.padding({ left: 16, right: 16, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '输入关键词搜索文档...', text: this.searchQuery });
            TextInput.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(346:9)", "entry");
            TextInput.height(44);
            TextInput.layoutWeight(1);
            TextInput.backgroundColor(Color.White);
            TextInput.borderRadius(8);
            TextInput.padding({ left: 12, right: 12 });
            TextInput.onChange((value: string) => {
                this.searchQuery = value;
            });
            TextInput.onSubmit(() => {
                this.performSearch();
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('搜索');
            Button.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(359:9)", "entry");
            Button.height(44);
            Button.fontSize(14);
            Button.backgroundColor('#007AFF');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
            Button.margin({ left: 8 });
            Button.onClick(() => {
                this.performSearch();
            });
        }, Button);
        Button.pop();
        // 搜索框
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 搜索结果
            if (this.searchResults.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`找到 ${this.searchResults.length} 个结果`);
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(375:9)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#8E8E93');
                        Text.padding({ left: 16, right: 16, bottom: 8 });
                        Text.width('100%');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 8 });
                        List.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(381:9)", "entry");
                        List.width('100%');
                        List.layoutWeight(1);
                        List.padding({ left: 16, right: 16 });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const result = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                    ListItem.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(383:13)", "entry");
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(384:15)", "entry");
                                        Column.width('100%');
                                        Column.padding(12);
                                        Column.backgroundColor(Color.White);
                                        Column.borderRadius(10);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(385:17)", "entry");
                                        Row.width('100%');
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(result.filename);
                                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(386:19)", "entry");
                                        Text.fontSize(15);
                                        Text.fontWeight(FontWeight.Medium);
                                        Text.fontColor('#333333');
                                        Text.layoutWeight(1);
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`${result.score.toFixed(1)}`);
                                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(394:19)", "entry");
                                        Text.fontSize(12);
                                        Text.fontColor('#007AFF');
                                        Text.backgroundColor('#E3F2FD');
                                        Text.padding({ left: 8, right: 8, top: 2, bottom: 2 });
                                        Text.borderRadius(10);
                                    }, Text);
                                    Text.pop();
                                    Row.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        // 匹配词
                                        if (result.matchedTerms.length > 0) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Row.create();
                                                    Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(405:19)", "entry");
                                                    Row.width('100%');
                                                    Row.margin({ top: 6 });
                                                }, Row);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create('匹配: ');
                                                    Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(406:21)", "entry");
                                                    Text.fontSize(11);
                                                    Text.fontColor('#8E8E93');
                                                }, Text);
                                                Text.pop();
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    ForEach.create();
                                                    const forEachItemGenFunction = _item => {
                                                        const term = _item;
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Text.create(term);
                                                            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(410:23)", "entry");
                                                            Text.fontSize(11);
                                                            Text.fontColor('#007AFF');
                                                            Text.margin({ right: 6 });
                                                        }, Text);
                                                        Text.pop();
                                                    };
                                                    this.forEachUpdateFunction(elmtId, result.matchedTerms.slice(0, 5), forEachItemGenFunction);
                                                }, ForEach);
                                                ForEach.pop();
                                                Row.pop();
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
                                        If.create();
                                        // 摘要
                                        if (result.snippet) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(result.snippet);
                                                    Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(422:19)", "entry");
                                                    Text.fontSize(12);
                                                    Text.fontColor('#666666');
                                                    Text.maxLines(2);
                                                    Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                                    Text.margin({ top: 6 });
                                                    Text.width('100%');
                                                }, Text);
                                                Text.pop();
                                            });
                                        }
                                        else {
                                            this.ifElseBranchUpdateFunction(1, () => {
                                            });
                                        }
                                    }, If);
                                    If.pop();
                                    Column.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.searchResults, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
            else if (!this.isSearching && this.searchQuery.length > 0) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(442:9)", "entry");
                        Column.width('100%');
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('未找到相关文档');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(443:11)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(451:9)", "entry");
                        Column.width('100%');
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('输入关键词开始搜索');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(452:11)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    // 知识关联视图
    buildRelationsView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(468:5)", "entry");
            Column.width('100%');
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.knowledgeNodes.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(470:9)", "entry");
                        Column.width('100%');
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无知识关联数据');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(471:11)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('请先构建索引');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(474:11)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#C7C7CC');
                        Text.margin({ top: 8 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 节点列表（按连接数排序）
                        Text.create('知识节点（按关联度排序）');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(484:9)", "entry");
                        // 节点列表（按连接数排序）
                        Text.fontSize(14);
                        // 节点列表（按连接数排序）
                        Text.fontColor('#666666');
                        // 节点列表（按连接数排序）
                        Text.padding({ left: 16, right: 16, bottom: 8 });
                        // 节点列表（按连接数排序）
                        Text.width('100%');
                    }, Text);
                    // 节点列表（按连接数排序）
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 8 });
                        List.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(490:9)", "entry");
                        List.width('100%');
                        List.layoutWeight(1);
                        List.padding({ left: 16, right: 16 });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const node = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                    ListItem.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(492:13)", "entry");
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(493:15)", "entry");
                                        Column.width('100%');
                                        Column.padding(12);
                                        Column.backgroundColor(Color.White);
                                        Column.borderRadius(10);
                                        Column.onClick(() => {
                                            if (this.selectedNode && this.selectedNode.filename === node.filename) {
                                                this.selectedNode = null;
                                                this.nodeRelations = [];
                                            }
                                            else {
                                                this.viewNodeRelations(node);
                                            }
                                        });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(494:17)", "entry");
                                        Row.width('100%');
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(node.filename);
                                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(495:19)", "entry");
                                        Text.fontSize(14);
                                        Text.fontWeight(FontWeight.Medium);
                                        Text.fontColor('#333333');
                                        Text.layoutWeight(1);
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`${node.connections} 关联`);
                                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(503:19)", "entry");
                                        Text.fontSize(11);
                                        Text.fontColor(Color.White);
                                        Text.backgroundColor(node.connections > 3 ? '#FF9500' : '#8E8E93');
                                        Text.padding({ left: 8, right: 8, top: 2, bottom: 2 });
                                        Text.borderRadius(10);
                                    }, Text);
                                    Text.pop();
                                    Row.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        // 关键词
                                        if (node.keywords.length > 0) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Row.create();
                                                    Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(514:19)", "entry");
                                                    Row.width('100%');
                                                    Row.margin({ top: 6 });
                                                }, Row);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    ForEach.create();
                                                    const forEachItemGenFunction = _item => {
                                                        const keyword = _item;
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Text.create(keyword);
                                                            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(516:23)", "entry");
                                                            Text.fontSize(10);
                                                            Text.fontColor('#666666');
                                                            Text.backgroundColor('#F0F0F0');
                                                            Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                                                            Text.borderRadius(4);
                                                            Text.margin({ right: 4 });
                                                        }, Text);
                                                        Text.pop();
                                                    };
                                                    this.forEachUpdateFunction(elmtId, node.keywords.slice(0, 5), forEachItemGenFunction);
                                                }, ForEach);
                                                ForEach.pop();
                                                Row.pop();
                                            });
                                        }
                                        // 显示关联文档
                                        else {
                                            this.ifElseBranchUpdateFunction(1, () => {
                                            });
                                        }
                                    }, If);
                                    If.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        // 显示关联文档
                                        if (this.selectedNode && this.selectedNode.filename === node.filename && this.nodeRelations.length > 0) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Column.create();
                                                    Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(531:19)", "entry");
                                                    Column.width('100%');
                                                }, Column);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create('关联文档:');
                                                    Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(532:21)", "entry");
                                                    Text.fontSize(12);
                                                    Text.fontColor('#666666');
                                                    Text.margin({ top: 8, bottom: 4 });
                                                    Text.width('100%');
                                                }, Text);
                                                Text.pop();
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    ForEach.create();
                                                    const forEachItemGenFunction = _item => {
                                                        const link = _item;
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Row.create();
                                                            Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(539:23)", "entry");
                                                            Row.width('100%');
                                                            Row.padding({ top: 4, bottom: 4 });
                                                            Row.backgroundColor('#F8F8F8');
                                                            Row.borderRadius(4);
                                                            Row.padding({ left: 8, right: 8 });
                                                            Row.margin({ bottom: 4 });
                                                        }, Row);
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Text.create(link.target);
                                                            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(540:25)", "entry");
                                                            Text.fontSize(12);
                                                            Text.fontColor('#007AFF');
                                                            Text.layoutWeight(1);
                                                        }, Text);
                                                        Text.pop();
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Text.create(`${(link.strength * 100).toFixed(0)}%`);
                                                            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(544:25)", "entry");
                                                            Text.fontSize(11);
                                                            Text.fontColor('#34C759');
                                                        }, Text);
                                                        Text.pop();
                                                        Row.pop();
                                                    };
                                                    this.forEachUpdateFunction(elmtId, this.nodeRelations, forEachItemGenFunction);
                                                }, ForEach);
                                                ForEach.pop();
                                                Column.pop();
                                            });
                                        }
                                        else {
                                            this.ifElseBranchUpdateFunction(1, () => {
                                            });
                                        }
                                    }, If);
                                    If.pop();
                                    Column.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.knowledgeNodes, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    // 热门关键词视图
    buildKeywordsView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(586:5)", "entry");
            Column.width('100%');
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.topKeywords.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(588:9)", "entry");
                        Column.width('100%');
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无关键词数据');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(589:11)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('请先构建索引');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(592:11)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#C7C7CC');
                        Text.margin({ top: 8 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('点击关键词进行搜索');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(601:9)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#8E8E93');
                        Text.padding({ left: 16, right: 16, bottom: 12 });
                        Text.width('100%');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(607:9)", "entry");
                        Scroll.layoutWeight(1);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Flex.create({ wrap: FlexWrap.Wrap });
                        Flex.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(608:11)", "entry");
                        Flex.width('100%');
                        Flex.padding({ left: 16, right: 16 });
                    }, Flex);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index: number) => {
                            const item = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(610:15)", "entry");
                                Row.padding({ left: 12, right: 12, top: 8, bottom: 8 });
                                Row.backgroundColor(index < 3 ? '#007AFF' :
                                    (index < 5 ? '#34C759' :
                                        (index < 10 ? '#E3F2FD' : '#F0F0F0')));
                                Row.borderRadius(20);
                                Row.margin({ right: 8, bottom: 8 });
                                Row.onClick(() => {
                                    this.searchByKeyword(item.keyword);
                                });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(item.keyword);
                                Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(611:17)", "entry");
                                Text.fontSize(index < 5 ? 14 : (index < 10 ? 13 : 12));
                                Text.fontColor(index < 5 ? '#FFFFFF' : '#333333');
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`${item.count}`);
                                Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(615:17)", "entry");
                                Text.fontSize(10);
                                Text.fontColor(index < 5 ? '#FFFFFF' : '#8E8E93');
                                Text.margin({ left: 4 });
                            }, Text);
                            Text.pop();
                            Row.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.topKeywords, forEachItemGenFunction, undefined, true, false);
                    }, ForEach);
                    ForEach.pop();
                    Flex.pop();
                    Scroll.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
