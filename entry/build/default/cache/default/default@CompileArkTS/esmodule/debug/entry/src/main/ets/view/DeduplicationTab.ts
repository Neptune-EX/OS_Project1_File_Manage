if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DeduplicationTab_Params {
    deduplicationManager?: DeduplicationManager | null;
    isScanning?: boolean;
    hasScanned?: boolean;
    refreshKey?: number;
    totalFilesCount?: number;
    duplicateGroupsCount?: number;
    savableSpaceText?: string;
    duplicateGroups?: DuplicateGroup[];
    lastScanTimeText?: string;
    isIncrementalScan?: boolean;
    scannedFilesCount?: number;
    newDuplicateGroupsCount?: number;
    showTrashPanel?: boolean;
    trashItems?: TrashItem[];
    isImporting?: boolean;
    showMessage?: boolean;
    messageText?: string;
    messageType?: 'success' | 'error' | 'info';
    showConfirmDialog?: boolean;
    confirmAction?: 'deduplicate' | 'delete' | 'clearTrash';
    pendingDeleteFile?: FileItem | null;
    pendingTrashItem?: TrashItem | null;
}
import { DeduplicationManager } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DeduplicationManager";
import type { DuplicateGroup, FileItem, ImportDirectoryResult, TrashItem } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DeduplicationManager";
import picker from "@ohos:file.picker";
// 去重统计信息接口
interface DeduplicateStats {
    keep: number;
    deleteCount: number;
    saveSpace: number;
}
export class DeduplicationTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__deduplicationManager = new ObservedPropertyObjectPU(null, this, "deduplicationManager");
        this.__isScanning = new ObservedPropertySimplePU(false, this, "isScanning");
        this.__hasScanned = new ObservedPropertySimplePU(false, this, "hasScanned");
        this.__refreshKey = new ObservedPropertySimplePU(0, this, "refreshKey");
        this.__totalFilesCount = new ObservedPropertySimplePU(0, this, "totalFilesCount");
        this.__duplicateGroupsCount = new ObservedPropertySimplePU(0, this, "duplicateGroupsCount");
        this.__savableSpaceText = new ObservedPropertySimplePU('0 B', this, "savableSpaceText");
        this.__duplicateGroups = new ObservedPropertyObjectPU([], this, "duplicateGroups");
        this.__lastScanTimeText = new ObservedPropertySimplePU('从未扫描', this, "lastScanTimeText");
        this.__isIncrementalScan = new ObservedPropertySimplePU(false, this, "isIncrementalScan");
        this.__scannedFilesCount = new ObservedPropertySimplePU(0, this, "scannedFilesCount");
        this.__newDuplicateGroupsCount = new ObservedPropertySimplePU(0, this, "newDuplicateGroupsCount");
        this.__showTrashPanel = new ObservedPropertySimplePU(false, this, "showTrashPanel");
        this.__trashItems = new ObservedPropertyObjectPU([], this, "trashItems");
        this.__isImporting = new ObservedPropertySimplePU(false, this, "isImporting");
        this.__showMessage = new ObservedPropertySimplePU(false, this, "showMessage");
        this.__messageText = new ObservedPropertySimplePU('', this, "messageText");
        this.__messageType = new ObservedPropertySimplePU('info', this, "messageType");
        this.__showConfirmDialog = new ObservedPropertySimplePU(false, this, "showConfirmDialog");
        this.__confirmAction = new ObservedPropertySimplePU('deduplicate', this, "confirmAction");
        this.__pendingDeleteFile = new ObservedPropertyObjectPU(null, this, "pendingDeleteFile");
        this.__pendingTrashItem = new ObservedPropertyObjectPU(null, this, "pendingTrashItem");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DeduplicationTab_Params) {
        if (params.deduplicationManager !== undefined) {
            this.deduplicationManager = params.deduplicationManager;
        }
        if (params.isScanning !== undefined) {
            this.isScanning = params.isScanning;
        }
        if (params.hasScanned !== undefined) {
            this.hasScanned = params.hasScanned;
        }
        if (params.refreshKey !== undefined) {
            this.refreshKey = params.refreshKey;
        }
        if (params.totalFilesCount !== undefined) {
            this.totalFilesCount = params.totalFilesCount;
        }
        if (params.duplicateGroupsCount !== undefined) {
            this.duplicateGroupsCount = params.duplicateGroupsCount;
        }
        if (params.savableSpaceText !== undefined) {
            this.savableSpaceText = params.savableSpaceText;
        }
        if (params.duplicateGroups !== undefined) {
            this.duplicateGroups = params.duplicateGroups;
        }
        if (params.lastScanTimeText !== undefined) {
            this.lastScanTimeText = params.lastScanTimeText;
        }
        if (params.isIncrementalScan !== undefined) {
            this.isIncrementalScan = params.isIncrementalScan;
        }
        if (params.scannedFilesCount !== undefined) {
            this.scannedFilesCount = params.scannedFilesCount;
        }
        if (params.newDuplicateGroupsCount !== undefined) {
            this.newDuplicateGroupsCount = params.newDuplicateGroupsCount;
        }
        if (params.showTrashPanel !== undefined) {
            this.showTrashPanel = params.showTrashPanel;
        }
        if (params.trashItems !== undefined) {
            this.trashItems = params.trashItems;
        }
        if (params.isImporting !== undefined) {
            this.isImporting = params.isImporting;
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
        if (params.showConfirmDialog !== undefined) {
            this.showConfirmDialog = params.showConfirmDialog;
        }
        if (params.confirmAction !== undefined) {
            this.confirmAction = params.confirmAction;
        }
        if (params.pendingDeleteFile !== undefined) {
            this.pendingDeleteFile = params.pendingDeleteFile;
        }
        if (params.pendingTrashItem !== undefined) {
            this.pendingTrashItem = params.pendingTrashItem;
        }
    }
    updateStateVars(params: DeduplicationTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__deduplicationManager.purgeDependencyOnElmtId(rmElmtId);
        this.__isScanning.purgeDependencyOnElmtId(rmElmtId);
        this.__hasScanned.purgeDependencyOnElmtId(rmElmtId);
        this.__refreshKey.purgeDependencyOnElmtId(rmElmtId);
        this.__totalFilesCount.purgeDependencyOnElmtId(rmElmtId);
        this.__duplicateGroupsCount.purgeDependencyOnElmtId(rmElmtId);
        this.__savableSpaceText.purgeDependencyOnElmtId(rmElmtId);
        this.__duplicateGroups.purgeDependencyOnElmtId(rmElmtId);
        this.__lastScanTimeText.purgeDependencyOnElmtId(rmElmtId);
        this.__isIncrementalScan.purgeDependencyOnElmtId(rmElmtId);
        this.__scannedFilesCount.purgeDependencyOnElmtId(rmElmtId);
        this.__newDuplicateGroupsCount.purgeDependencyOnElmtId(rmElmtId);
        this.__showTrashPanel.purgeDependencyOnElmtId(rmElmtId);
        this.__trashItems.purgeDependencyOnElmtId(rmElmtId);
        this.__isImporting.purgeDependencyOnElmtId(rmElmtId);
        this.__showMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__messageText.purgeDependencyOnElmtId(rmElmtId);
        this.__messageType.purgeDependencyOnElmtId(rmElmtId);
        this.__showConfirmDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__confirmAction.purgeDependencyOnElmtId(rmElmtId);
        this.__pendingDeleteFile.purgeDependencyOnElmtId(rmElmtId);
        this.__pendingTrashItem.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__deduplicationManager.aboutToBeDeleted();
        this.__isScanning.aboutToBeDeleted();
        this.__hasScanned.aboutToBeDeleted();
        this.__refreshKey.aboutToBeDeleted();
        this.__totalFilesCount.aboutToBeDeleted();
        this.__duplicateGroupsCount.aboutToBeDeleted();
        this.__savableSpaceText.aboutToBeDeleted();
        this.__duplicateGroups.aboutToBeDeleted();
        this.__lastScanTimeText.aboutToBeDeleted();
        this.__isIncrementalScan.aboutToBeDeleted();
        this.__scannedFilesCount.aboutToBeDeleted();
        this.__newDuplicateGroupsCount.aboutToBeDeleted();
        this.__showTrashPanel.aboutToBeDeleted();
        this.__trashItems.aboutToBeDeleted();
        this.__isImporting.aboutToBeDeleted();
        this.__showMessage.aboutToBeDeleted();
        this.__messageText.aboutToBeDeleted();
        this.__messageType.aboutToBeDeleted();
        this.__showConfirmDialog.aboutToBeDeleted();
        this.__confirmAction.aboutToBeDeleted();
        this.__pendingDeleteFile.aboutToBeDeleted();
        this.__pendingTrashItem.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    // 去重管理器
    private __deduplicationManager: ObservedPropertyObjectPU<DeduplicationManager | null>;
    get deduplicationManager() {
        return this.__deduplicationManager.get();
    }
    set deduplicationManager(newValue: DeduplicationManager | null) {
        this.__deduplicationManager.set(newValue);
    }
    // 扫描状态
    private __isScanning: ObservedPropertySimplePU<boolean>;
    get isScanning() {
        return this.__isScanning.get();
    }
    set isScanning(newValue: boolean) {
        this.__isScanning.set(newValue);
    }
    private __hasScanned: ObservedPropertySimplePU<boolean>;
    get hasScanned() {
        return this.__hasScanned.get();
    }
    set hasScanned(newValue: boolean) {
        this.__hasScanned.set(newValue);
    }
    private __refreshKey: ObservedPropertySimplePU<number>; // 强制刷新
    get refreshKey() {
        return this.__refreshKey.get();
    }
    set refreshKey(newValue: number) {
        this.__refreshKey.set(newValue);
    }
    // 扫描结果
    private __totalFilesCount: ObservedPropertySimplePU<number>;
    get totalFilesCount() {
        return this.__totalFilesCount.get();
    }
    set totalFilesCount(newValue: number) {
        this.__totalFilesCount.set(newValue);
    }
    private __duplicateGroupsCount: ObservedPropertySimplePU<number>;
    get duplicateGroupsCount() {
        return this.__duplicateGroupsCount.get();
    }
    set duplicateGroupsCount(newValue: number) {
        this.__duplicateGroupsCount.set(newValue);
    }
    private __savableSpaceText: ObservedPropertySimplePU<string>;
    get savableSpaceText() {
        return this.__savableSpaceText.get();
    }
    set savableSpaceText(newValue: string) {
        this.__savableSpaceText.set(newValue);
    }
    private __duplicateGroups: ObservedPropertyObjectPU<DuplicateGroup[]>;
    get duplicateGroups() {
        return this.__duplicateGroups.get();
    }
    set duplicateGroups(newValue: DuplicateGroup[]) {
        this.__duplicateGroups.set(newValue);
    }
    // 增量扫描信息
    private __lastScanTimeText: ObservedPropertySimplePU<string>;
    get lastScanTimeText() {
        return this.__lastScanTimeText.get();
    }
    set lastScanTimeText(newValue: string) {
        this.__lastScanTimeText.set(newValue);
    }
    private __isIncrementalScan: ObservedPropertySimplePU<boolean>;
    get isIncrementalScan() {
        return this.__isIncrementalScan.get();
    }
    set isIncrementalScan(newValue: boolean) {
        this.__isIncrementalScan.set(newValue);
    }
    private __scannedFilesCount: ObservedPropertySimplePU<number>;
    get scannedFilesCount() {
        return this.__scannedFilesCount.get();
    }
    set scannedFilesCount(newValue: number) {
        this.__scannedFilesCount.set(newValue);
    }
    private __newDuplicateGroupsCount: ObservedPropertySimplePU<number>;
    get newDuplicateGroupsCount() {
        return this.__newDuplicateGroupsCount.get();
    }
    set newDuplicateGroupsCount(newValue: number) {
        this.__newDuplicateGroupsCount.set(newValue);
    }
    // 回收站
    private __showTrashPanel: ObservedPropertySimplePU<boolean>;
    get showTrashPanel() {
        return this.__showTrashPanel.get();
    }
    set showTrashPanel(newValue: boolean) {
        this.__showTrashPanel.set(newValue);
    }
    private __trashItems: ObservedPropertyObjectPU<TrashItem[]>;
    get trashItems() {
        return this.__trashItems.get();
    }
    set trashItems(newValue: TrashItem[]) {
        this.__trashItems.set(newValue);
    }
    // 文件导入
    private __isImporting: ObservedPropertySimplePU<boolean>;
    get isImporting() {
        return this.__isImporting.get();
    }
    set isImporting(newValue: boolean) {
        this.__isImporting.set(newValue);
    }
    // 消息提示
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
    private __messageType: ObservedPropertySimplePU<'success' | 'error' | 'info'>;
    get messageType() {
        return this.__messageType.get();
    }
    set messageType(newValue: 'success' | 'error' | 'info') {
        this.__messageType.set(newValue);
    }
    // 确认对话框
    private __showConfirmDialog: ObservedPropertySimplePU<boolean>;
    get showConfirmDialog() {
        return this.__showConfirmDialog.get();
    }
    set showConfirmDialog(newValue: boolean) {
        this.__showConfirmDialog.set(newValue);
    }
    private __confirmAction: ObservedPropertySimplePU<'deduplicate' | 'delete' | 'clearTrash'>;
    get confirmAction() {
        return this.__confirmAction.get();
    }
    set confirmAction(newValue: 'deduplicate' | 'delete' | 'clearTrash') {
        this.__confirmAction.set(newValue);
    }
    private __pendingDeleteFile: ObservedPropertyObjectPU<FileItem | null>;
    get pendingDeleteFile() {
        return this.__pendingDeleteFile.get();
    }
    set pendingDeleteFile(newValue: FileItem | null) {
        this.__pendingDeleteFile.set(newValue);
    }
    private __pendingTrashItem: ObservedPropertyObjectPU<TrashItem | null>;
    get pendingTrashItem() {
        return this.__pendingTrashItem.get();
    }
    set pendingTrashItem(newValue: TrashItem | null) {
        this.__pendingTrashItem.set(newValue);
    }
    aboutToAppear() {
        let context = this.getUIContext().getHostContext() as Context;
        this.deduplicationManager = new DeduplicationManager(context);
        this.updateLastScanTime();
        this.loadTrashItems();
    }
    private updateLastScanTime() {
        if (this.deduplicationManager) {
            this.lastScanTimeText = this.deduplicationManager.getLastScanTimeReadable();
        }
    }
    private loadTrashItems() {
        if (this.deduplicationManager) {
            this.trashItems = [...this.deduplicationManager.getTrashItems()];
        }
    }
    // 开始扫描
    private async startScan(incremental: boolean = false) {
        if (!this.deduplicationManager) {
            this.showToast('初始化失败', 'error');
            return;
        }
        this.isScanning = true;
        this.hasScanned = false;
        // 重置状态（仅全量扫描）
        if (!incremental) {
            this.totalFilesCount = 0;
            this.duplicateGroupsCount = 0;
            this.savableSpaceText = '0 B';
            this.duplicateGroups = [];
            this.deduplicationManager.clearResults();
        }
        try {
            const result = await this.deduplicationManager.scanFilesDir(incremental);
            // 更新状态变量
            this.totalFilesCount = result.totalFiles;
            this.duplicateGroupsCount = result.duplicateGroups;
            this.savableSpaceText = result.savableSpaceReadable;
            this.isIncrementalScan = result.isIncremental;
            this.scannedFilesCount = result.scannedFiles;
            this.newDuplicateGroupsCount = result.newDuplicateGroups;
            // 获取重复组数组
            const groups = this.deduplicationManager.getDuplicateGroups();
            this.duplicateGroups = [...groups];
            this.hasScanned = true;
            this.updateLastScanTime();
            if (result.duplicateGroups === 0) {
                this.showToast('未发现重复文件', 'info');
            }
            else if (incremental && result.scannedFiles === 0) {
                this.showToast('没有变更文件', 'info');
            }
            else if (incremental) {
                this.showToast(`增量扫描完成，新增 ${result.newDuplicateGroups} 组重复`, 'success');
            }
            else {
                this.showToast(`发现 ${result.duplicateGroups} 组重复文件`, 'success');
            }
        }
        catch (error) {
            console.error('扫描失败:', error);
            this.showToast('扫描失败，请重试', 'error');
        }
        finally {
            this.isScanning = false;
        }
    }
    // 切换组展开状态
    private toggleGroupExpanded(group: DuplicateGroup) {
        group.expanded = !group.expanded;
        this.duplicateGroups = [...this.duplicateGroups];
    }
    // 切换文件选中状态
    private toggleFileSelection(group: DuplicateGroup, file: FileItem) {
        file.selected = !file.selected;
        if (!file.selected) {
            const selectedCount = group.files.filter(item => item.selected).length;
            if (selectedCount === 0) {
                file.selected = true;
                this.showToast('每组至少保留一个文件', 'info');
                return;
            }
        }
        this.duplicateGroups = [...this.duplicateGroups];
    }
    // 一键去重准备
    private prepareAutoDeduplicate() {
        if (!this.deduplicationManager || this.duplicateGroups.length === 0)
            return;
        this.deduplicationManager.autoSelectForDeduplicate();
        this.duplicateGroups = [...this.deduplicationManager.getDuplicateGroups()];
        this.confirmAction = 'deduplicate';
        this.showConfirmDialog = true;
    }
    // 执行去重
    private async executeDeduplicate() {
        if (!this.deduplicationManager)
            return;
        const deletedCount = this.deduplicationManager.executeDeduplicate();
        this.showConfirmDialog = false;
        if (deletedCount > 0) {
            this.showToast(`已移动 ${deletedCount} 个文件到回收站`, 'success');
            this.loadTrashItems();
            await this.startScan(false);
        }
        else {
            this.showToast('没有文件被删除', 'info');
        }
    }
    // 手动删除单个文件
    private deleteOneFile(file: FileItem) {
        this.pendingDeleteFile = file;
        this.confirmAction = 'delete';
        this.showConfirmDialog = true;
    }
    // 确认删除单个文件
    private async confirmDeleteOneFile() {
        if (!this.deduplicationManager || !this.pendingDeleteFile)
            return;
        const success = this.deduplicationManager.deleteFile(this.pendingDeleteFile.path);
        this.showConfirmDialog = false;
        if (success) {
            this.showToast(`已移动到回收站: ${this.pendingDeleteFile.filename}`, 'success');
            this.loadTrashItems();
            await this.startScan(false);
        }
        else {
            this.showToast('删除失败', 'error');
        }
        this.pendingDeleteFile = null;
    }
    // 恢复文件
    private async restoreFile(item: TrashItem) {
        if (!this.deduplicationManager)
            return;
        const success = this.deduplicationManager.restoreFromTrash(item);
        if (success) {
            this.showToast(`已恢复: ${item.filename}`, 'success');
            this.loadTrashItems();
            await this.startScan(false);
        }
        else {
            this.showToast('恢复失败', 'error');
        }
    }
    // 永久删除单个
    private permanentDeleteOne(item: TrashItem) {
        if (!this.deduplicationManager)
            return;
        const success = this.deduplicationManager.permanentDelete(item);
        if (success) {
            this.showToast(`已永久删除: ${item.filename}`, 'success');
            this.loadTrashItems();
        }
        else {
            this.showToast('删除失败', 'error');
        }
    }
    // 清空回收站
    private clearTrash() {
        if (!this.deduplicationManager)
            return;
        const count = this.deduplicationManager.clearTrash();
        this.showConfirmDialog = false;
        this.loadTrashItems();
        if (count > 0) {
            this.showToast(`已永久删除 ${count} 个文件`, 'success');
        }
    }
    // 导入文件
    private async importFiles() {
        if (!this.deduplicationManager)
            return;
        this.isImporting = true;
        try {
            const documentPicker = new picker.DocumentViewPicker();
            const selectOptions = new picker.DocumentSelectOptions();
            selectOptions.maxSelectNumber = 100;
            const uris = await documentPicker.select(selectOptions);
            if (uris && uris.length > 0) {
                let successCount = 0;
                for (const uri of uris) {
                    const filename = uri.split('/').pop() || `file_${Date.now()}`;
                    const success = await this.deduplicationManager.importFileToFilesDir(uri, filename);
                    if (success)
                        successCount++;
                }
                this.showToast(`成功导入 ${successCount} 个文件`, 'success');
                // 重新扫描
                this.refreshKey++;
                await this.startScan(false);
            }
        }
        catch (error) {
            console.error('导入文件失败:', error);
            this.showToast('导入失败', 'error');
        }
        finally {
            this.isImporting = false;
        }
    }
    // 导入文件夹
    private async importFolder() {
        if (!this.deduplicationManager)
            return;
        this.isImporting = true;
        try {
            const documentPicker = new picker.DocumentViewPicker();
            const selectOptions = new picker.DocumentSelectOptions();
            selectOptions.maxSelectNumber = 200;
            const uris = await documentPicker.select(selectOptions);
            if (uris && uris.length > 0) {
                let total: ImportDirectoryResult = { totalFiles: 0, importedFiles: 0, skippedFiles: 0 };
                let hasImport = false;
                for (const uri of uris) {
                    const dirResult: ImportDirectoryResult | null = await this.deduplicationManager.importDirectoryToFilesDir(uri);
                    if (dirResult) {
                        total.totalFiles += dirResult.totalFiles;
                        total.importedFiles += dirResult.importedFiles;
                        total.skippedFiles += dirResult.skippedFiles;
                        hasImport = true;
                        continue;
                    }
                    const filename = uri.split('/').pop() || `file_${Date.now()}`;
                    const success = await this.deduplicationManager.importFileToFilesDir(uri, filename);
                    total.totalFiles += 1;
                    if (success)
                        total.importedFiles += 1;
                    else
                        total.skippedFiles += 1;
                    hasImport = true;
                }
                if (!hasImport) {
                    this.showToast('请选择文件夹', 'info');
                    return;
                }
                const summary = total.skippedFiles > 0 ? `，失败 ${total.skippedFiles} 个` : '';
                this.showToast(`成功导入 ${total.importedFiles}/${total.totalFiles} 个文件${summary}`, 'success');
                this.refreshKey++;
                await this.startScan(false);
            }
        }
        catch (error) {
            console.error('导入文件夹失败:', error);
            this.showToast('导入失败', 'error');
        }
        finally {
            this.isImporting = false;
        }
    }
    // 显示提示消息
    private showToast(message: string, type: 'success' | 'error' | 'info') {
        this.messageText = message;
        this.messageType = type;
        this.showMessage = true;
        setTimeout(() => { this.showMessage = false; }, 3000);
    }
    private getMessageColor(): string {
        switch (this.messageType) {
            case 'success': return '#34C759';
            case 'error': return '#FF3B30';
            default: return '#007AFF';
        }
    }
    private getDeduplicateStats(): DeduplicateStats {
        let keep = 0, del = 0, saveSpace = 0;
        for (const group of this.duplicateGroups) {
            for (const file of group.files) {
                if (file.selected)
                    keep++;
                else {
                    del++;
                    saveSpace += file.size;
                }
            }
        }
        return { keep, deleteCount: del, saveSpace };
    }
    private formatFileSize(bytes: number): string {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题栏
            Row.create();
            // 标题栏
            Row.width('100%');
            // 标题栏
            Row.padding({ left: 16, right: 16, top: 12, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('📁 文件去重');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 回收站按钮
            Button.createWithLabel('🗑️ 回收站' + (this.trashItems.length > 0 ? ` (${this.trashItems.length})` : ''));
            // 回收站按钮
            Button.height(32);
            // 回收站按钮
            Button.fontSize(12);
            // 回收站按钮
            Button.fontColor(this.trashItems.length > 0 ? '#FF9500' : '#666666');
            // 回收站按钮
            Button.backgroundColor('#F0F0F0');
            // 回收站按钮
            Button.borderRadius(16);
            // 回收站按钮
            Button.onClick(() => {
                this.loadTrashItems();
                this.showTrashPanel = true;
            });
        }, Button);
        // 回收站按钮
        Button.pop();
        // 标题栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 消息提示
            if (this.showMessage) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.messageText);
                        Text.fontSize(14);
                        Text.fontColor('#FFFFFF');
                        Text.backgroundColor(this.getMessageColor());
                        Text.padding({ left: 16, right: 16, top: 8, bottom: 8 });
                        Text.borderRadius(8);
                        Text.margin({ left: 16, right: 16, bottom: 8 });
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
            Scroll.create();
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 扫描操作区域
            Column.create();
            // 扫描操作区域
            Column.width('100%');
            // 扫描操作区域
            Column.padding(16);
            // 扫描操作区域
            Column.backgroundColor('#FFFFFF');
            // 扫描操作区域
            Column.borderRadius(12);
            // 扫描操作区域
            Column.margin({ left: 12, right: 12, top: 8, bottom: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('上次扫描: ');
            Text.fontSize(13);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.lastScanTimeText);
            Text.fontSize(13);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isScanning ? '扫描中...' : '全量扫描');
            Button.layoutWeight(1);
            Button.height(44);
            Button.fontSize(15);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor(this.isScanning ? '#999999' : '#007AFF');
            Button.borderRadius(10);
            Button.enabled(!this.isScanning);
            Button.onClick(() => { this.startScan(false); });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('增量扫描');
            Button.layoutWeight(1);
            Button.height(44);
            Button.fontSize(15);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor(this.isScanning ? '#999999' : '#34C759');
            Button.borderRadius(10);
            Button.enabled(!this.isScanning && this.deduplicationManager?.getLastScanTime() !== 0);
            Button.margin({ left: 12 });
            Button.onClick(() => { this.startScan(true); });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 导入文件按钮
            Button.createWithLabel(this.isImporting ? '导入中...' : '📥 导入本地文件');
            // 导入文件按钮
            Button.width('100%');
            // 导入文件按钮
            Button.height(40);
            // 导入文件按钮
            Button.fontSize(14);
            // 导入文件按钮
            Button.fontColor('#007AFF');
            // 导入文件按钮
            Button.backgroundColor('#E8F4FF');
            // 导入文件按钮
            Button.borderRadius(10);
            // 导入文件按钮
            Button.margin({ top: 12 });
            // 导入文件按钮
            Button.enabled(!this.isImporting && !this.isScanning);
            // 导入文件按钮
            Button.onClick(() => { this.importFiles(); });
        }, Button);
        // 导入文件按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isImporting ? '导入中...' : '📂 导入本地文件夹');
            Button.width('100%');
            Button.height(40);
            Button.fontSize(14);
            Button.fontColor('#FF9500');
            Button.backgroundColor('#FFF4E5');
            Button.borderRadius(10);
            Button.margin({ top: 8 });
            Button.enabled(!this.isImporting && !this.isScanning);
            Button.onClick(() => { this.importFolder(); });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isIncrementalScan && this.hasScanned) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`📊 本次仅扫描变更文件 (${this.scannedFilesCount} 个)，新增重复 ${this.newDuplicateGroupsCount} 组`);
                        Text.fontSize(12);
                        Text.fontColor('#34C759');
                        Text.margin({ top: 10 });
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
        // 扫描操作区域
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 扫描结果统计
            if (this.hasScanned) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(12);
                        Column.margin({ left: 12, right: 12, bottom: 8 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('扫描结果');
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#333333');
                        Text.width('100%');
                        Text.margin({ bottom: 10 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.justifyContent(FlexAlign.SpaceBetween);
                    }, Row);
                    this.StatCard.bind(this)('总文件', `${this.totalFilesCount}`, '#007AFF');
                    this.StatCard.bind(this)('重复组', `${this.duplicateGroupsCount}`, '#FF9500');
                    this.StatCard.bind(this)('可节省', this.savableSpaceText, '#34C759');
                    Row.pop();
                    Column.pop();
                });
            }
            // 重复文件组列表
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 重复文件组列表
            if (this.hasScanned && this.duplicateGroups.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(12);
                        Column.margin({ left: 12, right: 12, bottom: 100 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('重复文件组');
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#333333');
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('一键去重');
                        Button.height(32);
                        Button.fontSize(13);
                        Button.fontColor('#FFFFFF');
                        Button.backgroundColor('#FF3B30');
                        Button.borderRadius(16);
                        Button.onClick(() => { this.prepareAutoDeduplicate(); });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const group = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                                Column.backgroundColor('#FFFAF0');
                                Column.border({ width: 1, color: '#FF9500', radius: 10 });
                                Column.margin({ bottom: 10 });
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.width('100%');
                                Row.padding(12);
                                Row.onClick(() => { this.toggleGroupExpanded(group); });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(group.expanded ? '▼' : '▶');
                                Text.fontSize(14);
                                Text.fontColor('#666666');
                                Text.margin({ right: 8 });
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.alignItems(HorizontalAlign.Start);
                                Column.layoutWeight(1);
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`${group.files.length} 个相同文件`);
                                Text.fontSize(14);
                                Text.fontWeight(FontWeight.Medium);
                                Text.fontColor('#333333');
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`(${group.sizeReadable})`);
                                Text.fontSize(12);
                                Text.fontColor('#999999');
                                Text.margin({ left: 8 });
                            }, Text);
                            Text.pop();
                            Row.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`哈希: ${group.hash.substring(0, 16)}...`);
                                Text.fontSize(11);
                                Text.fontColor('#AAAAAA');
                            }, Text);
                            Text.pop();
                            Column.pop();
                            Row.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (group.expanded) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Column.create();
                                            Column.padding({ left: 12, right: 12, bottom: 12 });
                                        }, Column);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            ForEach.create();
                                            const forEachItemGenFunction = _item => {
                                                const file = _item;
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Row.create();
                                                    Row.width('100%');
                                                    Row.padding({ left: 12, right: 12, top: 8, bottom: 8 });
                                                    Row.backgroundColor(file.selected ? '#F0F8FF' : '#FAFAFA');
                                                    Row.borderRadius(8);
                                                    Row.margin({ bottom: 4 });
                                                }, Row);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Checkbox.create();
                                                    Checkbox.select(file.selected);
                                                    Checkbox.onChange(() => { this.toggleFileSelection(group, file); });
                                                    Checkbox.margin({ right: 10 });
                                                }, Checkbox);
                                                Checkbox.pop();
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Column.create();
                                                    Column.alignItems(HorizontalAlign.Start);
                                                    Column.layoutWeight(1);
                                                }, Column);
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(file.filename);
                                                    Text.fontSize(13);
                                                    Text.fontWeight(FontWeight.Medium);
                                                    Text.fontColor(file.selected ? '#007AFF' : '#333333');
                                                    Text.maxLines(1);
                                                    Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                                }, Text);
                                                Text.pop();
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(file.path);
                                                    Text.fontSize(10);
                                                    Text.fontColor('#999999');
                                                    Text.maxLines(1);
                                                    Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                                }, Text);
                                                Text.pop();
                                                Column.pop();
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    If.create();
                                                    if (file.selected) {
                                                        this.ifElseBranchUpdateFunction(0, () => {
                                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                Text.create('保留');
                                                                Text.fontSize(11);
                                                                Text.fontColor('#FFFFFF');
                                                                Text.backgroundColor('#34C759');
                                                                Text.padding({ left: 8, right: 8, top: 3, bottom: 3 });
                                                                Text.borderRadius(10);
                                                            }, Text);
                                                            Text.pop();
                                                        });
                                                    }
                                                    else {
                                                        this.ifElseBranchUpdateFunction(1, () => {
                                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                Button.createWithLabel('删除');
                                                                Button.height(26);
                                                                Button.fontSize(11);
                                                                Button.fontColor('#FFFFFF');
                                                                Button.backgroundColor('#FF3B30');
                                                                Button.borderRadius(13);
                                                                Button.onClick(() => { this.deleteOneFile(file); });
                                                            }, Button);
                                                            Button.pop();
                                                        });
                                                    }
                                                }, If);
                                                If.pop();
                                                Row.pop();
                                            };
                                            this.forEachUpdateFunction(elmtId, group.files, forEachItemGenFunction);
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
                        };
                        this.forEachUpdateFunction(elmtId, this.duplicateGroups, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                });
            }
            // 无重复文件提示
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 无重复文件提示
            if (this.hasScanned && this.duplicateGroups.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(40);
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(12);
                        Column.margin({ left: 12, right: 12, bottom: 8 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('✅');
                        Text.fontSize(48);
                        Text.margin({ bottom: 12 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('太棒了！没有发现重复文件');
                        Text.fontSize(16);
                        Text.fontColor('#34C759');
                        Text.fontWeight(FontWeight.Medium);
                    }, Text);
                    Text.pop();
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
        Scroll.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 回收站面板
            if (this.showTrashPanel) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.width('100%');
                        Stack.height('100%');
                    }, Stack);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('rgba(0,0,0,0.5)');
                        Column.onClick(() => { this.showTrashPanel = false; });
                    }, Column);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('90%');
                        Column.height('70%');
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(16);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding(16);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🗑️ 回收站');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.trashItems.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel('清空');
                                    Button.height(28);
                                    Button.fontSize(12);
                                    Button.fontColor('#FF3B30');
                                    Button.backgroundColor('#FFF0F0');
                                    Button.borderRadius(14);
                                    Button.onClick(() => {
                                        this.confirmAction = 'clearTrash';
                                        this.showConfirmDialog = true;
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
                        Text.create('✕');
                        Text.fontSize(20);
                        Text.fontColor('#999999');
                        Text.margin({ left: 12 });
                        Text.onClick(() => { this.showTrashPanel = false; });
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.trashItems.length === 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.width('100%');
                                    Column.padding(40);
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('📭');
                                    Text.fontSize(48);
                                    Text.margin({ bottom: 12 });
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('回收站为空');
                                    Text.fontSize(14);
                                    Text.fontColor('#999999');
                                }, Text);
                                Text.pop();
                                Column.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Scroll.create();
                                    Scroll.layoutWeight(1);
                                }, Scroll);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = _item => {
                                        const item = _item;
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create();
                                            Row.width('100%');
                                            Row.padding(12);
                                            Row.backgroundColor('#FAFAFA');
                                            Row.borderRadius(8);
                                            Row.margin({ bottom: 8, left: 16, right: 16 });
                                        }, Row);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Column.create();
                                            Column.alignItems(HorizontalAlign.Start);
                                            Column.layoutWeight(1);
                                        }, Column);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(item.filename);
                                            Text.fontSize(14);
                                            Text.fontColor('#333333');
                                            Text.maxLines(1);
                                            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(`${item.sizeReadable} · 删除于 ${item.deleteTimeReadable}`);
                                            Text.fontSize(11);
                                            Text.fontColor('#999999');
                                        }, Text);
                                        Text.pop();
                                        Column.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Button.createWithLabel('恢复');
                                            Button.height(28);
                                            Button.fontSize(12);
                                            Button.fontColor('#34C759');
                                            Button.backgroundColor('#F0FFF0');
                                            Button.borderRadius(14);
                                            Button.onClick(() => { this.restoreFile(item); });
                                        }, Button);
                                        Button.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Button.createWithLabel('删除');
                                            Button.height(28);
                                            Button.fontSize(12);
                                            Button.fontColor('#FF3B30');
                                            Button.backgroundColor('#FFF0F0');
                                            Button.borderRadius(14);
                                            Button.margin({ left: 8 });
                                            Button.onClick(() => { this.permanentDeleteOne(item); });
                                        }, Button);
                                        Button.pop();
                                        Row.pop();
                                    };
                                    this.forEachUpdateFunction(elmtId, this.trashItems, forEachItemGenFunction);
                                }, ForEach);
                                ForEach.pop();
                                Column.pop();
                                Scroll.pop();
                            });
                        }
                    }, If);
                    If.pop();
                    Column.pop();
                    Stack.pop();
                });
            }
            // 确认对话框
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 确认对话框
            if (this.showConfirmDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.width('100%');
                        Stack.height('100%');
                    }, Stack);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('rgba(0,0,0,0.5)');
                        Column.onClick(() => { this.showConfirmDialog = false; });
                    }, Column);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('85%');
                        Column.padding(24);
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(16);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.confirmAction === 'deduplicate' ? '确认一键去重' :
                            this.confirmAction === 'clearTrash' ? '确认清空回收站' : '确认删除');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.confirmAction === 'deduplicate') {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.margin({ bottom: 20 });
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`将移动 ${this.getDeduplicateStats().deleteCount} 个重复文件到回收站`);
                                    Text.fontSize(14);
                                    Text.fontColor('#666666');
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`保留 ${this.getDeduplicateStats().keep} 个文件`);
                                    Text.fontSize(14);
                                    Text.fontColor('#666666');
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`可节省空间: ${this.formatFileSize(this.getDeduplicateStats().saveSpace)}`);
                                    Text.fontSize(14);
                                    Text.fontColor('#34C759');
                                    Text.margin({ top: 8 });
                                }, Text);
                                Text.pop();
                                Column.pop();
                            });
                        }
                        else if (this.confirmAction === 'clearTrash') {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`将永久删除回收站中的 ${this.trashItems.length} 个文件`);
                                    Text.fontSize(14);
                                    Text.fontColor('#666666');
                                    Text.margin({ bottom: 20 });
                                }, Text);
                                Text.pop();
                            });
                        }
                        else if (this.pendingDeleteFile) {
                            this.ifElseBranchUpdateFunction(2, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`确定删除 "${this.pendingDeleteFile.filename}" 吗？`);
                                    Text.fontSize(14);
                                    Text.fontColor('#666666');
                                    Text.margin({ bottom: 20 });
                                }, Text);
                                Text.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(3, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.confirmAction === 'clearTrash' ? '⚠️ 此操作不可恢复！' : '💡 可在回收站中恢复');
                        Text.fontSize(13);
                        Text.fontColor(this.confirmAction === 'clearTrash' ? '#FF3B30' : '#999999');
                        Text.margin({ bottom: 20 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.justifyContent(FlexAlign.SpaceBetween);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.width('45%');
                        Button.height(44);
                        Button.fontSize(15);
                        Button.fontColor('#333333');
                        Button.backgroundColor('#E5E5E5');
                        Button.borderRadius(10);
                        Button.onClick(() => { this.showConfirmDialog = false; this.pendingDeleteFile = null; });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('确认');
                        Button.width('45%');
                        Button.height(44);
                        Button.fontSize(15);
                        Button.fontColor('#FFFFFF');
                        Button.backgroundColor('#FF3B30');
                        Button.borderRadius(10);
                        Button.onClick(async () => {
                            if (this.confirmAction === 'deduplicate')
                                await this.executeDeduplicate();
                            else if (this.confirmAction === 'clearTrash')
                                this.clearTrash();
                            else
                                await this.confirmDeleteOneFile();
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                    Stack.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    StatCard(label: string, value: string, color: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.padding({ top: 12, bottom: 12, left: 16, right: 16 });
            Column.backgroundColor('#F8F8F8');
            Column.borderRadius(10);
            Column.width('30%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(value);
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(color);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(label);
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
