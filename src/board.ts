import { isHexColor } from './pieces';

/**
 * 棋盘外观自定义。
 *
 * 主题负责默认棋盘（面子 / 木边 / 格线 / 星位），这里只保存用户覆盖：
 * - style：规整格线或手绘格线；
 * - face：自定义棋盘底色，null 表示跟随主题；
 * - image：自定义背景图 data URL，null 表示不使用图片；
 * - veil：背景图上盖一层主题底色蒙版，保证格线与棋子可读（0–0.85）。
 */
export const BOARD_STYLES = ['clean', 'handdrawn'] as const;

export type BoardStyle = (typeof BOARD_STYLES)[number];

export interface BoardCustomization {
  style: BoardStyle;
  face: string | null;
  image: string | null;
  veil: number;
}

export const DEFAULT_BOARD: BoardCustomization = {
  style: 'clean',
  face: null,
  image: null,
  veil: 0.3,
};

export const MIN_BOARD_VEIL = 0;
export const MAX_BOARD_VEIL = 0.85;

/** 棋盘背景压缩后的 data URL 长度上限（字符数）。 */
export const MAX_BOARD_DATA_URL_LENGTH = 1_200_000;

const IMAGE_DATA_URL =
  /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+=*$/i;

export function isBoardStyle(value: unknown): value is BoardStyle {
  return (
    typeof value === 'string' &&
    (BOARD_STYLES as readonly string[]).includes(value)
  );
}

export function isBoardImageDataUrl(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= MAX_BOARD_DATA_URL_LENGTH &&
    IMAGE_DATA_URL.test(value)
  );
}

/** 把蒙版不透明度夹到 0–0.85；非数字回退到默认值。 */
export function clampBoardVeil(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_BOARD.veil;
  }
  return Math.min(MAX_BOARD_VEIL, Math.max(MIN_BOARD_VEIL, value));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

/** 只保留合法字段，防止损坏的 localStorage 污染棋盘。 */
export function sanitizeBoardCustomization(
  value: unknown,
): BoardCustomization {
  const source = asRecord(value);
  return {
    style: isBoardStyle(source.style) ? source.style : DEFAULT_BOARD.style,
    face: isHexColor(source.face) ? source.face : null,
    image: isBoardImageDataUrl(source.image) ? source.image : null,
    veil: clampBoardVeil(source.veil),
  };
}

export function hasBoardCustomization(board: BoardCustomization): boolean {
  return (
    board.style !== DEFAULT_BOARD.style ||
    board.face !== null ||
    board.image !== null
  );
}
