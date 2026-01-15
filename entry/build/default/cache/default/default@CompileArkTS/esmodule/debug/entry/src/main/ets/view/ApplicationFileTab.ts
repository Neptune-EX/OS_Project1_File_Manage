if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ApplicationFileTab_Params {
    message?: string;
    content?: string;
    fileName?: string;
}
import { writeFile } from "@bundle:com.example.filesmanger/entry/ets/common/utils/WriteFile";
export class ApplicationFileTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__message = new ObservedPropertySimplePU('', this, "message");
        this.__content = new ObservedPropertySimplePU('', this, "content");
        this.__fileName = new ObservedPropertySimplePU('', this, "fileName");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ApplicationFileTab_Params) {
        if (params.message !== undefined) {
            this.message = params.message;
        }
        if (params.content !== undefined) {
            this.content = params.content;
        }
        if (params.fileName !== undefined) {
            this.fileName = params.fileName;
        }
    }
    updateStateVars(params: ApplicationFileTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__message.purgeDependencyOnElmtId(rmElmtId);
        this.__content.purgeDependencyOnElmtId(rmElmtId);
        this.__fileName.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__message.aboutToBeDeleted();
        this.__content.aboutToBeDeleted();
        this.__fileName.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    // Used to record the read content.
    private __message: ObservedPropertySimplePU<string>;
    get message() {
        return this.__message.get();
    }
    set message(newValue: string) {
        this.__message.set(newValue);
    }
    // Used to record the contents of a text box.
    private __content: ObservedPropertySimplePU<string>;
    get content() {
        return this.__content.get();
    }
    set content(newValue: string) {
        this.__content.set(newValue);
    }
    // 新增：记录文件名
    private __fileName: ObservedPropertySimplePU<string>;
    get fileName() {
        return this.__fileName.get();
    }
    set fileName(newValue: string) {
        this.__fileName.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // === 新增：文件名输入区域 ===
            Text.create('文件名称：');
            // === 新增：文件名输入区域 ===
            Text.width({ "id": 16777267, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            // === 新增：文件名输入区域 ===
            Text.height({ "id": 16777263, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            // === 新增：文件名输入区域 ===
            Text.fontColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            // === 新增：文件名输入区域 ===
            Text.fontWeight(500);
            // === 新增：文件名输入区域 ===
            Text.fontSize({ "id": 16777259, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            // === 新增：文件名输入区域 ===
            Text.fontFamily('HarmonyHeiTi-Medium');
            // === 新增：文件名输入区域 ===
            Text.lineHeight({ "id": 16777263, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            // === 新增：文件名输入区域 ===
            Text.textAlign(TextAlign.Start);
            // === 新增：文件名输入区域 ===
            Text.margin({
                top: { "id": 16777256, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                bottom: { "id": 16777256, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                right: { "id": 16777279, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }
            });
        }, Text);
        // === 新增：文件名输入区域 ===
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '输入文件名（如：myfile.txt）', text: this.fileName });
            TextInput.width({ "id": 16777271, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextInput.height({ "id": 16777273, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextInput.borderRadius({ "id": 16777279, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextInput.backgroundColor({ "id": 16777250, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextInput.padding({ left: 10, right: 10 });
            TextInput.onChange((value: string) => {
                this.fileName = value;
            });
            TextInput.margin({ bottom: { "id": 16777259, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777242, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.width({ "id": 16777267, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.height({ "id": 16777263, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontWeight(500);
            Text.fontSize({ "id": 16777259, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontFamily('HarmonyHeiTi-Medium');
            Text.lineHeight({ "id": 16777263, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.textAlign(TextAlign.Start);
            Text.margin({
                top: { "id": 16777256, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                bottom: { "id": 16777256, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                right: { "id": 16777279, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextArea.create({ placeholder: '输入文件内容', text: this.content });
            TextArea.width({ "id": 16777271, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.height({ "id": 16777257, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.borderRadius({ "id": 16777265, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.backgroundColor({ "id": 16777250, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.enableKeyboardOnFocus(false);
            TextArea.onChange((value: string) => {
                this.content = value;
            });
        }, TextArea);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Text($r('app.string.file_content'))
            //   .width($r('app.float.default_294'))
            //   .height($r('app.float.default_22'))
            //   .fontSize($r('app.float.default_16'))
            //   .lineHeight($r('app.float.default_22'))
            //   .fontWeight(500)
            //   .margin({
            //     top: $r('app.float.default_13'),
            //     bottom: $r('app.float.default_13'),
            //     right: $r('app.float.default_8')
            //   })
            // TextArea({ text: this.message })
            //   .enableKeyboardOnFocus(false)
            //   .width($r('app.float.default_336'))
            //   .height($r('app.float.default_139'))
            //   .backgroundColor($r('app.color.start_window_background'))
            //   .borderRadius($r('app.float.default_24'))
            Column.create();
            // Text($r('app.string.file_content'))
            //   .width($r('app.float.default_294'))
            //   .height($r('app.float.default_22'))
            //   .fontSize($r('app.float.default_16'))
            //   .lineHeight($r('app.float.default_22'))
            //   .fontWeight(500)
            //   .margin({
            //     top: $r('app.float.default_13'),
            //     bottom: $r('app.float.default_13'),
            //     right: $r('app.float.default_8')
            //   })
            // TextArea({ text: this.message })
            //   .enableKeyboardOnFocus(false)
            //   .width($r('app.float.default_336'))
            //   .height($r('app.float.default_139'))
            //   .backgroundColor($r('app.color.start_window_background'))
            //   .borderRadius($r('app.float.default_24'))
            Column.width('100%');
            // Text($r('app.string.file_content'))
            //   .width($r('app.float.default_294'))
            //   .height($r('app.float.default_22'))
            //   .fontSize($r('app.float.default_16'))
            //   .lineHeight($r('app.float.default_22'))
            //   .fontWeight(500)
            //   .margin({
            //     top: $r('app.float.default_13'),
            //     bottom: $r('app.float.default_13'),
            //     right: $r('app.float.default_8')
            //   })
            // TextArea({ text: this.message })
            //   .enableKeyboardOnFocus(false)
            //   .width($r('app.float.default_336'))
            //   .height($r('app.float.default_139'))
            //   .backgroundColor($r('app.color.start_window_background'))
            //   .borderRadius($r('app.float.default_24'))
            Column.margin({ top: { "id": 16777253, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel({ "id": 16777222, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.width({ "id": 16777270, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.height({ "id": 16777273, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.onClick(() => {
                writeFile(this.content, this.fileName);
                this.content = '';
                this.fileName = '';
            });
        }, Button);
        Button.pop();
        // Text($r('app.string.file_content'))
        //   .width($r('app.float.default_294'))
        //   .height($r('app.float.default_22'))
        //   .fontSize($r('app.float.default_16'))
        //   .lineHeight($r('app.float.default_22'))
        //   .fontWeight(500)
        //   .margin({
        //     top: $r('app.float.default_13'),
        //     bottom: $r('app.float.default_13'),
        //     right: $r('app.float.default_8')
        //   })
        // TextArea({ text: this.message })
        //   .enableKeyboardOnFocus(false)
        //   .width($r('app.float.default_336'))
        //   .height($r('app.float.default_139'))
        //   .backgroundColor($r('app.color.start_window_background'))
        //   .borderRadius($r('app.float.default_24'))
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
