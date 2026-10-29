import { LOCALES, useI18n, type Locale, type StringKey } from '../i18n';

const NAME_KEYS: Record<Locale, StringKey> = {
  'zh-CN': 'language.zhCN',
  'zh-TW': 'language.zhTW',
  en: 'language.en',
};

const SHORT_KEYS: Record<Locale, StringKey> = {
  'zh-CN': 'language.short.zhCN',
  'zh-TW': 'language.short.zhTW',
  en: 'language.short.en',
};

interface LanguageSwitchProps {
  /** compact 用于报头，full 用于设置面板。 */
  variant?: 'compact' | 'full';
}

export function LanguageSwitch({ variant = 'compact' }: LanguageSwitchProps) {
  const { locale, setLocale, t } = useI18n();
  const keys = variant === 'full' ? NAME_KEYS : SHORT_KEYS;

  return (
    <div
      className={`lang-switch lang-switch-${variant}`}
      role="group"
      aria-label={t('language.groupAria')}
    >
      {LOCALES.map((item) => {
        const selected = item === locale;
        return (
          <button
            key={item}
            type="button"
            className={`lang-option${selected ? ' is-on' : ''}`}
            onClick={() => setLocale(item)}
            aria-pressed={selected}
            aria-label={t(NAME_KEYS[item])}
            title={t(NAME_KEYS[item])}
          >
            {t(keys[item])}
          </button>
        );
      })}
    </div>
  );
}
