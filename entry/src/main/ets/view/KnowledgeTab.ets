/**
 * AI 知识库 Tab 页面
 * 提供基于 DeepSeek AI 的智能对话和文档分析功能
 */

import { common } from '@kit.AbilityKit';
import { DeepSeekService, AICallParams, AICallResult } from '../common/utils/DeepSeekService';
import { ContentParser, ParseResult } from '../common/utils/ContentParser';
import { fileIo } from '@kit.CoreFileKit';
import { util } from '@kit.ArkTS';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const API_KEY_FILE = '.deepseek_api_key';

@Component
export struct KnowledgeTab {
  @State chatMessages: ChatMessage[] = [];
  @State inputText: string = '';
  @State isProcessing: boolean = false;
  @State apiKey: string = '';
  @State showApiKeyInput: boolean = false;
  @State apiKeyInput: string = '';
  @State showFileSelector: boolean = false;
  @State availableFiles: string[] = [];
  @State showToastMsg: boolean = false;
  @State toastText: string = '';
  @State toastType: string = 'info';

  private context: common.UIAbilityContext | null = null;
  private filesDir: string = '';
  private contentParser: ContentParser | null = null;
  private scroller: Scroller = new Scroller();

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
    } catch (error) {
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
    } catch (error) {
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
    if (this.inputText.trim().length === 0) return;

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
      } else {
        this.addAssistantMessage(`请求失败：${result.error || '未知错误'}`);
      }
    } catch (error) {
      this.addAssistantMessage(`发生错误：${error}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private loadFileList(): void {
    try {
      let files = fileIo.listFileSync(this.filesDir);
      this.availableFiles = files.filter((f: string) => {
        return !f.startsWith('.') && (f.endsWith('.txt') || f.endsWith('.docx') || f.endsWith('.pdf'));
      });
    } catch (error) {
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
    } catch (error) {
      this.addAssistantMessage(`分析出错：${error}`);
    } finally {
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

  build() {
    Column() {
      // 顶部栏
      Row() {
        Column() {
          Text('AI 助手')
            .fontSize(22)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
          Text(this.apiKey ? '已连接' : '未设置 API')
            .fontSize(11)
            .fontColor(this.apiKey ? '#34C759' : '#FF9500')
            .margin({ top: 2 })
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)

        Button('设置')
          .fontSize(13)
          .height(34)
          .backgroundColor('#007AFF')
          .fontColor(Color.White)
          .borderRadius(8)
          .onClick(() => {
            this.apiKeyInput = this.apiKey;
            this.showApiKeyInput = true;
          })

        Button('清空')
          .fontSize(13)
          .height(34)
          .backgroundColor('#FF3B30')
          .fontColor(Color.White)
          .borderRadius(8)
          .margin({ left: 8 })
          .onClick(() => {
            this.chatMessages = [];
            this.addAssistantMessage('对话已清空，有什么可以帮你的？');
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 8, bottom: 8 })
      .backgroundColor(Color.White)

      // Toast 提示
      if (this.showToastMsg) {
        Text(this.toastText)
          .fontSize(13)
          .fontColor(Color.White)
          .backgroundColor(this.toastType === 'success' ? '#34C759' : (this.toastType === 'error' ? '#FF3B30' : '#007AFF'))
          .padding({ left: 16, right: 16, top: 8, bottom: 8 })
          .borderRadius(20)
          .margin({ top: 8 })
      }

      // 对话区域
      Scroll(this.scroller) {
        Column() {
          ForEach(this.chatMessages, (msg: ChatMessage) => {
            Column() {
              Row() {
                if (msg.role === 'user') {
                  Blank().layoutWeight(1)
                }

                Column() {
                  Text(msg.content)
                    .fontSize(14)
                    .fontColor(msg.role === 'user' ? Color.White : '#333333')
                    .lineHeight(20)
                    .padding(12)
                    .backgroundColor(msg.role === 'user' ? '#007AFF' : Color.White)
                    .borderRadius(16)
                }
                .constraintSize({ maxWidth: '75%' })
                .alignItems(msg.role === 'user' ? HorizontalAlign.End : HorizontalAlign.Start)

                if (msg.role === 'assistant') {
                  Blank().layoutWeight(1)
                }
              }
              .width('100%')

              Text(this.formatTime(msg.timestamp))
                .fontSize(10)
                .fontColor('#AAAAAA')
                .margin({ top: 4 })
                .alignSelf(msg.role === 'user' ? ItemAlign.End : ItemAlign.Start)
            }
            .width('100%')
            .padding({ left: 16, right: 16, bottom: 12 })
          })
        }
        .width('100%')
        .padding({ top: 8 })
        .justifyContent(FlexAlign.Start)
      }
      .layoutWeight(1)
      .scrollBar(BarState.Off)
      .backgroundColor('#F0F0F0')
      .align(Alignment.Top)

      // 底部输入区
      Column() {
        Row({ space: 8 }) {
          Button('📄 分析文件')
            .fontSize(12)
            .height(32)
            .backgroundColor('#34C759')
            .fontColor(Color.White)
            .borderRadius(16)
            .onClick(() => {
              this.loadFileList();
              this.showFileSelector = true;
            })
            .enabled(!this.isProcessing)
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 8 })

        Row({ space: 10 }) {
          TextInput({ placeholder: '输入消息...', text: this.inputText })
            .layoutWeight(1)
            .height(40)
            .backgroundColor(Color.White)
            .borderRadius(20)
            .padding({ left: 16, right: 16 })
            .onChange((value: string) => { this.inputText = value; })
            .onSubmit(() => { this.sendMessage(); })
            .enabled(!this.isProcessing)

          Button(this.isProcessing ? '...' : '发送')
            .width(56)
            .height(40)
            .fontSize(14)
            .backgroundColor(this.isProcessing ? '#C7C7CC' : '#007AFF')
            .fontColor(Color.White)
            .borderRadius(20)
            .onClick(() => { this.sendMessage(); })
            .enabled(!this.isProcessing && this.inputText.trim().length > 0)
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 8, bottom: 8 })
      }
      .backgroundColor('#F8F8F8')

      // API Key 弹窗
      if (this.showApiKeyInput) {
        Column()
          .width('100%')
          .height('100%')
          .backgroundColor('rgba(0,0,0,0.4)')
          .onClick(() => { this.showApiKeyInput = false; })
          .position({ x: 0, y: 0 })

        Column() {
          Text('设置 API Key')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
            .margin({ bottom: 16 })

          TextInput({ placeholder: 'sk-...', text: this.apiKeyInput })
            .width('100%')
            .height(46)
            .backgroundColor('#F5F5F5')
            .borderRadius(10)
            .onChange((value: string) => { this.apiKeyInput = value; })
            .margin({ bottom: 12 })

          Text('从 DeepSeek 官网获取 API Key')
            .fontSize(11)
            .fontColor('#8E8E93')
            .margin({ bottom: 20 })

          Row({ space: 12 }) {
            Button('取消')
              .layoutWeight(1)
              .height(44)
              .backgroundColor('#E5E5E5')
              .fontColor('#333333')
              .borderRadius(10)
              .onClick(() => { this.showApiKeyInput = false; })

            Button('保存')
              .layoutWeight(1)
              .height(44)
              .backgroundColor('#007AFF')
              .fontColor(Color.White)
              .borderRadius(10)
              .onClick(() => {
                if (DeepSeekService.validateApiKey(this.apiKeyInput)) {
                  this.saveApiKey(this.apiKeyInput);
                } else {
                  this.showToast('API Key 格式不正确', 'error');
                }
              })
          }
          .width('100%')
        }
        .width('85%')
        .padding(24)
        .backgroundColor(Color.White)
        .borderRadius(20)
        .position({ x: '7.5%', y: '25%' })
      }

      // 文件选择弹窗
      if (this.showFileSelector) {
        Column()
          .width('100%')
          .height('100%')
          .backgroundColor('rgba(0,0,0,0.4)')
          .onClick(() => { this.showFileSelector = false; })
          .position({ x: 0, y: 0 })

        Column() {
          Text('选择文件')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
            .margin({ bottom: 16 })

          if (this.availableFiles.length === 0) {
            Text('暂无可分析的文件')
              .fontSize(14)
              .fontColor('#8E8E93')
              .padding(30)
          } else {
            Scroll() {
              Column({ space: 8 }) {
                ForEach(this.availableFiles, (filename: string) => {
                  Row() {
                    Text(filename.endsWith('.pdf') ? '📕' : (filename.endsWith('.docx') ? '📘' : '📄'))
                      .fontSize(20)
                      .margin({ right: 10 })
                    Text(filename)
                      .fontSize(14)
                      .fontColor('#333333')
                      .layoutWeight(1)
                      .maxLines(1)
                      .textOverflow({ overflow: TextOverflow.Ellipsis })
                  }
                  .width('100%')
                  .height(50)
                  .padding({ left: 14, right: 14 })
                  .backgroundColor('#F8F8F8')
                  .borderRadius(10)
                  .onClick(() => { this.analyzeFile(filename); })
                })
              }
              .width('100%')
            }
            .height(200)
          }

          Button('关闭')
            .width('100%')
            .height(44)
            .backgroundColor('#007AFF')
            .fontColor(Color.White)
            .borderRadius(10)
            .margin({ top: 16 })
            .onClick(() => { this.showFileSelector = false; })
        }
        .width('85%')
        .padding(24)
        .backgroundColor(Color.White)
        .borderRadius(20)
        .position({ x: '7.5%', y: '20%' })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}
