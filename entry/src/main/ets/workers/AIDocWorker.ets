/**
 * AI 文档分析后台 Worker
 * 在独立线程中执行 AI 文档分析，避免阻塞 UI
 */

import worker, { MessageEvents } from '@ohos.worker';
import { http } from '@kit.NetworkKit';
import { BusinessError } from '@kit.BasicServicesKit';

// Worker 消息类型
const MSG_TYPE_ANALYZE = 'analyze';
const MSG_TYPE_BATCH_ANALYZE = 'batch_analyze';
const MSG_TYPE_PROGRESS = 'progress';
const MSG_TYPE_RESULT = 'result';
const MSG_TYPE_ERROR = 'error';
const MSG_TYPE_COMPLETE = 'complete';

// DeepSeek API 配置
const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';
const TIMEOUT = 120000;

// 消息接口定义
interface WorkerMessage {
  type: string;
  taskId: string;
  filename: string;
  content: string;
  apiKey: string;
  files: FileItem[];
}

interface FileItem {
  filename: string;
  content: string;
}

interface DeepSeekMessage {
  role: string;
  content: string;
}

interface DeepSeekChoice {
  index: number;
  message: DeepSeekMessage;
  finish_reason: string;
}

interface DeepSeekUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChoice[];
  usage: DeepSeekUsage;
}

interface DeepSeekRequestMessage {
  role: string;
  content: string;
}

interface DeepSeekRequestBody {
  model: string;
  messages: DeepSeekRequestMessage[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
}

interface AnalysisResult {
  classification: ClassificationInfo;
  summary: string;
  keywords: string[];
}

interface ClassificationInfo {
  category: string;
  confidence: number;
}

// 定义解析结果的接口类型
interface GeneratedTypeLiteralInterface_1 {
  category?: string;
  confidence?: number;
}

interface ParsedAnalysisData {
  classification?: GeneratedTypeLiteralInterface_1;
  summary?: string;
  keywords?: string[];
}

// 获取 workerPort
const workerPort = worker.workerPort;

// 监听主线程消息
workerPort.onmessage = (event: MessageEvents) => {
  const message = event.data as WorkerMessage;

  if (message.type === MSG_TYPE_ANALYZE) {
    handleAnalyze(message);
  } else if (message.type === MSG_TYPE_BATCH_ANALYZE) {
    handleBatchAnalyze(message);
  }
};

/**
 * 处理单文档分析
 */
async function handleAnalyze(message: WorkerMessage): Promise<void> {
  try {
    console.log('[AIDocWorker] 开始分析文档:', message.filename);

    const result = await analyzeContent(message.content, message.apiKey);

    workerPort.postMessage({
      type: MSG_TYPE_RESULT,
      taskId: message.taskId,
      filename: message.filename,
      result: result
    });
  } catch (error) {
    console.error('[AIDocWorker] 分析失败:', error);
    workerPort.postMessage({
      type: MSG_TYPE_ERROR,
      taskId: message.taskId,
      filename: message.filename,
      error: String(error)
    });
  }
}

/**
 * 处理批量分析
 */
async function handleBatchAnalyze(message: WorkerMessage): Promise<void> {
  const files = message.files;
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 发送进度更新
    workerPort.postMessage({
      type: MSG_TYPE_PROGRESS,
      taskId: message.taskId,
      current: i + 1,
      total: total,
      filename: file.filename
    });

    try {
      const result = await analyzeContent(file.content, message.apiKey);

      workerPort.postMessage({
        type: MSG_TYPE_RESULT,
        taskId: message.taskId,
        filename: file.filename,
        result: result
      });

      // 添加延迟避免 API 限流
      if (i < files.length - 1) {
        await delay(1000);
      }
    } catch (error) {
      console.error('[AIDocWorker] 批量分析文件失败:', file.filename, error);
      workerPort.postMessage({
        type: MSG_TYPE_ERROR,
        taskId: message.taskId,
        filename: file.filename,
        error: String(error)
      });
    }
  }

  // 发送完成消息
  workerPort.postMessage({
    type: MSG_TYPE_COMPLETE,
    taskId: message.taskId,
    total: total
  });
}

/**
 * 分析文档内容
 */
async function analyzeContent(content: string, apiKey: string): Promise<AnalysisResult> {
  const systemPrompt = `你是一个专业的文档分析助手。请分析文档并返回分类、摘要和关键词。
只返回 JSON 格式，不要有其他文字。`;

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
}

