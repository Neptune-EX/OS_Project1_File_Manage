if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface HomePage_Params {
}
import { ApplicationFileTab } from "@bundle:com.example.filesmanger/entry/ets/view/ApplicationFileTab";
import { publicFilesTab } from "@bundle:com.example.filesmanger/entry/ets/view/PublicFilesTab";
import { SmartClassifyTab } from "@bundle:com.example.filesmanger/entry/ets/view/SmartClassifyTab";
import { KnowledgeTab } from "@bundle:com.example.filesmanger/entry/ets/view/KnowledgeTab";
import { TrashTab } from "@bundle:com.example.filesmanger/entry/ets/view/TrashTab";
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
            Column.debugLine("entry/src/main/ets/pages/HomePage.ets(26:5)", "entry");
            Column.backgroundColor({ "id": 16777313, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.justifyContent(FlexAlign.Start);
            Column.width('100%');
            Column.height('100%');
            Column.padding({ top: { "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/HomePage.ets(27:7)", "entry");
            Column.width({ "id": 16777241, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.height({ "id": 16777245, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777281, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(28:9)", "entry");
            Text.width({ "id": 16777239, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.height({ "id": 16777243, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.textAlign(TextAlign.Start);
            Text.fontSize({ "id": 16777237, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontFamily('HarmonyHeiTi-Bold');
            Text.fontColor({ "id": 16777315, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.lineHeight({ "id": 16777243, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontWeight(700);
            Text.margin({
                top: { "id": 16777247, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                bottom: { "id": 16777248, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                left: { "id": 16777234, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                right: { "id": 16777234, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }
            });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Tabs.create();
            Tabs.debugLine("entry/src/main/ets/pages/HomePage.ets(47:7)", "entry");
            Tabs.barWidth({ "id": 16777241, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Tabs.barHeight({ "id": 16777245, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Tabs.width('100%');
            Tabs.layoutWeight(1);
        }, Tabs);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new ApplicationFileTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 49, col: 11 });
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
            TabContent.height('100%');
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777257, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777248, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777228, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(48:9)", "entry");
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Scroll.create();
                    Scroll.debugLine("entry/src/main/ets/pages/HomePage.ets(58:11)", "entry");
                    Scroll.height({ "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                }, Scroll);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new publicFilesTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 59, col: 13 });
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
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777258, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777248, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777228, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(57:9)", "entry");
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Scroll.create();
                    Scroll.debugLine("entry/src/main/ets/pages/HomePage.ets(106:11)", "entry");
                    Scroll.height({ "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                }, Scroll);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new SmartClassifyTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 107, col: 13 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "SmartClassifyTab" });
                }
                Scroll.pop();
            });
            TabContent.height('100%');
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777262, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777248, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777228, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(105:9)", "entry");
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new KnowledgeTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 118, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "KnowledgeTab" });
                }
            });
            TabContent.height('100%');
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777263, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777248, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777228, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(117:9)", "entry");
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new TrashTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 127, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "TrashTab" });
                }
            });
            TabContent.height('100%');
            TabContent.tabBar(new SubTabBarStyle('回收站')
                .indicator({ marginTop: { "id": 16777248, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777228, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(126:9)", "entry");
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
