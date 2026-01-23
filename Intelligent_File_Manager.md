# 智能文件维护系统 - 功能实现文档 (BluePrint by:CBK @Neptune_EX)

本文档详细介绍智能维护系统的实现原理及核心方法。

---

## 1. 上传文件至沙箱（支持`docx`,`pdf`,`txt`格式）

### 功能路径

`entry/src/main/ets/view/ApplicationFileTab.ets`

### 关联文件
`entry/src/main/ets/common/utils/WriteFile.ets`

### 实现原理

系统扫描本地 `entry/src/main/resources/rawfile` 下的所有文件。通过 HarmonyOS 的 `entry/src/main/ets/view/ApplicationFileTab.ets` 将本地文件上传到沙箱。

### 核心代码

```typescript
// 新增：拷贝rawfile所有文件到沙箱
  private async copyAllRawFilesToSandbox(): Promise<void> {
    try {
      // 获取UIAbilityContext
      const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;

      // 获取rawfile文件列表
      const rawFileList: string[] = await this.getRawFilelist();

      if (rawFileList.length === 0) {
        this.copyStatus = "rawfile目录中没有文件";
        return;
      }

      this.copyStatus = `开始拷贝 ${rawFileList.length} 个文件...`;
      let successCount: number = 0;
      let failCount: number = 0;
      let details: string = "";

      // 获取沙箱目录
      const sandboxDir: string = context.filesDir;

      // 遍历所有文件进行拷贝
      for (const fileName of rawFileList) {
        try {
          // 从rawfile读取文件内容
          const fileContent: Uint8Array = context.resourceManager.getRawFileContentSync(fileName);

          // 目标文件路径
          const targetPath: string = sandboxDir + '/' + fileName;

          // 创建并写入文件
          const file = fs.openSync(targetPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
          const writeLen: number = fs.writeSync(file.fd, fileContent.buffer as ArrayBuffer);
          fs.closeSync(file);

          successCount++;
          details += `✓ ${fileName}: ${writeLen} 字节\n`;
          console.info("FileTab", `文件 ${fileName} 拷贝成功, 大小: ${writeLen} 字节`);

        } catch (fileError) {
          failCount++;
          details += `✗ ${fileName}: 失败\n`;
          console.error("FileTab", `文件 ${fileName} 拷贝失败:`, fileError);
        }
      }

      this.copyStatus = `拷贝完成！\n成功: ${successCount}, 失败: ${failCount}\n${details}`;

      // 更新文件列表显示
      await this.updateFileList();

    } catch (error) {
      const code: number = (error as BusinessError).code;
      const message: string = (error as BusinessError).message;
      this.copyStatus = `整体拷贝失败！错误码: ${code}, 信息: ${message}`;
      console.error("FileTab", `整体拷贝失败, error code: ${code}, message: ${message}.`);
    }
  }
```

### 关键点

- 本地无法直接上传文件至虚拟机沙箱，因为权限保护
- `context`用法极为精妙

---

## 2. 文件展示

### 功能路径

`entry/src/main/ets/view/PublicFilesTab.ets`

### 关联文件

`entry/src/main/ets/common/utils/FileManager.ets`

### 实现原理

使用`import { filePreview } from '@kit.PreviewKit'`内置的预览器完成对文件的预览。但`Preview Kit（文件预览服务）：不支持.pdf/.pptx/.xlsx/.docx文件格式预览`。

