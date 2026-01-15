if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DeduplicationTab_Params {
    deduplicationManager?: DeduplicationManager | null;
    availableDirectories?: DirectoryInfo[];
    selectedDirectories?: string[];
    isScanning?: boolean;
    scanProgress?: string;
    hasScanned?: boolean;
    scanResult?: ScanResult | null;
    duplicateGroups?: DuplicateGroup[];
    showMessage?: boolean;
    messageText?: string;
    messageType?: 'success' | 'error' | 'info';
    showConfirmDialog?: boolean;
    confirmAction?: 'deduplicate' | 'delete' | 'clearTest';
    pendingDeleteFile?: FileItem | null;
    isImporting?: boolean;
    importedFileCount?: number;
    testFolderFileCount?: number;
}
import { DeduplicationManager } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DeduplicationManager";
import type { DuplicateGroup, FileItem, ScanResult, DirectoryInfo } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DeduplicationManager";
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
        this.__availableDirectories = new ObservedPropertyObjectPU([], this, "availableDirectories");
        this.__selectedDirectories = new ObservedPropertyObjectPU([], this, "selectedDirectories");
        this.__isScanning = new ObservedPropertySimplePU(false, this, "isScanning");
        this.__scanProgress = new ObservedPropertySimplePU('', this, "scanProgress");
        this.__hasScanned = new ObservedPropertySimplePU(false, this, "hasScanned");
        this.__scanResult = new ObservedPropertyObjectPU(null, this, "scanResult");
        this.__duplicateGroups = new ObservedPropertyObjectPU([], this, "duplicateGroups");
        this.__showMessage = new ObservedPropertySimplePU(false, this, "showMessage");
        this.__messageText = new ObservedPropertySimplePU('', this, "messageText");
        this.__messageType = new ObservedPropertySimplePU('info', this, "messageType");
        this.__showConfirmDialog = new ObservedPropertySimplePU(false, this, "showConfirmDialog");
        this.__confirmAction = new ObservedPropertySimplePU('deduplicate', this, "confirmAction");
        this.__pendingDeleteFile = new ObservedPropertyObjectPU(null, this, "pendingDeleteFile");
        this.__isImporting = new ObservedPropertySimplePU(false, this, "isImporting");
        this.__importedFileCount = new ObservedPropertySimplePU(0, this, "importedFileCount");
        this.__testFolderFileCount = new ObservedPropertySimplePU(0, this, "testFolderFileCount");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DeduplicationTab_Params) {
        if (params.deduplicationManager !== undefined) {
            this.deduplicationManager = params.deduplicationManager;
        }
        if (params.availableDirectories !== undefined) {
            this.availableDirectories = params.availableDirectories;
        }
        if (params.selectedDirectories !== undefined) {
            this.selectedDirectories = params.selectedDirectories;
        }
        if (params.isScanning !== undefined) {
            this.isScanning = params.isScanning;
        }
        if (params.scanProgress !== undefined) {
            this.scanProgress = params.scanProgress;
        }
        if (params.hasScanned !== undefined) {
            this.hasScanned = params.hasScanned;
        }
        if (params.scanResult !== undefined) {
            this.scanResult = params.scanResult;
        }
        if (params.duplicateGroups !== undefined) {
            this.duplicateGroups = params.duplicateGroups;
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
        if (params.isImporting !== undefined) {
            this.isImporting = params.isImporting;
        }
        if (params.importedFileCount !== undefined) {
            this.importedFileCount = params.importedFileCount;
        }
        if (params.testFolderFileCount !== undefined) {
            this.testFolderFileCount = params.testFolderFileCount;
        }
    }
    updateStateVars(params: DeduplicationTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__deduplicationManager.purgeDependencyOnElmtId(rmElmtId);
        this.__availableDirectories.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedDirectories.purgeDependencyOnElmtId(rmElmtId);
        this.__isScanning.purgeDependencyOnElmtId(rmElmtId);
        this.__scanProgress.purgeDependencyOnElmtId(rmElmtId);
        this.__hasScanned.purgeDependencyOnElmtId(rmElmtId);
        this.__scanResult.purgeDependencyOnElmtId(rmElmtId);
        this.__duplicateGroups.purgeDependencyOnElmtId(rmElmtId);
        this.__showMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__messageText.purgeDependencyOnElmtId(rmElmtId);
        this.__messageType.purgeDependencyOnElmtId(rmElmtId);
        this.__showConfirmDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__confirmAction.purgeDependencyOnElmtId(rmElmtId);
        this.__pendingDeleteFile.purgeDependencyOnElmtId(rmElmtId);
        this.__isImporting.purgeDependencyOnElmtId(rmElmtId);
        this.__importedFileCount.purgeDependencyOnElmtId(rmElmtId);
        this.__testFolderFileCount.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__deduplicationManager.aboutToBeDeleted();
        this.__availableDirectories.aboutToBeDeleted();
        this.__selectedDirectories.aboutToBeDeleted();
        this.__isScanning.aboutToBeDeleted();
        this.__scanProgress.aboutToBeDeleted();
        this.__hasScanned.aboutToBeDeleted();
        this.__scanResult.aboutToBeDeleted();
        this.__duplicateGroups.aboutToBeDeleted();
        this.__showMessage.aboutToBeDeleted();
        this.__messageText.aboutToBeDeleted();
        this.__messageType.aboutToBeDeleted();
        this.__showConfirmDialog.aboutToBeDeleted();
        this.__confirmAction.aboutToBeDeleted();
        this.__pendingDeleteFile.aboutToBeDeleted();
        this.__isImporting.aboutToBeDeleted();
        this.__importedFileCount.aboutToBeDeleted();
        this.__testFolderFileCount.aboutToBeDeleted();
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
    // 目录选择
    private __availableDirectories: ObservedPropertyObjectPU<DirectoryInfo[]>;
    get availableDirectories() {
        return this.__availableDirectories.get();
    }
    set availableDirectories(newValue: DirectoryInfo[]) {
        this.__availableDirectories.set(newValue);
    }
    private __selectedDirectories: ObservedPropertyObjectPU<string[]>;
    get selectedDirectories() {
        return this.__selectedDirectories.get();
    }
    set selectedDirectories(newValue: string[]) {
        this.__selectedDirectories.set(newValue);
    }
    // 扫描状态
    private __isScanning: ObservedPropertySimplePU<boolean>;
    get isScanning() {
        return this.__isScanning.get();
    }
    set isScanning(newValue: boolean) {
        this.__isScanning.set(newValue);
    }
    private __scanProgress: ObservedPropertySimplePU<string>;
    get scanProgress() {
        return this.__scanProgress.get();
    }
    set scanProgress(newValue: string) {
        this.__scanProgress.set(newValue);
    }
    private __hasScanned: ObservedPropertySimplePU<boolean>;
    get hasScanned() {
        return this.__hasScanned.get();
    }
    set hasScanned(newValue: boolean) {
        this.__hasScanned.set(newValue);
    }
    // 扫描结果
    private __scanResult: ObservedPropertyObjectPU<ScanResult | null>;
    get scanResult() {
        return this.__scanResult.get();
    }
    set scanResult(newValue: ScanResult | null) {
        this.__scanResult.set(newValue);
    }
    private __duplicateGroups: ObservedPropertyObjectPU<DuplicateGroup[]>;
    get duplicateGroups() {
        return this.__duplicateGroups.get();
    }
    set duplicateGroups(newValue: DuplicateGroup[]) {
        this.__duplicateGroups.set(newValue);
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
    private __confirmAction: ObservedPropertySimplePU<'deduplicate' | 'delete' | 'clearTest'>;
    get confirmAction() {
        return this.__confirmAction.get();
    }
    set confirmAction(newValue: 'deduplicate' | 'delete' | 'clearTest') {
        this.__confirmAction.set(newValue);
    }
    private __pendingDeleteFile: ObservedPropertyObjectPU<FileItem | null>;
    get pendingDeleteFile() {
        return this.__pendingDeleteFile.get();
    }
    set pendingDeleteFile(newValue: FileItem | null) {
        this.__pendingDeleteFile.set(newValue);
    }
    // 导入测试文件状态
    private __isImporting: ObservedPropertySimplePU<boolean>;
    get isImporting() {
        return this.__isImporting.get();
    }
    set isImporting(newValue: boolean) {
        this.__isImporting.set(newValue);
    }
    private __importedFileCount: ObservedPropertySimplePU<number>;
    get importedFileCount() {
        return this.__importedFileCount.get();
    }
    set importedFileCount(newValue: number) {
        this.__importedFileCount.set(newValue);
    }
    private __testFolderFileCount: ObservedPropertySimplePU<number>;
    get testFolderFileCount() {
        return this.__testFolderFileCount.get();
    }
    set testFolderFileCount(newValue: number) {
        this.__testFolderFileCount.set(newValue);
    }
    aboutToAppear() {
        let context = this.getUIContext().getHostContext() as Context;
        this.deduplicationManager = new DeduplicationManager(context);
        this.loadDirectories();
        this.updateTestFolderCount();
    }
    // 更新测试文件夹文件数量
    private updateTestFolderCount() {
        if (this.deduplicationManager) {
            this.testFolderFileCount = this.deduplicationManager.getTestFolderFileCount();
        }
    }
    // 加载可用目录
    private loadDirectories() {
        if (this.deduplicationManager) {
            this.availableDirectories = this.deduplicationManager.getAvailableDirectories();
            // 默认选中主目录
            if (this.availableDirectories.length > 0) {
                this.selectedDirectories = [this.availableDirectories[0].path];
                this.availableDirectories[0].selected = true;
            }
        }
    }
    // 切换目录选择
    private toggleDirectorySelection(dir: DirectoryInfo) {
        dir.selected = !dir.selected;
        if (dir.selected) {
            if (!this.selectedDirectories.includes(dir.path)) {
                this.selectedDirectories.push(dir.path);
            }
        }
        else {
            this.selectedDirectories = this.selectedDirectories.filter(p => p !== dir.path);
        }
        // 触发更新
        this.availableDirectories = [...this.availableDirectories];
    }
    // 导入测试文件
    private async importTestFiles() {
        if (!this.deduplicationManager)
            return;
        try {
            // 创建文件选择器
            const documentPicker = new picker.DocumentViewPicker();
            // 配置选择选项
            const options = new picker.DocumentSelectOptions();
            options.maxSelectNumber = 100; // 最多选择100个文件
            this.isImporting = true;
            this.importedFileCount = 0;
            // 打开文件选择器
            const result = await documentPicker.select(options);
            if (result && result.length > 0) {
                console.log(`选择了 ${result.length} 个文件`);
                // 确保测试文件夹存在
                this.deduplicationManager.createTestFolder();
                let successCount = 0;
                for (const uri of result) {
                    // 从 URI 提取文件名
                    const parts = uri.split('/');
                    const fileName = parts[parts.length - 1] || `file_${Date.now()}`;
                    const success = await this.deduplicationManager.importFileToTestFolder(uri, fileName);
                    if (success) {
                        successCount++;
                    }
                }
                this.importedFileCount = successCount;
                this.updateTestFolderCount();
                this.loadDirectories(); // 刷新目录列表
                if (successCount > 0) {
                    this.showToast(`成功导入 ${successCount} 个文件`, 'success');
                }
                else {
                    this.showToast('导入失败', 'error');
                }
            }
            else {
                this.showToast('未选择任何文件', 'info');
            }
        }
        catch (error) {
            console.error('导入文件失败:', error);
            this.showToast('导入失败，请重试', 'error');
        }
        finally {
            this.isImporting = false;
        }
    }
    // 清空测试文件夹
    private prepareClearTestFolder() {
        this.confirmAction = 'clearTest';
        this.showConfirmDialog = true;
    }
    private executeClearTestFolder() {
        if (!this.deduplicationManager)
            return;
        const deletedCount = this.deduplicationManager.clearTestFolder();
        this.showConfirmDialog = false;
        this.updateTestFolderCount();
        this.loadDirectories();
        if (deletedCount > 0) {
            this.showToast(`已清空 ${deletedCount} 个测试文件`, 'success');
        }
        else {
            this.showToast('测试文件夹已为空', 'info');
        }
    }
    // 开始扫描
    private async startScan() {
        if (!this.deduplicationManager || this.selectedDirectories.length === 0) {
            this.showToast('请先选择要扫描的目录', 'error');
            return;
        }
        this.isScanning = true;
        this.scanProgress = '正在扫描文件...';
        this.hasScanned = false;
        try {
            const result = await this.deduplicationManager.scanForDuplicates(this.selectedDirectories);
            this.scanResult = result;
            this.duplicateGroups = this.deduplicationManager.getDuplicateGroups();
            this.hasScanned = true;
            if (result.duplicateGroups === 0) {
                this.showToast('未发现重复文件', 'info');
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
            this.scanProgress = '';
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
        this.duplicateGroups = [...this.duplicateGroups];
    }
    // 一键去重准备
    private prepareAutoDeduplicate() {
        if (!this.deduplicationManager || this.duplicateGroups.length === 0) {
            return;
        }
        this.deduplicationManager.autoSelectForDeduplicate();
        this.duplicateGroups = [...this.deduplicationManager.getDuplicateGroups()];
        this.confirmAction = 'deduplicate';
        this.showConfirmDialog = true;
    }
    // 执行去重
    private executeDeduplicate() {
        if (!this.deduplicationManager)
            return;
        const deletedCount = this.deduplicationManager.executeDeduplicate();
        this.showConfirmDialog = false;
        if (deletedCount > 0) {
            this.showToast(`成功删除 ${deletedCount} 个重复文件`, 'success');
            // 重新扫描以刷新结果
            this.startScan();
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
    private confirmDeleteOneFile() {
        if (!this.deduplicationManager || !this.pendingDeleteFile)
            return;
        const success = this.deduplicationManager.deleteFile(this.pendingDeleteFile.path);
        this.showConfirmDialog = false;
        if (success) {
            this.showToast(`已删除: ${this.pendingDeleteFile.filename}`, 'success');
            // 重新扫描以刷新结果
            this.startScan();
        }
        else {
            this.showToast('删除失败', 'error');
        }
        this.pendingDeleteFile = null;
    }
    // 显示提示消息
    private showToast(message: string, type: 'success' | 'error' | 'info') {
        this.messageText = message;
        this.messageType = type;
        this.showMessage = true;
        setTimeout(() => {
            this.showMessage = false;
        }, 3000);
    }
    // 获取消息背景色
    private getMessageColor(): string {
        switch (this.messageType) {
            case 'success': return '#34C759';
            case 'error': return '#FF3B30';
            case 'info': return '#007AFF';
        }
    }
    // 获取保留文件数和删除文件数
    private getDeduplicateStats(): DeduplicateStats {
        let keep = 0;
        let del = 0;
        let saveSpace = 0;
        for (const group of this.duplicateGroups) {
            for (const file of group.files) {
                if (file.selected) {
                    keep++;
                }
                else {
                    del++;
                    saveSpace += file.size;
                }
            }
        }
        const result: DeduplicateStats = {
            keep: keep,
            deleteCount: del,
            saveSpace: saveSpace
        };
        return result;
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
            // === 顶部标题栏 ===
            Row.create();
            // === 顶部标题栏 ===
            Row.width('100%');
            // === 顶部标题栏 ===
            Row.padding({ left: 16, right: 16, top: 12, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('📁 文件去重');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        // === 顶部标题栏 ===
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 消息提示 ===
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
            // === 导入测试数据区域 ===
            Column.create();
            // === 导入测试数据区域 ===
            Column.width('100%');
            // === 导入测试数据区域 ===
            Column.padding(16);
            // === 导入测试数据区域 ===
            Column.backgroundColor('#FFFFFF');
            // === 导入测试数据区域 ===
            Column.borderRadius(12);
            // === 导入测试数据区域 ===
            Column.margin({ left: 12, right: 12, top: 8, bottom: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('📥 导入测试数据');
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#333333');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.testFolderFileCount > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`已导入 ${this.testFolderFileCount} 个文件`);
                        Text.fontSize(12);
                        Text.fontColor('#34C759');
                        Text.padding({ left: 8, right: 8, top: 4, bottom: 4 });
                        Text.backgroundColor('#E8F5E9');
                        Text.borderRadius(10);
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
            Text.create('从设备选择测试文件导入到应用中，用于去重测试验证');
            Text.fontSize(13);
            Text.fontColor('#666666');
            Text.width('100%');
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isImporting ? '导入中...' : '选择文件导入');
            Button.layoutWeight(1);
            Button.height(40);
            Button.fontSize(14);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor(this.isImporting ? '#999999' : '#5856D6');
            Button.borderRadius(10);
            Button.enabled(!this.isImporting);
            Button.onClick(() => {
                this.importTestFiles();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.testFolderFileCount > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('清空');
                        Button.width(70);
                        Button.height(40);
                        Button.fontSize(14);
                        Button.fontColor('#FFFFFF');
                        Button.backgroundColor('#FF3B30');
                        Button.borderRadius(10);
                        Button.margin({ left: 10 });
                        Button.onClick(() => {
                            this.prepareClearTestFolder();
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
        Row.pop();
        // === 导入测试数据区域 ===
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // === 目录选择区域 ===
            Column.create();
            // === 目录选择区域 ===
            Column.width('100%');
            // === 目录选择区域 ===
            Column.padding(16);
            // === 目录选择区域 ===
            Column.backgroundColor('#FFFFFF');
            // === 目录选择区域 ===
            Column.borderRadius(12);
            // === 目录选择区域 ===
            Column.margin({ left: 12, right: 12, top: 8, bottom: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('选择扫描目录');
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#333333');
            Text.width('100%');
            Text.margin({ bottom: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.availableDirectories.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无可扫描目录');
                        Text.fontSize(14);
                        Text.fontColor('#999999');
                        Text.padding(20);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const dir = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.width('100%');
                                Row.padding({ top: 8, bottom: 8 });
                                Row.onClick(() => {
                                    this.toggleDirectorySelection(dir);
                                });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Checkbox.create();
                                Checkbox.select(dir.selected);
                                Checkbox.onChange((value: boolean) => {
                                    this.toggleDirectorySelection(dir);
                                });
                                Checkbox.margin({ right: 10 });
                            }, Checkbox);
                            Checkbox.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.alignItems(HorizontalAlign.Start);
                                Column.layoutWeight(1);
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(dir.name);
                                Text.fontSize(14);
                                Text.fontWeight(FontWeight.Medium);
                                Text.fontColor('#333333');
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(dir.path);
                                Text.fontSize(11);
                                Text.fontColor('#999999');
                                Text.maxLines(1);
                                Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                            }, Text);
                            Text.pop();
                            Column.pop();
                            Row.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.availableDirectories, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 扫描按钮
            Button.createWithLabel(this.isScanning ? '扫描中...' : '开始扫描');
            // 扫描按钮
            Button.width('100%');
            // 扫描按钮
            Button.height(44);
            // 扫描按钮
            Button.fontSize(16);
            // 扫描按钮
            Button.fontColor('#FFFFFF');
            // 扫描按钮
            Button.backgroundColor(this.isScanning ? '#999999' : '#007AFF');
            // 扫描按钮
            Button.borderRadius(10);
            // 扫描按钮
            Button.margin({ top: 12 });
            // 扫描按钮
            Button.enabled(!this.isScanning);
            // 扫描按钮
            Button.onClick(() => {
                this.startScan();
            });
        }, Button);
        // 扫描按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isScanning) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.scanProgress);
                        Text.fontSize(13);
                        Text.fontColor('#666666');
                        Text.margin({ top: 8 });
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
        // === 目录选择区域 ===
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 扫描结果统计 ===
            if (this.hasScanned && this.scanResult) {
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
                    this.StatCard.bind(this)('总文件', `${this.scanResult.totalFiles}`, '#007AFF');
                    this.StatCard.bind(this)('重复组', `${this.scanResult.duplicateGroups}`, '#FF9500');
                    this.StatCard.bind(this)('可节省', this.scanResult.savableSpaceReadable, '#34C759');
                    Row.pop();
                    Column.pop();
                });
            }
            // === 重复文件组列表 ===
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 重复文件组列表 ===
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
                        Button.onClick(() => {
                            this.prepareAutoDeduplicate();
                        });
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
                                // 组头部
                                Row.create();
                                // 组头部
                                Row.width('100%');
                                // 组头部
                                Row.padding(12);
                                // 组头部
                                Row.onClick(() => {
                                    this.toggleGroupExpanded(group);
                                });
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
                            // 组头部
                            Row.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                // 文件列表（展开时显示）
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
                                                    Checkbox.onChange(() => {
                                                        this.toggleFileSelection(group, file);
                                                    });
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
                                                                Button.onClick(() => {
                                                                    this.deleteOneFile(file);
                                                                });
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
            // === 无重复文件提示 ===
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 无重复文件提示 ===
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
            // === 确认对话框 ===
            if (this.showConfirmDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.width('100%');
                        Stack.height('100%');
                    }, Stack);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 背景遮罩
                        Column.create();
                        // 背景遮罩
                        Column.width('100%');
                        // 背景遮罩
                        Column.height('100%');
                        // 背景遮罩
                        Column.backgroundColor('rgba(0, 0, 0, 0.5)');
                        // 背景遮罩
                        Column.onClick(() => {
                            this.showConfirmDialog = false;
                        });
                    }, Column);
                    // 背景遮罩
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 对话框内容
                        Column.create();
                        // 对话框内容
                        Column.width('85%');
                        // 对话框内容
                        Column.padding(24);
                        // 对话框内容
                        Column.backgroundColor('#FFFFFF');
                        // 对话框内容
                        Column.borderRadius(16);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.confirmAction === 'deduplicate' ? '确认一键去重' :
                            this.confirmAction === 'clearTest' ? '确认清空测试数据' : '确认删除');
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
                                    Text.create(`即将删除 ${this.getDeduplicateStats().deleteCount} 个重复文件`);
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
                                    Text.create(`可节省空间: ${this.scanResult?.savableSpaceReadable || '0 B'}`);
                                    Text.fontSize(14);
                                    Text.fontColor('#34C759');
                                    Text.margin({ top: 8 });
                                }, Text);
                                Text.pop();
                                Column.pop();
                            });
                        }
                        else if (this.confirmAction === 'clearTest') {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`确定清空测试文件夹中的 ${this.testFolderFileCount} 个文件吗？`);
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
                                    Text.create(`确定删除文件 "${this.pendingDeleteFile.filename}" 吗？`);
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
                        Text.create('⚠️ 此操作不可恢复！');
                        Text.fontSize(13);
                        Text.fontColor('#FF3B30');
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
                        Button.onClick(() => {
                            this.showConfirmDialog = false;
                            this.pendingDeleteFile = null;
                        });
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
                        Button.onClick(() => {
                            if (this.confirmAction === 'deduplicate') {
                                this.executeDeduplicate();
                            }
                            else if (this.confirmAction === 'clearTest') {
                                this.executeClearTestFolder();
                            }
                            else {
                                this.confirmDeleteOneFile();
                            }
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    // 对话框内容
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
