if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface KnowledgeTab_Params {
    chatMessages?: ChatMessage[];
    inputText?: string;
    isProcessing?: boolean;
    apiKey?: string;
    showApiKeyInput?: boolean;
    apiKeyInput?: string;
    showFileSelector?: boolean;
    availableFiles?: string[];
    showToastMsg?: boolean;
    toastText?: string;
    toastType?: string;
    context?: common.UIAbilityContext | null;
    filesDir?: string;
    contentParser?: ContentParser | null;
    scroller?: Scroller;
}
import type common from "@ohos:app.ability.common";
import { DeepSeekService } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DeepSeekService";
import type { AICallParams, AICallResult } from "@bundle:com.example.filesmanger/entry/ets/common/utils/DeepSeekService";
import { ContentParser } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ContentParser";
import type { ParseResult } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ContentParser";
import fileIo from "@ohos:file.fs";
import util from "@ohos:util";
interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}
const API_KEY_FILE = '.deepseek_api_key';
export class KnowledgeTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__chatMessages = new ObservedPropertyObjectPU([], this, "chatMessages");
        this.__inputText = new ObservedPropertySimplePU('', this, "inputText");
        this.__isProcessing = new ObservedPropertySimplePU(false, this, "isProcessing");
        this.__apiKey = new ObservedPropertySimplePU('', this, "apiKey");
        this.__showApiKeyInput = new ObservedPropertySimplePU(false, this, "showApiKeyInput");
        this.__apiKeyInput = new ObservedPropertySimplePU('', this, "apiKeyInput");
        this.__showFileSelector = new ObservedPropertySimplePU(false, this, "showFileSelector");
        this.__availableFiles = new ObservedPropertyObjectPU([], this, "availableFiles");
        this.__showToastMsg = new ObservedPropertySimplePU(false, this, "showToastMsg");
        this.__toastText = new ObservedPropertySimplePU('', this, "toastText");
        this.__toastType = new ObservedPropertySimplePU('info', this, "toastType");
        this.context = null;
        this.filesDir = '';
        this.contentParser = null;
        this.scroller = new Scroller();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: KnowledgeTab_Params) {
        if (params.chatMessages !== undefined) {
            this.chatMessages = params.chatMessages;
        }
        if (params.inputText !== undefined) {
            this.inputText = params.inputText;
        }
        if (params.isProcessing !== undefined) {
            this.isProcessing = params.isProcessing;
        }
        if (params.apiKey !== undefined) {
            this.apiKey = params.apiKey;
        }
        if (params.showApiKeyInput !== undefined) {
            this.showApiKeyInput = params.showApiKeyInput;
        }
        if (params.apiKeyInput !== undefined) {
            this.apiKeyInput = params.apiKeyInput;
        }
        if (params.showFileSelector !== undefined) {
            this.showFileSelector = params.showFileSelector;
        }
        if (params.availableFiles !== undefined) {
            this.availableFiles = params.availableFiles;
        }
        if (params.showToastMsg !== undefined) {
            this.showToastMsg = params.showToastMsg;
        }
        if (params.toastText !== undefined) {
            this.toastText = params.toastText;
        }
        if (params.toastType !== undefined) {
            this.toastType = params.toastType;
        }
        if (params.context !== undefined) {
            this.context = params.context;
        }
        if (params.filesDir !== undefined) {
            this.filesDir = params.filesDir;
        }
        if (params.contentParser !== undefined) {
            this.contentParser = params.contentParser;
        }
        if (params.scroller !== undefined) {
            this.scroller = params.scroller;
        }
    }
    updateStateVars(params: KnowledgeTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__chatMessages.purgeDependencyOnElmtId(rmElmtId);
        this.__inputText.purgeDependencyOnElmtId(rmElmtId);
        this.__isProcessing.purgeDependencyOnElmtId(rmElmtId);
        this.__apiKey.purgeDependencyOnElmtId(rmElmtId);
        this.__showApiKeyInput.purgeDependencyOnElmtId(rmElmtId);
        this.__apiKeyInput.purgeDependencyOnElmtId(rmElmtId);
        this.__showFileSelector.purgeDependencyOnElmtId(rmElmtId);
        this.__availableFiles.purgeDependencyOnElmtId(rmElmtId);
        this.__showToastMsg.purgeDependencyOnElmtId(rmElmtId);
        this.__toastText.purgeDependencyOnElmtId(rmElmtId);
        this.__toastType.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__chatMessages.aboutToBeDeleted();
        this.__inputText.aboutToBeDeleted();
        this.__isProcessing.aboutToBeDeleted();
        this.__apiKey.aboutToBeDeleted();
        this.__showApiKeyInput.aboutToBeDeleted();
        this.__apiKeyInput.aboutToBeDeleted();
        this.__showFileSelector.aboutToBeDeleted();
        this.__availableFiles.aboutToBeDeleted();
        this.__showToastMsg.aboutToBeDeleted();
        this.__toastText.aboutToBeDeleted();
        this.__toastType.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __chatMessages: ObservedPropertyObjectPU<ChatMessage[]>;
    get chatMessages() {
        return this.__chatMessages.get();
    }
    set chatMessages(newValue: ChatMessage[]) {
        this.__chatMessages.set(newValue);
    }
    private __inputText: ObservedPropertySimplePU<string>;
    get inputText() {
        return this.__inputText.get();
    }
    set inputText(newValue: string) {
        this.__inputText.set(newValue);
    }
    private __isProcessing: ObservedPropertySimplePU<boolean>;
    get isProcessing() {
        return this.__isProcessing.get();
    }
    set isProcessing(newValue: boolean) {
        this.__isProcessing.set(newValue);
    }
    private __apiKey: ObservedPropertySimplePU<string>;
    get apiKey() {
        return this.__apiKey.get();
    }
    set apiKey(newValue: string) {
        this.__apiKey.set(newValue);
    }
    private __showApiKeyInput: ObservedPropertySimplePU<boolean>;
    get showApiKeyInput() {
        return this.__showApiKeyInput.get();
    }
    set showApiKeyInput(newValue: boolean) {
        this.__showApiKeyInput.set(newValue);
    }
    private __apiKeyInput: ObservedPropertySimplePU<string>;
    get apiKeyInput() {
        return this.__apiKeyInput.get();
    }
    set apiKeyInput(newValue: string) {
        this.__apiKeyInput.set(newValue);
    }
    private __showFileSelector: ObservedPropertySimplePU<boolean>;
    get showFileSelector() {
        return this.__showFileSelector.get();
    }
    set showFileSelector(newValue: boolean) {
        this.__showFileSelector.set(newValue);
    }
    private __availableFiles: ObservedPropertyObjectPU<string[]>;
    get availableFiles() {
        return this.__availableFiles.get();
    }
    set availableFiles(newValue: string[]) {
        this.__availableFiles.set(newValue);
    }
    private __showToastMsg: ObservedPropertySimplePU<boolean>;
    get showToastMsg() {
        return this.__showToastMsg.get();
    }
    set showToastMsg(newValue: boolean) {
        this.__showToastMsg.set(newValue);
    }
    private __toastText: ObservedPropertySimplePU<string>;
    get toastText() {
        return this.__toastText.get();
    }
    set toastText(newValue: string) {
        this.__toastText.set(newValue);
    }
    private __toastType: ObservedPropertySimplePU<string>;
    get toastType() {
        return this.__toastType.get();
    }
    set toastType(newValue: string) {
        this.__toastType.set(newValue);
    }
    private context: common.UIAbilityContext | null;
    private filesDir: string;
    private contentParser: ContentParser | null;
    private scroller: Scroller;
    aboutToAppear(): void {
        const ctx = this.getUIContext().getHostContext() as Context;
        this.context = ctx as common.UIAbilityContext;
        this.filesDir = this.context.filesDir;
        this.contentParser = ContentParser.getInstance(ctx);
        this.loadApiKey();
        this.addAssistantMessage('你好！我是 AI 助手，可以帮你分析文档、回答问题。\n\n点击右上角设置 API Key 开始使用。');
    }
    private loadApiKey(): void {
        try {
            const keyPath = `${this.filesDir}/${API_KEY_FILE}`;
            if (fileIo.accessSync(keyPath)) {
                const file = fileIo.openSync(keyPath, fileIo.OpenMode.READ_ONLY);
                const stat = fileIo.statSync(keyPath);
                const buffer = new ArrayBuffer(stat.size);
                fileIo.readSync(file.fd, buffer);
                fileIo.closeSync(file);
                const decoder = new util.TextDecoder('utf-8');
                this.apiKey = decoder.decodeWithStream(new Uint8Array(buffer), { stream: false }).trim();
            }
        }
        catch (error) {
            console.warn('[KnowledgeTab] 加载 API Key 失败');
        }
    }
    private saveApiKey(key: string): void {
        try {
            const keyPath = `${this.filesDir}/${API_KEY_FILE}`;
            const file = fileIo.openSync(keyPath, fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.CREATE | fileIo.OpenMode.TRUNC);
            const encoder = new util.TextEncoder();
            const data = encoder.encodeInto(key);
            fileIo.writeSync(file.fd, data.buffer);
            fileIo.closeSync(file);
            this.apiKey = key;
            this.showApiKeyInput = false;
            this.showToast('API Key 已保存', 'success');
        }
        catch (error) {
            this.showToast('保存失败', 'error');
        }
    }
    private addUserMessage(content: string): void {
        this.chatMessages.push({
            id: `user_${Date.now()}`,
            role: 'user',
            content: content,
            timestamp: Date.now()
        });
        this.chatMessages = this.chatMessages.slice();
        setTimeout((): void => { this.scroller.scrollEdge(Edge.Bottom); }, 100);
    }
    private addAssistantMessage(content: string): void {
        this.chatMessages.push({
            id: `assistant_${Date.now()}`,
            role: 'assistant',
            content: content,
            timestamp: Date.now()
        });
        this.chatMessages = this.chatMessages.slice();
        setTimeout((): void => { this.scroller.scrollEdge(Edge.Bottom); }, 100);
    }
    private async sendMessage(): Promise<void> {
        if (this.inputText.trim().length === 0)
            return;
        if (!this.apiKey || this.apiKey.trim().length === 0) {
            this.showToast('请先设置 API Key', 'error');
            this.showApiKeyInput = true;
            return;
        }
        const userInput = this.inputText.trim();
        this.inputText = '';
        this.addUserMessage(userInput);
        this.isProcessing = true;
        try {
            const params: AICallParams = {
                prompt: userInput,
                apiKey: this.apiKey,
                systemPrompt: '你是一个专业的文档分析助手，能够帮助用户理解和分析各类文档。回答要简洁有条理。',
                temperature: 0.7,
                maxTokens: 2000
            };
            const result: AICallResult = await DeepSeekService.callAI(params);
            if (result.success) {
                this.addAssistantMessage(result.content);
            }
            else {
                this.addAssistantMessage(`请求失败：${result.error || '未知错误'}`);
            }
        }
        catch (error) {
            this.addAssistantMessage(`发生错误：${error}`);
        }
        finally {
            this.isProcessing = false;
        }
    }
    private loadFileList(): void {
        try {
            let files = fileIo.listFileSync(this.filesDir);
            this.availableFiles = files.filter((f: string) => {
                return !f.startsWith('.') && (f.endsWith('.txt') || f.endsWith('.docx') || f.endsWith('.pdf'));
            });
        }
        catch (error) {
            this.showToast('加载文件列表失败', 'error');
        }
    }
    private async analyzeFile(filename: string): Promise<void> {
        if (!this.contentParser || !this.apiKey) {
            this.showToast('请先设置 API Key', 'error');
            return;
        }
        this.showFileSelector = false;
        this.addUserMessage(`分析文件：${filename}`);
        this.isProcessing = true;
        try {
            const parseResult: ParseResult = await this.contentParser.parseDocument(filename);
            if (!parseResult.success) {
                this.addAssistantMessage(`无法读取文件：${parseResult.error}`);
                this.isProcessing = false;
                return;
            }
            const prompt = `请分析以下文档，提供摘要和关键要点：

文档：${filename}（${parseResult.wordCount}字）

内容：
${parseResult.content.substring(0, 4000)}

请提供：
1. 摘要（100-150字）
2. 3-5个关键要点
3. 文档类型判断`;
            const params: AICallParams = {
                prompt: prompt,
                apiKey: this.apiKey,
                systemPrompt: '你是专业的文档分析助手，擅长提取关键信息。回答要简洁有条理。',
                temperature: 0.3,
                maxTokens: 1500
            };
            const result: AICallResult = await DeepSeekService.callAI(params);
            this.addAssistantMessage(result.success ? result.content : `分析失败：${result.error}`);
        }
        catch (error) {
            this.addAssistantMessage(`分析出错：${error}`);
        }
        finally {
            this.isProcessing = false;
        }
    }
    private showToast(message: string, type: string = 'info'): void {
        this.toastText = message;
        this.toastType = type;
        this.showToastMsg = true;
        setTimeout(() => { this.showToastMsg = false; }, 2500);
    }
    private formatTime(timestamp: number): string {
        const date = new Date(timestamp);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(213:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部栏
            Row.create();
            Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(215:7)", "entry");
            // 顶部栏
            Row.width('100%');
            // 顶部栏
            Row.padding({ left: 16, right: 16, top: 8, bottom: 8 });
            // 顶部栏
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(216:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('AI 助手');
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(217:11)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.apiKey ? '已连接' : '未设置 API');
            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(221:11)", "entry");
            Text.fontSize(11);
            Text.fontColor(this.apiKey ? '#34C759' : '#FF9500');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('设置');
            Button.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(229:9)", "entry");
            Button.fontSize(13);
            Button.height(34);
            Button.backgroundColor('#007AFF');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
            Button.onClick(() => {
                this.apiKeyInput = this.apiKey;
                this.showApiKeyInput = true;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('清空');
            Button.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(240:9)", "entry");
            Button.fontSize(13);
            Button.height(34);
            Button.backgroundColor('#FF3B30');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
            Button.margin({ left: 8 });
            Button.onClick(() => {
                this.chatMessages = [];
                this.addAssistantMessage('对话已清空，有什么可以帮你的？');
            });
        }, Button);
        Button.pop();
        // 顶部栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Toast 提示
            if (this.showToastMsg) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.toastText);
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(258:9)", "entry");
                        Text.fontSize(13);
                        Text.fontColor(Color.White);
                        Text.backgroundColor(this.toastType === 'success' ? '#34C759' : (this.toastType === 'error' ? '#FF3B30' : '#007AFF'));
                        Text.padding({ left: 16, right: 16, top: 8, bottom: 8 });
                        Text.borderRadius(20);
                        Text.margin({ top: 8 });
                    }, Text);
                    Text.pop();
                });
            }
            // 对话区域
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 对话区域
            Scroll.create(this.scroller);
            Scroll.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(268:7)", "entry");
            // 对话区域
            Scroll.layoutWeight(1);
            // 对话区域
            Scroll.scrollBar(BarState.Off);
            // 对话区域
            Scroll.backgroundColor('#F0F0F0');
            // 对话区域
            Scroll.align(Alignment.Top);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(269:9)", "entry");
            Column.width('100%');
            Column.padding({ top: 8 });
            Column.justifyContent(FlexAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const msg = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(271:13)", "entry");
                    Column.width('100%');
                    Column.padding({ left: 16, right: 16, bottom: 12 });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(272:15)", "entry");
                    Row.width('100%');
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    If.create();
                    if (msg.role === 'user') {
                        this.ifElseBranchUpdateFunction(0, () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Blank.create();
                                Blank.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(274:19)", "entry");
                                Blank.layoutWeight(1);
                            }, Blank);
                            Blank.pop();
                        });
                    }
                    else {
                        this.ifElseBranchUpdateFunction(1, () => {
                        });
                    }
                }, If);
                If.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(277:17)", "entry");
                    Column.constraintSize({ maxWidth: '75%' });
                    Column.alignItems(msg.role === 'user' ? HorizontalAlign.End : HorizontalAlign.Start);
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(msg.content);
                    Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(278:19)", "entry");
                    Text.fontSize(14);
                    Text.fontColor(msg.role === 'user' ? Color.White : '#333333');
                    Text.lineHeight(20);
                    Text.padding(12);
                    Text.backgroundColor(msg.role === 'user' ? '#007AFF' : Color.White);
                    Text.borderRadius(16);
                }, Text);
                Text.pop();
                Column.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    If.create();
                    if (msg.role === 'assistant') {
                        this.ifElseBranchUpdateFunction(0, () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Blank.create();
                                Blank.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(290:19)", "entry");
                                Blank.layoutWeight(1);
                            }, Blank);
                            Blank.pop();
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
                    Text.create(this.formatTime(msg.timestamp));
                    Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(295:15)", "entry");
                    Text.fontSize(10);
                    Text.fontColor('#AAAAAA');
                    Text.margin({ top: 4 });
                    Text.alignSelf(msg.role === 'user' ? ItemAlign.End : ItemAlign.Start);
                }, Text);
                Text.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, this.chatMessages, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        // 对话区域
        Scroll.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 底部输入区
            Column.create();
            Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(315:7)", "entry");
            // 底部输入区
            Column.backgroundColor('#F8F8F8');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(316:9)", "entry");
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('📄 分析文件');
            Button.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(317:11)", "entry");
            Button.fontSize(12);
            Button.height(32);
            Button.backgroundColor('#34C759');
            Button.fontColor(Color.White);
            Button.borderRadius(16);
            Button.onClick(() => {
                this.loadFileList();
                this.showFileSelector = true;
            });
            Button.enabled(!this.isProcessing);
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(332:9)", "entry");
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 8, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '输入消息...', text: this.inputText });
            TextInput.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(333:11)", "entry");
            TextInput.layoutWeight(1);
            TextInput.height(40);
            TextInput.backgroundColor(Color.White);
            TextInput.borderRadius(20);
            TextInput.padding({ left: 16, right: 16 });
            TextInput.onChange((value: string) => { this.inputText = value; });
            TextInput.onSubmit(() => { this.sendMessage(); });
            TextInput.enabled(!this.isProcessing);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isProcessing ? '...' : '发送');
            Button.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(343:11)", "entry");
            Button.width(56);
            Button.height(40);
            Button.fontSize(14);
            Button.backgroundColor(this.isProcessing ? '#C7C7CC' : '#007AFF');
            Button.fontColor(Color.White);
            Button.borderRadius(20);
            Button.onClick(() => { this.sendMessage(); });
            Button.enabled(!this.isProcessing && this.inputText.trim().length > 0);
        }, Button);
        Button.pop();
        Row.pop();
        // 底部输入区
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // API Key 弹窗
            if (this.showApiKeyInput) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(360:9)", "entry");
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('rgba(0,0,0,0.4)');
                        Column.onClick(() => { this.showApiKeyInput = false; });
                        Column.position({ x: 0, y: 0 });
                    }, Column);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(367:9)", "entry");
                        Column.width('85%');
                        Column.padding(24);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(20);
                        Column.position({ x: '7.5%', y: '25%' });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('设置 API Key');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(368:11)", "entry");
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: 'sk-...', text: this.apiKeyInput });
                        TextInput.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(374:11)", "entry");
                        TextInput.width('100%');
                        TextInput.height(46);
                        TextInput.backgroundColor('#F5F5F5');
                        TextInput.borderRadius(10);
                        TextInput.onChange((value: string) => { this.apiKeyInput = value; });
                        TextInput.margin({ bottom: 12 });
                    }, TextInput);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('从 DeepSeek 官网获取 API Key');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(382:11)", "entry");
                        Text.fontSize(11);
                        Text.fontColor('#8E8E93');
                        Text.margin({ bottom: 20 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 12 });
                        Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(387:11)", "entry");
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(388:13)", "entry");
                        Button.layoutWeight(1);
                        Button.height(44);
                        Button.backgroundColor('#E5E5E5');
                        Button.fontColor('#333333');
                        Button.borderRadius(10);
                        Button.onClick(() => { this.showApiKeyInput = false; });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('保存');
                        Button.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(396:13)", "entry");
                        Button.layoutWeight(1);
                        Button.height(44);
                        Button.backgroundColor('#007AFF');
                        Button.fontColor(Color.White);
                        Button.borderRadius(10);
                        Button.onClick(() => {
                            if (DeepSeekService.validateApiKey(this.apiKeyInput)) {
                                this.saveApiKey(this.apiKeyInput);
                            }
                            else {
                                this.showToast('API Key 格式不正确', 'error');
                            }
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                });
            }
            // 文件选择弹窗
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 文件选择弹窗
            if (this.showFileSelector) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(421:9)", "entry");
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('rgba(0,0,0,0.4)');
                        Column.onClick(() => { this.showFileSelector = false; });
                        Column.position({ x: 0, y: 0 });
                    }, Column);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(428:9)", "entry");
                        Column.width('85%');
                        Column.padding(24);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(20);
                        Column.position({ x: '7.5%', y: '20%' });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('选择文件');
                        Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(429:11)", "entry");
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.availableFiles.length === 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('暂无可分析的文件');
                                    Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(436:13)", "entry");
                                    Text.fontSize(14);
                                    Text.fontColor('#8E8E93');
                                    Text.padding(30);
                                }, Text);
                                Text.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Scroll.create();
                                    Scroll.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(441:13)", "entry");
                                    Scroll.height(200);
                                }, Scroll);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create({ space: 8 });
                                    Column.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(442:15)", "entry");
                                    Column.width('100%');
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = _item => {
                                        const filename = _item;
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create();
                                            Row.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(444:19)", "entry");
                                            Row.width('100%');
                                            Row.height(50);
                                            Row.padding({ left: 14, right: 14 });
                                            Row.backgroundColor('#F8F8F8');
                                            Row.borderRadius(10);
                                            Row.onClick(() => { this.analyzeFile(filename); });
                                        }, Row);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(filename.endsWith('.pdf') ? '📕' : (filename.endsWith('.docx') ? '📘' : '📄'));
                                            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(445:21)", "entry");
                                            Text.fontSize(20);
                                            Text.margin({ right: 10 });
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(filename);
                                            Text.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(448:21)", "entry");
                                            Text.fontSize(14);
                                            Text.fontColor('#333333');
                                            Text.layoutWeight(1);
                                            Text.maxLines(1);
                                            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        }, Text);
                                        Text.pop();
                                        Row.pop();
                                    };
                                    this.forEachUpdateFunction(elmtId, this.availableFiles, forEachItemGenFunction);
                                }, ForEach);
                                ForEach.pop();
                                Column.pop();
                                Scroll.pop();
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('关闭');
                        Button.debugLine("entry/src/main/ets/view/KnowledgeTab.ets(468:11)", "entry");
                        Button.width('100%');
                        Button.height(44);
                        Button.backgroundColor('#007AFF');
                        Button.fontColor(Color.White);
                        Button.borderRadius(10);
                        Button.margin({ top: 16 });
                        Button.onClick(() => { this.showFileSelector = false; });
                    }, Button);
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
    rerender() {
        this.updateDirtyElements();
    }
}
