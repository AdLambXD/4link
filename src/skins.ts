/**
 * 皮肤注册表。
 *
 * 加一套皮肤只需要在 SKINS 里追加一个对象：棋盘面子、格线、木边，
 * 以及最多 6 位玩家的棋子颜色。其余视觉全部由 CSS 变量驱动。
 */

export interface Skin {
  readonly id: string;
  readonly name: string;
  readonly note: string;
  readonly vars: Readonly<Record<string, string>>;
}

export const SKINS = [
  {
    id: 'washi',
    name: '和纸',
    note: 'WASHI',
    vars: {
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
    name: '榧木',
    note: 'KAYA',
    vars: {
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
    name: '青瓷',
    note: 'CELADON',
    vars: {
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
    name: '蓝染',
    note: 'INDIGO',
    vars: {
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
