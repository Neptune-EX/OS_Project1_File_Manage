import fileIo from "@ohos:file.fs";
import type common from "@ohos:app.ability.common";
/**
 * 文件信息接口
 */
export interface FileItem {
    path: string; // 完整路径
    filename: string; // 文件名
    size: number; // 文件大小（字节）
    sizeReadable: string; // 可读的文件大小
    selected: boolean; // 是否被选中保留
}
/**
 * 重复文件组接口
 */
export interface DuplicateGroup {
    hash: string; // 文件哈希值
    size: number; // 文件大小
    sizeReadable: string; // 可读的文件大小
    files: FileItem[]; // 重复文件列表
    expanded: boolean; // UI展开状态
}
/**
 * 扫描结果接口
 */
export interface ScanResult {
    totalFiles: number; // 总文件数
    duplicateGroups: number; // 重复组数量
    duplicateFiles: number; // 重复文件数量
    savableSpace: number; // 可节省空间（字节）
    savableSpaceReadable: string; // 可读的可节省空间
}
/**
 * 目录信息接口
 */
export interface DirectoryInfo {
    path: string;
    name: string;
    selected: boolean;
}
/**
 * 文件去重管理器
 */
export class DeduplicationManager {
    private context: Context;
    private filesDir: string;
    private duplicateGroups: DuplicateGroup[] = [];
    constructor(context: Context) {
        this.context = context;
        this.filesDir = this.getFilesDir();
    }
    /**
     * 获取沙箱文件目录
     */
    private getFilesDir(): string {
        try {
            const uiAbilityContext = this.context as common.UIAbilityContext;
            return uiAbilityContext.filesDir;
        }
        catch (error) {
            console.error('获取文件目录失败:', error);
            return '';
        }
    }
    /**
     * 获取可扫描的目录列表
     * 由于沙箱限制，只能扫描应用自己的目录
     */
    getAvailableDirectories(): DirectoryInfo[] {
        const dirs: DirectoryInfo[] = [];
        try {
            // 主文件目录
            dirs.push({
                path: this.filesDir,
                name: '应用文件目录',
                selected: true
            });
            // 列出子目录
            const files = fileIo.listFileSync(this.filesDir);
            for (const file of files) {
                const fullPath = `${this.filesDir}/${file}`;
                try {
                    const stat = fileIo.statSync(fullPath);
                    if (stat.isDirectory()) {
                        dirs.push({
                            path: fullPath,
                            name: file,
                            selected: false
                        });
                    }
                }
                catch (e) {
                    // 跳过无法访问的项
                }
            }
        }
        catch (error) {
            console.error('获取目录列表失败:', error);
        }
        return dirs;
    }
    /**
     * 获取测试文件夹路径
     */
    getTestFolderPath(): string {
        return `${this.filesDir}/测试数据`;
    }
    /**
     * 创建测试文件夹（如果不存在）
     */
    createTestFolder(): boolean {
        try {
            const testFolderPath = this.getTestFolderPath();
            // 检查是否已存在
            try {
                const stat = fileIo.statSync(testFolderPath);
                if (stat.isDirectory()) {
                    console.log('测试文件夹已存在');
                    return true;
                }
            }
            catch (e) {
                // 不存在，继续创建
            }
            // 创建文件夹
            fileIo.mkdirSync(testFolderPath);
            console.log('测试文件夹创建成功:', testFolderPath);
            return true;
        }
        catch (error) {
            console.error('创建测试文件夹失败:', error);
            return false;
        }
    }
    /**
     * 将选中的文件复制到测试文件夹
     * @param sourceUri 源文件URI
     * @param fileName 目标文件名
     */
    async importFileToTestFolder(sourceUri: string, fileName: string): Promise<boolean> {
        try {
            // 确保测试文件夹存在
            this.createTestFolder();
            const testFolderPath = this.getTestFolderPath();
            const targetPath = `${testFolderPath}/${fileName}`;
            console.log(`导入文件: ${sourceUri} -> ${targetPath}`);
            // 打开源文件
            const sourceFile = fileIo.openSync(sourceUri, fileIo.OpenMode.READ_ONLY);
            // 获取文件大小
            const sourceStat = fileIo.statSync(sourceUri);
            const fileSize = sourceStat.size;
            // 读取源文件内容
            const buffer = new ArrayBuffer(fileSize);
            fileIo.readSync(sourceFile.fd, buffer);
            fileIo.closeSync(sourceFile);
            // 创建并写入目标文件
            const targetFile = fileIo.openSync(targetPath, fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY | fileIo.OpenMode.TRUNC);
            fileIo.writeSync(targetFile.fd, buffer);
            fileIo.closeSync(targetFile);
            console.log(`文件导入成功: ${fileName}`);
            return true;
        }
        catch (error) {
            console.error(`文件导入失败 ${fileName}:`, error);
            return false;
        }
    }
    /**
     * 清空测试文件夹
     */
    clearTestFolder(): number {
        try {
            const testFolderPath = this.getTestFolderPath();
            let deletedCount = 0;
            // 检查文件夹是否存在
            try {
                fileIo.statSync(testFolderPath);
            }
            catch (e) {
                console.log('测试文件夹不存在');
                return 0;
            }
            // 列出所有文件并删除
            const files = fileIo.listFileSync(testFolderPath);
            for (const file of files) {
                const filePath = `${testFolderPath}/${file}`;
                try {
                    fileIo.unlinkSync(filePath);
                    deletedCount++;
                }
                catch (e) {
                    console.warn(`删除文件失败: ${file}`);
                }
            }
            console.log(`清空测试文件夹完成，删除 ${deletedCount} 个文件`);
            return deletedCount;
        }
        catch (error) {
            console.error('清空测试文件夹失败:', error);
            return 0;
        }
    }
    /**
     * 获取测试文件夹中的文件数量
     */
    getTestFolderFileCount(): number {
        try {
            const testFolderPath = this.getTestFolderPath();
            const files = fileIo.listFileSync(testFolderPath);
            return files.length;
        }
        catch (error) {
            return 0;
        }
    }
    /**
     * 扫描指定目录，递归获取所有文件
     */
    private async scanDirectoryRecursive(dirPath: string): Promise<string[]> {
        const allFiles: string[] = [];
        try {
            const items = fileIo.listFileSync(dirPath);
            for (const item of items) {
                const fullPath = `${dirPath}/${item}`;
                try {
                    const stat = fileIo.statSync(fullPath);
                    if (stat.isDirectory()) {
                        // 递归扫描子目录
                        const subFiles = await this.scanDirectoryRecursive(fullPath);
                        allFiles.push(...subFiles);
                    }
                    else if (stat.isFile()) {
                        allFiles.push(fullPath);
                    }
                }
                catch (e) {
                    console.warn(`无法访问: ${fullPath}`);
                }
            }
        }
        catch (error) {
            console.error(`扫描目录失败 ${dirPath}:`, error);
        }
        return allFiles;
    }
    /**
     * 计算文件哈希值（使用内容采样 + 大小作为快速哈希）
     * 由于性能考虑，对于小文件读取全部内容，大文件采样
     */
    private calculateFileHash(filePath: string, fileSize: number): string {
        try {
            const SAMPLE_SIZE = 4096; // 采样大小 4KB
            if (fileSize === 0) {
                return 'empty_file';
            }
            let sampleData: ArrayBuffer;
            if (fileSize <= SAMPLE_SIZE * 2) {
                // 小文件：读取全部内容
                sampleData = new ArrayBuffer(fileSize);
                const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
                fileIo.readSync(file.fd, sampleData);
                fileIo.closeSync(file);
            }
            else {
                // 大文件：采样开头和结尾
                sampleData = new ArrayBuffer(SAMPLE_SIZE * 2);
                const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
                // 读取开头
                const headBuffer = new ArrayBuffer(SAMPLE_SIZE);
                fileIo.readSync(file.fd, headBuffer, { offset: 0 });
                // 读取结尾
                const tailBuffer = new ArrayBuffer(SAMPLE_SIZE);
                fileIo.readSync(file.fd, tailBuffer, { offset: fileSize - SAMPLE_SIZE });
                fileIo.closeSync(file);
                // 合并数据
                const headView = new Uint8Array(headBuffer);
                const tailView = new Uint8Array(tailBuffer);
                const sampleView = new Uint8Array(sampleData);
                sampleView.set(headView, 0);
                sampleView.set(tailView, SAMPLE_SIZE);
            }
            // 计算简单哈希（DJB2 算法变体）
            const dataView = new Uint8Array(sampleData);
            let hashValue = 5381;
            for (let i = 0; i < dataView.length; i++) {
                hashValue = ((hashValue << 5) + hashValue) + dataView[i];
                hashValue = hashValue & 0xFFFFFFFF; // 保持32位
            }
            // 组合文件大小和内容哈希
            return `${fileSize}_${hashValue.toString(16)}`;
        }
        catch (error) {
            console.error(`计算文件哈希失败 ${filePath}:`, error);
            return `error_${Date.now()}`;
        }
    }
    /**
     * 格式化文件大小
     */
    private formatFileSize(bytes: number): string {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    }
    /**
     * 执行扫描并查找重复文件
     */
    async scanForDuplicates(directories: string[]): Promise<ScanResult> {
        console.log('开始扫描目录:', directories);
        // 收集所有文件
        let allFiles: string[] = [];
        for (const dir of directories) {
            const files = await this.scanDirectoryRecursive(dir);
            allFiles.push(...files);
        }
        console.log(`共发现 ${allFiles.length} 个文件`);
        // 按文件大小分组（第一轮快速过滤）
        const sizeMap: Map<number, string[]> = new Map();
        for (const filePath of allFiles) {
            try {
                const stat = fileIo.statSync(filePath);
                const size = stat.size;
                if (!sizeMap.has(size)) {
                    sizeMap.set(size, []);
                }
                sizeMap.get(size)!.push(filePath);
            }
            catch (e) {
                console.warn(`无法获取文件信息: ${filePath}`);
            }
        }
        // 对相同大小的文件计算哈希并分组
        const hashMap: Map<string, FileItem[]> = new Map();
        sizeMap.forEach((files: string[], size: number) => {
            // 只有多个相同大小的文件才需要进一步检查
            if (files.length > 1) {
                for (const filePath of files) {
                    const fileHash = this.calculateFileHash(filePath, size);
                    const filename = filePath.split('/').pop() || filePath;
                    const fileItem: FileItem = {
                        path: filePath,
                        filename: filename,
                        size: size,
                        sizeReadable: this.formatFileSize(size),
                        selected: false
                    };
                    if (!hashMap.has(fileHash)) {
                        hashMap.set(fileHash, []);
                    }
                    hashMap.get(fileHash)!.push(fileItem);
                }
            }
        });
        // 构建重复组（只保留有多个文件的组）
        this.duplicateGroups = [];
        let duplicateFileCount = 0;
        let savableSpace = 0;
        hashMap.forEach((files: FileItem[], hashKey: string) => {
            if (files.length > 1) {
                // 默认选中第一个文件保留
                files[0].selected = true;
                const group: DuplicateGroup = {
                    hash: hashKey,
                    size: files[0].size,
                    sizeReadable: files[0].sizeReadable,
                    files: files,
                    expanded: false
                };
                this.duplicateGroups.push(group);
                duplicateFileCount += files.length;
                // 可节省空间 = (文件数 - 1) * 文件大小
                savableSpace += (files.length - 1) * files[0].size;
            }
        });
        console.log(`发现 ${this.duplicateGroups.length} 组重复文件`);
        return {
            totalFiles: allFiles.length,
            duplicateGroups: this.duplicateGroups.length,
            duplicateFiles: duplicateFileCount,
            savableSpace: savableSpace,
            savableSpaceReadable: this.formatFileSize(savableSpace)
        };
    }
    /**
     * 获取重复文件组列表
     */
    getDuplicateGroups(): DuplicateGroup[] {
        return this.duplicateGroups;
    }
    /**
     * 删除单个文件
     */
    deleteFile(filePath: string): boolean {
        try {
            if (!fileIo.accessSync(filePath)) {
                console.log(`文件不存在: ${filePath}`);
                return false;
            }
            fileIo.unlinkSync(filePath);
            console.log(`文件删除成功: ${filePath}`);
            return true;
        }
        catch (error) {
            console.error(`删除文件失败 ${filePath}:`, error);
            return false;
        }
    }
    /**
     * 执行去重操作
     * 删除每个重复组中未被选中（selected=false）的文件
     * @returns 删除的文件数量
     */
    executeDeduplicate(): number {
        let deletedCount = 0;
        for (const group of this.duplicateGroups) {
            for (const file of group.files) {
                if (!file.selected) {
                    if (this.deleteFile(file.path)) {
                        deletedCount++;
                    }
                }
            }
        }
        console.log(`去重完成，共删除 ${deletedCount} 个文件`);
        return deletedCount;
    }
    /**
     * 一键去重：每组保留第一个文件
     */
    autoSelectForDeduplicate(): void {
        for (const group of this.duplicateGroups) {
            for (let i = 0; i < group.files.length; i++) {
                group.files[i].selected = (i === 0); // 只保留第一个
            }
        }
    }
    /**
     * 切换文件选中状态
     */
    toggleFileSelection(groupHash: string, filePath: string): void {
        for (const group of this.duplicateGroups) {
            if (group.hash === groupHash) {
                for (const file of group.files) {
                    if (file.path === filePath) {
                        file.selected = !file.selected;
                        break;
                    }
                }
                break;
            }
        }
    }
    /**
     * 切换组展开状态
     */
    toggleGroupExpanded(groupHash: string): void {
        for (const group of this.duplicateGroups) {
            if (group.hash === groupHash) {
                group.expanded = !group.expanded;
                break;
            }
        }
    }
    /**
     * 清空扫描结果
     */
    clearResults(): void {
        this.duplicateGroups = [];
    }
}
