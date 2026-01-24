# 智能文件维护系统 - 功能实现文档 (BluePrint by:CBK @Neptune_EX LJQ @Livia-Tassel)

本文档详细介绍智能维护系统的实现原理及核心方法。

---

## 1. 上传文件至沙箱（支持`docx`,`pdf`,`txt`格式）

### 功能路径

`entry/src/main/ets/view/ApplicationFileTab.ets`

### 关联文件
`entry/src/main/ets/common/utils/WriteFile.ets`

### 实现原理
系统沙箱路径存放在虚拟机内部，无法通过本地直接访问，因此使用程序将项目内文件和沙箱链接。
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
          details += `${fileName}: 失败\n`;
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

使用`import { filePreview } from '@kit.PreviewKit'`内置的预览器完成对文件的预览。但`Preview Kit（文件预览服务）：不支持.pdf/.pptx/.xlsx/.docx文件格式预览`，因此在虚拟机上无法查看具体内容。

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



## 3. 文件读取

### 关联代码

`entry/src/main/ets/common/utils/ContentParser.ets`,`entry/src/main/ets/view/SmartClassifyTab.ets`

### 实现内容

- **读取内容**: txt文档读取，docx文档读取，pdf文档读取。
- **内容分析**: 后台分段，理解文义，给出分类标签

### 核心方法

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

鸿蒙开发文档中有讲：PDF Kit（PDF服务）：X86版本不支持。因此不采用该方法进行PDF的读取。而且现行的东西不支持读取大容量的PDF文件，会卡死！因此使用最简单的


未采用：使用`PDFKit`的PDF文本解析，通过`读取图片+文字识别`解决文本提取问题
```typescript
private async extractPdfTextWithPDFKit(filePath: string): Promise<string> {
    let pdfDocument: pdfService.PdfDocument | null = null;
  
    try {
      console.log(`[ContentParser] 使用PDFKit解析: ${filePath}`);
  
      // 创建 PdfDocument 实例
      try {
        pdfDocument = new pdfService.PdfDocument;
        if (!pdfDocument) {
          throw new Error('Failed to create PdfDocument instance');
        }
        console.log('[ContentParser] PdfDocument实例创建成功');
      } catch (createError) {
        console.error('[ContentParser] 创建PdfDocument实例失败:', createError);
        throw new Error(`Failed to initialize PdfDocument: ${createError}`);
      }
  
      // 加载PDF文档
      const loadResult = pdfDocument.loadDocument(filePath, '');
  
      // 检查加载结果
      if (loadResult !== pdfService.ParseResult.PARSE_SUCCESS) {
        console.error(`[ContentParser] PDF加载失败，返回码: ${loadResult}`);
        throw new Error('PDF文档加载失败');
      }
  
      console.log('[ContentParser] PDF文档加载成功');
  
      // 获取总页数
      const pageCount = pdfDocument.getPageCount();
      console.log(`[ContentParser] PDF总页数: ${pageCount}`);
  
      if (pageCount <= 0) {
        throw new Error('PDF没有页面');
      }
  
      let extractedText = '';
  
      // 限制解析页数，避免性能问题
      const maxPagesToParse = Math.min(pageCount, 50);
  
      // 逐页提取文本
      for (let pageIndex = 0; pageIndex < maxPagesToParse; pageIndex++) {
        try {
          const page: pdfService.PdfPage = pdfDocument.getPage(pageIndex);
  
          if (!page) {
            console.warn(`[ContentParser] 第 ${pageIndex + 1} 页获取失败`);
            continue;
          }
  
          // 获取图形对象
          const graphs: Array<pdfService.GraphicsObject> = page.getGraphicsObjects();
  
          if (graphs && graphs.length > 0) {
            let pageText = '';
  
            // 遍历图形对象，提取文本
            for (let graph of graphs) {
              // 使用类型断言来访问text属性
              const typedGraph = graph as pdfService.TextObject;
              if (typedGraph.type === pdfService.GraphicsObjectType.OBJECT_TEXT && typedGraph.text) {
                pageText += typedGraph.text + ' ';
              }
            }
  
            if (pageText.trim().length > 0) {
              extractedText += pageText.trim() + '\n\n';
              console.log(`[ContentParser] 第 ${pageIndex + 1} 页提取到 ${pageText.trim().length} 字符`);
            }
          } else {
            console.log(`[ContentParser] 第 ${pageIndex + 1} 页没有图形对象`);
          }
  
          // 如果文本已经足够长，可以提前停止
          if (extractedText.length > 50000) {
            console.log(`[ContentParser] PDF文本提取达到限制，停止在第 ${pageIndex + 1} 页`);
            break;
          }
  
        } catch (pageError) {
          console.error(`[ContentParser] 提取第 ${pageIndex + 1} 页失败:`, pageError);
          continue;
        }
      }
  
      if (extractedText.trim().length === 0) {
        throw new Error('未提取到文本内容');
      }
  
      return extractedText;
  
    } catch (error) {
      console.error('[ContentParser] PDFKit解析失败:', error);
  
  
  
      // throw error;
    }
    return ''
  }
```

