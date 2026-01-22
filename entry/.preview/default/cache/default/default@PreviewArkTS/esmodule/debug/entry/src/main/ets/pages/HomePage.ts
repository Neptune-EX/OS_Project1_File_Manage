if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface HomePage_Params {
}
import { ApplicationFileTab } from "@bundle:com.example.filesmanger/entry/ets/view/ApplicationFileTab";
import { publicFilesTab } from "@bundle:com.example.filesmanger/entry/ets/view/PublicFilesTab";
import { DeduplicationTab } from "@bundle:com.example.filesmanger/entry/ets/view/DeduplicationTab";
import { TrashTab } from "@bundle:com.example.filesmanger/entry/ets/view/TrashTab";
import { TestDataTab } from "@bundle:com.example.filesmanger/entry/ets/view/TestDataTab";
import { SmartClassifyTab } from "@bundle:com.example.filesmanger/entry/ets/view/SmartClassifyTab";
import { KnowledgeTab } from "@bundle:com.example.filesmanger/entry/ets/view/KnowledgeTab";
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
            Column.debugLine("entry/src/main/ets/pages/HomePage.ets(28:5)", "entry");
            Column.backgroundColor({ "id": 16777299, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.justifyContent(FlexAlign.Center);
            Column.width('100%');
            Column.padding({ top: { "id": 16777242, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/HomePage.ets(29:7)", "entry");
            Column.width({ "id": 16777239, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.height({ "id": 16777243, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777279, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(30:9)", "entry");
            Text.width({ "id": 16777237, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.height({ "id": 16777241, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.textAlign(TextAlign.Start);
            Text.fontSize({ "id": 16777235, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontFamily('HarmonyHeiTi-Bold');
            Text.fontColor({ "id": 16777301, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.lineHeight({ "id": 16777241, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontWeight(700);
            Text.margin({
                top: { "id": 16777245, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                bottom: { "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                left: { "id": 16777232, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                right: { "id": 16777232, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }
            });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Tabs.create();
            Tabs.debugLine("entry/src/main/ets/pages/HomePage.ets(49:7)", "entry");
            Tabs.barWidth({ "id": 16777239, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Tabs.barHeight({ "id": 16777243, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Tabs.width('100%');
        }, Tabs);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new ApplicationFileTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 51, col: 11 });
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
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777255, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777226, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(50:9)", "entry");
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Scroll.create();
                    Scroll.debugLine("entry/src/main/ets/pages/HomePage.ets(60:11)", "entry");
                    Scroll.height({ "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                }, Scroll);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new publicFilesTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 61, col: 13 });
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
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777256, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777226, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(59:9)", "entry");
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Scroll.create();
                    Scroll.debugLine("entry/src/main/ets/pages/HomePage.ets(72:11)", "entry");
                    Scroll.height({ "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                }, Scroll);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new DeduplicationTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 73, col: 13 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "DeduplicationTab" });
                }
                Scroll.pop();
            });
            TabContent.height('100%');
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777257, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777226, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(71:9)", "entry");
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Scroll.create();
                    Scroll.debugLine("entry/src/main/ets/pages/HomePage.ets(84:11)", "entry");
                    Scroll.height({ "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                }, Scroll);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new TrashTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 85, col: 13 });
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
                Scroll.pop();
            });
            TabContent.height('100%');
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777258, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777226, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(83:9)", "entry");
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Scroll.create();
                    Scroll.debugLine("entry/src/main/ets/pages/HomePage.ets(96:11)", "entry");
                    Scroll.height({ "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                }, Scroll);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new TestDataTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 97, col: 13 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "TestDataTab" });
                }
                Scroll.pop();
            });
            TabContent.height('100%');
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777259, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777226, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(95:9)", "entry");
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Scroll.create();
                    Scroll.debugLine("entry/src/main/ets/pages/HomePage.ets(108:11)", "entry");
                    Scroll.height({ "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                }, Scroll);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new SmartClassifyTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 109, col: 13 });
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
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777260, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777226, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(107:9)", "entry");
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Scroll.create();
                    Scroll.debugLine("entry/src/main/ets/pages/HomePage.ets(120:11)", "entry");
                    Scroll.height({ "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                }, Scroll);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new KnowledgeTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 121, col: 13 });
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
                Scroll.pop();
            });
            TabContent.height('100%');
            TabContent.tabBar(new SubTabBarStyle({ "id": 16777261, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" })
                .indicator({ marginTop: { "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777226, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
            TabContent.debugLine("entry/src/main/ets/pages/HomePage.ets(119:9)", "entry");
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
