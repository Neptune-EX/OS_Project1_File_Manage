/**
 * AI 知识库 Tab 页面 - 简化版
 * 提供基于 DeepSeek AI 的智能对话和文档分析功能
 */

import { common } from '@kit.AbilityKit';
import { DeepSeekService, AICallParams, AICallResult } from '../common/utils/DeepSeekService';
import { ContentParser, ParseResult } from '../common/utils/ContentParser';
import { fileIo } from '@kit.CoreFileKit';

// 聊天消息接口
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// API 密钥存储键
const API_KEY_STORAGE_KEY = 'deepseek_api_key';

@Component
export struct KnowledgeTab {
  @State chatMessages: ChatMessage[] = [];
  @State inputText: string = '';
  @State isProcessing: boolean = false;
  @State apiKey: string = '';
  @State showApiKeyInput: boolean = false;
  @State apiKeyInput: string = '';

  // 文件选择
  @State showFileSelector: boolean = false;
  @State availableFiles: string[] = [];
  @State selectedFile: string = '';

  // 消息提示
  @State showMessage: boolean = false;
  @State messageText: string = '';
  @State messageType: string = 'info';

  private context: common.UIAbilityContext | null = null;
  private filesDir: string = '';
  private contentParser: ContentParser | null = null;
  private scroller: Scroller = new Scroller();

  aboutToAppear(): void {
    const ctx = this.getUIContext().getHostContext() as Context;
    this.context = ctx as common.UIAbilityContext;
    this.filesDir = this.context.filesDir;
    this.contentParser = ContentParser.getInstance(ctx);

    // 加载保存的 API Key (简化版，实际应使用安全存储)
    this.loadApiKey();

    // 添加欢迎消息
    this.addAssistantMessage('你好！我是 AI 助手，可以帮你分析文档、回答问题。请先设置 DeepSeek API Key。');
  }

  // 加载 API Key
  private loadApiKey(): void {
    try {
      // const preferences = this.context?.getPreferences();
      // 这里简化处理，实际应使用 preferences API
      // this.apiKey = preferences?.getSync(API_KEY_STORAGE_KEY, '') as string;
      this.apiKey=API_KEY_STORAGE_KEY
    } catch (error) {
      console.error('[KnowledgeTab] 加载 API Key 失败:', error);
    }
  }

  // 保存 API Key
  private saveApiKey(key: string): void {
    this.apiKey = key;
    this.showApiKeyInput = false;
    this.showToast('API Key 已保存', 'success');

    // 实际应用中应使用安全存储
    try {
      // const preferences = this.context?.getPreferences();
      // preferences?.putSync(API_KEY_STORAGE_KEY, key);
    } catch (error) {
      console.error('[KnowledgeTab] 保存 API Key 失败:', error);
    }
  }

  // 添加用户消息
  private addUserMessage(content: string): void {
    const message: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content,
      timestamp: Date.now()
    };
    this.chatMessages.push(message);
    this.chatMessages = this.chatMessages.slice();

