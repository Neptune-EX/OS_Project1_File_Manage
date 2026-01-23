# 智能文件维护系统 - 功能实现文档 (BluePrint by:CBK @Neptune_EX)

本文档详细介绍智能维护系统的实现原理及核心方法。

---

## 1. 上传文件至沙箱（支持`docx`,`pdf`,`txt`格式）

### 功能路径

`entry/src/main/ets/view/ApplicationFileTab.ets`

### 关联文件
`entry/src/main/ets/common/utils/WriteFile.ets`

### 实现原理

系统提供两种文件导入方式：
1. **资源导入**：扫描 `entry/src/main/resources/rawfile` 下的所有文件，拷贝到沙箱
2. **文件选择器**：使用 `picker.DocumentViewPicker` 从设备存储选择文件导入

### 核心代码

```typescript
// 资源导入
private async copyAllRawFilesToSandbox(): Promise<void> {
  const context = getContext(this) as common.UIAbilityContext;
  const rawFileList = await context.resourceManager.getRawFileList("");

  for (const fileName of rawFileList) {
    const content = context.resourceManager.getRawFileContentSync(fileName);
    const targetPath = `${context.filesDir}/${fileName}`;
    const file = fs.openSync(targetPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.TRUNC);
    fs.writeSync(file.fd, content.buffer as ArrayBuffer);
    fs.closeSync(file);
  }
}

// 文件选择器导入
private async importWithPicker(): Promise<void> {
  const context = getContext(this) as common.UIAbilityContext;
  const documentPicker = new picker.DocumentViewPicker(context);
  const options = new picker.DocumentSelectOptions();
  options.maxSelectNumber = 20;

  const uris = await documentPicker.select(options);
  for (const uri of uris) {
    const srcFile = fs.openSync(uri, fs.OpenMode.READ_ONLY);
    const stat = fs.statSync(srcFile.fd);
    const buffer = new ArrayBuffer(stat.size);
    fs.readSync(srcFile.fd, buffer);
    fs.closeSync(srcFile);

    const dstPath = `${context.filesDir}/${fileName}`;
    const dstFile = fs.openSync(dstPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.TRUNC);
    fs.writeSync(dstFile.fd, buffer);
    fs.closeSync(dstFile);
  }
}
```

### 关键点

- 本地无法直接上传文件至虚拟机沙箱，因为权限保护
- `picker.DocumentViewPicker` 可绕过权限限制，从系统文件管理器选择文件

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
private async openFilePreview(fileName: string): Promise<void> {
  const uiContext = this.getUIContext().getHostContext() as common.UIAbilityContext;
  const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
  const filePath: string = context.filesDir + '/' + fileName;

  const uri = fileUri.getUriFromPath(filePath);
  const previewInfo: filePreview.PreviewInfo = {
    title: fileName,
    uri: uri,
    mimeType: this.getMimeType(fileName)
  };
  const displayInfo: filePreview.DisplayInfo = {
    x: 100, y: 100, width: 800, height: 800
  };

  await filePreview.openPreview(uiContext, previewInfo, displayInfo);
}
```

---

## 3. 智能文档分类

### 关联代码

`entry/src/main/ets/common/utils/ContentParser.ets`, `entry/src/main/ets/view/SmartClassifyTab.ets`

### 实现原理

- **读取内容**: txt文档读取，docx文档读取，pdf文档读取
- **内容分析**: 本地关键词匹配分类 + DeepSeek AI 生成摘要
- **相似度检测**: 基于 Jaccard/余弦相似度算法检测相似文档

### 分类类别

| 类别 | 关键词示例 |
|------|-----------|
| 会议纪要 | 会议、讨论、决议、参会、议题 |
| 学习笔记 | 学习、笔记、知识点、总结、复习 |
| 项目报告 | 项目、报告、进度、计划、里程碑 |
| 个人日记 | 日记、心情、感想、今天、生活 |
| 待办清单 | 待办、任务、清单、计划、事项 |
| 技术文档 | 技术、文档、接口、API、函数 |

### (1) TXT文件读取 - 简单
```typescript
private async parseTxtFile(filename: string): Promise<ParseResult> {
  const filePath = `${this.filesDir}/${filename}`;
  const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
  const stat = fileIo.statSync(filePath);

  const maxSize = 500 * 1024; // 500KB
  const readSize = Math.min(stat.size, maxSize);
  const buffer = new ArrayBuffer(readSize);
  fileIo.readSync(file.fd, buffer);
  fileIo.closeSync(file);

  const content = this.arrayBufferToString(buffer);
  return { success: true, content: content, wordCount: content.length, format: DocumentFormat.TXT };
}
```

### (2) DOCX文件读取 - 中等

使用第三方库 `ohpm install @ohos/mammoth` 解决该问题。

```typescript
private async parseDocxFile(filename: string): Promise<ParseResult> {
  const filePath = `${this.filesDir}/${filename}`;
  const res = await mammoth.extractRawText({ path: filePath });

  return {
    success: true,
    content: res.value,
    wordCount: res.value.length,
    format: DocumentFormat.DOCX
  };
}
```

### (3) PDF文件读取 - 使用 PDFKit（ARM 真机）

**注意**：PDF Kit 在 X86 模拟器上不可用，仅支持 ARM 真机。

```typescript
import { pdfService } from '@kit.PDFKit';

