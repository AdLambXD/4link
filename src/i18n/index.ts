export { I18nProvider, useI18n, LANGUAGE_STORAGE_KEY } from './I18nProvider';
export { detectLocale, interpolate, resolveLocale, translate, translatePlural } from './core';
export { LANGUAGES, type LanguageMeta } from './languages';
export {
  DICTIONARIES,
  ar,
  de,
  en,
  es,
  fr,
  hi,
  ja,
  ru,
  zhCN,
  zhTW,
  type MessageKey,
  type Messages,
  type MessageValue,
  type PluralKey,
  type StringKey,
} from './messages';
export {
  FALLBACK_LOCALE,
  LOCALES,
  isLocale,
  lt,
  pickText,
  type Locale,
  type LocalizedText,
} from './types';
