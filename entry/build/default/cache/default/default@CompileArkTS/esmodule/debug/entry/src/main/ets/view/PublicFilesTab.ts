if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface publicFilesTab_Params {
    fileList?: Array<FileInfo>;
    searchKeyword?: string;
    selectedFile?: string;
    fileContent?: string;
    showFileContent?: boolean;
    newFileName?: string;
    fileManager?: FileManager | null;
    showSaveSuccess?: boolean;
    saveMessage?: string;
    showFileActionMenu?: boolean;
    selectedFileForMenu?: string;
    renamingFile?: string;
    newFilename?: string;
    showRenameDialog?: boolean;
    showFileActionPanel?: boolean;
    selectedFileForPanel?: string;
}
import { FileManager } from "@bundle:com.example.filesmanger/entry/ets/common/utils/FileManager";
import fileIo from "@ohos:file.fs";
import type { FileInfo } from "@bundle:com.example.filesmanger/entry/ets/common/utils/FileManager";
import { readFile } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ReadFile";
import { deleteFile, initDeleteUtils } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DeleteFile";
export class publicFilesTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__fileList = new ObservedPropertyObjectPU([], this, "fileList");
        this.__searchKeyword = new ObservedPropertySimplePU('', this, "searchKeyword");
        this.__selectedFile = new ObservedPropertySimplePU('', this, "selectedFile");
        this.__fileContent = new ObservedPropertySimplePU('', this, "fileContent");
        this.__showFileContent = new ObservedPropertySimplePU(false, this, "showFileContent");
        this.__newFileName = new ObservedPropertySimplePU('', this, "newFileName");
        this.__fileManager = new ObservedPropertyObjectPU(null, this, "fileManager");
        this.__showSaveSuccess = new ObservedPropertySimplePU(false, this, "showSaveSuccess");
        this.__saveMessage = new ObservedPropertySimplePU('', this, "saveMessage");
        this.__showFileActionMenu = new ObservedPropertySimplePU(false, this, "showFileActionMenu");
        this.__selectedFileForMenu = new ObservedPropertySimplePU('', this, "selectedFileForMenu");
        this.__renamingFile = new ObservedPropertySimplePU('', this, "renamingFile");
        this.__newFilename = new ObservedPropertySimplePU('', this, "newFilename");
        this.__showRenameDialog = new ObservedPropertySimplePU(false, this, "showRenameDialog");
        this.__showFileActionPanel = new ObservedPropertySimplePU(false, this, "showFileActionPanel");
        this.__selectedFileForPanel = new ObservedPropertySimplePU('', this, "selectedFileForPanel");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: publicFilesTab_Params) {
        if (params.fileList !== undefined) {
            this.fileList = params.fileList;
        }
        if (params.searchKeyword !== undefined) {
            this.searchKeyword = params.searchKeyword;
        }
        if (params.selectedFile !== undefined) {
            this.selectedFile = params.selectedFile;
        }
        if (params.fileContent !== undefined) {
            this.fileContent = params.fileContent;
        }
        if (params.showFileContent !== undefined) {
            this.showFileContent = params.showFileContent;
        }
        if (params.newFileName !== undefined) {
            this.newFileName = params.newFileName;
        }
        if (params.fileManager !== undefined) {
            this.fileManager = params.fileManager;
        }
        if (params.showSaveSuccess !== undefined) {
            this.showSaveSuccess = params.showSaveSuccess;
        }
        if (params.saveMessage !== undefined) {
            this.saveMessage = params.saveMessage;
        }
        if (params.showFileActionMenu !== undefined) {
            this.showFileActionMenu = params.showFileActionMenu;
        }
        if (params.selectedFileForMenu !== undefined) {
            this.selectedFileForMenu = params.selectedFileForMenu;
        }
        if (params.renamingFile !== undefined) {
            this.renamingFile = params.renamingFile;
        }
        if (params.newFilename !== undefined) {
            this.newFilename = params.newFilename;
        }
        if (params.showRenameDialog !== undefined) {
            this.showRenameDialog = params.showRenameDialog;
        }
        if (params.showFileActionPanel !== undefined) {
            this.showFileActionPanel = params.showFileActionPanel;
        }
        if (params.selectedFileForPanel !== undefined) {
            this.selectedFileForPanel = params.selectedFileForPanel;
        }
    }
    updateStateVars(params: publicFilesTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__fileList.purgeDependencyOnElmtId(rmElmtId);
        this.__searchKeyword.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedFile.purgeDependencyOnElmtId(rmElmtId);
        this.__fileContent.purgeDependencyOnElmtId(rmElmtId);
        this.__showFileContent.purgeDependencyOnElmtId(rmElmtId);
        this.__newFileName.purgeDependencyOnElmtId(rmElmtId);
        this.__fileManager.purgeDependencyOnElmtId(rmElmtId);
        this.__showSaveSuccess.purgeDependencyOnElmtId(rmElmtId);
        this.__saveMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__showFileActionMenu.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedFileForMenu.purgeDependencyOnElmtId(rmElmtId);
        this.__renamingFile.purgeDependencyOnElmtId(rmElmtId);
        this.__newFilename.purgeDependencyOnElmtId(rmElmtId);
        this.__showRenameDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__showFileActionPanel.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedFileForPanel.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__fileList.aboutToBeDeleted();
        this.__searchKeyword.aboutToBeDeleted();
        this.__selectedFile.aboutToBeDeleted();
        this.__fileContent.aboutToBeDeleted();
        this.__showFileContent.aboutToBeDeleted();
        this.__newFileName.aboutToBeDeleted();
        this.__fileManager.aboutToBeDeleted();
        this.__showSaveSuccess.aboutToBeDeleted();
        this.__saveMessage.aboutToBeDeleted();
        this.__showFileActionMenu.aboutToBeDeleted();
        this.__selectedFileForMenu.aboutToBeDeleted();
        this.__renamingFile.aboutToBeDeleted();
        this.__newFilename.aboutToBeDeleted();
        this.__showRenameDialog.aboutToBeDeleted();
        this.__showFileActionPanel.aboutToBeDeleted();
        this.__selectedFileForPanel.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    // 新增状态变量
    private __fileList: ObservedPropertyObjectPU<Array<FileInfo>>; // 文件列表
    get fileList() {
        return this.__fileList.get();
    }
    set fileList(newValue: Array<FileInfo>) {
        this.__fileList.set(newValue);
    }
    private __searchKeyword: ObservedPropertySimplePU<string>; // 搜索关键字
    get searchKeyword() {
        return this.__searchKeyword.get();
    }
    set searchKeyword(newValue: string) {
        this.__searchKeyword.set(newValue);
    }
    private __selectedFile: ObservedPropertySimplePU<string>; // 当前选中的文件
    get selectedFile() {
        return this.__selectedFile.get();
    }
    set selectedFile(newValue: string) {
        this.__selectedFile.set(newValue);
    }
    private __fileContent: ObservedPropertySimplePU<string>; // 文件内容
    get fileContent() {
        return this.__fileContent.get();
    }
    set fileContent(newValue: string) {
        this.__fileContent.set(newValue);
    }
    private __showFileContent: ObservedPropertySimplePU<boolean>; // 是否显示文件内容
    get showFileContent() {
        return this.__showFileContent.get();
    }
    set showFileContent(newValue: boolean) {
        this.__showFileContent.set(newValue);
    }
    private __newFileName: ObservedPropertySimplePU<string>; // 新文件名
    get newFileName() {
        return this.__newFileName.get();
    }
    set newFileName(newValue: string) {
        this.__newFileName.set(newValue);
    }
    private __fileManager: ObservedPropertyObjectPU<FileManager | null>; // 文件管理器实例
    get fileManager() {
        return this.__fileManager.get();
    }
    set fileManager(newValue: FileManager | null) {
        this.__fileManager.set(newValue);
    }
    // 删除的状态变量
    private __showSaveSuccess: ObservedPropertySimplePU<boolean>;
    get showSaveSuccess() {
        return this.__showSaveSuccess.get();
    }
    set showSaveSuccess(newValue: boolean) {
        this.__showSaveSuccess.set(newValue);
    }
    private __saveMessage: ObservedPropertySimplePU<string>;
    get saveMessage() {
        return this.__saveMessage.get();
    }
    set saveMessage(newValue: string) {
        this.__saveMessage.set(newValue);
    }
    // 文件操作菜单相关状态
    private __showFileActionMenu: ObservedPropertySimplePU<boolean>;
    get showFileActionMenu() {
        return this.__showFileActionMenu.get();
    }
    set showFileActionMenu(newValue: boolean) {
        this.__showFileActionMenu.set(newValue);
    }
    private __selectedFileForMenu: ObservedPropertySimplePU<string>;
    get selectedFileForMenu() {
        return this.__selectedFileForMenu.get();
    }
    set selectedFileForMenu(newValue: string) {
        this.__selectedFileForMenu.set(newValue);
    }
    // 重命名状态
    private __renamingFile: ObservedPropertySimplePU<string>;
    get renamingFile() {
        return this.__renamingFile.get();
    }
    set renamingFile(newValue: string) {
        this.__renamingFile.set(newValue);
    }
    private __newFilename: ObservedPropertySimplePU<string>;
    get newFilename() {
        return this.__newFilename.get();
    }
    set newFilename(newValue: string) {
        this.__newFilename.set(newValue);
    }
    private __showRenameDialog: ObservedPropertySimplePU<boolean>;
    get showRenameDialog() {
        return this.__showRenameDialog.get();
    }
    set showRenameDialog(newValue: boolean) {
        this.__showRenameDialog.set(newValue);
    }
    // 文件操作面板状态
    private __showFileActionPanel: ObservedPropertySimplePU<boolean>;
    get showFileActionPanel() {
        return this.__showFileActionPanel.get();
    }
    set showFileActionPanel(newValue: boolean) {
        this.__showFileActionPanel.set(newValue);
    }
    private __selectedFileForPanel: ObservedPropertySimplePU<string>;
    get selectedFileForPanel() {
        return this.__selectedFileForPanel.get();
    }
    set selectedFileForPanel(newValue: string) {
        this.__selectedFileForPanel.set(newValue);
    }
    aboutToAppear() {
        let context = this.getUIContext().getHostContext() as Context;
        this.fileManager = new FileManager(context);
        initDeleteUtils(context);
        // this.searchFilesWithInfo();
        this.loadFileListWithInfo();
    }
    onPageShow() {
        console.log('页面显示，刷新文件列表');
        this.searchFilesWithInfo();
    }
    // 加载文件列表（包含详细信息）
    async loadFileListWithInfo() {
        console.log('加载文件列表（带详细信息）...');
        if (this.fileManager) {
            try {
                const files = await this.fileManager.getAllFilesWithInfo();
                console.log('获取到的文件数量:', files.length);
                this.fileList = files;
                if (files.length > 0) {
                    console.log('示例文件信息:', {
                        filename: files[0].filename,
                        size: files[0].sizeReadable,
                        ctime: files[0].ctimeFormatted
                    });
                }
            }
            catch (error) {
                console.error('加载文件列表失败:', error);
                this.fileList = [];
            }
        }
    }
    // 搜索文件（带详细信息）
    async searchFilesWithInfo() {
        console.log('搜索文件:', this.searchKeyword);
        if (this.fileManager) {
            if (this.searchKeyword.trim() === '') {
                await this.loadFileListWithInfo();
            }
            else {
                const files = await this.fileManager.searchFilesWithInfo(this.searchKeyword);
                this.fileList = files;
                console.log('搜索结果:', files.length, '个文件');
            }
        }
    }
    // 执行删除文件的方法
    private async executeDeleteFile(filename: string) {
        console.log(`执行删除文件: ${filename}`);
        const success = deleteFile(filename);
        if (success) {
            console.log(`文件 ${filename} 删除成功`);
            await this.loadFileListWithInfo();
            if (this.selectedFile === filename) {
                this.selectedFile = '';
                this.fileContent = '';
                this.showFileContent = false;
            }
            this.saveMessage = `文件 "${filename}" 已删除`;
            this.showSaveSuccess = true;
            setTimeout(() => {
                this.showSaveSuccess = false;
            }, 3000);
        }
        else {
            console.log(`文件 ${filename} 删除失败`);
            this.saveMessage = `删除文件失败`;
            this.showSaveSuccess = true;
            setTimeout(() => {
                this.showSaveSuccess = false;
            }, 3000);
        }
    }
    // 打开文件操作面板
    private openFileActionPanel(filename: string) {
        this.selectedFileForPanel = filename;
        this.showFileActionPanel = true;
    }
    // 关闭文件操作面板
    private closeFileActionPanel() {
        this.showFileActionPanel = false;
        this.selectedFileForPanel = '';
    }
    // 查看文件内容
    private async viewFileContent(filename: string) {
        if (this.fileManager) {
            try {
                const content = readFile(filename);
                console.log(`文件内容:${content}`);
                this.selectedFile = filename;
                this.fileContent = content;
                this.showFileContent = true;
            }
            catch (error) {
                console.error(`读取文件失败: ${error}`);
                this.saveMessage = `读取文件失败: ${error}`;
                this.showSaveSuccess = true;
                setTimeout(() => {
                    this.showSaveSuccess = false;
                }, 3000);
            }
        }
    }
    // private async updateFileContent() {
    //   if (!this.fileManager || !this.selectedFile) {
    //     console.error('更新文件内容参数不完整');
    //     return;
    //   }
    //
    //   try {
    //     // 直接调用 FileManager 的 updateFile 方法
    //     const success = await this.fileManager.updateFile(this.selectedFile, this.fileContent);
    //
    //     if (success) {
    //       console.log(`文件内容更新成功: ${this.selectedFile}`);
    //
    //       // 显示成功提示
    //       this.saveMessage = '文件内容已保存';
    //       this.showSaveSuccess = true;
    //       setTimeout(() => {
    //         this.showSaveSuccess = false;
    //       }, 2000);
    //
    //       // 关闭文件内容界面
    //       setTimeout(() => {
    //         this.showFileContent = false;
    //       }, 1000);
    //
    //       // 刷新文件列表（因为文件大小可能已改变）
    //       await this.loadFileListWithInfo();
    //     } else {
    //       console.error('更新文件内容失败');
    //       this.saveMessage = '保存失败，请重试';
    //       this.showSaveSuccess = true;
    //       setTimeout(() => {
    //         this.showSaveSuccess = false;
    //       }, 3000);
    //     }
    //   } catch (error) {
    //     console.error(`更新文件内容过程中发生错误: ${error}`);
    //     this.saveMessage = `保存失败: ${error}`;
    //     this.showSaveSuccess = true;
    //     setTimeout(() => {
    //       this.showSaveSuccess = false;
    //     }, 3000);
    //   }
    // }
    private async updateFileContent() {
        if (!this.selectedFile || !this.fileContent) {
            console.error('更新文件内容参数不完整');
            return;
        }
        try {
            console.log(`开始更新文件内容: ${this.selectedFile}`);
            // 获取文件路径
            const context = this.getUIContext().getHostContext() as Context;
            const filesDir = context.filesDir;
            const filePath = filesDir + '/' + this.selectedFile;
            console.log(`更新文件路径: ${filePath}`);
            // 创建文件流并写入内容
            let fileStream = fileIo.createStreamSync(filePath, "w+");
            fileStream.writeSync(this.fileContent);
            fileStream.close();
            console.log(`文件内容更新成功: ${this.selectedFile}`);
            console.log(`写入的内容长度: ${this.fileContent.length}`);
            // 显示成功提示
            this.saveMessage = '文件内容已保存';
            this.showSaveSuccess = true;
            // 关闭文件内容界面
            setTimeout(() => {
                this.showFileContent = false;
            }, 1000);
            // 刷新文件列表（因为文件大小可能已改变）
            await this.loadFileListWithInfo();
            // 3秒后隐藏成功提示
            setTimeout(() => {
                this.showSaveSuccess = false;
            }, 3000);
        }
        catch (error) {
            console.error(`更新文件内容失败: ${error}`);
            this.saveMessage = `保存失败: ${error.message || error}`;
            this.showSaveSuccess = true;
            setTimeout(() => {
                this.showSaveSuccess = false;
            }, 3000);
        }
    }
    // 打开重命名对话框
    private openRenameDialog(filename: string) {
        this.renamingFile = filename;
        this.newFilename = filename;
        this.showRenameDialog = true;
    }
    // 关闭重命名对话框
    private closeRenameDialog() {
        this.showRenameDialog = false;
        this.renamingFile = '';
        this.newFilename = '';
    }
    // 执行重命名
    private async executeRename() {
        if (!this.fileManager || !this.renamingFile || !this.newFilename) {
            console.error('重命名参数不完整');
            return;
        }
        if (this.renamingFile === this.newFilename.trim()) {
            this.saveMessage = '文件名未改变';
            this.showSaveSuccess = true;
            setTimeout(() => {
                this.showSaveSuccess = false;
            }, 2000);
            this.closeRenameDialog();
            return;
        }
        if (this.newFilename.trim() === '') {
            this.saveMessage = '新文件名不能为空';
            this.showSaveSuccess = true;
            setTimeout(() => {
                this.showSaveSuccess = false;
            }, 2000);
            return;
        }
        try {
            console.log(`old name${this.renamingFile} new name${this.newFilename.trim()}`);
            const success = await this.fileManager.renameFile(this.renamingFile, this.newFilename.trim());
            if (success) {
                console.log(`重命名成功: ${this.renamingFile} -> ${this.newFilename}`);
                await this.loadFileListWithInfo();
                if (this.selectedFile === this.renamingFile) {
                    this.selectedFile = this.newFilename.trim();
                }
                this.saveMessage = `文件已重命名为 "${this.newFilename.trim()}"`;
                this.showSaveSuccess = true;
                setTimeout(() => {
                    this.showSaveSuccess = false;
                }, 3000);
                this.closeRenameDialog();
            }
            else {
                console.error('重命名失败');
                this.saveMessage = '重命名失败，请检查文件名是否合法或已存在';
                this.showSaveSuccess = true;
                setTimeout(() => {
                    this.showSaveSuccess = false;
                }, 3000);
            }
        }
        catch (error) {
            console.error(`重命名过程中发生错误: ${error}`);
            this.saveMessage = `重命名失败: ${error}`;
            this.showSaveSuccess = true;
            setTimeout(() => {
                this.showSaveSuccess = false;
            }, 3000);
        }
    }
    // 根据文件扩展名返回对应的图标
    private getFileIcon(filename: string): string {
        if (filename.endsWith('.txt'))
            return '📝';
        if (filename.endsWith('.pdf'))
            return '📕';
        if (filename.endsWith('.jpg') || filename.endsWith('.png') || filename.endsWith('.gif'))
            return '🖼️';
        if (filename.endsWith('.mp4') || filename.endsWith('.avi'))
            return '🎬';
        if (filename.endsWith('.mp3') || filename.endsWith('.wav'))
            return '🎵';
        if (filename.endsWith('.zip') || filename.endsWith('.rar'))
            return '🗜️';
        return '📄';
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // === 顶部搜索栏 ===
            Row.create();
            // === 顶部搜索栏 ===
            Row.padding({ left: 16, right: 16, top: 12, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '搜索文件...', text: this.searchKeyword });
            TextInput.onChange((value: string) => {
                this.searchKeyword = value;
                this.searchFilesWithInfo();
            });
            TextInput.layoutWeight(1);
            TextInput.height(40);
            TextInput.margin({ right: 10 });
            TextInput.padding({ left: 10, right: 10 });
            TextInput.backgroundColor(Color.White);
            TextInput.border({ width: 1, color: Color.Gray, radius: 8 });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('刷新');
            Button.onClick(() => {
                this.searchFilesWithInfo();
            });
            Button.height(40);
            Button.backgroundColor('#007AFF');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
        }, Button);
        Button.pop();
        // === 顶部搜索栏 ===
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 成功提示消息 ===
            if (this.showSaveSuccess) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.saveMessage);
                        Text.fontSize(14);
                        Text.fontColor('#FFFFFF');
                        Text.backgroundColor('#34C759');
                        Text.padding({ left: 16, right: 16, top: 8, bottom: 8 });
                        Text.borderRadius(8);
                        Text.margin({ bottom: 12 });
                    }, Text);
                    Text.pop();
                });
            }
            // === 文件列表 ===
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 文件列表 ===
            if (this.fileList.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.height(200);
                        Column.justifyContent(FlexAlign.Center);
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create("📁");
                        Text.fontSize(48);
                        Text.margin({ bottom: 10 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.searchKeyword ? '未找到相关文件' : '暂无文件');
                        Text.fontColor(Color.Gray);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 8 });
                        List.height('100%');
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const fileInfo = _item;
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
                                        Row.create();
                                        Row.padding({ left: 12, right: 12, top: 10, bottom: 10 });
                                        Row.backgroundColor(Color.White);
                                        Row.borderRadius(8);
                                        Row.border({ width: 1, color: '#F0F0F0' });
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(this.getFileIcon(fileInfo.filename));
                                        Text.fontSize(18);
                                        Text.margin({ right: 10 });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.layoutWeight(1);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(fileInfo.filename);
                                        Text.fontSize(15);
                                        Text.fontWeight(FontWeight.Medium);
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        Text.width('100%');
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(fileInfo.sizeReadable);
                                        Text.fontSize(11);
                                        Text.fontColor(Color.Gray);
                                        Text.margin({ right: 12 });
                                    }, Text);
                                    Text.pop();
                                    Row.pop();
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('查看');
                                        Button.onClick(() => {
                                            this.openFileActionPanel(fileInfo.filename);
                                        });
                                        Button.height(28);
                                        Button.fontSize(11);
                                        Button.margin({ right: 4 });
                                        Button.borderRadius(14);
                                        Button.backgroundColor('#007AFF');
                                        Button.fontColor(Color.White);
                                    }, Button);
                                    Button.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('删除');
                                        Button.onClick(() => {
                                            this.executeDeleteFile(fileInfo.filename);
                                        });
                                        Button.height(28);
                                        Button.fontSize(11);
                                        Button.borderRadius(14);
                                        Button.backgroundColor({ "id": 16777246, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                                        Button.fontColor(Color.White);
                                    }, Button);
                                    Button.pop();
                                    Row.pop();
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.fileList, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 文件操作面板（居中弹出）===
            if (this.showFileActionPanel) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.width('100%');
                        Stack.height('100%');
                        Stack.backgroundColor('rgba(0, 0, 0, 0.5)');
                        Stack.onClick(() => {
                            this.closeFileActionPanel();
                        });
                        Stack.position({ x: 0, y: 0 });
                    }, Stack);
                    Stack.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('85%');
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(20);
                        Column.shadow({ radius: 20, color: '#000000', offsetX: 0, offsetY: 0 });
                        Column.position({ x: '7.5%', y: '25%' });
                        Column.hitTestBehavior(HitTestMode.None);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding({ left: 20, right: 20, top: 15, bottom: 15 });
                        Row.border({ width: { bottom: 1 }, color: '#E0E0E0' });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件操作');
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
                            this.closeFileActionPanel();
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 12 });
                        Column.width('100%');
                        Column.padding(20);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件名:');
                        Text.fontSize(16);
                        Text.fontColor('#666666');
                        Text.width('30%');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.selectedFileForPanel);
                        Text.fontSize(16);
                        Text.fontColor('#007AFF');
                        Text.fontWeight(FontWeight.Bold);
                        Text.maxLines(1);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.width('70%');
                    }, Text);
                    Text.pop();
                    Row.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 15 });
                        Column.width('100%');
                        Column.padding({ left: 20, right: 20, bottom: 20 });
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('重命名');
                        Button.fontSize(18);
                        Button.width('90%');
                        Button.height(50);
                        Button.backgroundColor('#007AFF');
                        Button.fontColor('#FFFFFF');
                        Button.borderRadius(10);
                        Button.onClick(() => {
                            this.openRenameDialog(this.selectedFileForPanel);
                            this.closeFileActionPanel();
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('查看并修改内容');
                        Button.fontSize(18);
                        Button.width('90%');
                        Button.height(50);
                        Button.backgroundColor('#34C759');
                        Button.fontColor('#FFFFFF');
                        Button.borderRadius(10);
                        Button.onClick(() => {
                            this.viewFileContent(this.selectedFileForPanel);
                            this.closeFileActionPanel();
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.fontSize(18);
                        Button.width('90%');
                        Button.height(50);
                        Button.backgroundColor('#8E8E93');
                        Button.fontColor('#FFFFFF');
                        Button.borderRadius(10);
                        Button.onClick(() => {
                            this.closeFileActionPanel();
                        });
                    }, Button);
                    Button.pop();
                    Column.pop();
                    Column.pop();
                });
            }
            // === 重命名对话框 ===
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 重命名对话框 ===
            if (this.showRenameDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.width('100%');
                        Stack.height('100%');
                        Stack.backgroundColor('rgba(0, 0, 0, 0.5)');
                        Stack.onClick(() => {
                            this.closeRenameDialog();
                        });
                    }, Stack);
                    Stack.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('85%');
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(20);
                        Column.shadow({ radius: 20, color: '#000000', offsetX: 0, offsetY: 0 });
                        Column.position({ x: '7.5%', y: '30%' });
                        Column.hitTestBehavior(HitTestMode.None);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding({ left: 20, right: 20, top: 15, bottom: 15 });
                        Row.border({ width: { bottom: 1 }, color: '#E0E0E0' });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('重命名文件');
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
                            this.closeRenameDialog();
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 15 });
                        Column.width('100%');
                        Column.padding(20);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('原文件名:');
                        Text.fontSize(16);
                        Text.fontColor('#666666');
                        Text.width('30%');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.renamingFile);
                        Text.fontSize(16);
                        Text.fontColor('#333333');
                        Text.fontWeight(FontWeight.Medium);
                        Text.maxLines(1);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.width('70%');
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('新文件名:');
                        Text.fontSize(16);
                        Text.fontColor('#666666');
                        Text.width('30%');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({
                            placeholder: '输入新文件名',
                            text: this.newFilename
                        });
                        TextInput.onChange((value: string) => {
                            this.newFilename = value;
                        });
                        TextInput.width('70%');
                        TextInput.height(40);
                        TextInput.padding(10);
                        TextInput.border({ width: 1, color: Color.Gray, radius: 8 });
                    }, TextInput);
                    Row.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 15 });
                        Row.width('100%');
                        Row.padding({ left: 20, right: 20, bottom: 20 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.fontSize(16);
                        Button.width('45%');
                        Button.height(45);
                        Button.backgroundColor('#8E8E93');
                        Button.fontColor('#FFFFFF');
                        Button.borderRadius(10);
                        Button.onClick(() => {
                            this.closeRenameDialog();
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('确定');
                        Button.fontSize(16);
                        Button.width('45%');
                        Button.height(45);
                        Button.backgroundColor('#007AFF');
                        Button.fontColor('#FFFFFF');
                        Button.borderRadius(10);
                        Button.onClick(() => {
                            this.executeRename();
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                });
            }
            // === 文件内容查看/编辑界面 ===
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 文件内容查看/编辑界面 ===
            if (this.showFileContent && this.selectedFile) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.width('100%');
                        Stack.height('100%');
                        Stack.backgroundColor('rgba(0, 0, 0, 0.5)');
                        Stack.onClick(() => {
                            this.showFileContent = false;
                        });
                    }, Stack);
                    Stack.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('85%');
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(20);
                        Column.shadow({ radius: 20, color: '#000000', offsetX: 0, offsetY: 0 });
                        Column.position({ x: '7.5%', y: '15%' });
                        Column.hitTestBehavior(HitTestMode.None);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding({ left: 20, right: 20, top: 15, bottom: 15 });
                        Row.border({ width: { bottom: 1 }, color: '#E0E0E0' });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('编辑文件内容');
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
                            this.showFileContent = false;
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 15 });
                        Column.width('100%');
                        Column.padding(20);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件名:');
                        Text.fontSize(16);
                        Text.fontColor('#666666');
                        Text.width('20%');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.selectedFile);
                        Text.fontSize(16);
                        Text.fontColor('#007AFF');
                        Text.fontWeight(FontWeight.Medium);
                        Text.maxLines(1);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.width('80%');
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('文件内容:');
                        Text.fontSize(16);
                        Text.fontColor('#666666');
                        Text.width('100%');
                        Text.textAlign(TextAlign.Start);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextArea.create({ text: this.fileContent });
                        TextArea.onChange((value: string) => {
                            this.fileContent = value;
                        });
                        TextArea.width('100%');
                        TextArea.height(300);
                        TextArea.backgroundColor('#F8F8F8');
                        TextArea.padding(10);
                        TextArea.border({ width: 1, color: '#E0E0E0', radius: 8 });
                    }, TextArea);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 15 });
                        Row.width('100%');
                        Row.padding({ left: 20, right: 20, bottom: 20 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.fontSize(16);
                        Button.width('45%');
                        Button.height(45);
                        Button.backgroundColor('#8E8E93');
                        Button.fontColor('#FFFFFF');
                        Button.borderRadius(10);
                        Button.onClick(() => {
                            this.showFileContent = false;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('保存修改');
                        Button.fontSize(16);
                        Button.width('45%');
                        Button.height(45);
                        Button.backgroundColor('#34C759');
                        Button.fontColor('#FFFFFF');
                        Button.borderRadius(10);
                        Button.onClick(() => {
                            this.updateFileContent();
                        });
                    }, Button);
                    Button.pop();
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
