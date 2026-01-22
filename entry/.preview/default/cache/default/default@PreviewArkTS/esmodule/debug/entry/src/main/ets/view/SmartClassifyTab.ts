if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface SmartClassifyTab_Params {
    fileList?: FileAnalysis[];
    isLoading?: boolean;
    isAnalyzing?: boolean;
    selectedCategory?: DocumentCategory | null;
    searchKeyword?: string;
    showFileDetail?: boolean;
    selectedFile?: FileAnalysis | null;
    analysisProgress?: number;
    analysisProgressText?: string;
    showMessage?: boolean;
    messageText?: string;
    messageType?: string;
    filesDir?: string;
    similarityCalculator?: SimilarityCalculator | null;
    categoryRules?: CategoryKeywords[];
    categoryColors?: Map<DocumentCategory, string>;
}
import fileIo from "@ohos:file.fs";
import type common from "@ohos:app.ability.common";
import { DocumentCategory, getCategoryDisplayName } from "@bundle:com.example.filesmanger/entry/ets/common/types/AIDocTypes";
import { SimilarityCalculator } from "@bundle:com.example.filesmanger/entry/ets/common/utils/SimilarityCalculator";
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
export class SmartClassifyTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__fileList = new ObservedPropertyObjectPU([], this, "fileList");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__isAnalyzing = new ObservedPropertySimplePU(false, this, "isAnalyzing");
        this.__selectedCategory = new ObservedPropertySimplePU(null, this, "selectedCategory");
        this.__searchKeyword = new ObservedPropertySimplePU('', this, "searchKeyword");
        this.__showFileDetail = new ObservedPropertySimplePU(false, this, "showFileDetail");
        this.__selectedFile = new ObservedPropertyObjectPU(null, this, "selectedFile");
        this.__analysisProgress = new ObservedPropertySimplePU(0, this, "analysisProgress");
        this.__analysisProgressText = new ObservedPropertySimplePU('', this, "analysisProgressText");
        this.__showMessage = new ObservedPropertySimplePU(false, this, "showMessage");
        this.__messageText = new ObservedPropertySimplePU('', this, "messageText");
        this.__messageType = new ObservedPropertySimplePU('info', this, "messageType");
        this.filesDir = '';
        this.similarityCalculator = null;
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
        this.categoryColors = new Map([
            [DocumentCategory.MEETING_NOTES, '#FF9500'],
            [DocumentCategory.STUDY_NOTES, '#007AFF'],
            [DocumentCategory.PROJECT_REPORT, '#5856D6'],
            [DocumentCategory.PERSONAL_DIARY, '#FF2D55'],
            [DocumentCategory.TODO_LIST, '#34C759'],
            [DocumentCategory.TECHNICAL_DOC, '#00C7BE'],
            [DocumentCategory.OTHER, '#8E8E93']
        ]);
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: SmartClassifyTab_Params) {
        if (params.fileList !== undefined) {
            this.fileList = params.fileList;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.isAnalyzing !== undefined) {
            this.isAnalyzing = params.isAnalyzing;
        }
        if (params.selectedCategory !== undefined) {
            this.selectedCategory = params.selectedCategory;
        }
        if (params.searchKeyword !== undefined) {
            this.searchKeyword = params.searchKeyword;
        }
        if (params.showFileDetail !== undefined) {
            this.showFileDetail = params.showFileDetail;
        }
        if (params.selectedFile !== undefined) {
            this.selectedFile = params.selectedFile;
        }
        if (params.analysisProgress !== undefined) {
            this.analysisProgress = params.analysisProgress;
        }
        if (params.analysisProgressText !== undefined) {
            this.analysisProgressText = params.analysisProgressText;
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
        if (params.filesDir !== undefined) {
            this.filesDir = params.filesDir;
        }
        if (params.similarityCalculator !== undefined) {
            this.similarityCalculator = params.similarityCalculator;
        }
        if (params.categoryRules !== undefined) {
            this.categoryRules = params.categoryRules;
        }
        if (params.categoryColors !== undefined) {
            this.categoryColors = params.categoryColors;
        }
    }
    updateStateVars(params: SmartClassifyTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__fileList.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__isAnalyzing.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedCategory.purgeDependencyOnElmtId(rmElmtId);
        this.__searchKeyword.purgeDependencyOnElmtId(rmElmtId);
        this.__showFileDetail.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedFile.purgeDependencyOnElmtId(rmElmtId);
        this.__analysisProgress.purgeDependencyOnElmtId(rmElmtId);
        this.__analysisProgressText.purgeDependencyOnElmtId(rmElmtId);
        this.__showMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__messageText.purgeDependencyOnElmtId(rmElmtId);
        this.__messageType.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__fileList.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__isAnalyzing.aboutToBeDeleted();
        this.__selectedCategory.aboutToBeDeleted();
        this.__searchKeyword.aboutToBeDeleted();
        this.__showFileDetail.aboutToBeDeleted();
        this.__selectedFile.aboutToBeDeleted();
        this.__analysisProgress.aboutToBeDeleted();
        this.__analysisProgressText.aboutToBeDeleted();
        this.__showMessage.aboutToBeDeleted();
        this.__messageText.aboutToBeDeleted();
        this.__messageType.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __fileList: ObservedPropertyObjectPU<FileAnalysis[]>;
    get fileList() {
        return this.__fileList.get();
    }
    set fileList(newValue: FileAnalysis[]) {
        this.__fileList.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __isAnalyzing: ObservedPropertySimplePU<boolean>;
    get isAnalyzing() {
        return this.__isAnalyzing.get();
    }
    set isAnalyzing(newValue: boolean) {
        this.__isAnalyzing.set(newValue);
    }
    private __selectedCategory: ObservedPropertySimplePU<DocumentCategory | null>;
    get selectedCategory() {
        return this.__selectedCategory.get();
    }
    set selectedCategory(newValue: DocumentCategory | null) {
        this.__selectedCategory.set(newValue);
    }
    private __searchKeyword: ObservedPropertySimplePU<string>;
    get searchKeyword() {
        return this.__searchKeyword.get();
    }
    set searchKeyword(newValue: string) {
        this.__searchKeyword.set(newValue);
    }
    private __showFileDetail: ObservedPropertySimplePU<boolean>;
    get showFileDetail() {
        return this.__showFileDetail.get();
    }
    set showFileDetail(newValue: boolean) {
        this.__showFileDetail.set(newValue);
    }
    private __selectedFile: ObservedPropertyObjectPU<FileAnalysis | null>;
    get selectedFile() {
        return this.__selectedFile.get();
    }
    set selectedFile(newValue: FileAnalysis | null) {
        this.__selectedFile.set(newValue);
    }
    private __analysisProgress: ObservedPropertySimplePU<number>;
    get analysisProgress() {
        return this.__analysisProgress.get();
    }
    set analysisProgress(newValue: number) {
        this.__analysisProgress.set(newValue);
    }
    private __analysisProgressText: ObservedPropertySimplePU<string>;
    get analysisProgressText() {
        return this.__analysisProgressText.get();
    }
    set analysisProgressText(newValue: string) {
        this.__analysisProgressText.set(newValue);
    }
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
    private filesDir: string;
    private similarityCalculator: SimilarityCalculator | null;
    // 类别关键词规则（本地分类使用）
    private categoryRules: CategoryKeywords[];
    // 类别颜色映射
    private categoryColors: Map<DocumentCategory, string>;
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
        }
        catch (error) {
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
            }
            catch (e) {
                return content;
            }
        }
        catch (error) {
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
        if (!this.similarityCalculator)
            return [];
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
        if (this.isAnalyzing)
            return;
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(358:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部标题
            Column.create();
            Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(360:7)", "entry");
            // 顶部标题
            Column.width('100%');
            // 顶部标题
            Column.padding({ left: 16, right: 16, top: 12, bottom: 8 });
            // 顶部标题
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('智能分类');
            Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(361:9)", "entry");
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`共 ${this.fileList.length} 个文件，已分析 ${this.getAnalyzedCount()} 个`);
            Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(367:9)", "entry");
            Text.fontSize(12);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        // 顶部标题
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 操作按钮区
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(376:7)", "entry");
            // 操作按钮区
            Row.width('100%');
            // 操作按钮区
            Row.padding({ left: 16, right: 16, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isAnalyzing ? '分析中...' : '开始分析');
            Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(377:9)", "entry");
            Button.onClick(() => this.analyzeAllFiles());
            Button.enabled(!this.isAnalyzing && this.fileList.length > 0);
            Button.height(40);
            Button.fontSize(14);
            Button.backgroundColor(this.isAnalyzing ? '#C7C7CC' : '#007AFF');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
            Button.layoutWeight(1);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('刷新列表');
            Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(387:9)", "entry");
            Button.onClick(() => this.loadFiles());
            Button.enabled(!this.isLoading && !this.isAnalyzing);
            Button.height(40);
            Button.fontSize(14);
            Button.backgroundColor('#34C759');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
            Button.layoutWeight(1);
        }, Button);
        Button.pop();
        // 操作按钮区
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 分析进度
            if (this.isAnalyzing) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(402:9)", "entry");
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor('#F8F8F8');
                        Column.borderRadius(12);
                        Column.margin({ left: 16, right: 16, bottom: 12 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(403:11)", "entry");
                        Row.width('100%');
                        Row.margin({ bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('分析进度');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(404:13)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#333333');
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.analysisProgress}%`);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(408:13)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#007AFF');
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Progress.create({ value: this.analysisProgress, total: 100, type: ProgressType.Linear });
                        Progress.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(416:11)", "entry");
                        Progress.color('#007AFF');
                        Progress.backgroundColor('#E0E0E0');
                        Progress.height(8);
                        Progress.width('100%');
                        Progress.borderRadius(4);
                    }, Progress);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.analysisProgressText) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`已分析: ${this.analysisProgressText}`);
                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(424:13)", "entry");
                                    Text.fontSize(12);
                                    Text.fontColor('#8E8E93');
                                    Text.margin({ top: 6 });
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
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(439:9)", "entry");
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
            // 类别统计卡片
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 类别统计卡片
            if (this.getAnalyzedCount() > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(453:9)", "entry");
                        Scroll.scrollable(ScrollDirection.Horizontal);
                        Scroll.scrollBar(BarState.Off);
                        Scroll.width('100%');
                        Scroll.height(70);
                        Scroll.margin({ bottom: 12 });
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 8 });
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(454:11)", "entry");
                        Row.padding({ left: 16, right: 16 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 全部按钮
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(456:13)", "entry");
                        // 全部按钮
                        Column.width(70);
                        // 全部按钮
                        Column.height(60);
                        // 全部按钮
                        Column.backgroundColor(this.selectedCategory === null ? '#007AFF' : '#F0F0F0');
                        // 全部按钮
                        Column.borderRadius(10);
                        // 全部按钮
                        Column.justifyContent(FlexAlign.Center);
                        // 全部按钮
                        Column.onClick(() => {
                            this.selectedCategory = null;
                        });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.getAnalyzedCount()}`);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(457:15)", "entry");
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor(this.selectedCategory === null ? '#FFFFFF' : '#333333');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('全部');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(461:15)", "entry");
                        Text.fontSize(11);
                        Text.fontColor(this.selectedCategory === null ? '#FFFFFF' : '#666666');
                    }, Text);
                    Text.pop();
                    // 全部按钮
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const stat = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(475:15)", "entry");
                                Column.width(70);
                                Column.height(60);
                                Column.backgroundColor(this.selectedCategory === stat.category ? stat.color : '#F0F0F0');
                                Column.borderRadius(10);
                                Column.justifyContent(FlexAlign.Center);
                                Column.onClick(() => {
                                    this.selectedCategory = this.selectedCategory === stat.category ? null : stat.category;
                                });
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`${stat.count}`);
                                Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(476:17)", "entry");
                                Text.fontSize(18);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(this.selectedCategory === stat.category ? '#FFFFFF' : '#333333');
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(stat.name);
                                Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(480:17)", "entry");
                                Text.fontSize(10);
                                Text.fontColor(this.selectedCategory === stat.category ? '#FFFFFF' : '#666666');
                                Text.maxLines(1);
                                Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                            }, Text);
                            Text.pop();
                            Column.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.getCategoryStats(), forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    Row.pop();
                    Scroll.pop();
                });
            }
            // 搜索框
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 搜索框
            Row.create();
            Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(506:7)", "entry");
            // 搜索框
            Row.width('100%');
            // 搜索框
            Row.padding({ left: 16, right: 16, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '搜索文件名或关键词...', text: this.searchKeyword });
            TextInput.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(507:9)", "entry");
            TextInput.height(40);
            TextInput.layoutWeight(1);
            TextInput.backgroundColor('#F0F0F0');
            TextInput.borderRadius(8);
            TextInput.padding({ left: 12, right: 12 });
            TextInput.onChange((value: string) => {
                this.searchKeyword = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.searchKeyword.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('清除');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(518:11)", "entry");
                        Button.height(40);
                        Button.fontSize(14);
                        Button.backgroundColor('#E0E0E0');
                        Button.fontColor('#333333');
                        Button.borderRadius(8);
                        Button.margin({ left: 8 });
                        Button.onClick(() => {
                            this.searchKeyword = '';
                        });
                    }, Button);
                    Button.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        // 搜索框
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 文件列表
            if (this.isLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(535:9)", "entry");
                        Column.width('100%');
                        Column.height(200);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(536:11)", "entry");
                        LoadingProgress.width(48);
                        LoadingProgress.height(48);
                        LoadingProgress.color('#007AFF');
                    }, LoadingProgress);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('加载中...');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(540:11)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#8E8E93');
                        Text.margin({ top: 12 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else if (this.fileList.length === 0) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(549:9)", "entry");
                        Column.width('100%');
                        Column.height(200);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无文件');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(550:11)", "entry");
                        Text.fontSize(16);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 8 });
                        List.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(558:9)", "entry");
                        List.width('100%');
                        List.layoutWeight(1);
                        List.padding({ left: 16, right: 16 });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const file = _item;
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
                                    ListItem.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(560:13)", "entry");
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(561:15)", "entry");
                                        Column.width('100%');
                                        Column.padding(12);
                                        Column.backgroundColor(Color.White);
                                        Column.borderRadius(12);
                                        Column.border({ width: 1, color: '#E0E0E0' });
                                        Column.onClick(() => {
                                            this.selectedFile = file;
                                            this.showFileDetail = true;
                                        });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(562:17)", "entry");
                                        Row.width('100%');
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        // 类别标签
                                        if (file.isAnalyzed) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(file.categoryName);
                                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(565:21)", "entry");
                                                    Text.fontSize(10);
                                                    Text.fontColor(Color.White);
                                                    Text.backgroundColor(this.categoryColors.get(file.category) || '#8E8E93');
                                                    Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                                                    Text.borderRadius(4);
                                                    Text.margin({ right: 8 });
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
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(file.filename);
                                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(574:19)", "entry");
                                        Text.fontSize(15);
                                        Text.fontWeight(FontWeight.Medium);
                                        Text.fontColor('#333333');
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        Text.layoutWeight(1);
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        if (file.isAnalyzed && file.confidence > 0) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(`${(file.confidence * 100).toFixed(0)}%`);
                                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(583:21)", "entry");
                                                    Text.fontSize(12);
                                                    Text.fontColor('#8E8E93');
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
                                    Row.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        // 关键词
                                        if (file.isAnalyzed && file.keywords.length > 0) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Row.create();
                                                    Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(592:19)", "entry");
                                                    Row.width('100%');
                                                    Row.margin({ top: 6 });
                                                }, Row);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    ForEach.create();
                                                    const forEachItemGenFunction = _item => {
                                                        const keyword = _item;
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Text.create(keyword);
                                                            Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(594:23)", "entry");
                                                            Text.fontSize(10);
                                                            Text.fontColor('#666666');
                                                            Text.backgroundColor('#F0F0F0');
                                                            Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                                                            Text.borderRadius(4);
                                                            Text.margin({ right: 4 });
                                                        }, Text);
                                                        Text.pop();
                                                    };
                                                    this.forEachUpdateFunction(elmtId, file.keywords.slice(0, 4), forEachItemGenFunction);
                                                }, ForEach);
                                                ForEach.pop();
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    If.create();
                                                    if (file.keywords.length > 4) {
                                                        this.ifElseBranchUpdateFunction(0, () => {
                                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                Text.create(`+${file.keywords.length - 4}`);
                                                                Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(603:23)", "entry");
                                                                Text.fontSize(10);
                                                                Text.fontColor('#8E8E93');
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
                                        if (file.isAnalyzed && file.summary.length > 0) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(file.summary);
                                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(614:19)", "entry");
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
                                        // 统计信息
                                        else {
                                            this.ifElseBranchUpdateFunction(1, () => {
                                            });
                                        }
                                    }, If);
                                    If.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        // 统计信息
                                        if (file.isAnalyzed) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Row.create();
                                                    Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(625:19)", "entry");
                                                    Row.width('100%');
                                                    Row.margin({ top: 6 });
                                                }, Row);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(`${file.wordCount} 字`);
                                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(626:21)", "entry");
                                                    Text.fontSize(11);
                                                    Text.fontColor('#8E8E93');
                                                }, Text);
                                                Text.pop();
                                                Row.pop();
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
                        this.forEachUpdateFunction(elmtId, this.getFilteredFiles(), forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 文件详情弹窗
            if (this.showFileDetail && this.selectedFile) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(653:9)", "entry");
                        Stack.width('100%');
                        Stack.height('100%');
                        Stack.backgroundColor('rgba(0, 0, 0, 0.5)');
                        Stack.onClick(() => {
                            this.showFileDetail = false;
                        });
                        Stack.position({ x: 0, y: 0 });
                    }, Stack);
                    Stack.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(662:9)", "entry");
                        Column.width('90%');
                        Column.height('70%');
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.position({ x: '5%', y: '15%' });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 标题
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(664:11)", "entry");
                        // 标题
                        Row.width('100%');
                        // 标题
                        Row.padding({ left: 20, right: 20, top: 15, bottom: 15 });
                        // 标题
                        Row.border({ width: { bottom: 1 }, color: '#E0E0E0' });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件详情');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(665:13)", "entry");
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('×');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(671:13)", "entry");
                        Button.fontSize(24);
                        Button.fontColor('#666666');
                        Button.backgroundColor(Color.Transparent);
                        Button.onClick(() => {
                            this.showFileDetail = false;
                        });
                    }, Button);
                    Button.pop();
                    // 标题
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(683:11)", "entry");
                        Scroll.layoutWeight(1);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(684:13)", "entry");
                        Column.width('100%');
                        Column.padding(20);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 文件名
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(686:15)", "entry");
                        // 文件名
                        Row.width('100%');
                        // 文件名
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件名');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(687:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.width(80);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.selectedFile!.filename);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(691:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#333333');
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    // 文件名
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 类别
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(700:15)", "entry");
                        // 类别
                        Row.width('100%');
                        // 类别
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('分类');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(701:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.width(80);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.selectedFile!.categoryName);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(705:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor(Color.White);
                        Text.backgroundColor(this.categoryColors.get(this.selectedFile!.category) || '#8E8E93');
                        Text.padding({ left: 8, right: 8, top: 4, bottom: 4 });
                        Text.borderRadius(6);
                    }, Text);
                    Text.pop();
                    // 类别
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 置信度
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(716:15)", "entry");
                        // 置信度
                        Row.width('100%');
                        // 置信度
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('置信度');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(717:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.width(80);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${(this.selectedFile!.confidence * 100).toFixed(1)}%`);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(721:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#007AFF');
                    }, Text);
                    Text.pop();
                    // 置信度
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 字数
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(729:15)", "entry");
                        // 字数
                        Row.width('100%');
                        // 字数
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('字数');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(730:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.width(80);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.selectedFile!.wordCount}`);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(734:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#333333');
                    }, Text);
                    Text.pop();
                    // 字数
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 关键词
                        Text.create('关键词');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(742:15)", "entry");
                        // 关键词
                        Text.fontSize(14);
                        // 关键词
                        Text.fontColor('#666666');
                        // 关键词
                        Text.width('100%');
                        // 关键词
                        Text.margin({ bottom: 8 });
                    }, Text);
                    // 关键词
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Flex.create({ wrap: FlexWrap.Wrap });
                        Flex.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(748:15)", "entry");
                        Flex.width('100%');
                        Flex.margin({ bottom: 12 });
                    }, Flex);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const keyword = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(keyword);
                                Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(750:19)", "entry");
                                Text.fontSize(12);
                                Text.fontColor('#333333');
                                Text.backgroundColor('#F0F0F0');
                                Text.padding({ left: 10, right: 10, top: 6, bottom: 6 });
                                Text.borderRadius(16);
                                Text.margin({ right: 8, bottom: 8 });
                            }, Text);
                            Text.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.selectedFile!.keywords, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    Flex.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 摘要
                        Text.create('摘要');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(763:15)", "entry");
                        // 摘要
                        Text.fontSize(14);
                        // 摘要
                        Text.fontColor('#666666');
                        // 摘要
                        Text.width('100%');
                        // 摘要
                        Text.margin({ bottom: 8 });
                    }, Text);
                    // 摘要
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.selectedFile!.summary || '暂无摘要');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(769:15)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#333333');
                        Text.width('100%');
                        Text.padding(12);
                        Text.backgroundColor('#F8F8F8');
                        Text.borderRadius(8);
                    }, Text);
                    Text.pop();
                    Column.pop();
                    Scroll.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 关闭按钮
                        Button.createWithLabel('关闭');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(783:11)", "entry");
                        // 关闭按钮
                        Button.onClick(() => {
                            this.showFileDetail = false;
                        });
                        // 关闭按钮
                        Button.width('90%');
                        // 关闭按钮
                        Button.height(44);
                        // 关闭按钮
                        Button.fontSize(16);
                        // 关闭按钮
                        Button.backgroundColor('#007AFF');
                        // 关闭按钮
                        Button.fontColor(Color.White);
                        // 关闭按钮
                        Button.borderRadius(10);
                        // 关闭按钮
                        Button.margin({ bottom: 20 });
                    }, Button);
                    // 关闭按钮
                    Button.pop();
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
    }
    rerender() {
        this.updateDirtyElements();
    }
}
