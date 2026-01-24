import type common from "@ohos:app.ability.common";
// 相似度结果接口
export interface SimilarityResult {
    file1: string;
    file2: string;
    score: number; // 相似度分数 0-1
    method: SimilarityMethod;
    sharedTerms: string[]; // 共同词汇
}
// 相似度计算方法
export enum SimilarityMethod {
    KEYWORD = "keyword",
    JACCARD = "jaccard",
    COSINE = "cosine" // 余弦相似度
}
// 文档词频信息
export interface DocumentTerms {
    filename: string;
    terms: Map<string, number>; // 词 -> 频率
    totalTerms: number;
}
// 相似文档组
export interface SimilarGroup {
    baseFile: string;
    similarFiles: SimilarityResult[];
}
interface GeneratedTypeLiteralInterface_1 {
    term: string;
    count: number;
}
interface GeneratedTypeLiteralInterface_2 {
    term: string;
    score: number;
}
export class SimilarityCalculator {
    private static instance: SimilarityCalculator | null = null;
    private context: common.UIAbilityContext;
    private filesDir: string;
    // 停用词列表（中文常见停用词）
    private stopWords: string[] = [
        '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
        '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
        '自己', '这', '那', '他', '她', '它', '们', '这个', '那个', '什么', '怎么',
        '可以', '没', '把', '让', '被', '给', '从', '向', '对', '为', '与', '或',
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
        'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
        'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under',
        'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
        'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just'
    ];
    private constructor(context: Context) {
        this.context = context as common.UIAbilityContext;
        this.filesDir = this.context.filesDir;
    }
    static getInstance(context: Context): SimilarityCalculator {
        if (!SimilarityCalculator.instance) {
            SimilarityCalculator.instance = new SimilarityCalculator(context);
        }
        return SimilarityCalculator.instance;
    }
    /**
     * 计算两个文档的相似度
     */
    calculateSimilarity(content1: string, content2: string, method: SimilarityMethod = SimilarityMethod.JACCARD): number {
        const terms1 = this.extractTerms(content1);
        const terms2 = this.extractTerms(content2);
        switch (method) {
            case SimilarityMethod.JACCARD:
                return this.jaccardSimilarity(terms1, terms2);
            case SimilarityMethod.COSINE:
                return this.cosineSimilarity(terms1, terms2);
            case SimilarityMethod.KEYWORD:
                return this.keywordSimilarity(terms1, terms2);
            default:
                return this.jaccardSimilarity(terms1, terms2);
        }
    }
    /**
     * 提取文档中的词汇
     */
    extractTerms(content: string): Map<string, number> {
        const terms = new Map<string, number>();
        // 清理内容
        let cleanContent = content.toLowerCase();
        // 分词（简单实现：按空格和标点分割）
        const words = this.tokenize(cleanContent);
        // 统计词频，排除停用词
        words.forEach((word: string) => {
            if (word.length >= 2 && !this.isStopWord(word)) {
                const count = terms.get(word) || 0;
                terms.set(word, count + 1);
            }
        });
        return terms;
    }
    /**
     * 分词
     */
    private tokenize(text: string): string[] {
        const words: string[] = [];
        // 使用正则分割（中英文混合处理）
        // 匹配中文字符序列或英文单词
        const chinesePattern = /[\u4e00-\u9fa5]+/g;
        const englishPattern = /[a-zA-Z]+/g;
        // 提取中文词（简单按字符分割，实际应用中应使用分词库）
        const chineseMatches = text.match(chinesePattern);
        if (chineseMatches) {
            chineseMatches.forEach((match: string) => {
                // 将中文按 2-3 字符分组作为词
                for (let i = 0; i < match.length; i++) {
                    // 单字
                    words.push(match[i]);
                    // 双字词
                    if (i + 1 < match.length) {
                        words.push(match.substring(i, i + 2));
                    }
                    // 三字词
                    if (i + 2 < match.length) {
                        words.push(match.substring(i, i + 3));
                    }
                }
            });
        }
        // 提取英文单词
        const englishMatches = text.match(englishPattern);
        if (englishMatches) {
            englishMatches.forEach((word: string) => {
                if (word.length >= 2) {
                    words.push(word.toLowerCase());
                }
            });
        }
        return words;
    }
    /**
     * 检查是否为停用词
     */
    private isStopWord(word: string): boolean {
        return this.stopWords.includes(word);
    }
    /**
     * Jaccard 相似度
     * J(A,B) = |A ∩ B| / |A ∪ B|
     */
    private jaccardSimilarity(terms1: Map<string, number>, terms2: Map<string, number>): number {
        const set1 = new Set<string>();
        const set2 = new Set<string>();
        terms1.forEach((count: number, term: string) => {
            set1.add(term);
        });
        terms2.forEach((count: number, term: string) => {
            set2.add(term);
        });
        // 计算交集大小
        let intersection = 0;
        set1.forEach((term: string) => {
            if (set2.has(term)) {
                intersection++;
            }
        });
        // 计算并集大小
        const unionSet = new Set<string>();
        set1.forEach((term: string) => unionSet.add(term));
        set2.forEach((term: string) => unionSet.add(term));
        const union = unionSet.size;
        if (union === 0)
            return 0;
        return intersection / union;
    }
    /**
     * 余弦相似度
     * cos(A,B) = (A·B) / (|A| * |B|)
     */
    private cosineSimilarity(terms1: Map<string, number>, terms2: Map<string, number>): number {
        // 获取所有词汇
        const allTerms = new Set<string>();
        terms1.forEach((count: number, term: string) => allTerms.add(term));
        terms2.forEach((count: number, term: string) => allTerms.add(term));
        // 计算点积和模
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;
        allTerms.forEach((term: string) => {
            const freq1 = terms1.get(term) || 0;
            const freq2 = terms2.get(term) || 0;
            dotProduct += freq1 * freq2;
            magnitude1 += freq1 * freq1;
            magnitude2 += freq2 * freq2;
        });
        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);
        if (magnitude1 === 0 || magnitude2 === 0)
            return 0;
        return dotProduct / (magnitude1 * magnitude2);
    }
    /**
     * 关键词相似度（基于高频词匹配）
     */
    private keywordSimilarity(terms1: Map<string, number>, terms2: Map<string, number>): number {
        // 获取每个文档的 Top 20 关键词
        const keywords1 = this.getTopKeywords(terms1, 20);
        const keywords2 = this.getTopKeywords(terms2, 20);
        // 计算关键词重叠率
        let matchCount = 0;
        keywords1.forEach((keyword: string) => {
            if (keywords2.includes(keyword)) {
                matchCount++;
            }
        });
        const maxKeywords = Math.max(keywords1.length, keywords2.length);
        if (maxKeywords === 0)
            return 0;
        return matchCount / maxKeywords;
    }
    /**
     * 获取 Top N 关键词
     */
    getTopKeywords(terms: Map<string, number>, n: number): string[] {
        const entries: Array<GeneratedTypeLiteralInterface_1> = [];
        terms.forEach((count: number, term: string) => {
            entries.push({ term: term, count: count });
        });
        // 按频率排序
        entries.sort((a, b) => b.count - a.count);
        // 取前 N 个
        const result: string[] = [];
        for (let i = 0; i < Math.min(n, entries.length); i++) {
            result.push(entries[i].term);
        }
        return result;
    }
    /**
     * 获取两个文档的共同词汇
     */
    getSharedTerms(content1: string, content2: string, limit: number = 10): string[] {
        const terms1 = this.extractTerms(content1);
        const terms2 = this.extractTerms(content2);
        const shared: Array<GeneratedTypeLiteralInterface_2> = [];
        terms1.forEach((count1: number, term: string) => {
            const count2 = terms2.get(term);
            if (count2 !== undefined && count2 > 0) {
                shared.push({
                    term: term,
                    score: count1 + count2
                });
            }
        });
        // 按分数排序
        shared.sort((a, b) => b.score - a.score);
        // 返回前 N 个
        const result: string[] = [];
        for (let i = 0; i < Math.min(limit, shared.length); i++) {
            result.push(shared[i].term);
        }
        return result;
    }
    /**
     * 批量计算文档相似度
     */
    async batchCalculateSimilarity(documents: Map<string, string>, threshold: number = 0.3, method: SimilarityMethod = SimilarityMethod.JACCARD): Promise<SimilarityResult[]> {
        const results: SimilarityResult[] = [];
        const filenames: string[] = [];
        documents.forEach((content: string, filename: string) => {
            filenames.push(filename);
        });
        // 计算所有文档对的相似度
        for (let i = 0; i < filenames.length; i++) {
            for (let j = i + 1; j < filenames.length; j++) {
                const file1 = filenames[i];
                const file2 = filenames[j];
                const content1 = documents.get(file1) || '';
                const content2 = documents.get(file2) || '';
                const score = this.calculateSimilarity(content1, content2, method);
                if (score >= threshold) {
                    const sharedTerms = this.getSharedTerms(content1, content2, 5);
                    results.push({
                        file1: file1,
                        file2: file2,
                        score: score,
                        method: method,
                        sharedTerms: sharedTerms
                    });
                }
            }
        }
        // 按相似度排序
        results.sort((a, b) => b.score - a.score);
        return results;
    }
    /**
     * 查找与目标文档相似的文档
     */
    findSimilarDocuments(targetContent: string, documents: Map<string, string>, threshold: number = 0.3, method: SimilarityMethod = SimilarityMethod.JACCARD): SimilarityResult[] {
        const results: SimilarityResult[] = [];
        documents.forEach((content: string, filename: string) => {
            const score = this.calculateSimilarity(targetContent, content, method);
            if (score >= threshold) {
                const sharedTerms = this.getSharedTerms(targetContent, content, 5);
                results.push({
                    file1: 'target',
                    file2: filename,
                    score: score,
                    method: method,
                    sharedTerms: sharedTerms
                });
            }
        });
        // 按相似度排序
        results.sort((a, b) => b.score - a.score);
        return results;
    }
    /**
     * 将相似文档分组
     */
    groupSimilarDocuments(similarityResults: SimilarityResult[], threshold: number = 0.5): SimilarGroup[] {
        const groups: SimilarGroup[] = [];
        const processed = new Set<string>();
        similarityResults.forEach((result: SimilarityResult) => {
            if (result.score < threshold)
                return;
            const file1 = result.file1;
            const file2 = result.file2;
            // 检查是否已处理
            if (processed.has(file1) && processed.has(file2))
                return;
            // 查找现有组
            let foundGroup: SimilarGroup | null = null;
            for (const group of groups) {
                if (group.baseFile === file1 || group.baseFile === file2) {
                    foundGroup = group;
                    break;
                }
                const hasFile1 = group.similarFiles.some((r: SimilarityResult) => r.file1 === file1 || r.file2 === file1);
                const hasFile2 = group.similarFiles.some((r: SimilarityResult) => r.file1 === file2 || r.file2 === file2);
                if (hasFile1 || hasFile2) {
                    foundGroup = group;
                    break;
                }
            }
            if (foundGroup) {
                foundGroup.similarFiles.push(result);
            }
            else {
                groups.push({
                    baseFile: file1,
                    similarFiles: [result]
                });
            }
            processed.add(file1);
            processed.add(file2);
        });
        return groups;
    }
    /**
     * 格式化相似度为百分比字符串
     */
    formatSimilarityScore(score: number): string {
        return `${(score * 100).toFixed(1)}%`;
    }
    /**
     * 获取相似度等级描述
     */
    getSimilarityLevel(score: number): string {
        if (score >= 0.9)
            return '极高相似';
        if (score >= 0.7)
            return '高度相似';
        if (score >= 0.5)
            return '中度相似';
        if (score >= 0.3)
            return '低度相似';
        return '不相似';
    }
}
