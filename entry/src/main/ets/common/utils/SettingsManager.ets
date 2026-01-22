/**
 * 设置管理器
 * 负责 API Key 和其他设置的持久化存储
 * 使用 @ohos.data.preferences 进行数据持久化
 */

import dataPreferences from '@ohos.data.preferences';
import { common } from '@kit.AbilityKit';

// 设置键名常量
const PREFERENCES_NAME = 'ai_doc_settings';
const KEY_API_KEY = 'deepseek_api_key';
const KEY_AUTO_ANALYZE = 'auto_analyze';
const KEY_ANALYSIS_LANGUAGE = 'analysis_language';
const KEY_LAST_SCAN_TIME = 'last_scan_time';
const KEY_CACHE_ENABLED = 'cache_enabled';

// 设置接口
export interface AISettings {
  apiKey: string;
  autoAnalyze: boolean;
  analysisLanguage: string;
  lastScanTime: number;
  cacheEnabled: boolean;
}

// 默认设置
const DEFAULT_SETTINGS: AISettings = {
  apiKey: '',
  autoAnalyze: false,
  analysisLanguage: 'zh',
  lastScanTime: 0,
  cacheEnabled: true
};

export class SettingsManager {
  private static instance: SettingsManager | null = null;
  private context: common.UIAbilityContext;
  private preferences: dataPreferences.Preferences | null = null;
  private isInitialized: boolean = false;

  private constructor(context: Context) {
    this.context = context as common.UIAbilityContext;
  }

