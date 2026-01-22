import fileIo from "@ohos:file.fs";
import type common from "@ohos:app.ability.common";
// 生成配置
export interface GeneratorConfig {
    fileCount: number; // 文件总数
    minSize: number; // 最小文件大小(bytes)
    maxSize: number; // 最大文件大小(bytes)
    minDuplicateRate: number; // 最小重复率(0-100)
    maxDuplicateRate: number; // 最大重复率(0-100)
}
// 生成结果
export interface GeneratorResult {
    totalFiles: number; // 生成的文件总数
    uniqueFiles: number; // 唯一文件数
    duplicateFiles: number; // 重复文件数
    duplicateGroups: number; // 重复组数
    totalSize: number; // 总大小
    success: boolean;
    message: string;
}
export class TestDataGenerator {
    private context: Context;
    private filesDir: string;
    private static instance: TestDataGenerator | null = null;
    constructor(context: Context) {
        this.context = context;
        const uiAbilityContext = context as common.UIAbilityContext;
        this.filesDir = uiAbilityContext.filesDir;
    }
    static getInstance(context: Context): TestDataGenerator {
        if (!TestDataGenerator.instance) {
            TestDataGenerator.instance = new TestDataGenerator(context);
        }
        return TestDataGenerator.instance;
    }
    /**
     * 生成随机字符串内容
     */
    private generateRandomContent(size: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 \n';
        let content = '';
        for (let i = 0; i < size; i++) {
            content += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return content;
    }
    /**
     * 生成指定范围内的随机数
     */
    private randomInRange(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /**
     * 生成随机文件名
     */
    private generateRandomFilename(length: number = 8): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let name = '';
        for (let i = 0; i < length; i++) {
            name += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return name;
    }
    /**
     * 生成测试文件
     */
    generateTestFiles(config: GeneratorConfig): GeneratorResult {
        try {
            console.log(`开始生成测试文件，配置: ${JSON.stringify(config)}`);
            // 计算实际重复率（在范围内随机）
            const actualDuplicateRate = this.randomInRange(config.minDuplicateRate, config.maxDuplicateRate) / 100;
            // 计算重复文件数和唯一文件数
            const duplicateFileCount = Math.floor(config.fileCount * actualDuplicateRate);
            const uniqueFileCount = config.fileCount - duplicateFileCount;
            // 计算重复组数（每组至少2个文件）
            // 重复文件分成若干组，每组2-5个文件
            let remainingDuplicates = duplicateFileCount;
            const duplicateGroups: string[] = []; // 存储每组的内容模板
            while (remainingDuplicates > 0) {
                // 每组2-5个文件
                const groupSize = Math.min(this.randomInRange(2, 5), remainingDuplicates);
                if (groupSize < 2 && remainingDuplicates >= 2) {
                    continue;
                }
                if (groupSize < 2) {
                    break;
                }
                // 为这组生成一个内容模板
                const contentSize = this.randomInRange(config.minSize, config.maxSize);
                const content = this.generateRandomContent(contentSize);
                // 添加groupSize次相同内容
                for (let i = 0; i < groupSize; i++) {
                    duplicateGroups.push(content);
                }
                remainingDuplicates -= groupSize;
            }
            // 生成唯一文件的内容
            const uniqueContents: string[] = [];
            for (let i = 0; i < uniqueFileCount; i++) {
                const contentSize = this.randomInRange(config.minSize, config.maxSize);
                uniqueContents.push(this.generateRandomContent(contentSize));
            }
            // 合并所有内容并打乱顺序
            const allContents: string[] = [];
            for (const content of duplicateGroups) {
                allContents.push(content);
            }
            for (const content of uniqueContents) {
                allContents.push(content);
            }
            // Fisher-Yates 洗牌算法
            for (let i = allContents.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = allContents[i];
                allContents[i] = allContents[j];
                allContents[j] = temp;
            }
            // 写入文件
            let totalSize = 0;
            const usedFilenames: string[] = []; // 记录已使用的文件名，避免重复
            for (let i = 0; i < allContents.length; i++) {
                // 生成唯一的随机文件名
                let filename = '';
                do {
                    filename = `${this.generateRandomFilename(10)}.txt`;
                } while (usedFilenames.indexOf(filename) >= 0);
                usedFilenames.push(filename);
                const filePath = `${this.filesDir}/${filename}`;
                const content = allContents[i];
                try {
                    const stream = fileIo.createStreamSync(filePath, 'w+');
                    stream.writeSync(content);
                    stream.closeSync();
                    totalSize += content.length;
                }
                catch (writeError) {
                    console.error(`写入文件失败 ${filename}: ${writeError}`);
                }
            }
            // 计算实际生成的重复组数
            const contentSet = new Set<string>();
            let actualDuplicateGroups = 0;
            const contentCount: Map<string, number> = new Map();
            for (const content of allContents) {
                const count = contentCount.get(content) || 0;
                contentCount.set(content, count + 1);
            }
            contentCount.forEach((count: number) => {
                if (count > 1) {
                    actualDuplicateGroups++;
                }
            });
            const result: GeneratorResult = {
                totalFiles: allContents.length,
                uniqueFiles: uniqueFileCount,
                duplicateFiles: duplicateGroups.length,
                duplicateGroups: actualDuplicateGroups,
                totalSize: totalSize,
                success: true,
                message: `成功生成 ${allContents.length} 个测试文件`
            };
            console.log(`生成完成: ${JSON.stringify(result)}`);
            return result;
        }
        catch (error) {
            console.error(`生成测试文件失败: ${error}`);
            return {
                totalFiles: 0,
                uniqueFiles: 0,
                duplicateFiles: 0,
                duplicateGroups: 0,
                totalSize: 0,
                success: false,
                message: `生成失败: ${error}`
            };
        }
    }
    /**
     * 清空所有txt文件
     */
    clearTestFiles(): number {
        try {
            const files = fileIo.listFileSync(this.filesDir);
            let deletedCount = 0;
            for (const file of files) {
                // 清空所有txt文件（排除隐藏文件）
                if (!file.startsWith('.') && file.endsWith('.txt')) {
                    try {
                        const filePath = `${this.filesDir}/${file}`;
                        fileIo.unlinkSync(filePath);
                        deletedCount++;
                    }
                    catch (e) {
                        console.warn(`删除文件失败: ${file}`);
                    }
                }
            }
            console.log(`已清空 ${deletedCount} 个txt文件`);
            return deletedCount;
        }
        catch (error) {
            console.error(`清空文件失败: ${error}`);
            return 0;
        }
    }
    /**
     * 获取当前txt文件数量
     */
    getTestFileCount(): number {
        try {
            const files = fileIo.listFileSync(this.filesDir);
            let count = 0;
            for (const file of files) {
                if (!file.startsWith('.') && file.endsWith('.txt')) {
                    count++;
                }
            }
            return count;
        }
        catch (error) {
            return 0;
        }
    }
}
