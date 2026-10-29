export { I18nProvider, useI18n, LANGUAGE_STORAGE_KEY } from './I18nProvider';
export { detectLocale, interpolate, resolveLocale, translate, translatePlural } from './core';
export {
  DICTIONARIES,
  en,
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
