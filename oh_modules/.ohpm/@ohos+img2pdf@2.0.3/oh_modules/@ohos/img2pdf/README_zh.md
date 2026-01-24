# pdfViewer

## 简介


JavaScript实现的解析、展示PDF和图片添加到PDF，[pdfjs](https://gitcode.com/openharmony-tpc/pdfViewer/blob/master/pdfJs/README.md) 可以在OpenHarmony设备上呈现PDF文件内容，[library](https://gitcode.com/openharmony-tpc/pdfViewer/blob/master/library/README.md) 可以将 jpg、png图片格式添加到pdf的功能， 本工程基于开源库 [pdf.js](https://github.com/mozilla/pdf.js) 和 [jspdf](https://github.com/parallax/jsPDF) 进行修改适配OpenHarmony的组件工程。

## 安装模块

使用npm install 安装

```
  npm install @ohos/pdfjs
```

OpenHarmony npm环境配置等更多内容，请参照 [如何安装OpenHarmony npm包](https://gitcode.com/openharmony-tpc/docs/blob/master/readme/OpenHarmony_npm_usage.md) 。

使用ohpm install 安装

```
  ohpm install @ohos/img2pdf 
```

OpenHarmony ohpm 环境配置等更多内容，请参考如何安装 [OpenHarmony ohpm 包](https://gitcode.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md) 。


## 使用说明
### 配置全局resourceManager

pdfjs 获取资源文件需要在EntryAbility文件配置全局resourceManager
```
import { GlobalContext } from '../pages/globalThis'

GlobalContext.getContext().setObject("context", this.context)
```
### 1.使用getDocument(src:Uint8Array)方式加载要打开的PDF文件数据。
```    
    import { GlobalContext } from '../pages/globalThis'
    
    gloContext: Context = GlobalContext.getContext().getObject("context") as Context
    gloContext.resourceManager.getRawFile(pdfFilePath, (error: Error, value: Uint8Array) => {
      if (error != null) {
        console.log(error.message);
      } else {
        this.getPDFDocument(value);
      }
    })
```
### 2.通过加载任务对象获取PDF文档中的各个页面。
```
    loadingTask.promise.then((pdf) => {
      // 获取首页pdf数据
      pdf.getPage(1).then((page) => {
        // TODO 进行getViewport操作
      })
    })    
```
### 3.通过getViewport()提供的展示比例，返回PDf文档的页面尺寸。
```
    page.getViewport({ scale: 1 }).width
    page.getViewport({ scale: 1 }).height
```

### 4.通过jspdf 图片转pdf。
以下为伪代码展示，imageData图片数据和path文件路径需要开发者自行定义。
```
		import jsPDF from "@ohos/img2pdf"
		
        let imageData = imageData
        let data = path
        let jsPdf = new jsPDF();
        jsPdf.addImage(imageData, 50, 50, 150, 150);
        let content = jsPdf.buildDocument();
        
        let buf = jsPdf.getArrayBuffer(content)
        const writer = fileio.openSync(data + `/pdfMessage.pdf`, 0o102, 0o666);
        fileio.writeSync(writer, buf);
```

### 5.多张图片转pdf。
以下为伪代码展示，imageData/imageData1/imageData2图片数据和path文件路径需要开发者自行定义。
```
        import jsPDF from "@ohos/img2pdf"
        
        let imageData = imageData
        let imageData1 = imageData1
        let imageData2 = imageData2
        let data = path
        let jsPdf = new jsPDF();
        jsPdf.addImage(imageData, 10, 10, 20, 20);
        jsPdf.addImage(imageData1, 70, 10, 100, 40);
        jsPdf.addImage(imageData2, 100, 100, 100, 40);
        let content = jsPdf.buildDocument();

        let buf = jsPdf.getArrayBuffer(content)
        const writer = fileio.openSync(data + `/pdfMessage.pdf`, 0o102, 0o666);
        fileio.writeSync(writer, buf);
```

由于img2pdf是基于开源库jspdf进行修改适配OpenHarmony的组件，所以更多的图片转pdf [使用方法可以参考jspdf的使用](https://artskydj.github.io/jsPDF/docs/module-addImage.html) 。

## 接口说明

### 1、读取pdf。

|方法名|入参|接口描述|
|:---:|:---:|:---:|
|getDocument|src|加载PDF并与PDF交互的主要入口|
|setPDFNetworkStreamFactory|pdfNetworkStreamFactory|返回一个解析为{IPDFStream}实例的回调|
|annotationStorage| |存储表单中的注解数据|
|getPageLayout| |返回一个包含页面布局名称的字符串的promise|

### 2、图片转pdf。
|     方法名     |                             入参                             |              接口描述               |
| :------------: | :----------------------------------------------------------: | :---------------------------------: |
|     jsPDF      |         options：默认导出为a4纸张，纵向，单位为毫米          |             jsPDF实例化             |
|    addImage    |           imageData：图片内容，arguments：图片大小           |            将图片转化pdf            |
| buildDocument  |                                                              |      获取转化pdf的content数据       |
| getArrayBuffer |                    data：需要转化的string                    |         返回ArrayBuffer数组         |
|    addPage     |        format:页面的尺寸格式，orientation:页面的方向         | 将新页面添加(并将焦点转移到)PDF文档 |
|    movePage    |  targetPage:目标页面number，beforePage:被移动之前页面number  |           移动2个PDF页面            |
|    setPage     |                     page:页面位置number                      | 将新页面添加(并将焦点转移到)PDF文档 |
|   insertPage   |               beforePage:待插入位置页面number                |             插入新页面              |
|   deletePage   |                  targetPage:目标页面number                   |             删除PDF页面             |
|      text      | text:要添加的文本,x:文本横坐标,y:文本纵坐标,options:包含文本格式设置的对象 |          向PDF页面添加文本          |
|     output     |    type:指定输出的数据类型,options:用于设置输出选项的对象    |         用于生成PDF文档数据         |
|  getPageWidth  |                                                              |         获取当前页面的宽度          |
| getPageHeight  |                                                              |         获取当前页面的高度          |

## 

## 目录结构

```
/pdfViewer  # 工程代码
|—— entry   # 工程demo示例
|—— library
│   └── src
│       └── main
│           └── ets
│               └── components
│               └── btoa
│               └── fflate
│               └── libs
│               └── modules 
│               └── jspdf.js
│   └── index.ets               # 对外接口
├── pdfJs     
│   └── src
│       └── main
│           └── ets
│               └── components
│                   └── core
│                   └── display
│                   └── shared
│                   └── dca-library.js 
│                   └── deepCopyAll.js
│   └── index.ets               # 对外接口
```

## 约束与限制
在下述版本验证通过：

DevEco Studio: 4.0 Release(4.0.3.513), SDK: API10 (4.0.10.10)

DevEco Studio: 4.0 Beta2(4.0.3.512), SDK: API10 (4.0.10.9)

DevEco Studio版本: 4.0Canary2(4.0.3.312), SDK: API10(4.0.9.2)

DevEco Studio: NEXT Beta1-5.0.3.806, SDK: API12 Release (5.0.0.66)

## 开源协议

本项目基于 [Apache License 2.0](https://gitcode.com/openharmony-tpc/pdfViewer/blob/master/LICENSE) ，请自由地享受和参与开源。

## 贡献代码

使用过程中发现任何问题都可以提 [Issue](https://gitcode.com/openharmony-tpc/pdfViewer/issues) 给组件，当然，也非常欢迎发 [PR](https://gitcode.com/openharmony-tpc/pdfViewer/pulls)共建 。