    // 滚动到底部
    setTimeout(() => {
      this.scroller.scrollEdge(Edge.Bottom);
    }, 100);
  }

  // 添加助手消息
  private addAssistantMessage(content: string): void {
    const message: ChatMessage = {
      id: `assistant_${Date.now()}`,
      role: 'assistant',
      content: content,
      timestamp: Date.now()
    };
    this.chatMessages.push(message);
    this.chatMessages = this.chatMessages.slice();

    // 滚动到底部
    setTimeout(() => {
      this.scroller.scrollEdge(Edge.Bottom);
    }, 100);
  }

  // 发送消息
  private async sendMessage(): Promise<void> {
    if (this.inputText.trim().length === 0) {
      return;
    }

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
        systemPrompt: '你是一个专业的文档分析助手，能够帮助用户理解和分析各类文档。',
        temperature: 0.7,
        maxTokens: 2000
      };

      const result: AICallResult = await DeepSeekService.callAI(params);

      if (result.success) {
        this.addAssistantMessage(result.content);
      } else {
        this.addAssistantMessage(`抱歉，请求失败：${result.error || '未知错误'}`);
        this.showToast('AI 请求失败', 'error');
      }
    } catch (error) {
      console.error('[KnowledgeTab] AI 调用失败:', error);
      this.addAssistantMessage(`抱歉，发生错误：${error}`);
      this.showToast('发生错误', 'error');
    } finally {
      this.isProcessing = false;
    }
  }

  // 加载文件列表
  private loadFileList(): void {
    try {
      let files = fileIo.listFileSync(this.filesDir);
      // 过滤隐藏文件和只保留支持的格式
      this.availableFiles = files.filter((f: string) => {
        return !f.startsWith('.') && (
          f.endsWith('.txt') ||
          f.endsWith('.docx') ||
          f.endsWith('.pdf')
        );
      });
    } catch (error) {
      console.error('[KnowledgeTab] 加载文件列表失败:', error);
      this.showToast('加载文件列表失败', 'error');
    }
  }

  // 分析选中的文件
  private async analyzeFile(filename: string): Promise<void> {
    if (!this.contentParser) {
      this.showToast('内容解析器未初始化', 'error');
      return;
    }

    if (!this.apiKey || this.apiKey.trim().length === 0) {
      this.showToast('请先设置 API Key', 'error');
      this.showApiKeyInput = true;
      return;
    }

    this.showFileSelector = false;
    this.addUserMessage(`请分析文件：${filename}`);
    this.isProcessing = true;

    try {
      // 读取文件内容
      const parseResult: ParseResult = await this.contentParser.parseDocument(filename);

      if (!parseResult.success) {
        this.addAssistantMessage(`无法读取文件：${parseResult.error || '未知错误'}`);
        this.isProcessing = false;
        return;
      }

      // 调用 AI 分析
      const prompt = `请分析以下文档内容，提供摘要、关键要点和分类建议：

文档名称：${filename}
字数：${parseResult.wordCount}

文档内容：
${parseResult.content.substring(0, 4000)}

请提供：
1. 文档摘要（100-200字）
2. 3-5个关键要点
3. 文档类型分类建议
4. 其他有价值的分析`;

      const params: AICallParams = {
        prompt: prompt,
        apiKey: this.apiKey,
        systemPrompt: '你是一个专业的文档分析助手，擅长提取关键信息和提供有价值的洞察。',
        temperature: 0.3,
        maxTokens: 2000
      };

      const result: AICallResult = await DeepSeekService.callAI(params);

      if (result.success) {
        this.addAssistantMessage(result.content);
      } else {
        this.addAssistantMessage(`分析失败：${result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('[KnowledgeTab] 文件分析失败:', error);
      this.addAssistantMessage(`分析过程出错：${error}`);
    } finally {
      this.isProcessing = false;
    }
  }

  // 清空对话
  private clearChat(): void {
    this.chatMessages = [];
    this.addAssistantMessage('对话已清空。有什么我可以帮你的吗？');
  }

  // 显示提示消息
  private showToast(message: string, type: string = 'info'): void {
    this.messageText = message;
    this.messageType = type;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  // 格式化时间
  private formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  build() {
    Column() {
      // 顶部标题栏
      Row() {
        Text('AI 助手')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .layoutWeight(1)

        Button('设置 API')
          .fontSize(12)
          .height(32)
          .backgroundColor('#007AFF')
          .fontColor(Color.White)
          .borderRadius(6)
          .onClick(() => {
            this.apiKeyInput = this.apiKey;
            this.showApiKeyInput = true;
          })

        Button('清空')
          .fontSize(12)
          .height(32)
          .backgroundColor('#FF3B30')
          .fontColor(Color.White)
          .borderRadius(6)
          .margin({ left: 8 })
          .onClick(() => {
            this.clearChat();
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 12 })

      // 消息提示
      if (this.showMessage) {
        Text(this.messageText)
          .fontSize(14)
          .fontColor('#FFFFFF')
          .backgroundColor(
            this.messageType === 'success' ? '#34C759' :
              (this.messageType === 'error' ? '#FF3B30' : '#007AFF')
          )
          .padding({ left: 16, right: 16, top: 8, bottom: 8 })
          .borderRadius(8)
          .margin({ left: 16, right: 16, bottom: 8 })
      }

      // 对话区域
      Scroll(this.scroller) {
        Column() {
          if (this.chatMessages.length === 0) {
            Column() {
              Text('暂无对话')
                .fontSize(14)
                .fontColor('#8E8E93')
            }
            .width('100%')
            .height(200)
            .justifyContent(FlexAlign.Center)
          } else {
            ForEach(this.chatMessages, (message: ChatMessage) => {
              Row() {
                if (message.role === 'user') {
                  Blank()
                    .layoutWeight(1)
                }

                Column() {
                  Text(message.content)
                    .fontSize(14)
                    .fontColor(message.role === 'user' ? '#FFFFFF' : '#333333')
                    .padding(12)
                    .backgroundColor(message.role === 'user' ? '#007AFF' : '#F0F0F0')
                    .borderRadius(12)
                    .maxLines(1000)

                  Text(this.formatTime(message.timestamp))
                    .fontSize(10)
                    .fontColor('#8E8E93')
                    .margin({ top: 4 })
                    .alignSelf(message.role === 'user' ? ItemAlign.End : ItemAlign.Start)
                }
                .alignItems(message.role === 'user' ? HorizontalAlign.End : HorizontalAlign.Start)
                .layoutWeight(3)

                if (message.role === 'assistant') {
                  Blank()
                    .layoutWeight(1)
                }
              }
              .width('100%')
              .margin({ bottom: 12 })
              .padding({ left: 16, right: 16 })
            })
          }
        }
        .width('100%')
      }
      .layoutWeight(1)
      .scrollBar(BarState.Auto)

      // 底部输入区
      Column() {
        // 功能按钮
        Row({ space: 8 }) {
          Button('分析文件')
            .fontSize(12)
            .height(36)
            .backgroundColor('#34C759')
            .fontColor(Color.White)
            .borderRadius(6)
            .onClick(() => {
              this.loadFileList();
              this.showFileSelector = true;
            })
            .enabled(!this.isProcessing)
        }
        .width('100%')
        .padding({ left: 16, right: 16, bottom: 35 })

        // 输入框和发送按钮
        Row({ space: 8 }) {
          TextInput({ placeholder: '输入消息...', text: this.inputText })
            .layoutWeight(1)
            .height(44)
            .backgroundColor(Color.White)
            .borderRadius(8)
            .onChange((value: string) => {
              this.inputText = value;
            })
            .onSubmit(() => {
              this.sendMessage();
            })
            .enabled(!this.isProcessing)

          Button(this.isProcessing ? '处理中...' : '发送')
            .height(44)
            .fontSize(14)
            .backgroundColor(this.isProcessing ? '#C7C7CC' : '#007AFF')
            .fontColor(Color.White)
            .borderRadius(8)
            .onClick(() => {
              this.sendMessage();
            })
            .enabled(!this.isProcessing && this.inputText.trim().length > 0)
        }
        .width('100%')
        .padding({ left: 16, right: 16, bottom: 60 })
      }
      .backgroundColor('#F8F8F8')
      .borderRadius({ topLeft: 16, topRight: 16 })

      // API Key 设置弹窗
      if (this.showApiKeyInput) {
        Stack()
          .width('100%')
          .height('100%')
          .backgroundColor('rgba(0, 0, 0, 0.5)')
          .onClick(() => {
            this.showApiKeyInput = false;
          })
          .position({ x: 0, y: 0 })

        Column() {
          Text('设置 DeepSeek API Key')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
            .margin({ bottom: 16 })

          TextInput({ placeholder: '请输入 API Key (sk-...)', text: this.apiKeyInput })
            .width('100%')
            .height(44)
            .backgroundColor('#F0F0F0')
            .borderRadius(8)
            .type(InputType.Normal)
            .onChange((value: string) => {
              this.apiKeyInput = value;
            })
            .margin({ bottom: 16 })

          Text('提示：请从 DeepSeek 官网获取 API Key')
            .fontSize(12)
            .fontColor('#8E8E93')
            .margin({ bottom: 16 })

          Row({ space: 12 }) {
            Button('取消')
              .layoutWeight(1)
              .height(44)
              .backgroundColor('#E0E0E0')
              .fontColor('#333333')
              .borderRadius(8)
              .onClick(() => {
                this.showApiKeyInput = false;
              })

            Button('保存')
              .layoutWeight(1)
              .height(44)
              .backgroundColor('#007AFF')
              .fontColor(Color.White)
              .borderRadius(8)
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
        .padding(20)
        .backgroundColor(Color.White)
        .borderRadius(16)
        .position({ x: '7.5%', y: '30%' })
      }

      // 文件选择器弹窗
      if (this.showFileSelector) {
        Stack()
          .width('100%')
          .height('100%')
          .backgroundColor('rgba(0, 0, 0, 0.5)')
          .onClick(() => {
            this.showFileSelector = false;
          })
          .position({ x: 0, y: 0 })

        Column() {
          Text('选择要分析的文件')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
            .margin({ bottom: 16 })

          if (this.availableFiles.length === 0) {
            Text('暂无可分析的文件')
              .fontSize(14)
              .fontColor('#8E8E93')
              .padding(40)
          } else {
            Scroll() {
              Column() {
                ForEach(this.availableFiles, (filename: string) => {
                  Row() {
                    Text(filename)
                      .fontSize(14)
                      .fontColor('#333333')
                      .layoutWeight(1)
                  }
                  .width('100%')
                  .height(44)
                  .padding({ left: 12, right: 12 })
                  .backgroundColor('#F8F8F8')
                  .borderRadius(8)
                  .margin({ bottom: 8 })
                  .onClick(() => {
                    this.analyzeFile(filename);
                  })
                })
              }
              .width('100%')
            }
            .layoutWeight(1)
          }

          Button('关闭')
            .width('100%')
            .height(44)
            .backgroundColor('#007AFF')
            .fontColor(Color.White)
            .borderRadius(8)
            .margin({ top: 16 })
            .onClick(() => {
              this.showFileSelector = false;
            })
        }
        .width('85%')
        .height('60%')
        .padding(20)
        .backgroundColor(Color.White)
        .borderRadius(16)
        .position({ x: '7.5%', y: '20%' })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}
