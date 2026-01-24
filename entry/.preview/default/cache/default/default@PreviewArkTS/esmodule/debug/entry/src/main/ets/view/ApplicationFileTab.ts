if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ApplicationFileTab_Params {
    content?: string;
    fileName?: string;
    statusText?: string;
    statusType?: string;
    isProcessing?: boolean;
}
import { writeFile } from "@bundle:com.example.filesmanger/entry/ets/common/utils/WriteFile";
import type common from "@ohos:app.ability.common";
import type { BusinessError } from "@ohos:base";
import fs from "@ohos:file.fs";
import picker from "@ohos:file.picker";
export class ApplicationFileTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__content = new ObservedPropertySimplePU('', this, "content");
        this.__fileName = new ObservedPropertySimplePU('', this, "fileName");
        this.__statusText = new ObservedPropertySimplePU('', this, "statusText");
        this.__statusType = new ObservedPropertySimplePU('info', this, "statusType");
        this.__isProcessing = new ObservedPropertySimplePU(false, this, "isProcessing");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ApplicationFileTab_Params) {
        if (params.content !== undefined) {
            this.content = params.content;
        }
        if (params.fileName !== undefined) {
            this.fileName = params.fileName;
        }
        if (params.statusText !== undefined) {
            this.statusText = params.statusText;
        }
        if (params.statusType !== undefined) {
            this.statusType = params.statusType;
        }
        if (params.isProcessing !== undefined) {
            this.isProcessing = params.isProcessing;
        }
    }
    updateStateVars(params: ApplicationFileTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__content.purgeDependencyOnElmtId(rmElmtId);
        this.__fileName.purgeDependencyOnElmtId(rmElmtId);
        this.__statusText.purgeDependencyOnElmtId(rmElmtId);
        this.__statusType.purgeDependencyOnElmtId(rmElmtId);
        this.__isProcessing.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__content.aboutToBeDeleted();
        this.__fileName.aboutToBeDeleted();
        this.__statusText.aboutToBeDeleted();
        this.__statusType.aboutToBeDeleted();
        this.__isProcessing.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __content: ObservedPropertySimplePU<string>;
    get content() {
        return this.__content.get();
    }
    set content(newValue: string) {
        this.__content.set(newValue);
    }
    private __fileName: ObservedPropertySimplePU<string>;
    get fileName() {
        return this.__fileName.get();
    }
    set fileName(newValue: string) {
        this.__fileName.set(newValue);
    }
    private __statusText: ObservedPropertySimplePU<string>;
    get statusText() {
        return this.__statusText.get();
    }
    set statusText(newValue: string) {
        this.__statusText.set(newValue);
    }
    private __statusType: ObservedPropertySimplePU<string>; // info, success, error
    get statusType() {
        return this.__statusType.get();
    }
    set statusType(newValue: string) {
        this.__statusType.set(newValue);
    }
    private __isProcessing: ObservedPropertySimplePU<boolean>;
    get isProcessing() {
        return this.__isProcessing.get();
    }
    set isProcessing(newValue: boolean) {
        this.__isProcessing.set(newValue);
    }
    private async copyAllRawFilesToSandbox(): Promise<void> {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        this.statusText = '正在导入...';
        this.statusType = 'info';
        try {
            const context = getContext(this) as common.UIAbilityContext;
            const rawFileList = await context.resourceManager.getRawFileList("");
            if (rawFileList.length === 0) {
                this.statusText = '资源目录为空';
                this.statusType = 'error';
                this.isProcessing = false;
                return;
            }
            let success = 0;
            for (const fileName of rawFileList) {
                try {
                    const content = context.resourceManager.getRawFileContentSync(fileName);
                    const targetPath = `${context.filesDir}/${fileName}`;
                    const file = fs.openSync(targetPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.TRUNC);
                    fs.writeSync(file.fd, content.buffer as ArrayBuffer);
                    fs.closeSync(file);
                    success++;
                }
                catch (e) {
                    console.error("FileTab", `拷贝 ${fileName} 失败`);
                }
            }
            this.statusText = `导入完成：${success}/${rawFileList.length} 个文件`;
            this.statusType = 'success';
        }
        catch (error) {
            this.statusText = `导入失败：${(error as BusinessError).message}`;
            this.statusType = 'error';
        }
        finally {
            this.isProcessing = false;
        }
    }
    private async importWithPicker(): Promise<void> {
        if (this.isProcessing)
            return;
        try {
            const context = getContext(this) as common.UIAbilityContext;
            const documentPicker = new picker.DocumentViewPicker(context);
            const options = new picker.DocumentSelectOptions();
            options.maxSelectNumber = 20;
            const uris = await documentPicker.select(options);
            if (uris.length === 0) {
                this.statusText = '未选择文件';
                this.statusType = 'info';
                return;
            }
            this.isProcessing = true;
            this.statusText = '正在导入...';
            this.statusType = 'info';
            let success = 0;
            for (const uri of uris) {
                try {
                    const parts = uri.split('/');
                    const fileName = parts[parts.length - 1];
                    const srcFile = fs.openSync(uri, fs.OpenMode.READ_ONLY);
                    const stat = fs.statSync(srcFile.fd);
                    const buffer = new ArrayBuffer(stat.size);
                    fs.readSync(srcFile.fd, buffer);
                    fs.closeSync(srcFile);
                    const dstPath = `${context.filesDir}/${fileName}`;
                    const dstFile = fs.openSync(dstPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.TRUNC);
                    fs.writeSync(dstFile.fd, buffer);
                    fs.closeSync(dstFile);
                    success++;
                }
                catch (e) {
                    console.error("FileTab", "导入文件失败:", e);
                }
            }
            this.statusText = `导入完成：${success}/${uris.length} 个文件`;
            this.statusType = 'success';
        }
        catch (error) {
            this.statusText = `选择失败`;
            this.statusType = 'error';
        }
        finally {
            this.isProcessing = false;
        }
    }
    private createFile(): void {
        const name = this.fileName.trim();
        const text = this.content.trim();
        if (name.length === 0) {
            this.statusText = '请输入文件名';
            this.statusType = 'error';
            return;
        }
        if (text.length === 0) {
            this.statusText = '请输入文件内容';
            this.statusType = 'error';
            return;
        }
        // 自动添加 .txt 扩展名
        const finalName = name.includes('.') ? name : `${name}.txt`;
        try {
            writeFile(text, finalName);
            this.statusText = `文件 "${finalName}" 创建成功`;
            this.statusType = 'success';
            this.content = '';
            this.fileName = '';
        }
        catch (e) {
            this.statusText = '创建失败';
            this.statusType = 'error';
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(143:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题
            Text.create('文件导入');
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(145:7)", "entry");
            // 标题
            Text.fontSize(20);
            // 标题
            Text.fontWeight(FontWeight.Bold);
            // 标题
            Text.fontColor('#333333');
            // 标题
            Text.width('100%');
            // 标题
            Text.padding({ left: 20, top: 16, bottom: 12 });
        }, Text);
        // 标题
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 导入卡片
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(153:7)", "entry");
            // 导入卡片
            Column.width('100%');
            // 导入卡片
            Column.padding(16);
            // 导入卡片
            Column.margin({ left: 16, right: 16 });
            // 导入卡片
            Column.backgroundColor(Color.White);
            // 导入卡片
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 12 });
            Row.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(154:9)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 资源导入
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(156:11)", "entry");
            // 资源导入
            Column.layoutWeight(1);
            // 资源导入
            Column.height(90);
            // 资源导入
            Column.backgroundColor('#E8F5E9');
            // 资源导入
            Column.borderRadius(12);
            // 资源导入
            Column.justifyContent(FlexAlign.Center);
            // 资源导入
            Column.onClick(() => this.copyAllRawFilesToSandbox());
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('📦');
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(157:13)", "entry");
            Text.fontSize(28);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('资源导入');
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(159:13)", "entry");
            Text.fontSize(13);
            Text.fontColor('#333333');
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('从应用资源');
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(163:13)", "entry");
            Text.fontSize(10);
            Text.fontColor('#8E8E93');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        // 资源导入
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 文件选择
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(176:11)", "entry");
            // 文件选择
            Column.layoutWeight(1);
            // 文件选择
            Column.height(90);
            // 文件选择
            Column.backgroundColor('#E3F2FD');
            // 文件选择
            Column.borderRadius(12);
            // 文件选择
            Column.justifyContent(FlexAlign.Center);
            // 文件选择
            Column.onClick(() => this.importWithPicker());
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('📁');
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(177:13)", "entry");
            Text.fontSize(28);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('选择文件');
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(179:13)", "entry");
            Text.fontSize(13);
            Text.fontColor('#333333');
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('从设备存储');
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(183:13)", "entry");
            Text.fontSize(10);
            Text.fontColor('#8E8E93');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        // 文件选择
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 状态提示
            if (this.statusText.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(199:11)", "entry");
                        Row.width('100%');
                        Row.margin({ top: 12 });
                        Row.justifyContent(FlexAlign.Center);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.statusType === 'success' ? '✓' : (this.statusType === 'error' ? '✗' : 'ℹ'));
                        Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(200:13)", "entry");
                        Text.fontSize(14);
                        Text.fontColor(this.statusType === 'success' ? '#34C759' :
                            (this.statusType === 'error' ? '#FF3B30' : '#007AFF'));
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.statusText);
                        Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(206:13)", "entry");
                        Text.fontSize(13);
                        Text.fontColor('#666666');
                        Text.margin({ left: 6 });
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
        // 导入卡片
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 创建文件标题
            Text.create('创建新文件');
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(223:7)", "entry");
            // 创建文件标题
            Text.fontSize(20);
            // 创建文件标题
            Text.fontWeight(FontWeight.Bold);
            // 创建文件标题
            Text.fontColor('#333333');
            // 创建文件标题
            Text.width('100%');
            // 创建文件标题
            Text.padding({ left: 20, top: 24, bottom: 12 });
        }, Text);
        // 创建文件标题
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 创建文件卡片
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(231:7)", "entry");
            // 创建文件卡片
            Column.width('100%');
            // 创建文件卡片
            Column.padding(16);
            // 创建文件卡片
            Column.margin({ left: 16, right: 16 });
            // 创建文件卡片
            Column.backgroundColor(Color.White);
            // 创建文件卡片
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 文件名输入
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(233:9)", "entry");
            // 文件名输入
            Column.width('100%');
            // 文件名输入
            Column.margin({ bottom: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('文件名');
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(234:11)", "entry");
            Text.fontSize(13);
            Text.fontColor('#8E8E93');
            Text.width('100%');
            Text.margin({ bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '例如：笔记、会议记录', text: this.fileName });
            TextInput.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(240:11)", "entry");
            TextInput.width('100%');
            TextInput.height(44);
            TextInput.backgroundColor('#F5F5F5');
            TextInput.borderRadius(10);
            TextInput.padding({ left: 12, right: 12 });
            TextInput.onChange((value: string) => {
                this.fileName = value;
            });
        }, TextInput);
        // 文件名输入
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 内容输入
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(254:9)", "entry");
            // 内容输入
            Column.width('100%');
            // 内容输入
            Column.margin({ bottom: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('文件内容');
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(255:11)", "entry");
            Text.fontSize(13);
            Text.fontColor('#8E8E93');
            Text.width('100%');
            Text.margin({ bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextArea.create({ placeholder: '在此输入文件内容...', text: this.content });
            TextArea.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(261:11)", "entry");
            TextArea.width('100%');
            TextArea.height(120);
            TextArea.backgroundColor('#F5F5F5');
            TextArea.borderRadius(10);
            TextArea.padding(12);
            TextArea.onChange((value: string) => {
                this.content = value;
            });
        }, TextArea);
        // 内容输入
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 创建按钮
            Button.createWithLabel('创建文件');
            Button.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(275:9)", "entry");
            // 创建按钮
            Button.width('100%');
            // 创建按钮
            Button.height(46);
            // 创建按钮
            Button.fontSize(16);
            // 创建按钮
            Button.fontWeight(FontWeight.Medium);
            // 创建按钮
            Button.backgroundColor('#007AFF');
            // 创建按钮
            Button.fontColor(Color.White);
            // 创建按钮
            Button.borderRadius(10);
            // 创建按钮
            Button.onClick(() => this.createFile());
        }, Button);
        // 创建按钮
        Button.pop();
        // 创建文件卡片
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