目前采用：二进制文件转为`utf-8`格式，会有很多乱码，仅简单地实现了提取
```typescript
 private async parsePdfFile(filename: string): Promise<ParseResult> {
    try {
      const filePath = `${this.filesDir}/${filename}`;
      console.log("[ContentParser] 正在读取PDF文件:", filePath);

      // 检查文件是否存在
      try {
        fileIo.accessSync(filePath);
      } catch (e) {
        console.error("[ContentParser] PDF文件不存在:", filePath);
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: '文件不存在',
          format: DocumentFormat.PDF
        };
      }

      // 检查文件大小
      const stat = fileIo.statSync(filePath);
      if (stat.size === 0) {
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: '文件为空',
          format: DocumentFormat.PDF
        };
      }

      console.log(`[ContentParser] PDF文件大小: ${stat.size} bytes`);


      let content: string = '';
      try {
        content = await this.extractTextWithPDF(filePath);
      } catch (pdfError) {
        console.error(`[ContentParser] PDFKit解析失败: ${pdfError}`);
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: `PDF解析失败: ${pdfError.message || pdfError}`,
          format: DocumentFormat.PDF
        };
      }

      if (!content || content.trim().length === 0) {
        console.warn(`[ContentParser] PDF解析结果为空: ${filename}`);
        return {
          success: false,
          content: '',
          wordCount: 0,
          error: 'PDF 文件解析失败，无法提取文本内容',
          format: DocumentFormat.PDF
        };
      }

      const wordCount = this.countWords(content);
      console.log(`[ContentParser] PDF解析成功，提取字符数: ${content.length}, 字数: ${wordCount}`);

      return {
        success: true,
        content: content,
        wordCount: wordCount,
        format: DocumentFormat.PDF
      };
    } catch (error) {
      console.error('[ContentParser] 解析 PDF 文件失败:', error);
      return {
        success: false,
        content: '',
        wordCount: 0,
        error: `解析失败: ${error.message || error}`,
        format: DocumentFormat.PDF
      };
    }
  }



  /**
   * ArrayBuffer 转字符串（支持 UTF-8）
   */
  private arrayBufferToString(buffer: ArrayBuffer): string {
    try {
      const uint8Array = new Uint8Array(buffer);
      let result = '';

      // 尝试 UTF-8 解码
      for (let i = 0; i < uint8Array.length; i++) {
        result += String.fromCharCode(uint8Array[i]);
      }

      // 尝试解码 UTF-8 编码的内容
      try {
        return decodeURIComponent(escape(result));
      } catch (e) {
        // 如果解码失败，返回原始结果
        return result;
      }
    } catch (error) {
      console.error('[ContentParser] Buffer 转字符串失败:', error);
      return '';
    }
  }

```








## 4. 本地关键词提取

### 关联代码

`entry/src/main/ets/view/SmartClassifyTab.ets`