类别说明：
- meeting_notes: 会议纪要
- study_notes: 学习笔记
- project_report: 项目报告
- personal_diary: 个人日记
- todo_list: 待办清单
- technical_doc: 技术文档
- other: 其他`;

  const response = await callDeepSeekAPI(prompt, systemPrompt, apiKey);
  return parseAnalysisResult(response);
}

/**
 * 调用 DeepSeek API
 */
function callDeepSeekAPI(prompt: string, systemPrompt: string, apiKey: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const httpRequest = http.createHttp();

    const messages: DeepSeekRequestMessage[] = [];

    if (systemPrompt && systemPrompt.length > 0) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    messages.push({
      role: 'user',
      content: prompt
    });

    const requestBody: DeepSeekRequestBody = {
      model: MODEL,
      messages: messages,
      temperature: 0.3,
      max_tokens: 1000,
      stream: false
    };

    httpRequest.request(
      API_URL,
      {
        method: http.RequestMethod.POST,
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        extraData: JSON.stringify(requestBody),
        expectDataType: http.HttpDataType.STRING,
        connectTimeout: TIMEOUT,
        readTimeout: TIMEOUT
      },
      (err: BusinessError, data: http.HttpResponse) => {
        if (err) {
          httpRequest.destroy();
          reject(new Error(`API 请求失败: ${err.message}`));
          return;
        }

        try {
          if (data.responseCode !== 200) {
            httpRequest.destroy();
            reject(new Error(`API 返回错误: ${data.responseCode}`));
            return;
          }

          const responseText = data.result as string;
          const response = JSON.parse(responseText) as DeepSeekResponse;

          if (!response.choices || response.choices.length === 0) {
            httpRequest.destroy();
            reject(new Error('API 响应格式错误'));
            return;
          }

          httpRequest.destroy();
          resolve(response.choices[0].message.content);
        } catch (parseError) {
          httpRequest.destroy();
          reject(new Error(`解析响应失败: ${parseError}`));
        }
      }
    );
  });
}

/**
 * 解析分析结果
 */
// function parseAnalysisResult(content: string): AnalysisResult {
//   try {
//     let jsonStr = content.trim();
//
//     // 尝试提取 JSON
//     const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
//     if (jsonMatch) {
//       jsonStr = jsonMatch[1];
//     } else {
//       const startIndex = content.indexOf('{');
//       const endIndex = content.lastIndexOf('}');
//       if (startIndex !== -1 && endIndex !== -1) {
//         jsonStr = content.substring(startIndex, endIndex + 1);
//       }
//     }
//
//     const parsed = JSON.parse(jsonStr);
//
//     // 提取分类
//     let category = 'other';
//     let confidence = 0.5;
//     if (parsed.classification) {
//       category = parsed.classification.category || 'other';
//       confidence = parsed.classification.confidence || 0.5;
//     }
//
//     // 提取摘要
//     let summary = '';
//     if (parsed.summary) {
//       summary = typeof parsed.summary === 'string' ? parsed.summary : '';
//     }
//
//     // 提取关键词
//     let keywords: string[] = [];
//     if (Array.isArray(parsed.keywords)) {
//       keywords = parsed.keywords;
//     }
//
//     return {
//       classification: {
//         category: category,
//         confidence: confidence
//       },
//       summary: summary,
//       keywords: keywords
//     };
//   } catch (error) {
//     console.error('[AIDocWorker] 解析结果失败:', error);
//     return {
//       classification: {
//         category: 'other',
//         confidence: 0
//       },
//       summary: '',
//       keywords: []
//     };
//   }
// }


// 修改后的函数
function parseAnalysisResult(content: string): AnalysisResult {
  try {
    let jsonStr = content.trim();

    // 尝试提取 JSON
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const startIndex = content.indexOf('{');
      const endIndex = content.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        jsonStr = content.substring(startIndex, endIndex + 1);
      }
    }

    // 使用类型断言，明确指定解析后的类型
    const parsed = JSON.parse(jsonStr) as ParsedAnalysisData;

    // 提取分类
    let category = 'other';
    let confidence = 0.5;
    if (parsed.classification) {
      category = parsed.classification.category || 'other';
      confidence = parsed.classification.confidence || 0.5;
    }

    // 提取摘要
    let summary = '';
    if (parsed.summary) {
      summary = typeof parsed.summary === 'string' ? parsed.summary : '';
    }

    // 提取关键词
    let keywords: string[] = [];
    if (Array.isArray(parsed.keywords)) {
      keywords = parsed.keywords;
    }

    return {
      classification: {
        category: category,
        confidence: confidence
      },
      summary: summary,
      keywords: keywords
    };
  } catch (error) {
    console.error('[AIDocWorker] 解析结果失败:', error);
    return {
      classification: {
        category: 'other',
        confidence: 0
      },
      summary: '',
      keywords: []
    };
  }
}


/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