private async extractPdfTextWithPDFKit(filePath: string): Promise<string> {
  const pdfDocument = new pdfService.PdfDocument();
  const loadResult = pdfDocument.loadDocument(filePath, '');

  if (loadResult !== pdfService.ParseResult.PARSE_SUCCESS) {
    throw new Error(`PDF加载失败，错误码: ${loadResult}`);
  }

  const pageCount = pdfDocument.getPageCount();
  let extractedText = '';

  for (let pageIndex = 0; pageIndex < Math.min(pageCount, 50); pageIndex++) {
    const page = pdfDocument.getPage(pageIndex);
    if (!page) continue;

    const graphs = page.getGraphicsObjects();
    if (graphs && graphs.length > 0) {
      for (const graph of graphs) {
        const textObj = graph as pdfService.TextObject;
        if (textObj.type === pdfService.GraphicsObjectType.OBJECT_TEXT && textObj.text) {
          extractedText += textObj.text + ' ';
        }
      }
    }
  }

  return extractedText.trim();
}
```

---

## 4. 相似度检测

### 功能路径

`entry/src/main/ets/common/utils/SimilarityCalculator.ets`

### 实现原理

基于文本内容计算文档间的相似度，支持多种算法：
- **Jaccard 相似度**：基于词集合的交集/并集比例
- **余弦相似度**：基于词频向量的夹角余弦值
- **共同关键词**：提取两篇文档的共同高频词

### 核心代码

```typescript
// 批量计算相似度
async batchCalculateSimilarity(
  documents: Map<string, string>,
  threshold: number = 0.25
): Promise<SimilarityResult[]> {
  const results: SimilarityResult[] = [];
  const filenames = Array.from(documents.keys());

  for (let i = 0; i < filenames.length; i++) {
    for (let j = i + 1; j < filenames.length; j++) {
      const content1 = documents.get(filenames[i]) || '';
      const content2 = documents.get(filenames[j]) || '';

      const terms1 = this.extractTerms(content1);
      const terms2 = this.extractTerms(content2);
      const score = this.calculateJaccardSimilarity(terms1, terms2);

      if (score >= threshold) {
        results.push({
          file1: filenames[i],
          file2: filenames[j],
          score: score,
          sharedTerms: this.getSharedTerms(terms1, terms2)
        });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
```

### UI 展示

在 SmartClassifyTab 中，分析完成后自动计算相似度，展示相似文档对及共同关键词。

---

## 5. AI 知识库对话

### 功能路径

`entry/src/main/ets/view/KnowledgeTab.ets`

### 关联文件

`entry/src/main/ets/common/utils/DeepSeekService.ets`

### 实现原理

集成 DeepSeek API，提供：
- **智能对话**：用户可直接与 AI 对话
- **文档分析**：选择文件后，AI 自动分析并生成摘要、关键要点、分类建议

### 核心代码

```typescript
// DeepSeek API 调用
static async callAI(params: AICallParams): Promise<AICallResult> {
  const requestBody = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: params.systemPrompt || '你是一个专业的文档分析助手' },
      { role: 'user', content: params.prompt }
    ],
    temperature: params.temperature || 0.7,
    max_tokens: params.maxTokens || 2000
  };

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${params.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  return {
    success: true,
    content: data.choices[0].message.content
  };
}
```

### API Key 管理

- API Key 保存在沙箱文件 `.deepseek_api_key` 中
- 启动时自动加载，支持用户手动设置

---

## 6. 自动摘要生成

### 功能路径

`entry/src/main/ets/view/SmartClassifyTab.ets`

### 实现原理

支持两种摘要生成模式：
1. **AI 摘要**：调用 DeepSeek API 生成高质量摘要
2. **本地摘要**：提取文档前几句有效句子作为摘要（后备方案）

### 核心代码

```typescript
private async generateSummaryAsync(content: string): Promise<string> {
  // 优先使用 AI 摘要
  if (this.useAISummary && this.apiKey && this.apiKey.length > 0) {
    try {
      const result = await DeepSeekService.summarizeDocument(content, this.apiKey);
      if (result.success && result.content.length > 0) {
        return result.content;
      }
    } catch (error) {
      console.warn('AI 摘要失败，使用本地摘要');
    }
  }

  // 本地摘要作为后备
  return this.generateLocalSummary(content);
}

private generateLocalSummary(content: string): string {
  const sentences = content.split(/[。！？；\.\!\?\;]+/);
  const validSentences = sentences.filter(s => s.trim().length > 8);

  const summaryParts: string[] = [];
  let totalLength = 0;

  for (let i = 0; i < validSentences.length && summaryParts.length < 4; i++) {
    const sentence = validSentences[i].trim();
    if (totalLength + sentence.length <= 280) {
      summaryParts.push(sentence);
      totalLength += sentence.length;
    }
  }

  return summaryParts.join('。') + '。';
}
```

---

## 7. 项目架构

```
entry/src/main/ets/
├── entryability/
│   └── EntryAbility.ets          # 应用入口
├── pages/
│   └── HomePage.ets              # 主页面（4个Tab）
├── view/
│   ├── ApplicationFileTab.ets    # Tab1: 文件导入
│   ├── PublicFilesTab.ets        # Tab2: 文件管理
│   ├── SmartClassifyTab.ets      # Tab3: 智能分类
│   └── KnowledgeTab.ets          # Tab4: AI知识库
├── workers/
│   ├── DuplicateWorker.ets       # 去重扫描Worker
│   └── AIDocWorker.ets           # AI分析Worker
└── common/
    ├── types/
    │   └── AIDocTypes.ets        # 类型定义
    └── utils/
        ├── FileManager.ets       # 文件操作核心
        ├── ContentParser.ets     # 文档解析（TXT/DOCX/PDF）
        ├── DeepSeekService.ets   # DeepSeek API 服务
        ├── SimilarityCalculator.ets  # 相似度计算
        ├── KnowledgeIndex.ets    # 知识索引
        ├── WriteFile.ets         # 文件写入
        └── ReadFile.ets          # 文件读取
```

---

## 8. 技术栈

| 技术 | 用途 |
|------|------|
| ArkTS/ETS | HarmonyOS 应用开发语言 |
| @ohos/mammoth | DOCX 文档解析 |
| @kit.PDFKit | PDF 文档解析（ARM 真机） |
| @kit.CoreFileKit | 文件操作 |
| @kit.PreviewKit | 文件预览 |
| DeepSeek API | AI 对话和文档分析 |

---

## 9. 注意事项

1. **PDF 解析**：仅支持 ARM 真机，X86 模拟器不可用
2. **API Key**：使用 DeepSeek AI 功能需要设置有效的 API Key
3. **文件大小限制**：TXT 最大 500KB，PDF 最大 10MB
4. **沙箱权限**：应用只能访问自己的沙箱目录