### 实现内容
- **关键词分析**-: 根据内置中英文语义词，提取文本关键词
- **文档分类**-: 根据内置标签，设置文档类别
- **摘要提取**-：利用简单分词法，给出我呢当摘要

### 核心方法

```typescript
// 本地分类
  private classifyLocal(content: string): ClassificationResult {
    if (content.length === 0) {
      return { category: DocumentCategory.OTHER, confidence: 0.5 };
    }

    const contentLower = content.toLowerCase();
    let bestCategory = DocumentCategory.OTHER;
    let bestScore = 0;

    this.categoryRules.forEach((rule: CategoryKeywords): void => {
      let score = 0;
      rule.keywords.forEach((keyword: string): void => {
        if (contentLower.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });

      const normalizedScore = score / rule.keywords.length;
      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestCategory = rule.category;
      }
    });

    if (bestScore < 0.1) {
      bestCategory = DocumentCategory.OTHER;
      bestScore = 0.5;
    }

    return {
      category: bestCategory,
      confidence: Math.min(bestScore * 2, 1)
    };
  }

  // 提取关键词
  private extractKeywords(content: string): string[] {
    if (!this.similarityCalculator || content.length === 0) {
      return [];
    }

    try {
      const terms = this.similarityCalculator.extractTerms(content);
      return this.similarityCalculator.getTopKeywords(terms, 6);
    } catch (error) {
      console.error('[SmartClassifyTab] 提取关键词失败:', JSON.stringify(error));
      return [];
    }
  }

  // 生成摘要
  private generateSummary(content: string): string {
    if (content.length === 0) {
      return '';
    }

    const sentences: string[] = content.split(/[。！？\.\!\?]/);
    const validSentences: string[] = sentences.filter((s: string): boolean => {
      return s.trim().length > 10;
    });

    const summaryParts: string[] = [];
    const maxSentences = Math.min(2, validSentences.length);
    for (let i = 0; i < maxSentences; i++) {
      summaryParts.push(validSentences[i].trim());
    }

    let summary = summaryParts.join('。');
    if (summary.length > 150) {
      summary = summary.substring(0, 150) + '...';
    }

    return summary;
  }

```
### 优化要点：
-**本地内置功能有限**-：本地代码逻辑实有限，只能利用简单的字符串分割算法
-**内容提取粗糙**-：

因此，为满足智能化需求，我们将文档与Deepseek通过API远程链接起来，以实现`重复笔记检测`，`自动摘要生成`，`高性能检索`

## 5. Deepseek接入
### 关联代码

`entry/src/main/ets/common/utils/AIDocService.ets`，`entry/src/main/ets/common/utils/DeepSeekService.ets`，`entry/src/main/ets/view/KnowledgeTab.ets`

### 实现内容

- **Deepseek通过API接入**-：开放程序的网络接入，实现程序与Deepseek的互通
- **预设定Prompt**-：为实现上述智能化需求，内置Prompt，以同文件一起发到Deepseek处

### 核心方法：

