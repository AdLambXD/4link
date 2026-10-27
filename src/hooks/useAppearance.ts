import { useCallback, useLayoutEffect, useState } from 'react';
import {
  DEFAULT_BOARD,
  clampBoardVeil,
  isBoardImageDataUrl,
  isBoardStyle,
  sanitizeBoardCustomization,
  type BoardCustomization,
  type BoardStyle,
} from '../board';
import {
  EMPTY_PIECES,
  isHexColor,
  isPieceImageDataUrl,
  pieceColor,
  sanitizePieceCustomization,
  type PieceCustomization,
  type PlayerNumber,
} from '../pieces';
import {
  DEFAULT_SKIN_ID,
  getSkin,
  isSkinId,
  type SkinId,
} from '../skins';

const SKIN_STORAGE_KEY = '4link.skin.v1';
const PIECES_STORAGE_KEY = '4link.pieces.v1';
const BOARD_STORAGE_KEY = '4link.board.v1';

function loadSkin(): SkinId {
  try {
    const raw = localStorage.getItem(SKIN_STORAGE_KEY);
    return isSkinId(raw) ? raw : DEFAULT_SKIN_ID;
  } catch {
    return DEFAULT_SKIN_ID;
  }
}

function loadPieces(): PieceCustomization {
  try {
    const raw = localStorage.getItem(PIECES_STORAGE_KEY);
    return raw ? sanitizePieceCustomization(JSON.parse(raw)) : EMPTY_PIECES;
  } catch {
    return EMPTY_PIECES;
  }
}

function loadBoard(): BoardCustomization {
  try {
    const raw = localStorage.getItem(BOARD_STORAGE_KEY);
    return raw ? sanitizeBoardCustomization(JSON.parse(raw)) : DEFAULT_BOARD;
  } catch {
    return DEFAULT_BOARD;
  }
}

/**
 * 整站外观：主题变量 + 玩家棋子覆盖 + 棋盘覆盖。
 *
 * 主题先写入 :root，自定义颜色/图片再覆盖对应变量；
 * 因此换主题时，未自定义的棋子与棋盘会自动跟随新主题。
 */
export function useAppearance() {
  const [skinId, setSkinId] = useState<SkinId>(loadSkin);
  const [pieces, setPieces] = useState<PieceCustomization>(loadPieces);
  const [board, setBoard] = useState<BoardCustomization>(loadBoard);
  const skin = getSkin(skinId);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.skin = skin.id;
    root.dataset.scheme = skin.scheme;

    // 让移动端浏览器地址栏 / 状态栏跟随整站主题。
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', skin.vars['--paper']);
    document
      .querySelector('meta[name="color-scheme"]')
      ?.setAttribute('content', skin.scheme);

    for (const [name, value] of Object.entries(skin.vars)) {
      root.style.setProperty(name, value);
    }

    for (const player of [1, 2, 3, 4, 5, 6] as const) {
      root.style.setProperty(`--p${player}`, pieceColor(skin, pieces, player));
      const image = pieces.images[player];
      root.style.setProperty(
        `--p${player}-image`,
        image ? `url("${image}")` : 'none',
      );
    }

    // 棋盘覆盖写在主题变量之后，才能盖住 --board-face。
    root.dataset.boardStyle = board.style;
    root.style.setProperty('--board-face', board.face ?? skin.vars['--board-face']);
    root.style.setProperty(
      '--board-bg-image',
      board.image ? `url("${board.image}")` : 'none',
    );
    root.style.setProperty(
      '--board-bg-veil',
      String(board.image ? board.veil : 0),
    );

    try {
      localStorage.setItem(SKIN_STORAGE_KEY, skin.id);
      localStorage.setItem(PIECES_STORAGE_KEY, JSON.stringify(pieces));
      localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(board));
    } catch {
      // 隐私模式或存储配额不足时，外观仍在本局生效。
    }
  }, [skin, pieces, board]);

  const chooseSkin = useCallback((id: SkinId) => setSkinId(id), []);

  const setPieceColor = useCallback(
    (player: PlayerNumber, color: string | null) => {
      setPieces((prev) => {
        if (color === null) {
          const colors = { ...prev.colors };
          delete colors[player];
          return { ...prev, colors };
        }
        if (!isHexColor(color)) return prev;
        return { ...prev, colors: { ...prev.colors, [player]: color } };
      });
    },
    [],
  );

  const setPieceImage = useCallback(
    (player: PlayerNumber, image: string | null) => {
      setPieces((prev) => {
        if (image === null) {
          const images = { ...prev.images };
          delete images[player];
          return { ...prev, images };
        }
        if (!isPieceImageDataUrl(image)) return prev;
        return { ...prev, images: { ...prev.images, [player]: image } };
      });
    },
    [],
  );

  const resetPieces = useCallback(() => {
    setPieces({ colors: {}, images: {} });
  }, []);

  const setBoardStyle = useCallback((style: BoardStyle) => {
    if (!isBoardStyle(style)) return;
    setBoard((prev) => ({ ...prev, style }));
  }, []);

  const setBoardFace = useCallback((face: string | null) => {
    setBoard((prev) => {
      if (face === null) return { ...prev, face: null };
      if (!isHexColor(face)) return prev;
      return { ...prev, face };
    });
  }, []);

  const setBoardImage = useCallback((image: string | null) => {
    setBoard((prev) => {
      if (image === null) return { ...prev, image: null };
      if (!isBoardImageDataUrl(image)) return prev;
      return { ...prev, image };
    });
  }, []);

  const setBoardVeil = useCallback((veil: number) => {
    setBoard((prev) => ({ ...prev, veil: clampBoardVeil(veil) }));
  }, []);

  const resetBoard = useCallback(() => setBoard(DEFAULT_BOARD), []);

  return {
    skinId,
    skin,
    pieces,
    board,
    setSkinId: chooseSkin,
    setPieceColor,
    setPieceImage,
    resetPieces,
    setBoardStyle,
    setBoardFace,
    setBoardImage,
    setBoardVeil,
    resetBoard,
  };
}
