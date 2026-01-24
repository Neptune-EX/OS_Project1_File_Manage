/**
 * 文本差异对比工具
 * 用于比较两个文档的差异
 */
// 差异类型
export enum DiffType {
    SAME = "same",
    ADDED = "added",
    REMOVED = "removed" // 删除
}
// 差异行
export interface DiffLine {
    type: DiffType;
    content: string;
    lineNum1?: number; // 文档1行号
    lineNum2?: number; // 文档2行号
}
// 差异结果
export interface DiffResult {
    lines: DiffLine[];
    sameCount: number;
    addedCount: number;
    removedCount: number;
    similarity: number; // 0-1
}
export class DiffUtils {
    /**
     * 计算两个文本的差异（基于行）
     */
    static diff(text1: string, text2: string): DiffResult {
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        // 使用 LCS 算法找出最长公共子序列
        const lcs = DiffUtils.computeLCS(lines1, lines2);
        const diffLines: DiffLine[] = [];
        let i = 0, j = 0, k = 0;
        let sameCount = 0, addedCount = 0, removedCount = 0;
        while (i < lines1.length || j < lines2.length) {
            if (k < lcs.length && i < lines1.length && j < lines2.length &&
                lines1[i] === lcs[k] && lines2[j] === lcs[k]) {
                // 相同行
                diffLines.push({
                    type: DiffType.SAME,
                    content: lines1[i],
                    lineNum1: i + 1,
                    lineNum2: j + 1
                });
                sameCount++;
                i++;
                j++;
                k++;
            }
            else if (j < lines2.length && (k >= lcs.length || lines2[j] !== lcs[k])) {
                // 文档2新增
                diffLines.push({
                    type: DiffType.ADDED,
                    content: lines2[j],
                    lineNum2: j + 1
                });
                addedCount++;
                j++;
            }
            else if (i < lines1.length && (k >= lcs.length || lines1[i] !== lcs[k])) {
                // 文档1删除
                diffLines.push({
                    type: DiffType.REMOVED,
                    content: lines1[i],
                    lineNum1: i + 1
                });
                removedCount++;
                i++;
            }
        }
        const total = Math.max(lines1.length, lines2.length);
        const similarity = total > 0 ? sameCount / total : 1;
        return {
            lines: diffLines,
            sameCount,
            addedCount,
            removedCount,
            similarity
        };
    }
    /**
     * 计算最长公共子序列 (LCS)
     */
    private static computeLCS(arr1: string[], arr2: string[]): string[] {
        const m = arr1.length;
        const n = arr2.length;
        // 创建 DP 表
        const dp: number[][] = [];
        for (let i = 0; i <= m; i++) {
            dp.push(new Array(n + 1).fill(0));
        }
        // 填充 DP 表
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (arr1[i - 1] === arr2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                }
                else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        // 回溯找出 LCS
        const lcs: string[] = [];
        let i = m, j = n;
        while (i > 0 && j > 0) {
            if (arr1[i - 1] === arr2[j - 1]) {
                lcs.unshift(arr1[i - 1]);
                i--;
                j--;
            }
            else if (dp[i - 1][j] > dp[i][j - 1]) {
                i--;
            }
            else {
                j--;
            }
        }
        return lcs;
    }
    /**
     * 简化版差异：只返回差异摘要
     */
    static quickDiff(text1: string, text2: string): string {
        if (text1 === text2) {
            return '内容完全相同';
        }
        const result = DiffUtils.diff(text1, text2);
        if (result.addedCount === 0 && result.removedCount === 0) {
            return '内容完全相同';
        }
        const parts: string[] = [];
        if (result.removedCount > 0) {
            parts.push(`删除 ${result.removedCount} 行`);
        }
        if (result.addedCount > 0) {
            parts.push(`新增 ${result.addedCount} 行`);
        }
        parts.push(`相似度 ${(result.similarity * 100).toFixed(0)}%`);
        return parts.join('，');
    }
}
