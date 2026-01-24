if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface TrashTab_Params {
    trashItems?: TrashItem[];
    isLoading?: boolean;
    showToastMsg?: boolean;
    toastText?: string;
    toastType?: string;
    trashManager?: TrashManager | null;
}
import { TrashManager } from "@bundle:com.example.filesmanger/entry/ets/common/utils/TrashManager";
import type { TrashItem } from "@bundle:com.example.filesmanger/entry/ets/common/utils/TrashManager";
export class TrashTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__trashItems = new ObservedPropertyObjectPU([], this, "trashItems");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__showToastMsg = new ObservedPropertySimplePU(false, this, "showToastMsg");
        this.__toastText = new ObservedPropertySimplePU('', this, "toastText");
        this.__toastType = new ObservedPropertySimplePU('info', this, "toastType");
        this.trashManager = null;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: TrashTab_Params) {
        if (params.trashItems !== undefined) {
            this.trashItems = params.trashItems;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
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
        if (params.trashManager !== undefined) {
            this.trashManager = params.trashManager;
        }
    }
    updateStateVars(params: TrashTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__trashItems.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__showToastMsg.purgeDependencyOnElmtId(rmElmtId);
        this.__toastText.purgeDependencyOnElmtId(rmElmtId);
        this.__toastType.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__trashItems.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__showToastMsg.aboutToBeDeleted();
        this.__toastText.aboutToBeDeleted();
        this.__toastType.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __trashItems: ObservedPropertyObjectPU<TrashItem[]>;
    get trashItems() {
        return this.__trashItems.get();
    }
    set trashItems(newValue: TrashItem[]) {
        this.__trashItems.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
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
    private trashManager: TrashManager | null;
    aboutToAppear(): void {
        const context = this.getUIContext().getHostContext() as Context;
        this.trashManager = TrashManager.getInstance(context);
        this.loadTrashItems();
    }
    private loadTrashItems(): void {
        if (!this.trashManager)
            return;
        this.trashItems = this.trashManager.getTrashItems();
        // 按删除时间倒序
        this.trashItems.sort((a: TrashItem, b: TrashItem): number => b.deletedTime - a.deletedTime);
    }
    private restoreFile(item: TrashItem): void {
        if (!this.trashManager)
            return;
        if (this.trashManager.restore(item.trashName)) {
            this.showToast(`已恢复: ${item.originalName}`, 'success');
            this.loadTrashItems();
        }
        else {
            this.showToast('恢复失败', 'error');
        }
    }
    private deleteFile(item: TrashItem): void {
        if (!this.trashManager)
            return;
        if (this.trashManager.deletePermanently(item.trashName)) {
            this.showToast('已永久删除', 'success');
            this.loadTrashItems();
        }
        else {
            this.showToast('删除失败', 'error');
        }
    }
    private emptyTrash(): void {
        if (!this.trashManager || this.trashItems.length === 0)
            return;
        const count = this.trashManager.emptyTrash();
        this.showToast(`已清空 ${count} 个文件`, 'success');
        this.loadTrashItems();
    }
    private showToast(message: string, type: string): void {
        this.toastText = message;
        this.toastType = type;
        this.showToastMsg = true;
        setTimeout((): void => {
            this.showToastMsg = false;
        }, 2500);
    }
    private formatTime(timestamp: number): string {
        const date = new Date(timestamp);
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const h = date.getHours();
        const min = date.getMinutes();
        return `${m}/${d} ${h}:${min < 10 ? '0' + min : min}`;
    }
    private formatSize(bytes: number): string {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/TrashTab.ets(86:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部栏
            Row.create();
            Row.debugLine("entry/src/main/ets/view/TrashTab.ets(88:7)", "entry");
            // 顶部栏
            Row.width('100%');
            // 顶部栏
            Row.padding({ left: 16, right: 16, top: 12, bottom: 12 });
            // 顶部栏
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/TrashTab.ets(89:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('回收站');
            Text.debugLine("entry/src/main/ets/view/TrashTab.ets(90:11)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.trashItems.length} 个文件`);
            Text.debugLine("entry/src/main/ets/view/TrashTab.ets(94:11)", "entry");
            Text.fontSize(12);
            Text.fontColor('#8E8E93');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('刷新');
            Button.debugLine("entry/src/main/ets/view/TrashTab.ets(102:9)", "entry");
            Button.height(32);
            Button.fontSize(13);
            Button.backgroundColor('#007AFF');
            Button.fontColor(Color.White);
            Button.borderRadius(8);
            Button.onClick((): void => {
                this.loadTrashItems();
                this.showToast('已刷新', 'info');
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.trashItems.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('清空');
                        Button.debugLine("entry/src/main/ets/view/TrashTab.ets(114:11)", "entry");
                        Button.height(32);
                        Button.fontSize(13);
                        Button.backgroundColor('#FF3B30');
                        Button.fontColor(Color.White);
                        Button.borderRadius(8);
                        Button.margin({ left: 8 });
                        Button.onClick((): void => {
                            this.emptyTrash();
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
        // 顶部栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Toast
            if (this.showToastMsg) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.toastText);
                        Text.debugLine("entry/src/main/ets/view/TrashTab.ets(132:9)", "entry");
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
            // 列表
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 列表
            if (this.trashItems.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/TrashTab.ets(143:9)", "entry");
                        Column.width('100%');
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🗑️');
                        Text.debugLine("entry/src/main/ets/view/TrashTab.ets(144:11)", "entry");
                        Text.fontSize(48);
                        Text.margin({ bottom: 12 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('回收站为空');
                        Text.debugLine("entry/src/main/ets/view/TrashTab.ets(147:11)", "entry");
                        Text.fontSize(16);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 8 });
                        List.debugLine("entry/src/main/ets/view/TrashTab.ets(155:9)", "entry");
                        List.width('100%');
                        List.layoutWeight(1);
                        List.padding({ left: 16, right: 16, top: 8 });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const item = _item;
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
                                    ListItem.debugLine("entry/src/main/ets/view/TrashTab.ets(157:13)", "entry");
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.debugLine("entry/src/main/ets/view/TrashTab.ets(158:15)", "entry");
                                        Row.width('100%');
                                        Row.padding(12);
                                        Row.backgroundColor(Color.White);
                                        Row.borderRadius(10);
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.debugLine("entry/src/main/ets/view/TrashTab.ets(159:17)", "entry");
                                        Column.layoutWeight(1);
                                        Column.alignItems(HorizontalAlign.Start);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.originalName);
                                        Text.debugLine("entry/src/main/ets/view/TrashTab.ets(160:19)", "entry");
                                        Text.fontSize(14);
                                        Text.fontColor('#333333');
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create({ space: 8 });
                                        Row.debugLine("entry/src/main/ets/view/TrashTab.ets(165:19)", "entry");
                                        Row.margin({ top: 4 });
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(this.formatTime(item.deletedTime));
                                        Text.debugLine("entry/src/main/ets/view/TrashTab.ets(166:21)", "entry");
                                        Text.fontSize(11);
                                        Text.fontColor('#8E8E93');
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(this.formatSize(item.size));
                                        Text.debugLine("entry/src/main/ets/view/TrashTab.ets(169:21)", "entry");
                                        Text.fontSize(11);
                                        Text.fontColor('#8E8E93');
                                    }, Text);
                                    Text.pop();
                                    Row.pop();
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('恢复');
                                        Button.debugLine("entry/src/main/ets/view/TrashTab.ets(178:17)", "entry");
                                        Button.height(30);
                                        Button.fontSize(12);
                                        Button.backgroundColor('#34C759');
                                        Button.fontColor(Color.White);
                                        Button.borderRadius(6);
                                        Button.onClick((): void => {
                                            this.restoreFile(item);
                                        });
                                    }, Button);
                                    Button.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('删除');
                                        Button.debugLine("entry/src/main/ets/view/TrashTab.ets(188:17)", "entry");
                                        Button.height(30);
                                        Button.fontSize(12);
                                        Button.backgroundColor('#FF3B30');
                                        Button.fontColor(Color.White);
                                        Button.borderRadius(6);
                                        Button.margin({ left: 8 });
                                        Button.onClick((): void => {
                                            this.deleteFile(item);
                                        });
                                    }, Button);
                                    Button.pop();
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.trashItems, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
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
