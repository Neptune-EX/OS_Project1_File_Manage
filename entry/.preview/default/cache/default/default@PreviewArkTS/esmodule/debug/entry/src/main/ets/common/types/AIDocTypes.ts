/**
 * AI 文档管理系统类型定义
 * 定义智能文档分析、分类、搜索相关的数据结构
 */
// 文档类别枚举
export enum DocumentCategory {
    MEETING_NOTES = "meeting_notes",
    STUDY_NOTES = "study_notes",
    PROJECT_REPORT = "project_report",
    PERSONAL_DIARY = "personal_diary",
    TODO_LIST = "todo_list",
    TECHNICAL_DOC = "technical_doc",
    OTHER = "other" // 其他
}
// 文档类别显示名称映射
export function getCategoryDisplayName(category: DocumentCategory): string {
    switch (category) {
        case DocumentCategory.MEETING_NOTES:
            return '会议纪要';
        case DocumentCategory.STUDY_NOTES:
            return '学习笔记';
        case DocumentCategory.PROJECT_REPORT:
            return '项目报告';
        case DocumentCategory.PERSONAL_DIARY:
            return '个人日记';
        case DocumentCategory.TODO_LIST:
            return '待办清单';
        case DocumentCategory.TECHNICAL_DOC:
            return '技术文档';
        case DocumentCategory.OTHER:
            return '其他';
        default:
            return '未分类';
    }
}
// 文档元数据接口
export interface DocumentMetadata {
    filename: string; // 文件名
    category: DocumentCategory; // 文档类别
    categoryConfidence: number; // 分类置信度 (0-1)
    keywords: string[]; // 关键词列表
    summary: string; // 摘要
    wordCount: number; // 字数统计
    lastAnalyzedAt: number; // 最后分析时间戳
    relatedDocs: string[]; // 相关文档列表
    contentHash: string; // 内容哈希（用于检测变化）
}
// AI 分析请求参数
export interface AIAnalysisRequest {
    filename: string; // 文件名
    content: string; // 文件内容
    analysisType: AIAnalysisType; // 分析类型
}
// AI 分析类型枚举
export enum AIAnalysisType {
    CLASSIFY = "classify",
    SUMMARIZE = "summarize",
    KEYWORDS = "keywords",
    FULL_ANALYSIS = "full_analysis" // 完整分析（包含以上所有）
}
// AI 分类结果
export interface ClassificationResult {
    category: DocumentCategory;
    confidence: number;
}
// AI 摘要结果
export interface SummaryResult {
    summary: string;
    wordCount: number;
}
// AI 关键词结果
export interface KeywordsResult {
    keywords: string[];
}
// 完整 AI 分析结果
export interface FullAnalysisResult {
    classification: ClassificationResult;
    summary: SummaryResult;
    keywords: KeywordsResult;
}
// 搜索结果接口
export interface SearchResult {
    filename: string; // 文件名
    relevanceScore: number; // 相关性分数 (0-1)
    matchedKeywords: string[]; // 匹配的关键词
    snippet: string; // 内容片段
    category: DocumentCategory; // 文档类别
}
// 相似文档结果
export interface SimilarDocResult {
    filename: string; // 文件名
    similarityScore: number; // 相似度分数 (0-1)
    sharedKeywords: string[]; // 共同关键词
}
// 知识关联结果
export interface KnowledgeRelation {
    sourceDoc: string; // 源文档
    targetDoc: string; // 目标文档
    relationScore: number; // 关联分数
    relationKeywords: string[]; // 关联关键词
}
// AI 文档索引（持久化存储结构）
export interface AIDocumentIndex {
    version: number; // 索引版本
    lastUpdated: number; // 最后更新时间
    documents: DocumentMetadata[]; // 文档元数据列表
    keywordIndex: KeywordIndexEntry[]; // 关键词倒排索引
}
// 关键词索引条目
export interface KeywordIndexEntry {
    keyword: string; // 关键词
    documents: string[]; // 包含该关键词的文档列表
    frequency: number; // 总出现频率
}
// Worker 消息类型
export enum AIWorkerMessageType {
    ANALYZE = "analyze",
    PROGRESS = "progress",
    RESULT = "result",
    ERROR = "error",
    BATCH_ANALYZE = "batch_analyze",
    CANCEL = "cancel" // 取消任务
}
// Worker 消息接口
export interface AIWorkerMessage {
    type: AIWorkerMessageType;
    taskId: string;
    payload: AIWorkerPayload;
}
// Worker 消息载荷
export interface AIWorkerPayload {
    // 分析请求
    filename: string;
    content: string;
    analysisType: AIAnalysisType;
    apiKey: string;
    // 批量分析
    files: AIAnalysisRequest[];
    // 进度更新
    current: number;
    total: number;
    currentFile: string;
    // 结果
    result: FullAnalysisResult;
    metadata: DocumentMetadata;
    // 错误
    error: string;
}
// 分析状态枚举
export enum AnalysisStatus {
    IDLE = "idle",
    ANALYZING = "analyzing",
    COMPLETED = "completed",
    ERROR = "error" // 错误
}
// UI 状态接口
export interface AIAnalysisState {
    status: AnalysisStatus; // 当前状态
    progress: number; // 进度 (0-100)
    currentFile: string; // 当前处理的文件
    totalFiles: number; // 总文件数
    processedFiles: number; // 已处理文件数
    errorMessage: string; // 错误信息
}
// 搜索选项
export interface SearchOptions {
    query: string; // 搜索查询
    categories: DocumentCategory[]; // 限定类别
    sortBy: SearchSortBy; // 排序方式
    limit: number; // 结果数量限制
}
// 搜索排序方式
export enum SearchSortBy {
    RELEVANCE = "relevance",
    DATE = "date",
    NAME = "name" // 按名称
}
// 分析设置
export interface AIAnalysisSettings {
    apiKey: string; // API Key
    autoAnalyze: boolean; // 是否自动分析新文件
    analysisLanguage: string; // 分析语言 ('zh' | 'en')
}
