if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface TestDataTab_Params {
    fileCount?: string;
    minSize?: string;
    maxSize?: string;
    minDuplicateRate?: string;
    maxDuplicateRate?: string;
    isGenerating?: boolean;
    showMessage?: boolean;
    messageText?: string;
    messageType?: string;
    lastResult?: GeneratorResult | null;
    currentTestFileCount?: number;
    generator?: TestDataGenerator | null;
}
import { TestDataGenerator } from "@bundle:com.example.filesmanger/entry/ets/common/utils/TestDataGenerator";
import type { GeneratorConfig, GeneratorResult } from "@bundle:com.example.filesmanger/entry/ets/common/utils/TestDataGenerator";
export class TestDataTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__fileCount = new ObservedPropertySimplePU('200', this, "fileCount");
        this.__minSize = new ObservedPropertySimplePU('100', this, "minSize");
        this.__maxSize = new ObservedPropertySimplePU('1000', this, "maxSize");
        this.__minDuplicateRate = new ObservedPropertySimplePU('30', this, "minDuplicateRate");
        this.__maxDuplicateRate = new ObservedPropertySimplePU('50', this, "maxDuplicateRate");
        this.__isGenerating = new ObservedPropertySimplePU(false, this, "isGenerating");
        this.__showMessage = new ObservedPropertySimplePU(false, this, "showMessage");
        this.__messageText = new ObservedPropertySimplePU('', this, "messageText");
        this.__messageType = new ObservedPropertySimplePU('success', this, "messageType");
        this.__lastResult = new ObservedPropertyObjectPU(null, this, "lastResult");
        this.__currentTestFileCount = new ObservedPropertySimplePU(0, this, "currentTestFileCount");
        this.generator = null;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: TestDataTab_Params) {
        if (params.fileCount !== undefined) {
            this.fileCount = params.fileCount;
        }
        if (params.minSize !== undefined) {
            this.minSize = params.minSize;
        }
        if (params.maxSize !== undefined) {
            this.maxSize = params.maxSize;
        }
        if (params.minDuplicateRate !== undefined) {
            this.minDuplicateRate = params.minDuplicateRate;
        }
        if (params.maxDuplicateRate !== undefined) {
            this.maxDuplicateRate = params.maxDuplicateRate;
        }
        if (params.isGenerating !== undefined) {
            this.isGenerating = params.isGenerating;
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
        if (params.lastResult !== undefined) {
            this.lastResult = params.lastResult;
        }
        if (params.currentTestFileCount !== undefined) {
            this.currentTestFileCount = params.currentTestFileCount;
        }
        if (params.generator !== undefined) {
            this.generator = params.generator;
        }
    }
    updateStateVars(params: TestDataTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__fileCount.purgeDependencyOnElmtId(rmElmtId);
        this.__minSize.purgeDependencyOnElmtId(rmElmtId);
        this.__maxSize.purgeDependencyOnElmtId(rmElmtId);
        this.__minDuplicateRate.purgeDependencyOnElmtId(rmElmtId);
        this.__maxDuplicateRate.purgeDependencyOnElmtId(rmElmtId);
        this.__isGenerating.purgeDependencyOnElmtId(rmElmtId);
        this.__showMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__messageText.purgeDependencyOnElmtId(rmElmtId);
        this.__messageType.purgeDependencyOnElmtId(rmElmtId);
        this.__lastResult.purgeDependencyOnElmtId(rmElmtId);
        this.__currentTestFileCount.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__fileCount.aboutToBeDeleted();
        this.__minSize.aboutToBeDeleted();
        this.__maxSize.aboutToBeDeleted();
        this.__minDuplicateRate.aboutToBeDeleted();
        this.__maxDuplicateRate.aboutToBeDeleted();
        this.__isGenerating.aboutToBeDeleted();
        this.__showMessage.aboutToBeDeleted();
        this.__messageText.aboutToBeDeleted();
        this.__messageType.aboutToBeDeleted();
        this.__lastResult.aboutToBeDeleted();
        this.__currentTestFileCount.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    // 配置参数
    private __fileCount: ObservedPropertySimplePU<string>; // 文件总数
    get fileCount() {
        return this.__fileCount.get();
    }
    set fileCount(newValue: string) {
        this.__fileCount.set(newValue);
    }
    private __minSize: ObservedPropertySimplePU<string>; // 最小文件大小(bytes)
    get minSize() {
        return this.__minSize.get();
    }
    set minSize(newValue: string) {
        this.__minSize.set(newValue);
    }
    private __maxSize: ObservedPropertySimplePU<string>; // 最大文件大小(bytes)
    get maxSize() {
        return this.__maxSize.get();
    }
    set maxSize(newValue: string) {
        this.__maxSize.set(newValue);
    }
    private __minDuplicateRate: ObservedPropertySimplePU<string>; // 最小重复率(%)
    get minDuplicateRate() {
        return this.__minDuplicateRate.get();
    }
    set minDuplicateRate(newValue: string) {
        this.__minDuplicateRate.set(newValue);
    }
    private __maxDuplicateRate: ObservedPropertySimplePU<string>; // 最大重复率(%)
    get maxDuplicateRate() {
        return this.__maxDuplicateRate.get();
    }
    set maxDuplicateRate(newValue: string) {
        this.__maxDuplicateRate.set(newValue);
    }
    // 状态
    private __isGenerating: ObservedPropertySimplePU<boolean>;
    get isGenerating() {
        return this.__isGenerating.get();
    }
    set isGenerating(newValue: boolean) {
        this.__isGenerating.set(newValue);
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
    private __messageType: ObservedPropertySimplePU<string>;
    get messageType() {
        return this.__messageType.get();
    }
    set messageType(newValue: string) {
        this.__messageType.set(newValue);
    }
    private __lastResult: ObservedPropertyObjectPU<GeneratorResult | null>;
    get lastResult() {
        return this.__lastResult.get();
    }
    set lastResult(newValue: GeneratorResult | null) {
        this.__lastResult.set(newValue);
    }
    private __currentTestFileCount: ObservedPropertySimplePU<number>;
    get currentTestFileCount() {
        return this.__currentTestFileCount.get();
    }
    set currentTestFileCount(newValue: number) {
        this.__currentTestFileCount.set(newValue);
    }
    private generator: TestDataGenerator | null;
    aboutToAppear() {
        const context = this.getUIContext().getHostContext() as Context;
        this.generator = TestDataGenerator.getInstance(context);
        this.refreshTestFileCount();
    }
    // 刷新测试文件数量
    private refreshTestFileCount() {
        if (this.generator) {
            this.currentTestFileCount = this.generator.getTestFileCount();
        }
    }
    // 显示消息
    private showToast(message: string, type: string = 'success') {
        this.messageText = message;
        this.messageType = type;
        this.showMessage = true;
        setTimeout(() => {
            this.showMessage = false;
        }, 3000);
    }
    // 验证输入参数
    private validateConfig(): GeneratorConfig | null {
        const fileCount = parseInt(this.fileCount);
        const minSize = parseInt(this.minSize);
        const maxSize = parseInt(this.maxSize);
        const minDupRate = parseInt(this.minDuplicateRate);
        const maxDupRate = parseInt(this.maxDuplicateRate);
        if (isNaN(fileCount) || fileCount < 1 || fileCount > 1000) {
            this.showToast('文件数量需在1-1000之间', 'error');
            return null;
        }
        if (isNaN(minSize) || isNaN(maxSize) || minSize < 10 || maxSize > 100000) {
            this.showToast('文件大小需在10-100000字节之间', 'error');
            return null;
        }
        if (minSize > maxSize) {
            this.showToast('最小文件大小不能大于最大值', 'error');
            return null;
        }
        if (isNaN(minDupRate) || isNaN(maxDupRate) || minDupRate < 0 || maxDupRate > 100) {
            this.showToast('重复率需在0-100%之间', 'error');
            return null;
        }
        if (minDupRate > maxDupRate) {
            this.showToast('最小重复率不能大于最大值', 'error');
            return null;
        }
        return {
            fileCount: fileCount,
            minSize: minSize,
            maxSize: maxSize,
            minDuplicateRate: minDupRate,
            maxDuplicateRate: maxDupRate
        };
    }
    // 执行生成
    private performGenerate() {
        if (!this.generator || this.isGenerating)
            return;
        const config = this.validateConfig();
        if (!config)
            return;
        this.isGenerating = true;
        this.showToast('正在生成测试文件...', 'info');
        // 使用setTimeout让UI有时间更新
        setTimeout(() => {
            if (this.generator) {
                const result = this.generator.generateTestFiles(config);
                this.lastResult = result;
                this.isGenerating = false;
                this.refreshTestFileCount();
                if (result.success) {
                    this.showToast(result.message, 'success');
                }
                else {
                    this.showToast(result.message, 'error');
                }
            }
        }, 100);
    }
    // 清空测试文件
    private performClear() {
        if (!this.generator || this.isGenerating)
            return;
        this.isGenerating = true;
        const deletedCount = this.generator.clearTestFiles();
        this.isGenerating = false;
        this.lastResult = null;
        this.refreshTestFileCount();
        this.showToast(`已清空 ${deletedCount} 个txt文件`, 'success');
    }
    // 格式化文件大小
    private formatSize(bytes: number): string {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(139:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // === 标题 ===
            Column.create();
            Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(141:7)", "entry");
            // === 标题 ===
            Column.width('100%');
            // === 标题 ===
            Column.padding({ left: 16, right: 16, top: 12, bottom: 8 });
            // === 标题 ===
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('测试数据生成器');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(142:9)", "entry");
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`当前txt文件: ${this.currentTestFileCount} 个`);
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(148:9)", "entry");
            Text.fontSize(12);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        // === 标题 ===
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 消息提示 ===
            if (this.showMessage) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.messageText);
                        Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(158:9)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#FFFFFF');
                        Text.backgroundColor(this.messageType === 'success' ? '#34C759' :
                            (this.messageType === 'error' ? '#FF3B30' : '#007AFF'));
                        Text.padding({ left: 16, right: 16, top: 8, bottom: 8 });
                        Text.borderRadius(8);
                        Text.margin({ left: 16, right: 16, bottom: 12 });
                    }, Text);
                    Text.pop();
                });
            }
            // === 配置表单 ===
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // === 配置表单 ===
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(171:7)", "entry");
            // === 配置表单 ===
            Column.width('100%');
            // === 配置表单 ===
            Column.padding({ left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 文件数量
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(173:9)", "entry");
            // 文件数量
            Column.width('100%');
            // 文件数量
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('文件总数量');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(174:11)", "entry");
            Text.fontSize(14);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.fileCount, placeholder: '1-1000' });
            TextInput.debugLine("entry/src/main/ets/view/TestDataTab.ets(177:11)", "entry");
            TextInput.type(InputType.Number);
            TextInput.onChange((value: string) => { this.fileCount = value; });
            TextInput.height(44);
            TextInput.backgroundColor(Color.White);
            TextInput.border({ width: 1, color: '#E0E0E0', radius: 8 });
            TextInput.padding({ left: 12, right: 12 });
        }, TextInput);
        // 文件数量
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 文件大小范围
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(189:9)", "entry");
            // 文件大小范围
            Column.width('100%');
            // 文件大小范围
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('文件大小范围 (字节)');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(190:11)", "entry");
            Text.fontSize(14);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 12 });
            Row.debugLine("entry/src/main/ets/view/TestDataTab.ets(193:11)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.minSize, placeholder: '最小' });
            TextInput.debugLine("entry/src/main/ets/view/TestDataTab.ets(194:13)", "entry");
            TextInput.type(InputType.Number);
            TextInput.onChange((value: string) => { this.minSize = value; });
            TextInput.height(44);
            TextInput.backgroundColor(Color.White);
            TextInput.border({ width: 1, color: '#E0E0E0', radius: 8 });
            TextInput.padding({ left: 12, right: 12 });
            TextInput.layoutWeight(1);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('~');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(203:13)", "entry");
            Text.fontSize(16);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.maxSize, placeholder: '最大' });
            TextInput.debugLine("entry/src/main/ets/view/TestDataTab.ets(207:13)", "entry");
            TextInput.type(InputType.Number);
            TextInput.onChange((value: string) => { this.maxSize = value; });
            TextInput.height(44);
            TextInput.backgroundColor(Color.White);
            TextInput.border({ width: 1, color: '#E0E0E0', radius: 8 });
            TextInput.padding({ left: 12, right: 12 });
            TextInput.layoutWeight(1);
        }, TextInput);
        Row.pop();
        // 文件大小范围
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 重复率范围
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(222:9)", "entry");
            // 重复率范围
            Column.width('100%');
            // 重复率范围
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('重复率范围 (%)');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(223:11)", "entry");
            Text.fontSize(14);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 12 });
            Row.debugLine("entry/src/main/ets/view/TestDataTab.ets(226:11)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.minDuplicateRate, placeholder: '最小' });
            TextInput.debugLine("entry/src/main/ets/view/TestDataTab.ets(227:13)", "entry");
            TextInput.type(InputType.Number);
            TextInput.onChange((value: string) => { this.minDuplicateRate = value; });
            TextInput.height(44);
            TextInput.backgroundColor(Color.White);
            TextInput.border({ width: 1, color: '#E0E0E0', radius: 8 });
            TextInput.padding({ left: 12, right: 12 });
            TextInput.layoutWeight(1);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('~');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(236:13)", "entry");
            Text.fontSize(16);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.maxDuplicateRate, placeholder: '最大' });
            TextInput.debugLine("entry/src/main/ets/view/TestDataTab.ets(240:13)", "entry");
            TextInput.type(InputType.Number);
            TextInput.onChange((value: string) => { this.maxDuplicateRate = value; });
            TextInput.height(44);
            TextInput.backgroundColor(Color.White);
            TextInput.border({ width: 1, color: '#E0E0E0', radius: 8 });
            TextInput.padding({ left: 12, right: 12 });
            TextInput.layoutWeight(1);
        }, TextInput);
        Row.pop();
        // 重复率范围
        Column.pop();
        // === 配置表单 ===
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // === 操作按钮 ===
            Row.create({ space: 12 });
            Row.debugLine("entry/src/main/ets/view/TestDataTab.ets(258:7)", "entry");
            // === 操作按钮 ===
            Row.width('100%');
            // === 操作按钮 ===
            Row.padding({ left: 16, right: 16, top: 24 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isGenerating ? '生成中...' : '生成测试文件');
            Button.debugLine("entry/src/main/ets/view/TestDataTab.ets(259:9)", "entry");
            Button.onClick(() => this.performGenerate());
            Button.enabled(!this.isGenerating);
            Button.height(48);
            Button.fontSize(16);
            Button.backgroundColor(this.isGenerating ? '#C7C7CC' : '#007AFF');
            Button.fontColor(Color.White);
            Button.borderRadius(10);
            Button.layoutWeight(1);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('清空所有txt文件');
            Button.debugLine("entry/src/main/ets/view/TestDataTab.ets(269:9)", "entry");
            Button.onClick(() => this.performClear());
            Button.enabled(!this.isGenerating && this.currentTestFileCount > 0);
            Button.height(48);
            Button.fontSize(16);
            Button.backgroundColor((!this.isGenerating && this.currentTestFileCount > 0) ? '#FF3B30' : '#C7C7CC');
            Button.fontColor(Color.White);
            Button.borderRadius(10);
            Button.layoutWeight(1);
        }, Button);
        Button.pop();
        // === 操作按钮 ===
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // === 生成结果 ===
            if (this.lastResult && this.lastResult.success) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 8 });
                        Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(284:9)", "entry");
                        Column.width('100%');
                        Column.padding(16);
                        Column.margin({ left: 16, right: 16, top: 24 });
                        Column.backgroundColor('#F8F8F8');
                        Column.borderRadius(12);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('上次生成结果');
                        Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(285:11)", "entry");
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/TestDataTab.ets(290:11)", "entry");
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(291:13)", "entry");
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.lastResult.totalFiles}`);
                        Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(292:15)", "entry");
                        Text.fontSize(24);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#007AFF');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('总文件数');
                        Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(296:15)", "entry");
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(302:13)", "entry");
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.lastResult.uniqueFiles}`);
                        Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(303:15)", "entry");
                        Text.fontSize(24);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#34C759');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('唯一文件');
                        Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(307:15)", "entry");
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(313:13)", "entry");
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.lastResult.duplicateFiles}`);
                        Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(314:15)", "entry");
                        Text.fontSize(24);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#FF9500');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('重复文件');
                        Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(318:15)", "entry");
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(324:13)", "entry");
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.lastResult.duplicateGroups}`);
                        Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(325:15)", "entry");
                        Text.fontSize(24);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#FF3B30');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('重复组');
                        Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(329:15)", "entry");
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`总大小: ${this.formatSize(this.lastResult.totalSize)}`);
                        Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(337:11)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            // === 使用说明 ===
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // === 使用说明 ===
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/view/TestDataTab.ets(349:7)", "entry");
            // === 使用说明 ===
            Column.width('100%');
            // === 使用说明 ===
            Column.padding(16);
            // === 使用说明 ===
            Column.margin({ left: 16, right: 16, top: 16 });
            // === 使用说明 ===
            Column.backgroundColor('#FFF8E1');
            // === 使用说明 ===
            Column.borderRadius(12);
            // === 使用说明 ===
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('使用说明');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(350:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('1. 设置要生成的文件数量（1-1000）');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(355:9)", "entry");
            Text.fontSize(12);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('2. 设置单个文件的大小范围（字节）');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(358:9)", "entry");
            Text.fontSize(12);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('3. 设置文件重复率范围（实际重复率会在此范围内随机）');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(361:9)", "entry");
            Text.fontSize(12);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('4. 点击"生成测试文件"开始生成');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(364:9)", "entry");
            Text.fontSize(12);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('5. 生成的文件为随机文件名，可在"管理文件"页面查看');
            Text.debugLine("entry/src/main/ets/view/TestDataTab.ets(367:9)", "entry");
            Text.fontSize(12);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        // === 使用说明 ===
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
