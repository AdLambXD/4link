import type { Skin } from './skins';

export const PLAYER_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

export type PlayerNumber = (typeof PLAYER_NUMBERS)[number];

/** 玩家自定义颜色与图片；未设置的项跟随当前主题。 */
export interface PieceCustomization {
  colors: Partial<Record<PlayerNumber, string>>;
  images: Partial<Record<PlayerNumber, string>>;
}

export const EMPTY_PIECES: PieceCustomization = { colors: {}, images: {} };

/** 单张棋子图片压缩后的 data URL 长度上限（字符数）。 */
export const MAX_PIECE_DATA_URL_LENGTH = 480_000;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const IMAGE_DATA_URL =
  /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+=*$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value);
}

export function isPieceImageDataUrl(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= MAX_PIECE_DATA_URL_LENGTH &&
    IMAGE_DATA_URL.test(value)
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

/** 只保留合法的 1–6 号颜色/图片，防止损坏的 localStorage 污染整站。 */
export function sanitizePieceCustomization(value: unknown): PieceCustomization {
  const source = asRecord(value);
  const rawColors = asRecord(source.colors);
  const rawImages = asRecord(source.images);
  const colors: PieceCustomization['colors'] = {};
  const images: PieceCustomization['images'] = {};

  for (const player of PLAYER_NUMBERS) {
    const color = rawColors[player];
    if (isHexColor(color)) colors[player] = color;

    const image = rawImages[player];
    if (isPieceImageDataUrl(image)) images[player] = image;
  }

  return { colors, images };
}

export function pieceColor(
  skin: Skin,
  pieces: PieceCustomization,
  player: PlayerNumber,
): string {
  return pieces.colors[player] ?? skin.vars[`--p${player}`] ?? '#000000';
}

export function pieceImage(
  pieces: PieceCustomization,
  player: PlayerNumber,
): string | null {
  return pieces.images[player] ?? null;
}

export function hasPieceCustomization(pieces: PieceCustomization): boolean {
  return (
    Object.keys(pieces.colors).length > 0 ||
    Object.keys(pieces.images).length > 0
  );
}
