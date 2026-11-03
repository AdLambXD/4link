import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { LANGUAGES } from '../i18n/languages';

interface LanguageSwitchProps {
  /** compact 用于报头，full 用于设置面板。 */
  variant?: 'compact' | 'full';
}

export function LanguageSwitch({ variant = 'compact' }: LanguageSwitchProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current =
    LANGUAGES.find((language) => language.id === locale) ?? LANGUAGES[0];

  // 点击外部或按 Esc 关闭弹出菜单。
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (variant === 'full') {
    return (
      <div
        className="lang-switch lang-switch-full"
        role="group"
        aria-label={t('language.groupAria')}
      >
        {LANGUAGES.map((language) => {
          const selected = language.id === locale;
          return (
            <button
              key={language.id}
              type="button"
              lang={language.id}
              className={`lang-option${selected ? ' is-on' : ''}`}
              onClick={() => setLocale(language.id)}
              aria-pressed={selected}
            >
              <span className="lang-option-name">{language.name}</span>
              <span className="lang-option-short">{language.short}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="lang-menu" ref={rootRef}>
      <button
        type="button"
        className={`lang-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language.groupAria')}
        onClick={() => setOpen((value) => !value)}
      >
        <span lang={locale}>{current.short}</span>
        <span className="lang-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div
          className="lang-pop"
          role="listbox"
          aria-label={t('language.groupAria')}
        >
          {LANGUAGES.map((language) => {
            const selected = language.id === locale;
            return (
              <button
                key={language.id}
                type="button"
                role="option"
                lang={language.id}
                aria-selected={selected}
                className={`lang-pop-option${selected ? ' is-on' : ''}`}
                onClick={() => {
                  setLocale(language.id);
                  setOpen(false);
                }}
              >
                <span className="lang-pop-name">{language.name}</span>
                <span className="lang-pop-short">{language.short}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