  static getInstance(context: Context): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager(context);
    }
    return SettingsManager.instance;
  }

  /**
   * 初始化 Preferences
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.preferences = await dataPreferences.getPreferences(this.context, PREFERENCES_NAME);
      this.isInitialized = true;
      console.log('[SettingsManager] 初始化成功');
    } catch (error) {
      console.error('[SettingsManager] 初始化失败:', error);
      // throw error;
    }
  }

  /**
   * 确保已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * 保存 API Key
   */
  async saveApiKey(apiKey: string): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return;

      await this.preferences.put(KEY_API_KEY, apiKey);
      await this.preferences.flush();
      console.log('[SettingsManager] API Key 已保存');
    } catch (error) {
      console.error('[SettingsManager] 保存 API Key 失败:', error);
      // throw error;
    }
  }

  /**
   * 获取 API Key
   */
  async getApiKey(): Promise<string> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return '';

      const apiKey = await this.preferences.get(KEY_API_KEY, '');
      return apiKey as string;
    } catch (error) {
      console.error('[SettingsManager] 获取 API Key 失败:', error);
      return '';
    }
  }

  /**
   * 检查是否已配置 API Key
   */
  async hasApiKey(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    return apiKey.length > 0;
  }

  /**
   * 清除 API Key
   */
  async clearApiKey(): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return;

      await this.preferences.delete(KEY_API_KEY);
      await this.preferences.flush();
      console.log('[SettingsManager] API Key 已清除');
    } catch (error) {
      console.error('[SettingsManager] 清除 API Key 失败:', error);
      // throw error;
    }
  }

  /**
   * 保存自动分析设置
   */
  async saveAutoAnalyze(enabled: boolean): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return;

      await this.preferences.put(KEY_AUTO_ANALYZE, enabled);
      await this.preferences.flush();
    } catch (error) {
      console.error('[SettingsManager] 保存自动分析设置失败:', error);
      // throw error;
    }
  }

  /**
   * 获取自动分析设置
   */
  async getAutoAnalyze(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return DEFAULT_SETTINGS.autoAnalyze;

      const value = await this.preferences.get(KEY_AUTO_ANALYZE, DEFAULT_SETTINGS.autoAnalyze);
      return value as boolean;
    } catch (error) {
      console.error('[SettingsManager] 获取自动分析设置失败:', error);
      return DEFAULT_SETTINGS.autoAnalyze;
    }
  }

  /**
   * 保存分析语言设置
   */
  async saveAnalysisLanguage(language: string): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return;

      await this.preferences.put(KEY_ANALYSIS_LANGUAGE, language);
      await this.preferences.flush();
    } catch (error) {
      console.error('[SettingsManager] 保存分析语言设置失败:', error);
      // throw error;
    }
  }

  /**
   * 获取分析语言设置
   */
  async getAnalysisLanguage(): Promise<string> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return DEFAULT_SETTINGS.analysisLanguage;

      const value = await this.preferences.get(KEY_ANALYSIS_LANGUAGE, DEFAULT_SETTINGS.analysisLanguage);
      return value as string;
    } catch (error) {
      console.error('[SettingsManager] 获取分析语言设置失败:', error);
      return DEFAULT_SETTINGS.analysisLanguage;
    }
  }

  /**
   * 保存上次扫描时间
   */
  async saveLastScanTime(timestamp: number): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return;

      await this.preferences.put(KEY_LAST_SCAN_TIME, timestamp);
      await this.preferences.flush();
    } catch (error) {
      console.error('[SettingsManager] 保存上次扫描时间失败:', error);
      // throw error;
    }
  }

  /**
   * 获取上次扫描时间
   */
  async getLastScanTime(): Promise<number> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return 0;

      const value = await this.preferences.get(KEY_LAST_SCAN_TIME, 0);
      return value as number;
    } catch (error) {
      console.error('[SettingsManager] 获取上次扫描时间失败:', error);
      return 0;
    }
  }

  /**
   * 保存缓存启用设置
   */
  async saveCacheEnabled(enabled: boolean): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return;

      await this.preferences.put(KEY_CACHE_ENABLED, enabled);
      await this.preferences.flush();
    } catch (error) {
      console.error('[SettingsManager] 保存缓存设置失败:', error);
      // throw error;
    }
  }

  /**
   * 获取缓存启用设置
   */
  async getCacheEnabled(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return DEFAULT_SETTINGS.cacheEnabled;

      const value = await this.preferences.get(KEY_CACHE_ENABLED, DEFAULT_SETTINGS.cacheEnabled);
      return value as boolean;
    } catch (error) {
      console.error('[SettingsManager] 获取缓存设置失败:', error);
      return DEFAULT_SETTINGS.cacheEnabled;
    }
  }

  /**
   * 获取所有设置
   */
  async getAllSettings(): Promise<AISettings> {
    const apiKey = await this.getApiKey();
    const autoAnalyze = await this.getAutoAnalyze();
    const analysisLanguage = await this.getAnalysisLanguage();
    const lastScanTime = await this.getLastScanTime();
    const cacheEnabled = await this.getCacheEnabled();

    return {
      apiKey: apiKey,
      autoAnalyze: autoAnalyze,
      analysisLanguage: analysisLanguage,
      lastScanTime: lastScanTime,
      cacheEnabled: cacheEnabled
    };
  }

  /**
   * 保存所有设置
   */
  async saveAllSettings(settings: AISettings): Promise<void> {
    await this.saveApiKey(settings.apiKey);
    await this.saveAutoAnalyze(settings.autoAnalyze);
    await this.saveAnalysisLanguage(settings.analysisLanguage);
    await this.saveLastScanTime(settings.lastScanTime);
    await this.saveCacheEnabled(settings.cacheEnabled);
  }

  /**
   * 重置为默认设置
   */
  async resetToDefaults(): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.preferences) return;

      await this.preferences.clear();
      await this.preferences.flush();
      console.log('[SettingsManager] 已重置为默认设置');
    } catch (error) {
      console.error('[SettingsManager] 重置设置失败:', error);
      // throw error;
    }
  }

  /**
   * 验证 API Key 格式
   */
  validateApiKey(apiKey: string): boolean {
    if (!apiKey || apiKey.trim().length === 0) {
      return false;
    }
    // DeepSeek API Key 通常以 sk- 开头
    return apiKey.trim().startsWith('sk-');
  }

  /**
   * 格式化上次扫描时间为可读字符串
   */
  formatLastScanTime(timestamp: number): string {
    if (timestamp === 0) {
      return '从未扫描';
    }

    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
}
