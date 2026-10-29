import { describe, expect, it } from 'vitest';
import { PUZZLES } from '../game/puzzle';
import { TUTORIALS } from '../game/tutorial';
import {
  DICTIONARIES,
  LOCALES,
  detectLocale,
  interpolate,
  pickText,
  resolveLocale,
  translate,
  translatePlural,
  zhCN,
} from './index';
import type { MessageValue } from './messages';

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

function forms(value: MessageValue): string[] {
  return typeof value === 'string' ? [value] : [value.one, value.other];
}

describe('多语言字典', () => {
  it('三种语言的键完全一致，且每条文案都不为空', () => {
    const keys = Object.keys(zhCN).sort();
    for (const locale of LOCALES) {
      const dictionary = DICTIONARIES[locale];
      expect(Object.keys(dictionary).sort()).toEqual(keys);
      for (const key of keys) {
        for (const form of forms(dictionary[key as keyof typeof dictionary])) {
          expect(form.trim().length, `${locale} ${key}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('每种语言的占位符与原语言一致', () => {
    for (const key of Object.keys(zhCN) as Array<keyof typeof zhCN>) {
      const source = forms(zhCN[key]);
      for (const locale of LOCALES) {
        const target = forms(DICTIONARIES[locale][key]);
        expect(target.map(placeholders), `${locale} ${key}`).toEqual(
          source.map(placeholders),
        );
      }
    }
  });

  it('插值会替换参数并保留未知占位符', () => {
    expect(interpolate('{a} + {b}', { a: 1, b: 2 })).toBe('1 + 2');
    expect(interpolate('{a} + {b}', { a: 1 })).toBe('1 + {b}');
    expect(
      translate('zh-CN', 'game.lesson', { no: 2, total: 6 }),
    ).toBe('课程 2 / 6');
  });

  it('英文按数量选择单复数，中文统一用 other', () => {
    expect(translatePlural('en', 'game.limitMoves', 1)).toBe('Limit 1 move');
    expect(translatePlural('en', 'game.limitMoves', 3)).toBe('Limit 3 moves');
    expect(translatePlural('zh-CN', 'game.limitMoves', 1)).toBe('限 1 步');
    expect(translatePlural('zh-TW', 'game.limitMoves', 3)).toBe('限 3 步');
    expect(translatePlural('en', 'puzzle.hints', 2)).toBe('Used 2 hints');
  });

  it('残局和教程内容在三种语言下都写齐了', () => {
    for (const puzzle of PUZZLES) {
      for (const locale of LOCALES) {
        expect(pickText(puzzle.title, locale).trim().length).toBeGreaterThan(0);
        expect(pickText(puzzle.note, locale).trim().length).toBeGreaterThan(0);
      }
    }

    for (const lesson of TUTORIALS) {
      for (const locale of LOCALES) {
        for (const field of [
          lesson.title,
          lesson.goal,
          lesson.tip,
          lesson.done,
        ]) {
          expect(pickText(field, locale).trim().length).toBeGreaterThan(0);
        }
        for (const step of lesson.steps) {
          expect(pickText(step.prompt, locale).trim().length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('语言选择', () => {
  it('按浏览器语言列表匹配支持的语言', () => {
    expect(detectLocale(['zh-CN'])).toBe('zh-CN');
    expect(detectLocale(['zh-Hans-CN'])).toBe('zh-CN');
    expect(detectLocale(['zh-TW'])).toBe('zh-TW');
    expect(detectLocale(['zh-HK'])).toBe('zh-TW');
    expect(detectLocale(['zh-Hant'])).toBe('zh-TW');
    expect(detectLocale(['en-GB'])).toBe('en');
    expect(detectLocale(['ja-JP'])).toBe('en');
    expect(detectLocale(['ja-JP', 'zh-TW'])).toBe('zh-TW');
    expect(detectLocale([])).toBe('en');
  });

  it('合法的手动选择优先，非法值回退到浏览器语言', () => {
    expect(resolveLocale('en', ['zh-CN'])).toBe('en');
    expect(resolveLocale('zh-TW', ['en-US'])).toBe('zh-TW');
    expect(resolveLocale('fr', ['zh-TW'])).toBe('zh-TW');
    expect(resolveLocale(null, ['en-US'])).toBe('en');
    expect(resolveLocale('', [])).toBe('en');
  });
});
