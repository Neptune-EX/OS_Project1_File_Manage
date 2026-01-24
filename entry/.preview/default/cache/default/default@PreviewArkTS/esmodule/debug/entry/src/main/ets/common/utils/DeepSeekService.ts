import http from "@ohos:net.http";
import type { BusinessError } from "@ohos:base";
// DeepSeek API 消息接口
interface DeepSeekMessage {
    role: string;
    content: string;
}
// DeepSeek API 选择项接口
interface DeepSeekChoice {
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
}
// DeepSeek API 使用量接口
interface DeepSeekUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}
// DeepSeek API 响应接口
interface DeepSeekResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: DeepSeekChoice[];
    usage: DeepSeekUsage;
}
// DeepSeek API 请求消息接口
interface DeepSeekRequestMessage {
    role: string;
    content: string;
}
// DeepSeek API 请求体接口
interface DeepSeekRequestBody {
    model: string;
    messages: DeepSeekRequestMessage[];
    temperature: number;
    max_tokens: number;
    stream: boolean;
}
// 通用 AI 调用参数接口
export interface AICallParams {
    prompt: string;
    apiKey: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
}
// AI 调用结果接口
export interface AICallResult {
    success: boolean;
    content: string;
    error?: string;
    usage?: DeepSeekUsage;
}
export class DeepSeekService {
    private static readonly API_URL = 'https://api.deepseek.com/v1/chat/completions';
    private static readonly MODEL = 'deepseek-chat';
    private static readonly TIMEOUT = 120000;
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
            const result = await DeepSeekService.callDeepSeekAPIGeneral(params.prompt, params.apiKey, params.systemPrompt || '', params.temperature !== undefined ? params.temperature : 0.3, params.maxTokens !== undefined ? params.maxTokens : 2000);
            return result;
        }
        catch (error) {
            console.error('[DeepSeekService] AI 调用失败:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return { success: false, content: '', error: errorMessage };
        }
    }
    /**
     * 通用 DeepSeek API 调用
     */
    private static async callDeepSeekAPIGeneral(prompt: string, apiKey: string, systemPrompt: string, temperature: number, maxTokens: number): Promise<AICallResult> {
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
            httpRequest.request(DeepSeekService.API_URL, {
                method: http.RequestMethod.POST,
                header: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                extraData: JSON.stringify(requestBody),
                expectDataType: http.HttpDataType.STRING,
                connectTimeout: DeepSeekService.TIMEOUT,
                readTimeout: DeepSeekService.TIMEOUT
            }, (err: BusinessError, data: http.HttpResponse) => {
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
                }
                catch (parseError) {
                    httpRequest.destroy();
                    resolve({ success: false, content: '', error: `解析响应失败: ${parseError}` });
                }
            });
        });
    }
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
}
