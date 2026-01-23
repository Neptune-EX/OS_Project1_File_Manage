# pdfViewer

## Introduction


**pdfViewer** is a PDF reader in JavaScript. Its [pdfjs](https://gitcode.com/openharmony-tpc/pdfViewer/blob/master/pdfJs/README.md) module allows you to display PDF documents on OpenHarmony devices, and its [library](https://gitcode.com/openharmony-tpc/pdfViewer/blob/master/library/README.md) module lets you add JPG and PNG images to PDF documents. This project is modified based on the open-source libraries [pdf.js](https://github.com/mozilla/pdf.js) and [jspdf](https://github.com/parallax/jsPDF) to adapt to the OpenHarmony component project.

## How to Install

Use **npm install** to install the project.

```
  npm install @ohos/pdfjs
```

For details about how to configure the OpenHarmony npm environment, see [Installing an OpenHarmony HAR](https://gitcode.com/openharmony-tpc/docs/blob/master/readme/OpenHarmony_npm_usage-en.md).

Use **ohpm install** to install the project.

```
  ohpm install @ohos/img2pdf
```

For details, see [Installing an OpenHarmony HAR](https://gitcode.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.en.md).


## How to Use
1. Configure the global **resourceManager**.

   To obtain the resource files, you need to configure the global **resourceManager** in the EntryAbility file.

   ```
   import { GlobalContext } from '../pages/globalThis'
   
   GlobalContext.getContext().setObject("context", this.context)
   ```

2. Use **getDocument(src:Uint8Array)** to load the PDF document to be opened.

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

3. Obtain the pages in the PDF document.

   ```
       loadingTask.promise.then((pdf) => {
         // Obtain the PDF data on the first page.
         pdf.getPage(1).then((page) => {
           // TODO: Perform the getViewport operation.
         })
       })    
   ```

4. Use **getViewport()** to obtain the page size of the PDF document.

   ```
       page.getViewport({ scale: 1 }).width
       page.getViewport({ scale: 1 }).height
   ```

5. Add an image to a PDF document.

   The following is a pseudocode example. You need to specify **imageData** and **path** on your own.

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

6. Add multiple images to the PDF document.

   The following is a pseudocode example. You need to specify **imageData**, **imageData1**, **imageData2**, and **path** on your own.

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

   **img2pdf** is modified based on the open-source library **jspdf** to adapt to OpenHarmony. For more information about adding images to a PDF document, see [addImage](https://artskydj.github.io/jsPDF/docs/module-addImage.html).

## Available APIs

### Reading PDF Files

|API|Parameter|Description|
|:---|:---|:---|
|getDocument|src|Loads a PDF document.|
|setPDFNetworkStreamFactory|pdfNetworkStreamFactory|Returns a callback that is parsed as an **IPDFStream** instance.|
|annotationStorage| |Stores annotations in a PDF document.|
|getPageLayout| |Obtains the layout of a page in a PDF document|

### Converting an Image to a PDF File
|     API    |                             Parameter                            |              Description              |
| :------------ | :---------------------------------------------------------- | :--------------------------------- |
|     jsPDF      |         **options**: settings initializing the jsPDF instance. By default, the format is A4, the orientation is landscape , and the unit is millimeter.         |             Creates a jsPDF instance.            |
|    addImage    |           **imageData**: image content.<br>**arguments**: image size.          |            Adds an image to the PDF document.           |
| buildDocument  |                                                              |      Builds the PDF document.      |
| getArrayBuffer |                    **data**: string to convert.                   |         Obtains the PDF document data as an **ArrayBuffer**.        |
|    addPage     |        **format**: format of the page.<br>**orientation**: page orientation.        | Adds a new page (and move the focus to) the PDF document.|
|    movePage    |  **targetPage**: number of the target page.<br>**beforePage**: number of the page before it is moved. |           Moves a page to a different position in the PDF document.           |
|    setPage     |                     **page**: number of the page to set.                     | Sets a page.|
|   insertPage   |               **beforePage**: number of the page inserted.               |             Inserts a new page.             |
|   deletePage   |                  **targetPage**: number of the page to delete.                  |             Deletes a page from the PDF document.            |
|      text      | **text**: text to add.<br>**x**: horizontal coordinate of the text.<br>**y**: vertical coordinate of the text.<br>**options**: format settings of the text.|          Adds text to a PDF page.         |
|     output     |    **type**: the output data type.<br>**options**: output settings.   |         Outputs the PDF document.        |
|  getPageWidth  |                                                              |         Obtains the width of the current page.         |
| getPageHeight  |                                                              |         Obtains the height of the current page.         |



## Project Directory

```
/pdfViewer  # Project code
|—— entry   # Project demo.
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
│   └── index.ets               # External APIs
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
│   └── index.ets               # External APIs
```

## Constraints
This project has been verified in the following versions:

- DevEco Studio: 4.0 Release (4.0.3.513), SDK: API10 (4.0.10.10)

- DevEco Studio: 4.0 Beta2 (4.0.3.512), SDK: API10 (4.0.10.9)

- DevEco Studio: 4.0 Canary2 (4.0.3.312), SDK: API10 (4.0.9.2)

- DevEco Studio: NEXT Beta1-5.0.3.806, SDK: API12 Release (5.0.0.66)


## License

This project is licensed under [Apache License 2.0](https://gitcode.com/openharmony-tpc/pdfViewer/blob/master/LICENSE).

## How to Contribute

If you find any problem when using the project, submit an [issue](https://gitcode.com/openharmony-tpc/pdfViewer/issues) or a [PR](https://gitcode.com/openharmony-tpc/pdfViewer/pulls).