### 预览器调用
```typescript
/**
   * Open file preview using PreviewKit (for PDF, DOCX, etc.)
   */
  private async openFilePreview(fileName: string): Promise<void> {
    try {
      // Get UIContext
      const uiContext = this.getUIContext().getHostContext() as common.UIAbilityContext;
      if (!uiContext) {
        throw new Error('Unable to get UI context');
      }

      // Get file path
      const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
      const sandboxDir: string = context.filesDir;
      const filePath: string = sandboxDir + '/' + fileName;
      // Check if file exists
      try {
        const isExist = fs.accessSync(filePath);
        if (!isExist) {
          throw new Error(`File does not exist: ${fileName}`);
        }
      } catch (error) {
        throw new Error(`File does not exist: ${fileName}`);
      }
      // Convert path to URI
      const uri = fileUri.getUriFromPath(filePath);
      // Build preview parameters
      const previewInfo: filePreview.PreviewInfo = {
        title: fileName,
        uri: uri,
        mimeType: this.getMimeType(fileName)
      };
      const displayInfo: filePreview.DisplayInfo = {
        x: 100,
        y: 100,
        width: 800,
        height: 800
      };
      // Open preview
      await filePreview.openPreview(uiContext, previewInfo, displayInfo);

      this.saveMessage = `Preview opened: ${fileName}`;
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 2000);

    } catch (error) {
      const err = error as BusinessError;
      console.error(`Failed to open preview:`, err);
      this.saveMessage = `Preview failed: ${err.message || 'Unknown error'}`;
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 3000);
    }
  }

  /**
   * View file content - supports TXT (inline), DOCX and PDF (preview window)
   */
  private async viewFileContent(filename: string): Promise<void> {
    if (!this.fileManager) {
      return;
    }

    try {
      // Check if file type is supported
      if (!this.canPreviewFileType(filename)) {
        this.saveMessage = `File type not supported for preview: ${filename}`;
        this.showSaveSuccess = true;
        setTimeout(() => {
          this.showSaveSuccess = false;
        }, 3000);
        return;
      }

      await this.openFilePreview(filename);
      // // For text files, display content inline (commented out as UI is commented)
      // if (this.isTextFile(filename)) {
      //   const content = readFile(filename);
      //   console.log(`File content: ${content}`);
      //
      //   this.selectedFile = filename;
      //   this.fileContent = content;
      //   this.showFileContent = true;
      //
      //   this.saveMessage = `Text file loaded: ${filename}`;
      //   this.showSaveSuccess = true;
      //   setTimeout(() => {
      //     this.showSaveSuccess = false;
      //   }, 2000);
      // } else {
      //   // For DOCX, PDF, and other document types, open preview window
      //   await this.openFilePreview(filename);
      // }
    } catch (error) {
      console.error(`Failed to view file: ${error}`);
      this.saveMessage = `Failed to read file: ${error}`;
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 3000);
    }
  }


```

### 数据结构
```typescript
interface PreviewConfig {
  title?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
```

---



## 3. 智能文档分类

### 关联代码

`entry/src/main/ets/common/utils/ContentParser.ets`,`entry/src/main/ets/view/SmartClassifyTab.ets`

### 实现原理

- **读取内容**: txt文档读取，docx文档读取，pdf文档读取。
- **内容分析**: 后台分段，理解文义，给出分类标签

### 核心方法

**文件路径**: `entry/src/main/ets/common/utils/DuplicateScanner.ets`


### (1) TXT文件读取 -简单
```typescript
  private async parseTxtFile(filename: string): Promise<ParseResult> {
    try {
      const filePath = `${this.filesDir}/${filename}`;

      // 检查文件是否存在
      try {
        fileIo.accessSync(filePath);
      } catch (e) {
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: '文件不存在',
          format: DocumentFormat.TXT
        };
      }

      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(filePath);

      // 限制读取大小
      const maxSize = 500 * 1024; // 500KB
      const readSize = Math.min(stat.size, maxSize);
      const buffer = new ArrayBuffer(readSize);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      const content = this.arrayBufferToString(buffer);
      const wordCount = this.countWords(content);

      return {
        success: true,
        content: content,
        wordCount: wordCount,
        format: DocumentFormat.TXT
      };
    } catch (error) {
      console.error('[ContentParser] 解析 TXT 文件失败:', error);
      return {
        success: false,
        content: '',
        wordCount: 0,
        error: `解析失败: ${error}`,
        format: DocumentFormat.TXT
      };
    }
  }
```

### (2) Docx文件读取 -中等

使用第三方库`ohpm install @ohos/mammoth`解决该问题，第三方库网址`https://ohpm.openharmony.cn/#/cn/result?sortedType=relevancy&page=1&q=docx`


```typescript
  private async parseDocxFile(filename: string): Promise<ParseResult> {
    try {
      const filePath = `${this.filesDir}/${filename}`;
      console.log("[ContentParser]正在读取docx文件")
      // 检查文件是否存在
      try {
        fileIo.accessSync(filePath);
      } catch (e) {
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: '文件不存在',
          format: DocumentFormat.DOCX
        };
      }

      const res = await mammoth.extractRawText({
        path: filePath
      });
      console.log(`[ContentParser] mammoth解析完成，message: ${res.messages}`);

      // 提取文本内容
      let content = res.value;
      let wordCount=content.length


      if (content.length === 0) {
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: 'DOCX 文件解析失败，内容为空',
          format: DocumentFormat.DOCX
        };
      }

      return {
        success: true,
        content: content,
        wordCount: wordCount,
        format: DocumentFormat.DOCX
      };
    } catch (error) {
      console.error('[ContentParser] 解析 DOCX 文件失败:', error);
      return {
        success: false,
        content: '',
        wordCount: 0,
        error: `解析失败: ${error}`,
        format: DocumentFormat.DOCX
      };
    }
  }
```


### (3) PDF文件读取

鸿蒙开发文档中有讲：PDF Kit（PDF服务）：X86版本不支持。因此不采用该方法进行PDF的读取。而且现行的东西不支持读取大容量的PDF文件，会卡死！

```typescript

```


---

