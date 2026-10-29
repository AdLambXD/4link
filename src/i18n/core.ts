import {
  DICTIONARIES,
  type MessageKey,
  type PluralKey,
  type StringKey,
} from './messages';
import { FALLBACK_LOCALE, isLocale, type Locale } from './types';

export type TranslateParams = Record<string, string | number>;

/** 把 {name} 替换成参数；缺少参数时保留占位符，方便发现漏传。 */
export function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export function translate(
  locale: Locale,
  key: StringKey,
  params?: TranslateParams,
): string {
  const dictionary = DICTIONARIES[locale] ?? DICTIONARIES[FALLBACK_LOCALE];
  const value = dictionary[key] ?? DICTIONARIES[FALLBACK_LOCALE][key];
  return interpolate(typeof value === 'string' ? value : key, params);
}

const pluralRules = new Map<Locale, Intl.PluralRules>();

function pluralCategory(locale: Locale, count: number): Intl.LDMLPluralRule {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  return rules.select(count);
}

export function translatePlural(
  locale: Locale,
  key: PluralKey,
  count: number,
  params?: TranslateParams,
): string {
  const dictionary = DICTIONARIES[locale] ?? DICTIONARIES[FALLBACK_LOCALE];
  const value = dictionary[key] ?? DICTIONARIES[FALLBACK_LOCALE][key];
  if (typeof value === 'string') {
    return interpolate(value, { ...params, count });
  }
  const form = pluralCategory(locale, count) === 'one' ? value.one : value.other;
  return interpolate(form, { ...params, count });
}

/** 把 zh-Hant / zh-TW / zh-HK 之类归到对应中文变体。 */
function localeForTag(tag: string): Locale | null {
  const normalized = tag.trim().toLowerCase().replace(/_/g, '-');
  if (!normalized) return null;
  if (
    normalized.startsWith('zh-hant') ||
    normalized === 'zh-tw' ||
    normalized === 'zh-hk' ||
    normalized === 'zh-mo'
  ) {
    return 'zh-TW';
  }
  if (normalized.startsWith('zh')) return 'zh-CN';
  if (normalized.startsWith('en')) return 'en';
  return null;
}

/** 依次查看浏览器语言列表，取第一个能支持的语言；都不支持时用英文。 */
export function detectLocale(languages: readonly string[] = []): Locale {
  for (const language of languages) {
    const locale = localeForTag(language);
    if (locale) return locale;
  }
  return 'en';
}

/**
 * 决定初始语言：合法的手动选择优先，其次跟随浏览器。
 *
 * `stored` 直接来自 localStorage，可能是旧版本或被人为改过的值。
 */
export function resolveLocale(
  stored: string | null | undefined,
  languages: readonly string[] = [],
): Locale {
  if (isLocale(stored)) return stored;
  return detectLocale(languages);
}

export function messageKeys(): MessageKey[] {
  return Object.keys(DICTIONARIES[FALLBACK_LOCALE]) as MessageKey[];
}