### (1) Deepseek网络通讯
```typescript
/**
   * 验证 API Key 格式
   */
  static validateApiKey(apiKey: string): boolean {
    if (!apiKey || apiKey.trim().length === 0) {
      return false;
    }
    return apiKey.trim().startsWith('sk-');
  }

  /**
   * 通用 AI 调用接口
   */
  static async callAI(params: AICallParams): Promise<AICallResult> {
    try {
      console.log('[DeepSeekService] AI 调用开始, Prompt 长度:', params.prompt.length);

      const result = await DeepSeekService.callDeepSeekAPIGeneral(
        params.prompt,
        params.apiKey,
        params.systemPrompt || '',
        params.temperature !== undefined ? params.temperature : 0.3,
        params.maxTokens !== undefined ? params.maxTokens : 2000
      );

      return result;
    } catch (error) {
      console.error('[DeepSeekService] AI 调用失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, content: '', error: errorMessage };
    }
  }

  /**
   * 通用 DeepSeek API 调用
   */
  private static async callDeepSeekAPIGeneral(
    prompt: string,
    apiKey: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<AICallResult> {
    return new Promise<AICallResult>((resolve) => {
      const httpRequest = http.createHttp();
      const messages: DeepSeekRequestMessage[] = [];

      if (systemPrompt && systemPrompt.length > 0) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const requestBody: DeepSeekRequestBody = {
        model: DeepSeekService.MODEL,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        stream: false
      };

      httpRequest.request(
        DeepSeekService.API_URL,
        {
          method: http.RequestMethod.POST,
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          extraData: JSON.stringify(requestBody),
          expectDataType: http.HttpDataType.STRING,
          connectTimeout: DeepSeekService.TIMEOUT,
          readTimeout: DeepSeekService.TIMEOUT
        },
        (err: BusinessError, data: http.HttpResponse) => {
          if (err) {
            httpRequest.destroy();
            resolve({ success: false, content: '', error: `API 请求失败: ${err.message}` });
            return;
          }

          try {
            if (data.responseCode !== 200) {
              httpRequest.destroy();
              resolve({ success: false, content: '', error: `API 返回错误: ${data.responseCode}` });
              return;
            }

            const responseText = data.result as string;
            const response = JSON.parse(responseText) as DeepSeekResponse;

            if (!response.choices || response.choices.length === 0) {
              httpRequest.destroy();
              resolve({ success: false, content: '', error: 'API 响应格式错误' });
              return;
            }

            const content = response.choices[0].message.content;
            httpRequest.destroy();
            resolve({ success: true, content: content, usage: response.usage });
          } catch (parseError) {
            httpRequest.destroy();
            resolve({ success: false, content: '', error: `解析响应失败: ${parseError}` });
          }
        }
      );
    });
  }
```

### (2) Prompt内置（20260124版本未启用） 

```typescript
  /**
   * 文档分类 AI 调用
   */
  static async classifyDocument(content: string, apiKey: string): Promise<AICallResult> {
    const systemPrompt = '你是一个专业的文档分类助手。只返回 JSON 格式，不要有其他文字。';
    const prompt = `分析以下文档内容，判断其最合适的类别：
      - meeting_notes (会议纪要)
      - study_notes (学习笔记)
      - project_report (项目报告)
      - personal_diary (个人日记)
      - todo_list (待办清单)
      - technical_doc (技术文档)
      - other (其他)

      文档内容：
      ${content.substring(0, 2000)}

      请返回 JSON 格式: {"category": "类别", "confidence": 0.85}`;

    return await DeepSeekService.callAI({
      prompt: prompt,
      apiKey: apiKey,
      systemPrompt: systemPrompt,
      temperature: 0.1,
      maxTokens: 100
    });
  }

  /**
   * 文档摘要 AI 调用
   */
  static async summarizeDocument(content: string, apiKey: string): Promise<AICallResult> {
    const systemPrompt = '你是一个专业的文档摘要助手。请生成简洁准确的摘要。';
    const prompt = `请为以下文档生成 100-200 字的摘要，提取核心观点和关键信息：

    ${content.substring(0, 4000)}

    要求：简洁明了，保留核心观点，使用中文`;

    return await DeepSeekService.callAI({
      prompt: prompt,
      apiKey: apiKey,
      systemPrompt: systemPrompt,
      temperature: 0.3,
      maxTokens: 500
    });
  }

  /**
   * 关键词提取 AI 调用
   */
  static async extractKeywords(content: string, apiKey: string): Promise<AICallResult> {
    const systemPrompt = '你是一个专业的关键词提取助手。只返回 JSON 数组格式，不要有其他文字。';
    const prompt = `从以下文档中提取 3-8 个最能代表文档核心主题的关键词：

    ${content.substring(0, 3000)}

    请返回 JSON 数组格式: ["关键词1", "关键词2", "关键词3"]`;

    return await DeepSeekService.callAI({
      prompt: prompt,
      apiKey: apiKey,
      systemPrompt: systemPrompt,
      temperature: 0.2,
      maxTokens: 200
    });
  }

  /**
   * 完整文档分析 AI 调用（分类+摘要+关键词）
   */
  static async fullDocumentAnalysis(content: string, apiKey: string): Promise<AICallResult> {
    const systemPrompt = '你是一个专业的文档分析助手。只返回 JSON 格式，不要有其他文字。';
    const prompt = `请分析以下文档，提供完整的分析结果：

    ${content.substring(0, 4000)}

    请返回以下 JSON 格式：
    {
      "classification": {
        "category": "类别（meeting_notes/study_notes/project_report/personal_diary/todo_list/technical_doc/other）",
        "confidence": 0.85
      },
      "summary": "100-200字的摘要",
      "keywords": ["关键词1", "关键词2", "关键词3"]
    }`;

    return await DeepSeekService.callAI({
      prompt: prompt,
      apiKey: apiKey,
      systemPrompt: systemPrompt,
      temperature: 0.3,
      maxTokens: 1000
    });
  }

```
## 版本总结：

