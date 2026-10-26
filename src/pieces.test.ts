import { describe, expect, it } from 'vitest';
import {
  EMPTY_PIECES,
  MAX_PIECE_DATA_URL_LENGTH,
  hasPieceCustomization,
  isHexColor,
  isPieceImageDataUrl,
  pieceColor,
  pieceImage,
  sanitizePieceCustomization,
  type PieceCustomization,
} from './pieces';
import { DEFAULT_SKIN_ID, SKINS, getSkin, isSkinId } from './skins';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';
const WEBP = 'data:image/webp;base64,UklGRiIAAABXRUJQ';

describe('棋子自定义', () => {
  it('只接受六位十六进制颜色', () => {
    expect(isHexColor('#cf4427')).toBe(true);
    expect(isHexColor('#ABCDEF')).toBe(true);
    expect(isHexColor('cf4427')).toBe(false);
    expect(isHexColor('#fff')).toBe(false);
    expect(isHexColor('#cf4427ff')).toBe(false);
    expect(isHexColor(42)).toBe(false);
    expect(isHexColor(null)).toBe(false);
  });

  it('只接受受限长度的 PNG / JPEG / WebP data URL', () => {
    expect(isPieceImageDataUrl(PNG)).toBe(true);
    expect(isPieceImageDataUrl(WEBP)).toBe(true);
    expect(isPieceImageDataUrl('data:image/gif;base64,R0lGODlh')).toBe(false);
    expect(isPieceImageDataUrl('https://example.com/a.png')).toBe(false);
    expect(
      isPieceImageDataUrl(
        `data:image/png;base64,${'A'.repeat(MAX_PIECE_DATA_URL_LENGTH)}`,
      ),
    ).toBe(false);
  });

  it('清洗 localStorage 里的损坏数据', () => {
    expect(sanitizePieceCustomization(null)).toEqual(EMPTY_PIECES);
    expect(sanitizePieceCustomization('nope')).toEqual(EMPTY_PIECES);

    const cleaned = sanitizePieceCustomization({
      colors: { 1: '#112233', 2: 'red', 7: '#ffffff', 3: 12 },
      images: { 1: PNG, 2: 'javascript:alert(1)', 8: PNG },
    });

    expect(cleaned.colors).toEqual({ 1: '#112233' });
    expect(cleaned.images).toEqual({ 1: PNG });
  });

  it('无效字段不会泄漏进结果', () => {
    const cleaned = sanitizePieceCustomization({
      colors: [],
      images: 'x',
      extra: { colors: { 1: '#000000' } },
    });
    expect(cleaned).toEqual(EMPTY_PIECES);
  });

  it('未自定义时使用主题颜色，自定义后覆盖', () => {
    const skin = getSkin(DEFAULT_SKIN_ID);
    const themed = pieceColor(skin, EMPTY_PIECES, 1);
    expect(themed).toBe(skin.vars['--p1']);

    const custom: PieceCustomization = {
      colors: { 1: '#123456' },
      images: {},
    };
    expect(pieceColor(skin, custom, 1)).toBe('#123456');
    expect(pieceColor(skin, custom, 2)).toBe(skin.vars['--p2']);
  });

  it('图片按玩家读取，缺失时为 null', () => {
    const custom: PieceCustomization = { colors: {}, images: { 3: PNG } };
    expect(pieceImage(custom, 3)).toBe(PNG);
    expect(pieceImage(custom, 4)).toBeNull();
    expect(pieceImage(EMPTY_PIECES, 1)).toBeNull();
  });

  it('能判断是否做过任意自定义', () => {
    expect(hasPieceCustomization(EMPTY_PIECES)).toBe(false);
    expect(hasPieceCustomization({ colors: { 1: '#000000' }, images: {} })).toBe(
      true,
    );
    expect(hasPieceCustomization({ colors: {}, images: { 2: PNG } })).toBe(true);
  });
});

describe('全站主题', () => {
  const REQUIRED_VARS = [
    '--paper',
    '--paper-hi',
    '--paper-lo',
    '--paper-deep',
    '--ink',
    '--ink-soft',
    '--muted',
    '--rule',
    '--rule-strong',
    '--accent',
    '--accent-hi',
    '--surface-hover',
    '--on-accent',
    '--stone-ring',
    '--shadow-rgb',
    '--board-face',
    '--board-edge',
    '--board-grid',
    '--board-dot',
    '--p1',
    '--p2',
    '--p3',
    '--p4',
    '--p5',
    '--p6',
  ];

  it('主题 id 唯一，默认主题存在', () => {
    expect(new Set(SKINS.map((skin) => skin.id)).size).toBe(SKINS.length);
    expect(isSkinId(DEFAULT_SKIN_ID)).toBe(true);
    expect(isSkinId('missing')).toBe(false);
  });

  it('每套主题都覆盖整站需要的全部变量', () => {
    for (const skin of SKINS) {
      const vars = skin.vars as Readonly<Record<string, string>>;
      for (const name of REQUIRED_VARS) {
        expect(vars[name], `${skin.id} 缺少 ${name}`).toMatch(
          /^(#[0-9a-f]{6}|[0-9]+ [0-9]+ [0-9]+)$/i,
        );
      }
      expect(['light', 'dark']).toContain(skin.scheme);
    }
  });

  it('未知主题回退到默认主题', () => {
    expect(getSkin(DEFAULT_SKIN_ID).id).toBe(DEFAULT_SKIN_ID);
  });

  it('暗色主题提供浅色墨与深色纸', () => {
    const dark = SKINS.filter((skin) => skin.scheme === 'dark');
    expect(dark.length).toBeGreaterThan(0);
    for (const skin of dark) {
      expect(skin.vars['--ink']).not.toBe(skin.vars['--paper']);
      expect(skin.vars['--stone-ring']).not.toBe(skin.vars['--paper']);
    }
  });
});
