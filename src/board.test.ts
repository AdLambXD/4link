import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BOARD,
  MAX_BOARD_DATA_URL_LENGTH,
  clampBoardVeil,
  hasBoardCustomization,
  isBoardImageDataUrl,
  isBoardStyle,
  sanitizeBoardCustomization,
} from './board';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';
const WEBP = 'data:image/webp;base64,UklGRiIAAABXRUJQ';

describe('棋盘自定义', () => {
  it('格线样式只接受规整与手绘', () => {
    expect(isBoardStyle('clean')).toBe(true);
    expect(isBoardStyle('handdrawn')).toBe(true);
    expect(isBoardStyle('sketch')).toBe(false);
    expect(isBoardStyle(1)).toBe(false);
    expect(isBoardStyle(null)).toBe(false);
  });

  it('只接受受限长度的 PNG / JPEG / WebP 背景图', () => {
    expect(isBoardImageDataUrl(PNG)).toBe(true);
    expect(isBoardImageDataUrl(WEBP)).toBe(true);
    expect(isBoardImageDataUrl('data:image/gif;base64,R0lGODlh')).toBe(false);
    expect(isBoardImageDataUrl('https://example.com/board.png')).toBe(false);
    expect(
      isBoardImageDataUrl(
        `data:image/webp;base64,${'A'.repeat(MAX_BOARD_DATA_URL_LENGTH)}`,
      ),
    ).toBe(false);
  });

  it('清洗 localStorage 里的损坏数据', () => {
    expect(sanitizeBoardCustomization(null)).toEqual(DEFAULT_BOARD);
    expect(sanitizeBoardCustomization('nope')).toEqual(DEFAULT_BOARD);
    expect(
      sanitizeBoardCustomization({ style: 'sketch', face: 'red', image: 'x' }),
    ).toEqual(DEFAULT_BOARD);
  });

  it('保留合法字段并丢弃越界值', () => {
    const cleaned = sanitizeBoardCustomization({
      style: 'handdrawn',
      face: '#123456',
      image: WEBP,
      veil: 2,
    });
    expect(cleaned).toEqual({
      style: 'handdrawn',
      face: '#123456',
      image: WEBP,
      veil: 0.85,
    });

    expect(
      sanitizeBoardCustomization({
        style: 'clean',
        face: '#fff',
        image: PNG,
        veil: -3,
      }),
    ).toEqual({ style: 'clean', face: null, image: PNG, veil: 0 });
  });

  it('蒙版不透明度夹在 0–0.85，非数字回退到默认值', () => {
    expect(clampBoardVeil(-1)).toBe(0);
    expect(clampBoardVeil(0.4)).toBe(0.4);
    expect(clampBoardVeil(9)).toBe(0.85);
    expect(clampBoardVeil('0.5')).toBe(DEFAULT_BOARD.veil);
    expect(clampBoardVeil(Number.NaN)).toBe(DEFAULT_BOARD.veil);
  });

  it('能判断是否做过棋盘自定义', () => {
    expect(hasBoardCustomization(DEFAULT_BOARD)).toBe(false);
    expect(hasBoardCustomization({ ...DEFAULT_BOARD, style: 'handdrawn' })).toBe(
      true,
    );
    expect(hasBoardCustomization({ ...DEFAULT_BOARD, face: '#123456' })).toBe(
      true,
    );
    expect(hasBoardCustomization({ ...DEFAULT_BOARD, image: PNG })).toBe(true);
    // 只调整蒙版不算自定义，因为没有背景图时它不会生效。
    expect(hasBoardCustomization({ ...DEFAULT_BOARD, veil: 0.6 })).toBe(false);
  });
});