`20260124` 完成了基本框架，完成本地简单智能化代码编写，完成Deepseek接入并完成连通性测试

---

## 6. 知识图谱功能

### 功能路径

`entry/src/main/ets/pages/KnowledgeGraphPage.ets`

### 关联文件

- `entry/src/main/ets/common/utils/GraphLayout.ets` - 力导向布局算法
- `entry/src/main/ets/common/utils/KnowledgeIndex.ets` - 知识索引服务
- `entry/src/main/ets/view/SmartClassifyTab.ets` - 入口按钮
- `entry/src/main/resources/base/profile/main_pages.json` - 页面路由配置

### 实现内容

- **知识图谱可视化**：类似 Obsidian 的动态知识图谱，展示文档之间的概念关联
- **力导向布局**：自动计算节点位置，避免重叠
- **节点拖拽**：支持手动调整节点位置，连线跟随移动
- **节点详情**：点击节点显示文件名、分类、关键词、摘要

### 核心方法

### (1) 力导向布局算法

```typescript
/**
 * 运行力导向布局
 */
run(iterations: number = 50): LayoutResult {
  const repulsion = 5000;
  const attraction = 0.05;
  const damping = 0.9;
  const minDist = 60;

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations;

    // 斥力：节点间互斥
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n1 = this.nodes[i];
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion * alpha / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        n1.vx -= fx;
        n1.vy -= fy;
        n2.vx += fx;
        n2.vy += fy;
      }
    }

    // 引力：连接的节点相互吸引
    this.edges.forEach((edge: GraphEdge) => {
      const n1 = this.findNode(edge.source);
      const n2 = this.findNode(edge.target);
      if (!n1 || !n2) return;

      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - minDist) * attraction * edge.strength * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      n1.vx += fx;
      n1.vy += fy;
      n2.vx -= fx;
      n2.vy -= fy;
    });

    // 更新位置
    this.nodes.forEach((node: GraphNode) => {
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    });
  }

  return { nodes: this.nodes, edges: this.edges };
}
```

### (2) Canvas 绘制连线

```typescript
// 绘制所有连线
private drawEdges(): void {
  if (!this.canvasContext || this.canvasWidth === 0) return;

  this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

  this.graphEdges.forEach((edge: GraphEdge) => {
    const sourceNode = this.findNodeById(edge.source);
    const targetNode = this.findNodeById(edge.target);
    if (!sourceNode || !targetNode) return;

    const isHighlight = this.selectedNode &&
      (this.selectedNode.id === edge.source || this.selectedNode.id === edge.target);

    this.canvasContext.beginPath();
    this.canvasContext.moveTo(sourceNode.x, sourceNode.y);
    this.canvasContext.lineTo(targetNode.x, targetNode.y);

    if (isHighlight) {
      this.canvasContext.strokeStyle = '#5856D6';
      this.canvasContext.globalAlpha = 1;
    } else {
      this.canvasContext.strokeStyle = '#CCCCCC';
      this.canvasContext.globalAlpha = this.selectedNode ? 0.15 : (0.4 + edge.strength * 0.5);
    }

    this.canvasContext.lineWidth = 1 + edge.strength * 2;
    this.canvasContext.stroke();
  });

  this.canvasContext.globalAlpha = 1;
}
```

