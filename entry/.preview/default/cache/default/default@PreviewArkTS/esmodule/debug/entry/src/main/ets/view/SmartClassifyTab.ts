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
    analyzedCount?: number;
    similarDocs?: SimilarDoc[];
    showSimilarPanel?: boolean;
    apiKey?: string;
    showApiKeyInput?: boolean;
    apiKeyInput?: string;
    useAISummary?: boolean;
    showDiffPanel?: boolean;
    diffFile1?: string;
    diffFile2?: string;
    diffResult?: DiffResult | null;
    isDeleting?: boolean;
    knowledgeIndex?: KnowledgeIndex | null;
    contentParser?: ContentParser | null;
    documentContents?: Map<string, string>;
    trashManager?: TrashManager | null;
    filesDir?: string;
    similarityCalculator?: SimilarityCalculator | null;
    categoryColors?: Map<DocumentCategory, string>;
    categoryRules?: CategoryKeywords[];
}
import fileIo from "@ohos:file.fs";
import type common from "@ohos:app.ability.common";
import util from "@ohos:util";
import router from "@ohos:router";
import { DocumentCategory, getCategoryDisplayName } from "@bundle:com.example.filesmanger/entry/ets/common/types/AIDocTypes";
import { SimilarityCalculator } from "@bundle:com.example.filesmanger/entry/ets/common/utils/SimilarityCalculator";
import { ContentParser } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ContentParser";
import { DeepSeekService } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DeepSeekService";
import type { AICallResult } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DeepSeekService";
import { DiffUtils, DiffType } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DiffUtils";
import type { DiffLine, DiffResult } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DiffUtils";
import { TrashManager } from "@bundle:com.example.filesmanger/entry/ets/common/utils/TrashManager";
import { KnowledgeIndex } from "@bundle:com.example.filesmanger/entry/ets/common/utils/KnowledgeIndex";
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
        this.__analyzedCount = new ObservedPropertySimplePU(0, this, "analyzedCount");
        this.__similarDocs = new ObservedPropertyObjectPU([], this, "similarDocs");
        this.__showSimilarPanel = new ObservedPropertySimplePU(false, this, "showSimilarPanel");
        this.__apiKey = new ObservedPropertySimplePU('', this, "apiKey");
        this.__showApiKeyInput = new ObservedPropertySimplePU(false, this, "showApiKeyInput");
        this.__apiKeyInput = new ObservedPropertySimplePU('', this, "apiKeyInput");
        this.__useAISummary = new ObservedPropertySimplePU(true, this, "useAISummary");
        this.__showDiffPanel = new ObservedPropertySimplePU(false, this, "showDiffPanel");
        this.__diffFile1 = new ObservedPropertySimplePU('', this, "diffFile1");
        this.__diffFile2 = new ObservedPropertySimplePU('', this, "diffFile2");
        this.__diffResult = new ObservedPropertyObjectPU(null, this, "diffResult");
        this.__isDeleting = new ObservedPropertySimplePU(false, this, "isDeleting");
        this.knowledgeIndex = null;
        this.contentParser = null;
        this.documentContents = new Map();
        this.trashManager = null;
        this.filesDir = '';
        this.similarityCalculator = null;
        this.categoryColors = new Map();
        this.categoryRules = [];
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
        if (params.analyzedCount !== undefined) {
            this.analyzedCount = params.analyzedCount;
        }
        if (params.similarDocs !== undefined) {
            this.similarDocs = params.similarDocs;
        }
        if (params.showSimilarPanel !== undefined) {
            this.showSimilarPanel = params.showSimilarPanel;
        }
        if (params.apiKey !== undefined) {
            this.apiKey = params.apiKey;
        }
        if (params.showApiKeyInput !== undefined) {
            this.showApiKeyInput = params.showApiKeyInput;
        }
        if (params.apiKeyInput !== undefined) {
            this.apiKeyInput = params.apiKeyInput;
        }
        if (params.useAISummary !== undefined) {
            this.useAISummary = params.useAISummary;
        }
        if (params.showDiffPanel !== undefined) {
            this.showDiffPanel = params.showDiffPanel;
        }
        if (params.diffFile1 !== undefined) {
            this.diffFile1 = params.diffFile1;
        }
        if (params.diffFile2 !== undefined) {
            this.diffFile2 = params.diffFile2;
        }
        if (params.diffResult !== undefined) {
            this.diffResult = params.diffResult;
        }
        if (params.isDeleting !== undefined) {
            this.isDeleting = params.isDeleting;
        }
        if (params.knowledgeIndex !== undefined) {
            this.knowledgeIndex = params.knowledgeIndex;
        }
        if (params.contentParser !== undefined) {
            this.contentParser = params.contentParser;
        }
        if (params.documentContents !== undefined) {
            this.documentContents = params.documentContents;
        }
        if (params.trashManager !== undefined) {
            this.trashManager = params.trashManager;
        }
        if (params.filesDir !== undefined) {
            this.filesDir = params.filesDir;
        }
        if (params.similarityCalculator !== undefined) {
            this.similarityCalculator = params.similarityCalculator;
        }
        if (params.categoryColors !== undefined) {
            this.categoryColors = params.categoryColors;
        }
        if (params.categoryRules !== undefined) {
            this.categoryRules = params.categoryRules;
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
        this.__analyzedCount.purgeDependencyOnElmtId(rmElmtId);
        this.__similarDocs.purgeDependencyOnElmtId(rmElmtId);
        this.__showSimilarPanel.purgeDependencyOnElmtId(rmElmtId);
        this.__apiKey.purgeDependencyOnElmtId(rmElmtId);
        this.__showApiKeyInput.purgeDependencyOnElmtId(rmElmtId);
        this.__apiKeyInput.purgeDependencyOnElmtId(rmElmtId);
        this.__useAISummary.purgeDependencyOnElmtId(rmElmtId);
        this.__showDiffPanel.purgeDependencyOnElmtId(rmElmtId);
        this.__diffFile1.purgeDependencyOnElmtId(rmElmtId);
        this.__diffFile2.purgeDependencyOnElmtId(rmElmtId);
        this.__diffResult.purgeDependencyOnElmtId(rmElmtId);
        this.__isDeleting.purgeDependencyOnElmtId(rmElmtId);
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
        this.__analyzedCount.aboutToBeDeleted();
        this.__similarDocs.aboutToBeDeleted();
        this.__showSimilarPanel.aboutToBeDeleted();
        this.__apiKey.aboutToBeDeleted();
        this.__showApiKeyInput.aboutToBeDeleted();
        this.__apiKeyInput.aboutToBeDeleted();
        this.__useAISummary.aboutToBeDeleted();
        this.__showDiffPanel.aboutToBeDeleted();
        this.__diffFile1.aboutToBeDeleted();
        this.__diffFile2.aboutToBeDeleted();
        this.__diffResult.aboutToBeDeleted();
        this.__isDeleting.aboutToBeDeleted();
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
    private __analyzedCount: ObservedPropertySimplePU<number>;
    get analyzedCount() {
        return this.__analyzedCount.get();
    }
    set analyzedCount(newValue: number) {
        this.__analyzedCount.set(newValue);
    }
    private __similarDocs: ObservedPropertyObjectPU<SimilarDoc[]>;
    get similarDocs() {
        return this.__similarDocs.get();
    }
    set similarDocs(newValue: SimilarDoc[]) {
        this.__similarDocs.set(newValue);
    }
    private __showSimilarPanel: ObservedPropertySimplePU<boolean>;
    get showSimilarPanel() {
        return this.__showSimilarPanel.get();
    }
    set showSimilarPanel(newValue: boolean) {
        this.__showSimilarPanel.set(newValue);
    }
    private __apiKey: ObservedPropertySimplePU<string>;
    get apiKey() {
        return this.__apiKey.get();
    }
    set apiKey(newValue: string) {
        this.__apiKey.set(newValue);
    }
    private __showApiKeyInput: ObservedPropertySimplePU<boolean>;
    get showApiKeyInput() {
        return this.__showApiKeyInput.get();
    }
    set showApiKeyInput(newValue: boolean) {
        this.__showApiKeyInput.set(newValue);
    }
    private __apiKeyInput: ObservedPropertySimplePU<string>;
    get apiKeyInput() {
        return this.__apiKeyInput.get();
    }
    set apiKeyInput(newValue: string) {
        this.__apiKeyInput.set(newValue);
    }
    private __useAISummary: ObservedPropertySimplePU<boolean>;
    get useAISummary() {
        return this.__useAISummary.get();
    }
    set useAISummary(newValue: boolean) {
        this.__useAISummary.set(newValue);
    }
    // 差异对比相关状态
    private __showDiffPanel: ObservedPropertySimplePU<boolean>;
    get showDiffPanel() {
        return this.__showDiffPanel.get();
    }
    set showDiffPanel(newValue: boolean) {
        this.__showDiffPanel.set(newValue);
    }
    private __diffFile1: ObservedPropertySimplePU<string>;
    get diffFile1() {
        return this.__diffFile1.get();
    }
    set diffFile1(newValue: string) {
        this.__diffFile1.set(newValue);
    }
    private __diffFile2: ObservedPropertySimplePU<string>;
    get diffFile2() {
        return this.__diffFile2.get();
    }
    set diffFile2(newValue: string) {
        this.__diffFile2.set(newValue);
    }
    private __diffResult: ObservedPropertyObjectPU<DiffResult | null>;
    get diffResult() {
        return this.__diffResult.get();
    }
    set diffResult(newValue: DiffResult | null) {
        this.__diffResult.set(newValue);
    }
    private __isDeleting: ObservedPropertySimplePU<boolean>;
    get isDeleting() {
        return this.__isDeleting.get();
    }
    set isDeleting(newValue: boolean) {
        this.__isDeleting.set(newValue);
    }
    private knowledgeIndex: KnowledgeIndex | null;
    private contentParser: ContentParser | null;
    private documentContents: Map<string, string>;
    private trashManager: TrashManager | null;
    private filesDir: string;
    private similarityCalculator: SimilarityCalculator | null;
    private categoryColors: Map<DocumentCategory, string>;
    private categoryRules: CategoryKeywords[];
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
        }
        catch (error) {
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
        }
        catch (error) {
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
            allFiles = allFiles.filter(f => !f.startsWith('.'));
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
        }
        catch (error) {
            console.error('[SmartClassifyTab] 加载文件失败:', JSON.stringify(error));
            this.showToast('加载文件失败', 'error');
        }
        finally {
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
            }
            else {
                console.error(`[SmartClassifyTab] 读取文件失败: ${filename}, 错误: ${result.error}`);
                return '';
            }
        }
        catch (error) {
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
        }
        catch (error) {
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
            }
            catch (error) {
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
            }
            else if (summaryParts.length === 0) {
                // 第一句太长，截取部分
                summaryParts.push(sentence.substring(0, maxLength));
                break;
            }
            else {
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
        if (text.length === 0)
            return false;
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
        }
        catch (error) {
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
            const results = await this.similarityCalculator.batchCalculateSimilarity(this.documentContents, 0.25 // 相似度阈值
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
        }
        catch (error) {
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
    // 删除重复文件（移动到回收站）
    private async deleteDuplicate(fileToDelete: string): Promise<void> {
        if (this.isDeleting || !this.trashManager)
            return;
        this.isDeleting = true;
        try {
            if (this.trashManager.moveToTrash(fileToDelete)) {
                // 从列表中移除
                this.fileList = this.fileList.filter((f: FileAnalysis): boolean => f.filename !== fileToDelete);
                this.documentContents.delete(fileToDelete);
                // 从相似文档中移除相关项
                this.similarDocs = this.similarDocs.filter((doc: SimilarDoc): boolean => doc.file1 !== fileToDelete && doc.file2 !== fileToDelete);
                this.showToast(`已移至回收站: ${fileToDelete}`, 'success');
                this.showDiffPanel = false;
            }
            else {
                this.showToast('删除失败', 'error');
            }
        }
        catch (error) {
            console.error('[SmartClassifyTab] 删除文件失败:', JSON.stringify(error));
            this.showToast('删除失败', 'error');
        }
        finally {
            this.isDeleting = false;
        }
    }
    // 一键删除所有100%重复文件（移动到回收站）
    private async deleteAllDuplicates(): Promise<void> {
        if (this.isDeleting || !this.trashManager)
            return;
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
        this.similarDocs = this.similarDocs.filter((doc: SimilarDoc): boolean => !toDelete.has(doc.file1) && !toDelete.has(doc.file2));
        this.showToast(`已移至回收站 ${deleted} 个文件`, 'success');
        this.isDeleting = false;
    }
    // 构建知识图谱
    private buildKnowledgeGraph(): void {
        if (!this.knowledgeIndex)
            return;
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
        }
        catch (error) {
            console.error('[SmartClassifyTab] 分析过程出错:', JSON.stringify(error));
            this.showToast('分析过程出错', 'error');
        }
        finally {
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(848:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部标题
            Column.create();
            Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(850:7)", "entry");
            // 顶部标题
            Column.width('100%');
            // 顶部标题
            Column.padding({ left: 16, right: 16, top: 12, bottom: 8 });
            // 顶部标题
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('智能分类');
            Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(851:9)", "entry");
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`共 ${this.fileList.length} 个文件，已分析 ${this.getAnalyzedCount()} 个`);
            Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(857:9)", "entry");
            Text.fontSize(12);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        // 顶部标题
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // AI 设置行
            Row.create({ space: 8 });
            Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(866:7)", "entry");
            // AI 设置行
            Row.width('100%');
            // AI 设置行
            Row.padding({ left: 16, right: 16, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Toggle.create({ type: ToggleType.Switch, isOn: this.useAISummary });
            Toggle.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(867:9)", "entry");
            Toggle.onChange((isOn: boolean): void => {
                this.useAISummary = isOn;
            });
            Toggle.width(45);
            Toggle.height(26);
        }, Toggle);
        Toggle.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('AI摘要');
            Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(874:9)", "entry");
            Text.fontSize(13);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(878:9)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.apiKey ? 'API已设置' : '未设置API');
            Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(880:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(this.apiKey ? '#34C759' : '#FF9500');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('设置');
            Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(884:9)", "entry");
            Button.onClick((): void => {
                this.apiKeyInput = this.apiKey;
                this.showApiKeyInput = true;
            });
            Button.height(28);
            Button.fontSize(12);
            Button.backgroundColor('#E0E0E0');
            Button.fontColor('#333333');
            Button.borderRadius(6);
        }, Button);
        Button.pop();
        // AI 设置行
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 操作按钮
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(899:7)", "entry");
            // 操作按钮
            Row.width('100%');
            // 操作按钮
            Row.padding({ left: 16, right: 16, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isAnalyzing ? '分析中...' : '开始分析');
            Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(900:9)", "entry");
            Button.onClick((): void => {
                this.analyzeAllFiles();
            });
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
            Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(912:9)", "entry");
            Button.onClick((): void => {
                this.loadFilesAsync();
            });
            Button.enabled(!this.isLoading && !this.isAnalyzing);
            Button.height(40);
            Button.fontSize(14);
            Button.backgroundColor('#34C759');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
            Button.layoutWeight(1);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 相似文档按钮
            if (this.similarDocs.length > 0 && !this.showSimilarPanel) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(`相似(${this.similarDocs.length})`);
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(926:11)", "entry");
                        Button.onClick((): void => {
                            this.showSimilarPanel = true;
                        });
                        Button.height(40);
                        Button.fontSize(14);
                        Button.backgroundColor('#FF9500');
                        Button.fontColor(Color.White);
                        Button.borderRadius(8);
                        Button.width(80);
                    }, Button);
                    Button.pop();
                });
            }
            // 知识图谱按钮
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 知识图谱按钮
            if (this.getAnalyzedCount() >= 2) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('图谱');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(940:11)", "entry");
                        Button.onClick((): void => {
                            this.buildKnowledgeGraph();
                        });
                        Button.height(40);
                        Button.fontSize(14);
                        Button.backgroundColor('#5856D6');
                        Button.fontColor(Color.White);
                        Button.borderRadius(8);
                        Button.width(60);
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
        // 操作按钮
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 分析进度
            if (this.isAnalyzing) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(957:9)", "entry");
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor('#F8F8F8');
                        Column.borderRadius(12);
                        Column.margin({ left: 16, right: 16, bottom: 12 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(958:11)", "entry");
                        Row.width('100%');
                        Row.margin({ bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('分析进度');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(959:13)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#333333');
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.analysisProgress}%`);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(963:13)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#007AFF');
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Progress.create({ value: this.analysisProgress, total: 100, type: ProgressType.Linear });
                        Progress.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(971:11)", "entry");
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
                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(979:13)", "entry");
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
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(994:9)", "entry");
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
                        Scroll.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1008:9)", "entry");
                        Scroll.scrollable(ScrollDirection.Horizontal);
                        Scroll.scrollBar(BarState.Off);
                        Scroll.width('100%');
                        Scroll.height(70);
                        Scroll.margin({ bottom: 12 });
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 8 });
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1009:11)", "entry");
                        Row.padding({ left: 16, right: 16 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 全部按钮
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1011:13)", "entry");
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
                        Column.onClick((): void => {
                            this.selectedCategory = null;
                        });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.getAnalyzedCount()}`);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1012:15)", "entry");
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor(this.selectedCategory === null ? '#FFFFFF' : '#333333');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('全部');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1016:15)", "entry");
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
                                Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1030:15)", "entry");
                                Column.width(70);
                                Column.height(60);
                                Column.backgroundColor(this.selectedCategory === stat.category ? stat.color : '#F0F0F0');
                                Column.borderRadius(10);
                                Column.justifyContent(FlexAlign.Center);
                                Column.onClick((): void => {
                                    if (this.selectedCategory === stat.category) {
                                        this.selectedCategory = null;
                                    }
                                    else {
                                        this.selectedCategory = stat.category;
                                    }
                                });
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`${stat.count}`);
                                Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1031:17)", "entry");
                                Text.fontSize(18);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(this.selectedCategory === stat.category ? '#FFFFFF' : '#333333');
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(stat.name);
                                Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1035:17)", "entry");
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
            // 相似文档面板
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 相似文档面板
            if (this.showSimilarPanel && this.similarDocs.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1066:9)", "entry");
                        Column.width('100%');
                        Column.padding(12);
                        Column.backgroundColor('#FFF8E1');
                        Column.borderRadius(12);
                        Column.margin({ left: 16, right: 16, bottom: 12 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1067:11)", "entry");
                        Row.width('100%');
                        Row.margin({ bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('相似文档');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1068:13)", "entry");
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                        Blank.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1072:13)", "entry");
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.similarDocs.length} 对`);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1073:13)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 一键去重按钮
                        if (this.similarDocs.some((d: SimilarDoc): boolean => d.score >= 0.99)) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel('一键去重');
                                    Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1079:15)", "entry");
                                    Button.height(28);
                                    Button.fontSize(12);
                                    Button.backgroundColor('#FF3B30');
                                    Button.fontColor(Color.White);
                                    Button.borderRadius(6);
                                    Button.margin({ left: 8 });
                                    Button.enabled(!this.isDeleting);
                                    Button.onClick((): void => {
                                        this.deleteAllDuplicates();
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
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('收起');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1092:13)", "entry");
                        Button.height(28);
                        Button.fontSize(12);
                        Button.backgroundColor('#E0E0E0');
                        Button.fontColor('#666666');
                        Button.borderRadius(6);
                        Button.margin({ left: 8 });
                        Button.onClick((): void => {
                            this.showSimilarPanel = false;
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 6 });
                        List.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1106:11)", "entry");
                        List.width('100%');
                        List.height(this.similarDocs.length > 3 ? 180 : this.similarDocs.length * 65);
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const doc = _item;
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
                                    ListItem.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1108:15)", "entry");
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1109:17)", "entry");
                                        Column.padding(8);
                                        Column.backgroundColor('#FAFAFA');
                                        Column.borderRadius(8);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1110:19)", "entry");
                                        Row.width('100%');
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // 相似度标签
                                        Text.create(`${(doc.score * 100).toFixed(0)}%`);
                                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1112:21)", "entry");
                                        // 相似度标签
                                        Text.fontSize(14);
                                        // 相似度标签
                                        Text.fontWeight(FontWeight.Bold);
                                        // 相似度标签
                                        Text.fontColor(doc.score >= 0.99 ? '#FF3B30' : '#FF9500');
                                        // 相似度标签
                                        Text.width(45);
                                    }, Text);
                                    // 相似度标签
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1118:21)", "entry");
                                        Column.layoutWeight(1);
                                        Column.alignItems(HorizontalAlign.Start);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(doc.file1);
                                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1119:23)", "entry");
                                        Text.fontSize(12);
                                        Text.fontColor('#333333');
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(doc.file2);
                                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1124:23)", "entry");
                                        Text.fontSize(12);
                                        Text.fontColor('#666666');
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        Text.margin({ top: 2 });
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // 操作按钮
                                        Row.create({ space: 4 });
                                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1135:21)", "entry");
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('对比');
                                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1136:23)", "entry");
                                        Button.height(26);
                                        Button.fontSize(11);
                                        Button.backgroundColor('#007AFF');
                                        Button.fontColor(Color.White);
                                        Button.borderRadius(4);
                                        Button.onClick((): void => {
                                            this.showDiff(doc.file1, doc.file2);
                                        });
                                    }, Button);
                                    Button.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        if (doc.score >= 0.99) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Button.createWithLabel('删除');
                                                    Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1147:25)", "entry");
                                                    Button.height(26);
                                                    Button.fontSize(11);
                                                    Button.backgroundColor('#FF3B30');
                                                    Button.fontColor(Color.White);
                                                    Button.borderRadius(4);
                                                    Button.onClick((): void => {
                                                        this.deleteDuplicate(doc.file2);
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
                                    // 操作按钮
                                    Row.pop();
                                    Row.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        if (doc.sharedTerms.length > 0) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Row.create();
                                                    Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1162:21)", "entry");
                                                    Row.width('100%');
                                                    Row.margin({ top: 4 });
                                                }, Row);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create('共同词: ');
                                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1163:23)", "entry");
                                                    Text.fontSize(10);
                                                    Text.fontColor('#8E8E93');
                                                }, Text);
                                                Text.pop();
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(doc.sharedTerms.slice(0, 3).join(', '));
                                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1166:23)", "entry");
                                                    Text.fontSize(10);
                                                    Text.fontColor('#007AFF');
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
                        this.forEachUpdateFunction(elmtId, this.similarDocs.slice(0, 10), forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                    Column.pop();
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
            Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1191:7)", "entry");
            // 搜索框
            Row.width('100%');
            // 搜索框
            Row.padding({ left: 16, right: 16, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '搜索文件名或关键词...', text: this.searchKeyword });
            TextInput.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1192:9)", "entry");
            TextInput.height(40);
            TextInput.layoutWeight(1);
            TextInput.backgroundColor('#F0F0F0');
            TextInput.borderRadius(8);
            TextInput.padding({ left: 12, right: 12 });
            TextInput.onChange((value: string): void => {
                this.searchKeyword = value;
            });
            TextInput.type(InputType.Normal);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.searchKeyword.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('清除');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1204:11)", "entry");
                        Button.height(40);
                        Button.fontSize(14);
                        Button.backgroundColor('#E0E0E0');
                        Button.fontColor('#333333');
                        Button.borderRadius(8);
                        Button.margin({ left: 8 });
                        Button.onClick((): void => {
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
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1221:9)", "entry");
                        Column.width('100%');
                        Column.height(200);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1222:11)", "entry");
                        LoadingProgress.width(48);
                        LoadingProgress.height(48);
                        LoadingProgress.color('#007AFF');
                    }, LoadingProgress);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('加载中...');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1226:11)", "entry");
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
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1235:9)", "entry");
                        Column.width('100%');
                        Column.height(200);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无文件');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1236:11)", "entry");
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
                        List.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1244:9)", "entry");
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
                                    ListItem.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1246:13)", "entry");
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1247:15)", "entry");
                                        Column.width('100%');
                                        Column.padding(12);
                                        Column.backgroundColor(Color.White);
                                        Column.borderRadius(12);
                                        Column.border({ width: 1, color: '#E0E0E0' });
                                        Column.onClick((): void => {
                                            this.selectedFile = file;
                                            this.showFileDetail = true;
                                        });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1248:17)", "entry");
                                        Row.width('100%');
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        if (file.isAnalyzed) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(file.categoryName);
                                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1250:21)", "entry");
                                                    Text.fontSize(10);
                                                    Text.fontColor(Color.White);
                                                    Text.backgroundColor(this.getCategoryColor(file.category));
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
                                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1259:19)", "entry");
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
                                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1268:21)", "entry");
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
                                        if (file.isAnalyzed && file.keywords.length > 0) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Row.create();
                                                    Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1276:19)", "entry");
                                                    Row.width('100%');
                                                    Row.margin({ top: 6 });
                                                }, Row);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    ForEach.create();
                                                    const forEachItemGenFunction = _item => {
                                                        const keyword = _item;
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Text.create(keyword);
                                                            Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1278:23)", "entry");
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
                                                                Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1287:23)", "entry");
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
                                        else {
                                            this.ifElseBranchUpdateFunction(1, () => {
                                            });
                                        }
                                    }, If);
                                    If.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        if (file.isAnalyzed && file.summary.length > 0) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(file.summary);
                                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1297:19)", "entry");
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
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        if (file.isAnalyzed) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Row.create();
                                                    Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1307:19)", "entry");
                                                    Row.width('100%');
                                                    Row.margin({ top: 6 });
                                                }, Row);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(`${file.wordCount} 字`);
                                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1308:21)", "entry");
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
                        Stack.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1335:9)", "entry");
                        Stack.width('100%');
                        Stack.height('100%');
                        Stack.backgroundColor('rgba(0, 0, 0, 0.5)');
                        Stack.onClick((): void => {
                            this.showFileDetail = false;
                        });
                        Stack.position({ x: 0, y: 0 });
                    }, Stack);
                    Stack.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1344:9)", "entry");
                        Column.width('90%');
                        Column.height('70%');
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.position({ x: '5%', y: '15%' });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1345:11)", "entry");
                        Row.width('100%');
                        Row.padding({ left: 20, right: 20, top: 15, bottom: 15 });
                        Row.border({ width: { bottom: 1 }, color: '#E0E0E0' });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件详情');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1346:13)", "entry");
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('×');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1352:13)", "entry");
                        Button.fontSize(24);
                        Button.fontColor('#666666');
                        Button.backgroundColor(Color.Transparent);
                        Button.onClick((): void => {
                            this.showFileDetail = false;
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1364:11)", "entry");
                        Scroll.layoutWeight(1);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1365:13)", "entry");
                        Column.width('100%');
                        Column.padding(20);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1366:15)", "entry");
                        Row.width('100%');
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件名');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1367:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.width(80);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.selectedFile) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.selectedFile.filename);
                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1372:19)", "entry");
                                    Text.fontSize(14);
                                    Text.fontColor('#333333');
                                    Text.layoutWeight(1);
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
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1381:15)", "entry");
                        Row.width('100%');
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('分类');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1382:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.width(80);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.selectedFile) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.selectedFile.categoryName);
                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1387:19)", "entry");
                                    Text.fontSize(14);
                                    Text.fontColor(Color.White);
                                    Text.backgroundColor(this.getCategoryColor(this.selectedFile.category));
                                    Text.padding({ left: 8, right: 8, top: 4, bottom: 4 });
                                    Text.borderRadius(6);
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
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1398:15)", "entry");
                        Row.width('100%');
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('置信度');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1399:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.width(80);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.selectedFile) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`${(this.selectedFile.confidence * 100).toFixed(1)}%`);
                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1404:19)", "entry");
                                    Text.fontSize(14);
                                    Text.fontColor('#007AFF');
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
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1412:15)", "entry");
                        Row.width('100%');
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('字数');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1413:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.width(80);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.selectedFile) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`${this.selectedFile.wordCount}`);
                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1418:19)", "entry");
                                    Text.fontSize(14);
                                    Text.fontColor('#333333');
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
                        Text.create('关键词');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1426:15)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.width('100%');
                        Text.margin({ bottom: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Flex.create({ wrap: FlexWrap.Wrap });
                        Flex.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1432:15)", "entry");
                        Flex.width('100%');
                        Flex.margin({ bottom: 12 });
                    }, Flex);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.selectedFile) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = _item => {
                                        const keyword = _item;
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(keyword);
                                            Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1435:21)", "entry");
                                            Text.fontSize(12);
                                            Text.fontColor('#333333');
                                            Text.backgroundColor('#F0F0F0');
                                            Text.padding({ left: 10, right: 10, top: 6, bottom: 6 });
                                            Text.borderRadius(16);
                                            Text.margin({ right: 8, bottom: 8 });
                                        }, Text);
                                        Text.pop();
                                    };
                                    this.forEachUpdateFunction(elmtId, this.selectedFile.keywords, forEachItemGenFunction);
                                }, ForEach);
                                ForEach.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    Flex.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('摘要');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1448:15)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.width('100%');
                        Text.margin({ bottom: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.selectedFile) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.selectedFile.summary || '暂无摘要');
                                    Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1455:17)", "entry");
                                    Text.fontSize(14);
                                    Text.fontColor('#333333');
                                    Text.width('100%');
                                    Text.padding(12);
                                    Text.backgroundColor('#F8F8F8');
                                    Text.borderRadius(8);
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
                    Scroll.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('关闭');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1469:11)", "entry");
                        Button.onClick((): void => {
                            this.showFileDetail = false;
                        });
                        Button.width('90%');
                        Button.height(44);
                        Button.fontSize(16);
                        Button.backgroundColor('#007AFF');
                        Button.fontColor(Color.White);
                        Button.borderRadius(10);
                        Button.margin({ bottom: 20 });
                    }, Button);
                    Button.pop();
                    Column.pop();
                });
            }
            // API Key 设置弹窗
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // API Key 设置弹窗
            if (this.showApiKeyInput) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1490:9)", "entry");
                        Stack.width('100%');
                        Stack.height('100%');
                        Stack.backgroundColor('rgba(0, 0, 0, 0.5)');
                        Stack.onClick((): void => {
                            this.showApiKeyInput = false;
                        });
                        Stack.position({ x: 0, y: 0 });
                    }, Stack);
                    Stack.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1499:9)", "entry");
                        Column.width('85%');
                        Column.padding(20);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.position({ x: '7.5%', y: '30%' });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('设置 DeepSeek API Key');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1500:11)", "entry");
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: '请输入 API Key (sk-...)', text: this.apiKeyInput });
                        TextInput.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1506:11)", "entry");
                        TextInput.width('100%');
                        TextInput.height(44);
                        TextInput.backgroundColor('#F0F0F0');
                        TextInput.borderRadius(8);
                        TextInput.type(InputType.Normal);
                        TextInput.onChange((value: string): void => {
                            this.apiKeyInput = value;
                        });
                        TextInput.margin({ bottom: 12 });
                    }, TextInput);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('API Key 将保存在本地，下次启动自动加载');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1517:11)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#8E8E93');
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 12 });
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1522:11)", "entry");
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1523:13)", "entry");
                        Button.layoutWeight(1);
                        Button.height(44);
                        Button.backgroundColor('#E0E0E0');
                        Button.fontColor('#333333');
                        Button.borderRadius(8);
                        Button.onClick((): void => {
                            this.showApiKeyInput = false;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('保存');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1533:13)", "entry");
                        Button.layoutWeight(1);
                        Button.height(44);
                        Button.backgroundColor('#007AFF');
                        Button.fontColor(Color.White);
                        Button.borderRadius(8);
                        Button.onClick((): void => {
                            if (DeepSeekService.validateApiKey(this.apiKeyInput)) {
                                this.saveApiKey(this.apiKeyInput);
                            }
                            else {
                                this.showToast('API Key 格式不正确，应以 sk- 开头', 'error');
                            }
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                });
            }
            // 差异对比弹窗
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 差异对比弹窗
            if (this.showDiffPanel && this.diffResult) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1558:9)", "entry");
                        Stack.width('100%');
                        Stack.height('100%');
                        Stack.backgroundColor('rgba(0, 0, 0, 0.5)');
                        Stack.onClick((): void => {
                            this.showDiffPanel = false;
                        });
                        Stack.position({ x: 0, y: 0 });
                    }, Stack);
                    Stack.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1567:9)", "entry");
                        Column.width('95%');
                        Column.height('80%');
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.position({ x: '2.5%', y: '10%' });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 标题栏
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1569:11)", "entry");
                        // 标题栏
                        Row.width('100%');
                        // 标题栏
                        Row.padding({ left: 16, right: 16, top: 12, bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文档对比');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1570:13)", "entry");
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                        Blank.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1574:13)", "entry");
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('×');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1575:13)", "entry");
                        Button.fontSize(20);
                        Button.fontColor('#666666');
                        Button.backgroundColor(Color.Transparent);
                        Button.onClick((): void => {
                            this.showDiffPanel = false;
                        });
                    }, Button);
                    Button.pop();
                    // 标题栏
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 文件名
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1587:11)", "entry");
                        // 文件名
                        Row.width('100%');
                        // 文件名
                        Row.padding({ left: 16, right: 16, bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1588:13)", "entry");
                        Column.layoutWeight(1);
                        Column.alignItems(HorizontalAlign.Start);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件1');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1589:15)", "entry");
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.diffFile1);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1592:15)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#333333');
                        Text.maxLines(1);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1601:13)", "entry");
                        Column.layoutWeight(1);
                        Column.alignItems(HorizontalAlign.End);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件2');
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1602:15)", "entry");
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.diffFile2);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1605:15)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#333333');
                        Text.maxLines(1);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                    }, Text);
                    Text.pop();
                    Column.pop();
                    // 文件名
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 统计信息
                        Row.create({ space: 12 });
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1618:11)", "entry");
                        // 统计信息
                        Row.width('100%');
                        // 统计信息
                        Row.padding({ left: 16, right: 16, bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`相同: ${this.diffResult.sameCount}`);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1619:13)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#34C759');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`删除: ${this.diffResult.removedCount}`);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1622:13)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#FF3B30');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`新增: ${this.diffResult.addedCount}`);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1625:13)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#007AFF');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`相似度: ${(this.diffResult.similarity * 100).toFixed(0)}%`);
                        Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1628:13)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#FF9500');
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    // 统计信息
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 差异内容
                        Scroll.create();
                        Scroll.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1637:11)", "entry");
                        // 差异内容
                        Scroll.layoutWeight(1);
                        // 差异内容
                        Scroll.backgroundColor('#FAFAFA');
                        // 差异内容
                        Scroll.margin({ left: 8, right: 8 });
                        // 差异内容
                        Scroll.borderRadius(8);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1638:13)", "entry");
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index: number) => {
                            const line = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1640:17)", "entry");
                                Row.width('100%');
                                Row.padding({ top: 2, bottom: 2, left: 4, right: 4 });
                                Row.backgroundColor(line.type === DiffType.ADDED ? '#E3F2FD' :
                                    (line.type === DiffType.REMOVED ? '#FFEBEE' : Color.Transparent));
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(line.lineNum1 ? `${line.lineNum1}` : ' ');
                                Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1641:19)", "entry");
                                Text.fontSize(10);
                                Text.fontColor('#8E8E93');
                                Text.width(25);
                                Text.textAlign(TextAlign.End);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(line.lineNum2 ? `${line.lineNum2}` : ' ');
                                Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1646:19)", "entry");
                                Text.fontSize(10);
                                Text.fontColor('#8E8E93');
                                Text.width(25);
                                Text.textAlign(TextAlign.End);
                                Text.margin({ right: 6 });
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(line.type === DiffType.ADDED ? '+' : (line.type === DiffType.REMOVED ? '-' : ' '));
                                Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1652:19)", "entry");
                                Text.fontSize(12);
                                Text.fontColor(line.type === DiffType.ADDED ? '#007AFF' : (line.type === DiffType.REMOVED ? '#FF3B30' : '#8E8E93'));
                                Text.width(14);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(line.content || ' ');
                                Text.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1656:19)", "entry");
                                Text.fontSize(12);
                                Text.fontColor(line.type === DiffType.SAME ? '#333333' : (line.type === DiffType.ADDED ? '#007AFF' : '#FF3B30'));
                                Text.layoutWeight(1);
                                Text.maxLines(2);
                                Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                            }, Text);
                            Text.pop();
                            Row.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.diffResult.lines.slice(0, 100), forEachItemGenFunction, undefined, true, false);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                    // 差异内容
                    Scroll.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 操作按钮
                        Row.create({ space: 12 });
                        Row.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1679:11)", "entry");
                        // 操作按钮
                        Row.width('100%');
                        // 操作按钮
                        Row.padding(12);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('关闭');
                        Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1680:13)", "entry");
                        Button.layoutWeight(1);
                        Button.height(40);
                        Button.backgroundColor('#E0E0E0');
                        Button.fontColor('#333333');
                        Button.borderRadius(8);
                        Button.onClick((): void => {
                            this.showDiffPanel = false;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.diffResult.similarity >= 0.99) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel(`删除 ${this.diffFile2}`);
                                    Button.debugLine("entry/src/main/ets/view/SmartClassifyTab.ets(1691:15)", "entry");
                                    Button.layoutWeight(1);
                                    Button.height(40);
                                    Button.backgroundColor('#FF3B30');
                                    Button.fontColor(Color.White);
                                    Button.borderRadius(8);
                                    Button.enabled(!this.isDeleting);
                                    Button.onClick((): void => {
                                        this.deleteDuplicate(this.diffFile2);
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
                    // 操作按钮
                    Row.pop();
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
