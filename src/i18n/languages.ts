import type { Locale } from './types';

export interface LanguageMeta {
  readonly id: Locale;
  /** 各语言的原生名称，切换菜单里始终这样显示。 */
  readonly name: string;
  /** 报头紧凑按钮里的短标签。 */
  readonly short: string;
}

/** 语言顺序：先中文，再英文，然后其余语言按使用范围排列。 */
export const LANGUAGES: readonly LanguageMeta[] = [
  { id: 'zh-CN', name: '简体中文', short: '简' },
  { id: 'zh-TW', name: '繁體中文', short: '繁' },
  { id: 'en', name: 'English', short: 'EN' },
  { id: 'ja', name: '日本語', short: '日' },
  { id: 'es', name: 'Español', short: 'ES' },
  { id: 'fr', name: 'Français', short: 'FR' },
  { id: 'de', name: 'Deutsch', short: 'DE' },
  { id: 'ru', name: 'Русский', short: 'RU' },
  { id: 'hi', name: 'हिन्दी', short: 'हि' },
  { id: 'ar', name: 'العربية', short: 'AR' },
];