### (3) 节点拖拽交互

```typescript
.gesture(
  PanGesture()
    .onActionStart(() => {
      this.draggingNodeId = node.id;
    })
    .onActionUpdate((event: GestureEvent) => {
      if (this.draggingNodeId === node.id) {
        const newNodes = this.graphNodes.slice();
        const newNode: GraphNode = {
          id: node.id,
          x: Math.max(node.radius, Math.min(this.canvasWidth - node.radius, node.x + event.offsetX)),
          y: Math.max(node.radius, Math.min(this.canvasHeight - node.radius, node.y + event.offsetY)),
          vx: 0,
          vy: 0,
          radius: node.radius,
          keywords: node.keywords,
          connections: node.connections
        };
        newNodes[index] = newNode;
        this.graphNodes = newNodes;
        this.drawEdges(); // 重绘连线
      }
    })
    .onActionEnd(() => {
      this.draggingNodeId = '';
    })
)
```

### (4) 页面跳转传参

```typescript
// 准备传递给图谱页面的数据
const analysisData: GraphFileData[] = [];
this.fileList.forEach((f: FileAnalysis) => {
  if (f.isAnalyzed) {
    const item: GraphFileData = {
      filename: f.filename,
      category: f.category,
      categoryName: f.categoryName,
      keywords: f.keywords,
      summary: f.summary
    };
    analysisData.push(item);
  }
});

// 跳转到图谱页面
router.pushUrl({
  url: 'pages/KnowledgeGraphPage',
  params: {
    fileAnalysisList: JSON.stringify(analysisData)
  }
});
```

### 数据结构

```typescript
// 带坐标的图节点
interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  keywords: string[];
  connections: number;
}

// 图边
interface GraphEdge {
  source: string;
  target: string;
  strength: number;
  sharedKeywords: string[];
}

// 知识关联
interface KnowledgeLink {
  source: string;
  target: string;
  strength: number;
  sharedKeywords: string[];
}
```

### 节点样式映射

| 属性 | 映射规则 |
|------|----------|
| 大小 | 连接数（3-30 connections → 20-50px） |
| 颜色 | 文档分类（7种颜色对应7种类别） |
| 标签 | 文件名（截断显示前6字符） |

### 连线样式映射

| 属性 | 映射规则 |
|------|----------|
| 粗细 | 关联强度（0.2-1.0 → 1-4px） |
| 透明度 | 关联强度（0.2-1.0 → 40%-100%） |
| 高亮 | 选中节点的相关连线变为紫色 |

### 性能限制

| 指标 | 限制 | 策略 |
|------|------|------|
| 节点数 | ≤80 | 按连接数排序取前80 |
| 连线数 | ≤300 | 按强度过滤（≥0.15） |
| 布局迭代 | 60次 | 平衡效果和速度 |

### 关键点

- **坐标系统一**：Canvas 绘制连线与节点 position 使用相同的 vp 坐标系
- **响应式更新**：拖拽节点时实时调用 `drawEdges()` 重绘连线
- **安全区域**：顶部预留 48px 避免被系统状态栏遮挡
- **ArkTS 限制**：不支持可选链 `?.`，需用 if 判断替代

---

## 版本总结（更新）：

`20260124` 完成了基本框架，完成本地简单智能化代码编写，完成Deepseek接入并完成连通性测试

`20260124-v2` 新增知识图谱功能：
- 实现力导向布局算法（GraphLayout.ets）
- 创建独立知识图谱页面（KnowledgeGraphPage.ets）
- 支持节点拖拽、点击查看详情
- Canvas 绘制连线确保坐标系一致