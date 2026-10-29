/**
 * 全站主题注册表。
 *
 * 一套主题不只换棋盘：页面纸张、墨色、规则线、强调色、棋盘与 1–6 号棋子
 * 都由这里的 CSS 变量驱动。新增主题只需追加一个对象。
 */

import { lt, type LocalizedText } from './i18n';

export type SkinScheme = 'light' | 'dark';

export interface Skin {
  readonly id: string;
  readonly name: LocalizedText;
  readonly note: string;
  readonly scheme: SkinScheme;
  readonly vars: Readonly<Record<string, string>>;
}

export const SKINS = [
  {
    id: 'washi',
    name: lt('和纸', '和紙', 'Washi'),
    note: 'WASHI',
    scheme: 'light',
    vars: {
      '--paper': '#f0e9d8',
      '--paper-hi': '#f7f2e4',
      '--paper-lo': '#ddd3bd',
      '--paper-deep': '#cdc1a6',
      '--ink': '#201c17',
      '--ink-soft': '#4d4437',
      '--muted': '#877d6b',
      '--rule': '#c6ba9f',
      '--rule-strong': '#9c9078',
      '--accent': '#cf4427',
      '--accent-hi': '#dc5133',
      '--surface-hover': '#fdf8ec',
      '--on-accent': '#f7f2e4',
      '--stone-ring': '#f7f2e4',
      '--shadow-rgb': '32 28 23',
      '--board-face': '#e5d3aa',
      '--board-edge': '#b49a6a',
      '--board-grid': '#4a3a26',
      '--board-dot': '#3e3020',
      '--p1': '#cf4427',
      '--p2': '#1d5f6a',
      '--p3': '#b47a12',
      '--p4': '#4b5c9e',
      '--p5': '#8b4a6b',
      '--p6': '#4f6b3a',
    },
  },
  {
    id: 'kaya',
    name: lt('榧木', '榧木', 'Kaya'),
    note: 'KAYA',
    scheme: 'light',
    vars: {
      '--paper': '#edd6b0',
      '--paper-hi': '#f7e8cc',
      '--paper-lo': '#d9bd90',
      '--paper-deep': '#c7a26b',
      '--ink': '#2b1d0f',
      '--ink-soft': '#4f3920',
      '--muted': '#8b6f4b',
      '--rule': '#c8a878',
      '--rule-strong': '#a37d4f',
      '--accent': '#b23a1e',
      '--accent-hi': '#c94d2c',
      '--surface-hover': '#fbefd9',
      '--on-accent': '#fbf2df',
      '--stone-ring': '#fbf2df',
      '--shadow-rgb': '35 23 10',
      '--board-face': '#dcb378',
      '--board-edge': '#9a7038',
      '--board-grid': '#4b3517',
      '--board-dot': '#3a2810',
      '--p1': '#b23a1e',
      '--p2': '#2c5a66',
      '--p3': '#c98f1d',
      '--p4': '#55764f',
      '--p5': '#7a4a72',
      '--p6': '#465b8a',
    },
  },
  {
    id: 'celadon',
    name: lt('青瓷', '青瓷', 'Celadon'),
    note: 'CELADON',
    scheme: 'light',
    vars: {
      '--paper': '#e1e8dc',
      '--paper-hi': '#eef3e9',
      '--paper-lo': '#cbd8c5',
      '--paper-deep': '#b5c5ae',
      '--ink': '#1f3027',
      '--ink-soft': '#40564a',
      '--muted': '#728477',
      '--rule': '#b8c9ba',
      '--rule-strong': '#8fa394',
      '--accent': '#b8462c',
      '--accent-hi': '#cf5a3d',
      '--surface-hover': '#f3f8ee',
      '--on-accent': '#f4f8ef',
      '--stone-ring': '#f4f8ef',
      '--shadow-rgb': '25 40 32',
      '--board-face': '#d4dfd1',
      '--board-edge': '#97ad9f',
      '--board-grid': '#41594c',
      '--board-dot': '#33493d',
      '--p1': '#c0492c',
      '--p2': '#2f5d63',
      '--p3': '#8a6a1f',
      '--p4': '#465b8a',
      '--p5': '#7d4760',
      '--p6': '#4e6438',
    },
  },
  {
    id: 'indigo',
    name: lt('蓝染', '藍染', 'Indigo'),
    note: 'INDIGO',
    scheme: 'dark',
    vars: {
      '--paper': '#111b30',
      '--paper-hi': '#1c2a45',
      '--paper-lo': '#0b1324',
      '--paper-deep': '#070e1c',
      '--ink': '#e9eef8',
      '--ink-soft': '#b4c1d8',
      '--muted': '#7f8fae',
      '--rule': '#31415f',
      '--rule-strong': '#536789',
      '--accent': '#e4674a',
      '--accent-hi': '#ef7a5e',
      '--surface-hover': '#223354',
      '--on-accent': '#131d31',
      '--stone-ring': '#f4e6c8',
      '--shadow-rgb': '0 0 0',
      '--board-face': '#22314f',
      '--board-edge': '#101b2f',
      '--board-grid': '#93a9c9',
      '--board-dot': '#c2d2e8',
      '--p1': '#e4674a',
      '--p2': '#7fc8c0',
      '--p3': '#e8c05a',
      '--p4': '#b8a2e8',
      '--p5': '#e79ab5',
      '--p6': '#9ed07a',
    },
  },
] as const satisfies readonly Skin[];

/** 皮肤 ID 从注册表自动推导，新增皮肤不需要再改类型。 */
export type SkinId = (typeof SKINS)[number]['id'];

export const DEFAULT_SKIN_ID: SkinId = 'washi';

export function getSkin(id: SkinId): Skin {
  return SKINS.find((skin) => skin.id === id) ?? SKINS[0];
}

export function isSkinId(value: unknown): value is SkinId {
  return typeof value === 'string' && SKINS.some((skin) => skin.id === value);
}
