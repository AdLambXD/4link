export const LOCALES = [
  'zh-CN',
  'zh-TW',
  'en',
  'ja',
  'es',
  'fr',
  'de',
  'ru',
  'hi',
  'ar',
] as const;

export type Locale = (typeof LOCALES)[number];

/** 游戏内容（残局、教程）里的多语言文本。 */
export type LocalizedText = Readonly<Record<Locale, string>>;

export const FALLBACK_LOCALE: Locale = 'zh-CN';

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
  );
}

/**
 * 紧凑地写一段多语言文本：
 * lt(简中, 繁中, 英文, 日文, 西班牙文, 法文, 德文, 俄文, 印地文, 阿拉伯文)
 */
export function lt(
  zhCN: string,
  zhTW: string,
  en: string,
  ja: string,
  es: string,
  fr: string,
  de: string,
  ru: string,
  hi: string,
  ar: string,
): LocalizedText {
  return {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    en,
    ja,
    es,
    fr,
    de,
    ru,
    hi,
    ar,
  };
}

export function pickText(value: LocalizedText, locale: Locale): string {
  return value[locale] || value[FALLBACK_LOCALE];
}
