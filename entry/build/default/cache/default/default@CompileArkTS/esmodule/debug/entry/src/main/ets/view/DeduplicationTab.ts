if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DeduplicationTab_Params {
    scanResult?: ScanResult | null;
    isScanning?: boolean;
    expandedGroups?: string[];
    showMessage?: boolean;
    messageText?: string;
    messageType?: string;
    lastScanTime?: string;
    showConfirmDialog?: boolean;
    confirmAction?: string;
    selectedGroupHash?: string;
    selectedKeepFile?: string;
    scanProgress?: number;
    scanProgressText?: string;
    isRealTimeScanning?: boolean;
    dynamicGroups?: DuplicateGroup[];
    dynamicStats?: DynamicStats;
    displayGroups?: DuplicateGroup[];
    useWorkerScan?: boolean;
    scanModeText?: string;
    showFileContentDialog?: boolean;
    viewingFileName?: string;
    viewingFileContent?: string;
    scanner?: DuplicateScanner | null;
    filesDir?: string;
}
import { DuplicateScanner } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DuplicateScanner";
import type { DuplicateGroup, DuplicateFileInfo, ScanResult, ScanCallbacks } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DuplicateScanner";
import fileIo from "@ohos:file.fs";
import type common from "@ohos:app.ability.common";
// 动态统计数据接口
interface DynamicStats {
    scannedFiles: number;
    duplicateGroups: number;
    totalDuplicates: number;
    totalWasteSize: number;
    totalWasteSizeReadable: string;
}
export class DeduplicationTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__scanResult = new ObservedPropertyObjectPU(null, this, "scanResult");
        this.__isScanning = new ObservedPropertySimplePU(false, this, "isScanning");
        this.__expandedGroups = new ObservedPropertyObjectPU([], this, "expandedGroups");
        this.__showMessage = new ObservedPropertySimplePU(false, this, "showMessage");
        this.__messageText = new ObservedPropertySimplePU('', this, "messageText");
        this.__messageType = new ObservedPropertySimplePU('success', this, "messageType");
        this.__lastScanTime = new ObservedPropertySimplePU('', this, "lastScanTime");
        this.__showConfirmDialog = new ObservedPropertySimplePU(false, this, "showConfirmDialog");
        this.__confirmAction = new ObservedPropertySimplePU('', this, "confirmAction");
        this.__selectedGroupHash = new ObservedPropertySimplePU('', this, "selectedGroupHash");
        this.__selectedKeepFile = new ObservedPropertySimplePU('', this, "selectedKeepFile");
        this.__scanProgress = new ObservedPropertySimplePU(0, this, "scanProgress");
        this.__scanProgressText = new ObservedPropertySimplePU('', this, "scanProgressText");
        this.__isRealTimeScanning = new ObservedPropertySimplePU(false, this, "isRealTimeScanning");
        this.__dynamicGroups = new ObservedPropertyObjectPU([], this, "dynamicGroups");
        this.__dynamicStats = new ObservedPropertyObjectPU({
            scannedFiles: 0,
            duplicateGroups: 0,
            totalDuplicates: 0,
            totalWasteSize: 0,
            totalWasteSizeReadable: '0 B'
        }, this, "dynamicStats");
        this.__displayGroups = new ObservedPropertyObjectPU([], this, "displayGroups");
        this.__useWorkerScan = new ObservedPropertySimplePU(true, this, "useWorkerScan");
        this.__scanModeText = new ObservedPropertySimplePU('Worker多线程', this, "scanModeText");
        this.__showFileContentDialog = new ObservedPropertySimplePU(false, this, "showFileContentDialog");
        this.__viewingFileName = new ObservedPropertySimplePU('', this, "viewingFileName");
        this.__viewingFileContent = new ObservedPropertySimplePU('', this, "viewingFileContent");
        this.scanner = null;
        this.filesDir = '';
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DeduplicationTab_Params) {
        if (params.scanResult !== undefined) {
            this.scanResult = params.scanResult;
        }
        if (params.isScanning !== undefined) {
            this.isScanning = params.isScanning;
        }
        if (params.expandedGroups !== undefined) {
            this.expandedGroups = params.expandedGroups;
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
        if (params.lastScanTime !== undefined) {
            this.lastScanTime = params.lastScanTime;
        }
        if (params.showConfirmDialog !== undefined) {
            this.showConfirmDialog = params.showConfirmDialog;
        }
        if (params.confirmAction !== undefined) {
            this.confirmAction = params.confirmAction;
        }
        if (params.selectedGroupHash !== undefined) {
            this.selectedGroupHash = params.selectedGroupHash;
        }
        if (params.selectedKeepFile !== undefined) {
            this.selectedKeepFile = params.selectedKeepFile;
        }
        if (params.scanProgress !== undefined) {
            this.scanProgress = params.scanProgress;
        }
        if (params.scanProgressText !== undefined) {
            this.scanProgressText = params.scanProgressText;
        }
        if (params.isRealTimeScanning !== undefined) {
            this.isRealTimeScanning = params.isRealTimeScanning;
        }
        if (params.dynamicGroups !== undefined) {
            this.dynamicGroups = params.dynamicGroups;
        }
        if (params.dynamicStats !== undefined) {
            this.dynamicStats = params.dynamicStats;
        }
        if (params.displayGroups !== undefined) {
            this.displayGroups = params.displayGroups;
        }
        if (params.useWorkerScan !== undefined) {
            this.useWorkerScan = params.useWorkerScan;
        }
        if (params.scanModeText !== undefined) {
            this.scanModeText = params.scanModeText;
        }
        if (params.showFileContentDialog !== undefined) {
            this.showFileContentDialog = params.showFileContentDialog;
        }
        if (params.viewingFileName !== undefined) {
            this.viewingFileName = params.viewingFileName;
        }
        if (params.viewingFileContent !== undefined) {
            this.viewingFileContent = params.viewingFileContent;
        }
        if (params.scanner !== undefined) {
            this.scanner = params.scanner;
        }
        if (params.filesDir !== undefined) {
            this.filesDir = params.filesDir;
        }
    }
    updateStateVars(params: DeduplicationTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__scanResult.purgeDependencyOnElmtId(rmElmtId);
        this.__isScanning.purgeDependencyOnElmtId(rmElmtId);
        this.__expandedGroups.purgeDependencyOnElmtId(rmElmtId);
        this.__showMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__messageText.purgeDependencyOnElmtId(rmElmtId);
        this.__messageType.purgeDependencyOnElmtId(rmElmtId);
        this.__lastScanTime.purgeDependencyOnElmtId(rmElmtId);
        this.__showConfirmDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__confirmAction.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedGroupHash.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedKeepFile.purgeDependencyOnElmtId(rmElmtId);
        this.__scanProgress.purgeDependencyOnElmtId(rmElmtId);
        this.__scanProgressText.purgeDependencyOnElmtId(rmElmtId);
        this.__isRealTimeScanning.purgeDependencyOnElmtId(rmElmtId);
        this.__dynamicGroups.purgeDependencyOnElmtId(rmElmtId);
        this.__dynamicStats.purgeDependencyOnElmtId(rmElmtId);
        this.__displayGroups.purgeDependencyOnElmtId(rmElmtId);
        this.__useWorkerScan.purgeDependencyOnElmtId(rmElmtId);
        this.__scanModeText.purgeDependencyOnElmtId(rmElmtId);
        this.__showFileContentDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__viewingFileName.purgeDependencyOnElmtId(rmElmtId);
        this.__viewingFileContent.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__scanResult.aboutToBeDeleted();
        this.__isScanning.aboutToBeDeleted();
        this.__expandedGroups.aboutToBeDeleted();
        this.__showMessage.aboutToBeDeleted();
        this.__messageText.aboutToBeDeleted();
        this.__messageType.aboutToBeDeleted();
        this.__lastScanTime.aboutToBeDeleted();
        this.__showConfirmDialog.aboutToBeDeleted();
        this.__confirmAction.aboutToBeDeleted();
        this.__selectedGroupHash.aboutToBeDeleted();
        this.__selectedKeepFile.aboutToBeDeleted();
        this.__scanProgress.aboutToBeDeleted();
        this.__scanProgressText.aboutToBeDeleted();
        this.__isRealTimeScanning.aboutToBeDeleted();
        this.__dynamicGroups.aboutToBeDeleted();
        this.__dynamicStats.aboutToBeDeleted();
        this.__displayGroups.aboutToBeDeleted();
        this.__useWorkerScan.aboutToBeDeleted();
        this.__scanModeText.aboutToBeDeleted();
        this.__showFileContentDialog.aboutToBeDeleted();
        this.__viewingFileName.aboutToBeDeleted();
        this.__viewingFileContent.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __scanResult: ObservedPropertyObjectPU<ScanResult | null>;
    get scanResult() {
        return this.__scanResult.get();
    }
    set scanResult(newValue: ScanResult | null) {
        this.__scanResult.set(newValue);
    }
    private __isScanning: ObservedPropertySimplePU<boolean>;
    get isScanning() {
        return this.__isScanning.get();
    }
    set isScanning(newValue: boolean) {
        this.__isScanning.set(newValue);
    }
    private __expandedGroups: ObservedPropertyObjectPU<string[]>;
    get expandedGroups() {
        return this.__expandedGroups.get();
    }
    set expandedGroups(newValue: string[]) {
        this.__expandedGroups.set(newValue);
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
    private __messageType: ObservedPropertySimplePU<string>; // 'success' | 'error' | 'info'
    get messageType() {
        return this.__messageType.get();
    }
    set messageType(newValue: string) {
        this.__messageType.set(newValue);
    }
    private __lastScanTime: ObservedPropertySimplePU<string>;
    get lastScanTime() {
        return this.__lastScanTime.get();
    }
    set lastScanTime(newValue: string) {
        this.__lastScanTime.set(newValue);
    }
    private __showConfirmDialog: ObservedPropertySimplePU<boolean>;
    get showConfirmDialog() {
        return this.__showConfirmDialog.get();
    }
    set showConfirmDialog(newValue: boolean) {
        this.__showConfirmDialog.set(newValue);
    }
    private __confirmAction: ObservedPropertySimplePU<string>; // 'dedup_all' | 'dedup_group'
    get confirmAction() {
        return this.__confirmAction.get();
    }
    set confirmAction(newValue: string) {
        this.__confirmAction.set(newValue);
    }
    private __selectedGroupHash: ObservedPropertySimplePU<string>;
    get selectedGroupHash() {
        return this.__selectedGroupHash.get();
    }
    set selectedGroupHash(newValue: string) {
        this.__selectedGroupHash.set(newValue);
    }
    private __selectedKeepFile: ObservedPropertySimplePU<string>;
    get selectedKeepFile() {
        return this.__selectedKeepFile.get();
    }
    set selectedKeepFile(newValue: string) {
        this.__selectedKeepFile.set(newValue);
    }
    // 可视化相关状态
    private __scanProgress: ObservedPropertySimplePU<number>; // 扫描进度 0-100
    get scanProgress() {
        return this.__scanProgress.get();
    }
    set scanProgress(newValue: number) {
        this.__scanProgress.set(newValue);
    }
    private __scanProgressText: ObservedPropertySimplePU<string>; // 进度文本 "当前/总数"
    get scanProgressText() {
        return this.__scanProgressText.get();
    }
    set scanProgressText(newValue: string) {
        this.__scanProgressText.set(newValue);
    }
    private __isRealTimeScanning: ObservedPropertySimplePU<boolean>; // 是否正在实时扫描
    get isRealTimeScanning() {
        return this.__isRealTimeScanning.get();
    }
    set isRealTimeScanning(newValue: boolean) {
        this.__isRealTimeScanning.set(newValue);
    }
    private __dynamicGroups: ObservedPropertyObjectPU<DuplicateGroup[]>; // 动态更新的重复组列表
    get dynamicGroups() {
        return this.__dynamicGroups.get();
    }
    set dynamicGroups(newValue: DuplicateGroup[]) {
        this.__dynamicGroups.set(newValue);
    }
    private __dynamicStats: ObservedPropertyObjectPU<DynamicStats>;
    get dynamicStats() {
        return this.__dynamicStats.get();
    }
    set dynamicStats(newValue: DynamicStats) {
        this.__dynamicStats.set(newValue);
    }
    private __displayGroups: ObservedPropertyObjectPU<DuplicateGroup[]>; // 当前显示的重复组列表
    get displayGroups() {
        return this.__displayGroups.get();
    }
    set displayGroups(newValue: DuplicateGroup[]) {
        this.__displayGroups.set(newValue);
    }
    // Worker多线程扫描开关
    private __useWorkerScan: ObservedPropertySimplePU<boolean>; // 默认使用Worker多线程扫描
    get useWorkerScan() {
        return this.__useWorkerScan.get();
    }
    set useWorkerScan(newValue: boolean) {
        this.__useWorkerScan.set(newValue);
    }
    private __scanModeText: ObservedPropertySimplePU<string>; // 当前扫描模式文本
    get scanModeText() {
        return this.__scanModeText.get();
    }
    set scanModeText(newValue: string) {
        this.__scanModeText.set(newValue);
    }
    // 查看文件内容相关状态
    private __showFileContentDialog: ObservedPropertySimplePU<boolean>;
    get showFileContentDialog() {
        return this.__showFileContentDialog.get();
    }
    set showFileContentDialog(newValue: boolean) {
        this.__showFileContentDialog.set(newValue);
    }
    private __viewingFileName: ObservedPropertySimplePU<string>;
    get viewingFileName() {
        return this.__viewingFileName.get();
    }
    set viewingFileName(newValue: string) {
        this.__viewingFileName.set(newValue);
    }
    private __viewingFileContent: ObservedPropertySimplePU<string>;
    get viewingFileContent() {
        return this.__viewingFileContent.get();
    }
    set viewingFileContent(newValue: string) {
        this.__viewingFileContent.set(newValue);
    }
    private scanner: DuplicateScanner | null;
    private filesDir: string;
    aboutToAppear() {
        const context = this.getUIContext().getHostContext() as Context;
        this.scanner = DuplicateScanner.getInstance(context);
        this.lastScanTime = this.scanner.getLastScanTimeFormatted();
        // 获取文件目录路径
        const uiAbilityContext = context as common.UIAbilityContext;
        this.filesDir = uiAbilityContext.filesDir;
    }
    // 查看文件内容
    private viewFileContent(filename: string) {
        try {
            const filePath = `${this.filesDir}/${filename}`;
            const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
            const stat = fileIo.statSync(filePath);
            // 限制读取大小，避免内存问题
            const maxReadSize = 10 * 1024; // 最多读取10KB
            const readSize = Math.min(stat.size, maxReadSize);
            const buffer = new ArrayBuffer(readSize);
            fileIo.readSync(file.fd, buffer);
            fileIo.closeSync(file);
            // 转换为字符串
            const uint8Array = new Uint8Array(buffer);
            let content = '';
            for (let i = 0; i < uint8Array.length; i++) {
                content += String.fromCharCode(uint8Array[i]);
            }
            // 如果文件被截断，添加提示
            if (stat.size > maxReadSize) {
                content += `\n\n... (文件过大，仅显示前 ${maxReadSize} 字节)`;
            }
            this.viewingFileName = filename;
            this.viewingFileContent = content;
            this.showFileContentDialog = true;
        }
        catch (error) {
            this.showToast(`读取文件失败: ${error}`, 'error');
        }
    }
    // 显示消息提示
    private showToast(message: string, type: string = 'success') {
        this.messageText = message;
        this.messageType = type;
        this.showMessage = true;
        setTimeout(() => {
            this.showMessage = false;
        }, 3000);
    }
    // 执行全量扫描
    private async performFullScan() {
        if (!this.scanner || this.isScanning)
            return;
        this.isScanning = true;
        this.isRealTimeScanning = true;
        this.scanProgress = 0;
        this.scanProgressText = '';
        this.dynamicGroups = [];
        this.displayGroups = []; // 清空显示列表
        // 根据扫描模式显示不同提示
        const modeHint = this.useWorkerScan ? '（Worker多线程模式）' : '（主线程异步模式）';
        this.showToast(`正在扫描文件...${modeHint}`, 'info');
        try {
            if (this.scanner) {
                // 创建回调对象
                const callbacks: ScanCallbacks = {
                    onProgress: (current: number, total: number) => {
                        this.scanProgress = Math.floor((current / total) * 100);
                        this.scanProgressText = `${current}/${total}`;
                    },
                    onGroupFound: (group: DuplicateGroup) => {
                        // 检查是否已存在该组（更新）
                        const existingIndex = this.dynamicGroups.findIndex((g: DuplicateGroup) => g.hash === group.hash);
                        if (existingIndex >= 0) {
                            // 更新已存在的组
                            this.dynamicGroups[existingIndex] = group;
                            this.dynamicGroups = this.dynamicGroups.slice().sort((a, b) => b.wasteSize - a.wasteSize);
                        }
                        else {
                            // 插入新组并按 wasteSize 降序排序
                            this.dynamicGroups = [...this.dynamicGroups, group]
                                .sort((a, b) => b.wasteSize - a.wasteSize);
                        }
                        // 更新显示列表
                        this.displayGroups = this.dynamicGroups;
                        // 更新动态统计
                        this.dynamicStats = {
                            scannedFiles: this.scanProgressText.split('/')[0] ? parseInt(this.scanProgressText.split('/')[0]) : 0,
                            duplicateGroups: this.dynamicGroups.length,
                            totalDuplicates: this.dynamicGroups.reduce((sum, g) => sum + g.files.length, 0),
                            totalWasteSize: this.dynamicGroups.reduce((sum, g) => sum + g.wasteSize, 0),
                            totalWasteSizeReadable: this.formatFileSize(this.dynamicGroups.reduce((sum, g) => sum + g.wasteSize, 0))
                        };
                    }
                };
                // 完成回调
                const onComplete = (result: ScanResult) => {
                    this.scanResult = result;
                    this.lastScanTime = this.scanner!.getLastScanTimeFormatted();
                    this.isScanning = false;
                    this.isRealTimeScanning = false;
                    // 更新显示列表为最终结果
                    if (this.scanResult) {
                        this.displayGroups = this.scanResult.duplicateGroups;
                    }
                    if (this.scanResult.duplicateGroups.length === 0) {
                        this.showToast('扫描完成，未发现重复文件', 'info');
                    }
                    else {
                        const modeInfo = this.useWorkerScan ? '[Worker]' : '[主线程]';
                        this.showToast(`${modeInfo} 扫描完成！发现 ${this.scanResult.duplicateGroups.length} 组重复文件，` +
                            `可节省 ${this.scanResult.totalWasteSizeReadable} 空间`, 'success');
                    }
                };
                // 根据开关选择扫描方式
                if (this.useWorkerScan) {
                    // 使用 Worker 多线程扫描
                    this.scanner.fullScanWithWorker(callbacks, onComplete);
                }
                else {
                    // 使用主线程异步扫描
                    this.scanner.fullScanAsync(callbacks, onComplete);
                }
            }
        }
        catch (error) {
            this.isScanning = false;
            this.isRealTimeScanning = false;
            this.showToast(`扫描失败: ${error}`, 'error');
        }
    }
    // 执行增量扫描
    private async performIncrementalScan() {
        if (!this.scanner || this.isScanning)
            return;
        this.isScanning = true;
        this.showToast('正在执行增量扫描...', 'info');
        try {
            setTimeout(() => {
                if (this.scanner) {
                    this.scanResult = this.scanner.incrementalScan();
                    this.lastScanTime = this.scanner.getLastScanTimeFormatted();
                    this.isScanning = false;
                    // 更新显示列表
                    if (this.scanResult) {
                        this.displayGroups = this.scanResult.duplicateGroups;
                    }
                    if (this.scanResult.changedFiles === 0) {
                        this.showToast('增量扫描完成，文件无变化', 'info');
                    }
                    else {
                        this.showToast(`增量扫描完成！检测到 ${this.scanResult.changedFiles} 个文件变更`, 'success');
                    }
                }
            }, 100);
        }
        catch (error) {
            this.isScanning = false;
            this.showToast(`扫描失败: ${error}`, 'error');
        }
    }
    // 一键去重
    private performDeduplicateAll() {
        if (!this.scanner)
            return;
        const deletedCount = this.scanner.deduplicateAll();
        this.scanResult = this.scanner.fullScan();
        // 更新显示列表
        if (this.scanResult) {
            this.displayGroups = this.scanResult.duplicateGroups;
        }
        this.showToast(`一键去重完成！已删除 ${deletedCount} 个重复文件`, 'success');
        this.showConfirmDialog = false;
    }
    // 处理单个重复组
    private performDeduplicateGroup() {
        if (!this.scanner || !this.selectedGroupHash || !this.selectedKeepFile)
            return;
        const deletedCount = this.scanner.deduplicateGroup(this.selectedGroupHash, this.selectedKeepFile);
        this.scanResult = this.scanner.fullScan();
        // 更新显示列表
        if (this.scanResult) {
            this.displayGroups = this.scanResult.duplicateGroups;
        }
        this.showToast(`已删除 ${deletedCount} 个重复文件，保留 "${this.selectedKeepFile}"`, 'success');
        this.showConfirmDialog = false;
        this.expandedGroups = this.expandedGroups.filter(h => h !== this.selectedGroupHash);
    }
    // 切换组展开状态
    private toggleGroup(hash: string) {
        const index = this.expandedGroups.indexOf(hash);
        if (index >= 0) {
            this.expandedGroups = this.expandedGroups.filter(h => h !== hash);
        }
        else {
            this.expandedGroups = this.expandedGroups.concat([hash]);
        }
    }
    // 检查组是否展开
    private isGroupExpanded(hash: string): boolean {
        return this.expandedGroups.indexOf(hash) >= 0;
    }
    // 获取变更状态文字
    private getChangeStatusText(group: DuplicateGroup): string {
        if (!group.changeStatus)
            return '';
        switch (group.changeStatus) {
            case 'new':
                return `新增重复组 (+${group.changeCount})`;
            case 'increased':
                return `重复数增加 (+${group.changeCount})`;
            case 'decreased':
                return `重复数减少 (-${group.changeCount})`;
            default:
                return '';
        }
    }
    // 获取变更状态颜色
    private getChangeStatusColor(group: DuplicateGroup): string {
        switch (group.changeStatus) {
            case 'new':
                return '#FF9500';
            case 'increased':
                return '#FF3B30';
            case 'decreased':
                return '#34C759';
            default:
                return '#8E8E93';
        }
    }
    //新增index命名方式，按照组重复的字符命名
    private getGroupNameByHash(group: DuplicateGroup): string {
        // 取hash的前6-8个字符（通常足够唯一标识）
        const hashPrefix = group.hash.substring(0, 8);
        console.log("命名名称", hashPrefix);
        console.log("hash类型", typeof group.hash);
        return `重复组 [${hashPrefix}]`;
    }
    private getSimpleHashName(group: DuplicateGroup, index: number): string {
        // 从复合hash中提取内容hash部分
        const parts = group.hash.split('_');
        if (parts.length >= 2) {
            // parts[1] 是内容的第一个hash值
            const contentHash = parts[1];
            if (contentHash && contentHash.length >= 4) {
                // 使用内容hash的前4个字符
                return `[${contentHash.substring(0, 4).toUpperCase()}]`;
            }
        }
        // 回退方案：使用文件数量
        return `${index + 1}`;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // === 顶部标题和扫描信息 ===
            Column.create();
            // === 顶部标题和扫描信息 ===
            Column.width('100%');
            // === 顶部标题和扫描信息 ===
            Column.padding({ left: 16, right: 16, top: 12, bottom: 8 });
            // === 顶部标题和扫描信息 ===
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('文件去重');
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`上次扫描: ${this.lastScanTime}`);
            Text.fontSize(12);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 扫描模式切换
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.useWorkerScan ? 'Worker多线程' : '主线程异步');
            Text.fontSize(11);
            Text.fontColor(this.useWorkerScan ? '#007AFF' : '#8E8E93');
            Text.margin({ right: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Toggle.create({ type: ToggleType.Switch, isOn: this.useWorkerScan });
            Toggle.width(40);
            Toggle.height(22);
            Toggle.selectedColor('#007AFF');
            Toggle.onChange((isOn: boolean) => {
                this.useWorkerScan = isOn;
                this.scanModeText = isOn ? 'Worker多线程' : '主线程异步';
            });
        }, Toggle);
        Toggle.pop();
        // 扫描模式切换
        Row.pop();
        Row.pop();
        // === 顶部标题和扫描信息 ===
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // === 操作按钮区 ===
            Row.create({ space: 10 });
            // === 操作按钮区 ===
            Row.width('100%');
            // === 操作按钮区 ===
            Row.padding({ left: 16, right: 16, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isScanning ? '扫描中...' : '全量扫描');
            Button.onClick(() => this.performFullScan());
            Button.enabled(!this.isScanning);
            Button.height(40);
            Button.fontSize(14);
            Button.backgroundColor(this.isScanning ? '#C7C7CC' : '#007AFF');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
            Button.layoutWeight(1);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('增量扫描');
            Button.onClick(() => this.performIncrementalScan());
            Button.enabled(!this.isScanning && this.lastScanTime !== '从未扫描');
            Button.height(40);
            Button.fontSize(14);
            Button.backgroundColor((!this.isScanning && this.lastScanTime !== '从未扫描') ? '#34C759' : '#C7C7CC');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
            Button.layoutWeight(1);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('一键去重');
            Button.onClick(() => {
                if (this.scanResult && this.scanResult.duplicateGroups.length > 0) {
                    this.confirmAction = 'dedup_all';
                    this.showConfirmDialog = true;
                }
                else {
                    this.showToast('请先执行扫描', 'info');
                }
            });
            Button.enabled(!this.isScanning && this.scanResult !== null && this.scanResult.duplicateGroups.length > 0);
            Button.height(40);
            Button.fontSize(14);
            Button.backgroundColor((!this.isScanning && this.scanResult !== null && this.scanResult.duplicateGroups.length > 0)
                ? '#FF3B30' : '#C7C7CC');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
            Button.layoutWeight(1);
        }, Button);
        Button.pop();
        // === 操作按钮区 ===
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 扫描进度条 ===
            if (this.isRealTimeScanning) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding({ left: 16, right: 16, top: 8, bottom: 12 });
                        Column.backgroundColor('#F8F8F8');
                        Column.borderRadius(12);
                        Column.margin({ left: 16, right: 16, bottom: 12 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('扫描进度');
                        Text.fontSize(14);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#333333');
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.scanProgress}%`);
                        Text.fontSize(14);
                        Text.fontColor('#007AFF');
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Progress.create({ value: this.scanProgress, total: 100, type: ProgressType.Linear });
                        Progress.color('#007AFF');
                        Progress.backgroundColor('#E0E0E0');
                        Progress.height(8);
                        Progress.width('100%');
                        Progress.borderRadius(4);
                    }, Progress);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.scanProgressText) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`已扫描文件: ${this.scanProgressText}`);
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
            // === 消息提示 ===
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 消息提示 ===
            if (this.showMessage) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.messageText);
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
            // === 扫描结果统计 ===
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 扫描结果统计 ===
            if (this.scanResult || this.isRealTimeScanning) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 根据扫描状态获取要显示的统计数据
                        Row.create();
                        // 根据扫描状态获取要显示的统计数据
                        Row.width('100%');
                        // 根据扫描状态获取要显示的统计数据
                        Row.padding({ left: 16, right: 16, top: 8, bottom: 12 });
                        // 根据扫描状态获取要显示的统计数据
                        Row.backgroundColor(this.isRealTimeScanning ? '#FFF8E1' : '#F8F8F8');
                        // 根据扫描状态获取要显示的统计数据
                        Row.borderRadius(12);
                        // 根据扫描状态获取要显示的统计数据
                        Row.margin({ left: 16, right: 16, bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.isRealTimeScanning ? this.dynamicStats.scannedFiles : (this.scanResult?.scannedFiles || 0)}`);
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#007AFF');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.isRealTimeScanning ? '已扫描' : '扫描文件');
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.isRealTimeScanning ? this.dynamicStats.duplicateGroups : (this.scanResult?.duplicateGroups.length || 0)}`);
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#FF9500');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('重复组');
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.isRealTimeScanning ? this.dynamicStats.totalDuplicates : (this.scanResult?.totalDuplicates || 0)}`);
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#FF3B30');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('重复文件');
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.isRealTimeScanning ? this.dynamicStats.totalWasteSizeReadable : (this.scanResult?.totalWasteSizeReadable || '0 B'));
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#34C759');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('可节省');
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                    // 根据扫描状态获取要显示的统计数据
                    Row.pop();
                });
            }
            // === 重复文件列表 ===
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 重复文件列表 ===
            if (!this.scanResult && !this.isRealTimeScanning) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height(200);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🔍');
                        Text.fontSize(48);
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('点击"全量扫描"开始检测重复文件');
                        Text.fontSize(14);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else if (!this.isRealTimeScanning && this.scanResult && this.scanResult.duplicateGroups.length === 0) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height(200);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('✅');
                        Text.fontSize(48);
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('太棒了！没有发现重复文件');
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
                        If.create();
                        // 动态排行榜提示
                        if (this.isRealTimeScanning && this.dynamicGroups.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.width('100%');
                                    Row.padding({ left: 16, right: 16, bottom: 8 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`🏆 动态排行榜 - 按可释放空间降序排列`);
                                    Text.fontSize(13);
                                    Text.fontWeight(FontWeight.Medium);
                                    Text.fontColor('#FF9500');
                                }, Text);
                                Text.pop();
                                Row.pop();
                            });
                        }
                        // 增量扫描提示
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 增量扫描提示
                        if (!this.isRealTimeScanning && this.scanResult && this.scanResult.isIncremental && this.scanResult.changedFiles > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.width('100%');
                                    Row.padding({ left: 16, right: 16, bottom: 8 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`📊 本次仅扫描变更文件，共 ${this.scanResult.changedFiles} 个文件有变化`);
                                    Text.fontSize(12);
                                    Text.fontColor('#FF9500');
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
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.displayGroups.length === 0 && this.isRealTimeScanning) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 扫描中但还未发现重复组
                                    Column.create();
                                    // 扫描中但还未发现重复组
                                    Column.width('100%');
                                    // 扫描中但还未发现重复组
                                    Column.height(200);
                                    // 扫描中但还未发现重复组
                                    Column.justifyContent(FlexAlign.Center);
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('🔄');
                                    Text.fontSize(48);
                                    Text.margin({ bottom: 16 });
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('正在扫描文件，寻找重复组...');
                                    Text.fontSize(14);
                                    Text.fontColor('#8E8E93');
                                }, Text);
                                Text.pop();
                                // 扫描中但还未发现重复组
                                Column.pop();
                            });
                        }
                        else if (this.displayGroups.length > 0) {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    List.create({ space: 8 });
                                    List.width('100%');
                                    List.layoutWeight(1);
                                    List.padding({ left: 16, right: 16 });
                                }, List);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = (_item, index: number) => {
                                        const group = _item;
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
                                            };
                                            const deepRenderFunction = (elmtId, isInitialRender) => {
                                                itemCreation(elmtId, isInitialRender);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Column.create();
                                                    Column.backgroundColor(Color.White);
                                                    Column.borderRadius(12);
                                                    Column.border({ width: 1, color: '#E0E0E0' });
                                                    Column.transition({
                                                        type: TransitionType.Insert,
                                                        opacity: 0,
                                                        translate: { x: 0, y: 50 }
                                                    });
                                                    Column.transition({
                                                        type: TransitionType.Delete,
                                                        opacity: 0,
                                                        translate: { x: 0, y: -50 }
                                                    });
                                                }, Column);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    // 组标题行
                                                    Row.create();
                                                    // 组标题行
                                                    Row.width('100%');
                                                    // 组标题行
                                                    Row.padding(12);
                                                    // 组标题行
                                                    Row.onClick(() => this.toggleGroup(group.hash));
                                                }, Row);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Column.create();
                                                    Column.alignItems(HorizontalAlign.Start);
                                                    Column.layoutWeight(1);
                                                }, Column);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Row.create();
                                                }, Row);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    // Text(`重复组 #${index + 1}`)
                                                    Text.create(`加密Hash值${this.getSimpleHashName(group, index)}`);
                                                    // Text(`重复组 #${index + 1}`)
                                                    Text.fontSize(16);
                                                    // Text(`重复组 #${index + 1}`)
                                                    Text.fontWeight(FontWeight.Bold);
                                                    // Text(`重复组 #${index + 1}`)
                                                    Text.fontColor('#333333');
                                                }, Text);
                                                // Text(`重复组 #${index + 1}`)
                                                Text.pop();
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    If.create();
                                                    if (group.changeStatus) {
                                                        this.ifElseBranchUpdateFunction(0, () => {
                                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                Text.create(this.getChangeStatusText(group));
                                                                Text.fontSize(11);
                                                                Text.fontColor(Color.White);
                                                                Text.backgroundColor(this.getChangeStatusColor(group));
                                                                Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                                                                Text.borderRadius(4);
                                                                Text.margin({ left: 8 });
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
                                                    Text.create(`${group.files.length} 个重复文件 · 可节省 ${this.formatFileSize(group.wasteSize)}`);
                                                    Text.fontSize(12);
                                                    Text.fontColor('#8E8E93');
                                                    Text.margin({ top: 4 });
                                                }, Text);
                                                Text.pop();
                                                Column.pop();
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(this.isGroupExpanded(group.hash) ? '▼' : '▶');
                                                    Text.fontSize(14);
                                                    Text.fontColor('#8E8E93');
                                                }, Text);
                                                Text.pop();
                                                // 组标题行
                                                Row.pop();
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    If.create();
                                                    // 展开的文件列表
                                                    if (this.isGroupExpanded(group.hash)) {
                                                        this.ifElseBranchUpdateFunction(0, () => {
                                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                Column.create({ space: 6 });
                                                                Column.width('100%');
                                                                Column.padding({ left: 12, right: 12, bottom: 12 });
                                                            }, Column);
                                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                ForEach.create();
                                                                const forEachItemGenFunction = (_item, fileIndex: number) => {
                                                                    const file = _item;
                                                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                        Row.create();
                                                                        Row.width('100%');
                                                                        Row.padding({ left: 12, right: 12, top: 8, bottom: 8 });
                                                                        Row.backgroundColor(fileIndex === 0 ? '#E8F5E9' : '#FFF8E1');
                                                                        Row.borderRadius(8);
                                                                    }, Row);
                                                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                        Column.create();
                                                                        Column.alignItems(HorizontalAlign.Start);
                                                                        Column.layoutWeight(1);
                                                                    }, Column);
                                                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                        Row.create();
                                                                    }, Row);
                                                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                        If.create();
                                                                        if (fileIndex === 0) {
                                                                            this.ifElseBranchUpdateFunction(0, () => {
                                                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                                    Text.create('保留');
                                                                                    Text.fontSize(10);
                                                                                    Text.fontColor(Color.White);
                                                                                    Text.backgroundColor('#34C759');
                                                                                    Text.padding({ left: 4, right: 4, top: 1, bottom: 1 });
                                                                                    Text.borderRadius(4);
                                                                                    Text.margin({ right: 6 });
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
                                                                        if (file.isNew) {
                                                                            this.ifElseBranchUpdateFunction(0, () => {
                                                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                                    Text.create('新增');
                                                                                    Text.fontSize(10);
                                                                                    Text.fontColor(Color.White);
                                                                                    Text.backgroundColor('#FF9500');
                                                                                    Text.padding({ left: 4, right: 4, top: 1, bottom: 1 });
                                                                                    Text.borderRadius(4);
                                                                                    Text.margin({ right: 6 });
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
                                                                        Text.fontSize(14);
                                                                        Text.fontColor('#333333');
                                                                        Text.maxLines(1);
                                                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                                                    }, Text);
                                                                    Text.pop();
                                                                    Row.pop();
                                                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                        Text.create(`${file.sizeReadable} · ${file.mtimeFormatted}`);
                                                                        Text.fontSize(11);
                                                                        Text.fontColor('#8E8E93');
                                                                        Text.margin({ top: 2 });
                                                                    }, Text);
                                                                    Text.pop();
                                                                    Column.pop();
                                                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                        Row.create({ space: 4 });
                                                                    }, Row);
                                                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                        Button.createWithLabel('查看');
                                                                        Button.onClick(() => {
                                                                            this.viewFileContent(file.filename);
                                                                        });
                                                                        Button.height(28);
                                                                        Button.fontSize(11);
                                                                        Button.backgroundColor('#8E8E93');
                                                                        Button.fontColor(Color.White);
                                                                        Button.borderRadius(14);
                                                                    }, Button);
                                                                    Button.pop();
                                                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                        If.create();
                                                                        if (fileIndex !== 0) {
                                                                            this.ifElseBranchUpdateFunction(0, () => {
                                                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                                    Button.createWithLabel('保留此文件');
                                                                                    Button.onClick(() => {
                                                                                        this.selectedGroupHash = group.hash;
                                                                                        this.selectedKeepFile = file.filename;
                                                                                        this.confirmAction = 'dedup_group';
                                                                                        this.showConfirmDialog = true;
                                                                                    });
                                                                                    Button.height(28);
                                                                                    Button.fontSize(11);
                                                                                    Button.backgroundColor('#007AFF');
                                                                                    Button.fontColor(Color.White);
                                                                                    Button.borderRadius(14);
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
                                                                    Row.pop();
                                                                    Row.pop();
                                                                };
                                                                this.forEachUpdateFunction(elmtId, group.files, forEachItemGenFunction, undefined, true, false);
                                                            }, ForEach);
                                                            ForEach.pop();
                                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                // 快速操作按钮
                                                                Row.create({ space: 10 });
                                                                // 快速操作按钮
                                                                Row.width('100%');
                                                                // 快速操作按钮
                                                                Row.padding({ top: 8 });
                                                            }, Row);
                                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                Button.createWithLabel('保留第一个，删除其他');
                                                                Button.onClick(() => {
                                                                    this.selectedGroupHash = group.hash;
                                                                    this.selectedKeepFile = group.files[0].filename;
                                                                    this.confirmAction = 'dedup_group';
                                                                    this.showConfirmDialog = true;
                                                                });
                                                                Button.height(36);
                                                                Button.fontSize(13);
                                                                Button.backgroundColor('#FF3B30');
                                                                Button.fontColor(Color.White);
                                                                Button.borderRadius(8);
                                                                Button.layoutWeight(1);
                                                            }, Button);
                                                            Button.pop();
                                                            // 快速操作按钮
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
                                                ListItem.pop();
                                            };
                                            this.observeComponentCreation2(itemCreation2, ListItem);
                                            ListItem.pop();
                                        }
                                    };
                                    this.forEachUpdateFunction(elmtId, this.displayGroups, forEachItemGenFunction, undefined, true, false);
                                }, ForEach);
                                ForEach.pop();
                                List.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(2, () => {
                            });
                        }
                    }, If);
                    If.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 确认对话框 ===
            if (this.showConfirmDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.width('100%');
                        Stack.height('100%');
                        Stack.backgroundColor('rgba(0, 0, 0, 0.5)');
                        Stack.onClick(() => {
                            this.showConfirmDialog = false;
                        });
                        Stack.position({ x: 0, y: 0 });
                    }, Stack);
                    Stack.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('85%');
                        Column.padding(24);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.position({ x: '7.5%', y: '30%' });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.confirmAction === 'dedup_all' ? '确认一键去重' : '确认删除重复文件');
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.confirmAction === 'dedup_all'
                            ? `即将删除所有重复组中的多余文件，每组保留最早创建的文件。\n\n共 ${this.scanResult ? this.scanResult.duplicateGroups.length : 0} 组重复文件将被处理。\n\n删除的文件将移入回收站，可以恢复。`
                            : `即将删除该组中除 "${this.selectedKeepFile}" 以外的所有文件。\n\n删除的文件将移入回收站，可以恢复。`);
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.textAlign(TextAlign.Center);
                        Text.margin({ bottom: 24 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 16 });
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.onClick(() => {
                            this.showConfirmDialog = false;
                        });
                        Button.height(44);
                        Button.fontSize(16);
                        Button.backgroundColor('#E0E0E0');
                        Button.fontColor('#333333');
                        Button.borderRadius(8);
                        Button.layoutWeight(1);
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('确认删除');
                        Button.onClick(() => {
                            if (this.confirmAction === 'dedup_all') {
                                this.performDeduplicateAll();
                            }
                            else {
                                this.performDeduplicateGroup();
                            }
                        });
                        Button.height(44);
                        Button.fontSize(16);
                        Button.backgroundColor('#FF3B30');
                        Button.fontColor(Color.White);
                        Button.borderRadius(8);
                        Button.layoutWeight(1);
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                });
            }
            // === 文件内容查看对话框 ===
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 文件内容查看对话框 ===
            if (this.showFileContentDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.width('100%');
                        Stack.height('100%');
                        Stack.backgroundColor('rgba(0, 0, 0, 0.5)');
                        Stack.onClick(() => {
                            this.showFileContentDialog = false;
                        });
                        Stack.position({ x: 0, y: 0 });
                    }, Stack);
                    Stack.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('90%');
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.position({ x: '5%', y: '10%' });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 标题栏
                        Row.create();
                        // 标题栏
                        Row.width('100%');
                        // 标题栏
                        Row.padding({ left: 20, right: 20, top: 15, bottom: 15 });
                        // 标题栏
                        Row.border({ width: { bottom: 1 }, color: '#E0E0E0' });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件内容');
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('×');
                        Button.fontSize(24);
                        Button.fontColor('#666666');
                        Button.backgroundColor(Color.Transparent);
                        Button.onClick(() => {
                            this.showFileContentDialog = false;
                        });
                    }, Button);
                    Button.pop();
                    // 标题栏
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 文件名
                        Row.create();
                        // 文件名
                        Row.width('100%');
                        // 文件名
                        Row.padding({ left: 20, right: 20, top: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件名:');
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.width('20%');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.viewingFileName);
                        Text.fontSize(14);
                        Text.fontColor('#007AFF');
                        Text.fontWeight(FontWeight.Medium);
                        Text.maxLines(1);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.width('80%');
                    }, Text);
                    Text.pop();
                    // 文件名
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 文件内容
                        Scroll.create();
                        // 文件内容
                        Scroll.width('100%');
                        // 文件内容
                        Scroll.height(300);
                        // 文件内容
                        Scroll.padding(16);
                        // 文件内容
                        Scroll.margin({ left: 20, right: 20, top: 12, bottom: 12 });
                        // 文件内容
                        Scroll.backgroundColor('#F8F8F8');
                        // 文件内容
                        Scroll.borderRadius(8);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.viewingFileContent);
                        Text.fontSize(13);
                        Text.fontColor('#333333');
                        Text.fontFamily('monospace');
                        Text.width('100%');
                    }, Text);
                    Text.pop();
                    // 文件内容
                    Scroll.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 关闭按钮
                        Button.createWithLabel('关闭');
                        // 关闭按钮
                        Button.onClick(() => {
                            this.showFileContentDialog = false;
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
    // 格式化文件大小
    private formatFileSize(bytes: number): string {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    }
    rerender() {
        this.updateDirtyElements();
    }
}
