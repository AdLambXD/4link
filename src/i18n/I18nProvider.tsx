import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  resolveLocale,
  translate,
  translatePlural,
  type TranslateParams,
} from './core';
import type { PluralKey, StringKey } from './messages';
import {
  pickText,
  type Locale,
  type LocalizedText,
} from './types';

export const LANGUAGE_STORAGE_KEY = '4link.lang.v1';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: StringKey, params?: TranslateParams) => string;
  tp: (key: PluralKey, count: number, params?: TranslateParams) => string;
  text: (value: LocalizedText) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): string | null {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function browserLanguages(): string[] {
  if (typeof navigator === 'undefined') return [];
  const languages = navigator.languages;
  if (languages && languages.length > 0) return [...languages];
  return navigator.language ? [navigator.language] : [];
}

function updateDocument(locale: Locale, title: string, description: string) {
  document.documentElement.lang = locale;
  document.title = title;
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );
  if (meta) meta.content = description;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    resolveLocale(readStoredLocale(), browserLanguages()),
  );

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      /* 隐私模式下写不进去也不影响本次切换 */
    }
  }, []);

  const t = useCallback(
    (key: StringKey, params?: TranslateParams) =>
      translate(locale, key, params),
    [locale],
  );

  const tp = useCallback(
    (key: PluralKey, count: number, params?: TranslateParams) =>
      translatePlural(locale, key, count, params),
    [locale],
  );

  const text = useCallback(
    (value: LocalizedText) => pickText(value, locale),
    [locale],
  );

  useEffect(() => {
    updateDocument(locale, t('app.title'), t('app.description'));
  }, [locale, t]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t, tp, text }),
    [locale, setLocale, t, tp, text],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>');
  return value;
}
