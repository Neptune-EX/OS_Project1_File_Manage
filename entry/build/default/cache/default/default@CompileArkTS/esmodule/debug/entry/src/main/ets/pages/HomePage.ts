if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface HomePage_Params {
}
import { ApplicationFileTab } from "@bundle:com.example.filesmanger/entry/ets/view/ApplicationFileTab";
import { publicFilesTab } from "@bundle:com.example.filesmanger/entry/ets/view/PublicFilesTab";
class HomePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: HomePage_Params) {
    }
    updateStateVars(params: HomePage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.backgroundColor({ "id": 16777249, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.justifyContent(FlexAlign.Center);
            Column.width('100%');
            Column.padding({ top: { "id": 16777275, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width({ "id": 16777272, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.height({ "id": 16777276, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777244, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.width({ "id": 16777270, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.height({ "id": 16777274, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.textAlign(TextAlign.Start);
            Text.fontSize({ "id": 16777268, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontFamily('HarmonyHeiTi-Bold');
            Text.fontColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.lineHeight({ "id": 16777274, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontWeight(700);
            Text.margin({
                top: { "id": 16777278, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                bottom: { "id": 16777279, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                left: { "id": 16777265, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                right: { "id": 16777265, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }
            });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Tabs.create();
            Tabs.barWidth({ "id": 16777261, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Tabs.barHeight({ "id": 16777276, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Tabs.width('100%');
        }, Tabs);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new ApplicationFileTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 46, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "ApplicationFileTab" });
                }
            });
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777220, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777279, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777259, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Scroll.create();
                    Scroll.height({ "id": 16777277, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                }, Scroll);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new publicFilesTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 55, col: 13 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "publicFilesTab" });
                }
                Scroll.pop();
            });
            TabContent.height('100%');
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777221, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777279, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777259, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
        }, TabContent);
        TabContent.pop();
        Tabs.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "HomePage";
    }
}
registerNamedRoute(() => new HomePage(undefined, {}), "", { bundleName: "com.example.filesmanger", moduleName: "entry", pagePath: "pages/HomePage", pageFullPath: "entry/src/main/ets/pages/HomePage", integratedHsp: "false", moduleType: "followWithHap" });
