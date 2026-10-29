import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import { CloseIcon } from './Icons';
import { LanguageSwitch } from './LanguageSwitch';
import {
  BOARD_STYLES,
  hasBoardCustomization,
  type BoardCustomization,
  type BoardStyle,
} from '../board';
import {
  PLAYER_NUMBERS,
  hasPieceCustomization,
  pieceColor,
  pieceImage,
  type PieceCustomization,
  type PlayerNumber,
} from '../pieces';
import { useI18n, type StringKey } from '../i18n';
import {
  ImageError,
  boardImageFileToDataUrl,
  imageFileToDataUrl,
  type ImageErrorCode,
} from '../lib/pieceImage';
import { SKINS, type Skin, type SkinId } from '../skins';

interface SettingsProps {
  skin: Skin;
  pieces: PieceCustomization;
  board: BoardCustomization;
  onSkinChange: (id: SkinId) => void;
  onPieceColorChange: (player: PlayerNumber, color: string | null) => void;
  onPieceImageChange: (player: PlayerNumber, image: string | null) => void;
  onResetPieces: () => void;
  onBoardStyleChange: (style: BoardStyle) => void;
  onBoardFaceChange: (face: string | null) => void;
  onBoardImageChange: (image: string | null) => void;
  onBoardVeilChange: (veil: number) => void;
  onResetBoard: () => void;
  onClose: () => void;
}

const PLAYER_ROLE_KEYS: Record<PlayerNumber, StringKey> = {
  1: 'settings.role.first',
  2: 'settings.role.second',
  3: 'settings.role.player',
  4: 'settings.role.player',
  5: 'settings.role.player',
  6: 'settings.role.player',
};

const BOARD_STYLE_META: Record<
  BoardStyle,
  { nameKey: StringKey; note: string }
> = {
  clean: { nameKey: 'settings.boardStyle.clean', note: 'CLEAN' },
  handdrawn: { nameKey: 'settings.boardStyle.handdrawn', note: 'SKETCH' },
};

const IMAGE_ERROR_KEYS: Record<ImageErrorCode, StringKey> = {
  'not-image': 'errors.image.notImage',
  'too-large': 'errors.image.tooLarge',
  unreadable: 'errors.image.unreadable',
  'invalid-size': 'errors.image.invalidSize',
  unsupported: 'errors.image.unsupported',
  'too-complex': 'errors.image.tooComplex',
};

/** 设置面板里的格线小样；手绘版用略带弧度的路径。 */
function BoardStylePreview({ style }: { style: BoardStyle }) {
  return (
    <span className="board-style-preview" aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        {style === 'handdrawn' ? (
          <g stroke="var(--board-grid)" strokeLinecap="round" fill="none">
            <path d="M6.4 6.3 L33.2 6.9" strokeWidth="2.1" />
            <path d="M33.5 6.4 L33.1 33.5" strokeWidth="1.5" />
            <path d="M33.3 33.7 L6.6 33.1" strokeWidth="1.9" />
            <path d="M6.2 33.4 L6.5 6.2" strokeWidth="1.4" />
            <path d="M14.2 6.6 C13.8 15 14.5 25 14 33.4" strokeWidth="1.8" />
            <path d="M26.1 6.4 C26.6 15 25.7 24 26.3 33.2" strokeWidth="1.2" />
            <path d="M6.3 14.4 C14 15 25 14.2 33.5 14.9" strokeWidth="1.5" />
            <path d="M6.7 25.3 C14 24.6 25 25.5 33.3 24.7" strokeWidth="2" />
          </g>
        ) : (
          <g stroke="var(--board-grid)" strokeWidth="1">
            <rect x="7" y="7" width="26" height="26" />
            <path d="M14 7v26M26 7v26M7 14h26M7 26h26" />
          </g>
        )}
        <circle cx="14" cy="14" r="1.4" fill="var(--board-dot)" />
        <circle cx="26" cy="26" r="1.4" fill="var(--board-dot)" />
      </svg>
    </span>
  );
}

function stoneStyle(
  color: string,
  image: string | null,
): CSSProperties {
  return {
    backgroundColor: color,
    backgroundImage: image ? `url("${image}")` : undefined,
  };
}

export function Settings({
  skin,
  pieces,
  board,
  onSkinChange,
  onPieceColorChange,
  onPieceImageChange,
  onResetPieces,
  onBoardStyleChange,
  onBoardFaceChange,
  onBoardImageChange,
  onBoardVeilChange,
  onResetBoard,
  onClose,
}: SettingsProps) {
  const { t, text } = useI18n();
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [busyPlayer, setBusyPlayer] = useState<PlayerNumber | null>(null);
  const [boardBusy, setBoardBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const imageErrorMessage = (value: unknown) =>
    value instanceof ImageError
      ? t(IMAGE_ERROR_KEYS[value.code], value.params)
      : t('settings.errorFallback');

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !sheetRef.current) return;

      const focusables = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('disabled'));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  async function handleUpload(
    player: PlayerNumber,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    setBusyPlayer(player);
    try {
      const dataUrl = await imageFileToDataUrl(file);
      onPieceImageChange(player, dataUrl);
    } catch (uploadError) {
      setError(uploadError);
    } finally {
      setBusyPlayer(null);
    }
  }

  async function handleBoardUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    setBoardBusy(true);
    try {
      const dataUrl = await boardImageFileToDataUrl(file);
      onBoardImageChange(dataUrl);
    } catch (uploadError) {
      setError(uploadError);
    } finally {
      setBoardBusy(false);
    }
  }

  const custom = hasPieceCustomization(pieces);
  const customBoard = hasBoardCustomization(board);
  const boardFace = board.face ?? skin.vars['--board-face'];

  return (
    <div
      className="settings-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={sheetRef}
        className="settings-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <header className="settings-head">
          <div>
            <span className="kicker">APPEARANCE</span>
            <h2 id="settings-title">{t('settings.title')}</h2>
            <p>{t('settings.subtitle')}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="settings-close"
            onClick={onClose}
            aria-label={t('common.closeSettings')}
          >
            <CloseIcon />
          </button>
        </header>

        <section
          className="settings-section"
          aria-labelledby="language-heading"
        >
          <div className="settings-section-head">
            <span className="settings-num">01</span>
            <h3 id="language-heading">{t('settings.languageHeading')}</h3>
            <span className="settings-section-note">
              {t('settings.languageNote')}
            </span>
          </div>
          <p className="settings-hint">{t('settings.languageHint')}</p>
          <LanguageSwitch variant="full" />
        </section>

        <section className="settings-section" aria-labelledby="theme-heading">
          <div className="settings-section-head">
            <span className="settings-num">02</span>
            <h3 id="theme-heading">{t('settings.themeHeading')}</h3>
            <span className="settings-section-note">
              {t('settings.themeNote')}
            </span>
          </div>

          <div className="theme-grid">
            {SKINS.map((option) => {
              const selected = option.id === skin.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`theme-option${selected ? ' is-on' : ''}`}
                  onClick={() => onSkinChange(option.id)}
                  aria-pressed={selected}
                >
                  <span
                    className="theme-preview"
                    style={{
                      backgroundColor: option.vars['--paper'],
                      borderColor: option.vars['--rule'],
                    }}
                    aria-hidden="true"
                  >
                    <span className="theme-preview-page">
                      <span
                        className="theme-preview-title"
                        style={{ backgroundColor: option.vars['--ink'] }}
                      />
                      <span
                        className="theme-preview-accent"
                        style={{ backgroundColor: option.vars['--accent'] }}
                      />
                      <span
                        className="theme-preview-board"
                        style={{
                          backgroundColor: option.vars['--board-face'],
                          borderColor: option.vars['--board-edge'],
                        }}
                      >
                        <i style={{ backgroundColor: option.vars['--p1'] }} />
                        <i style={{ backgroundColor: option.vars['--p2'] }} />
                        <i style={{ backgroundColor: option.vars['--p3'] }} />
                      </span>
                    </span>
                  </span>
                  <span className="theme-copy">
                    <span className="theme-name">{text(option.name)}</span>
                    <span className="theme-note">
                      {option.note} ·{' '}
                      {t(
                        option.scheme === 'dark'
                          ? 'settings.scheme.dark'
                          : 'settings.scheme.light',
                      )}
                    </span>
                  </span>
                  <span className="theme-check" aria-hidden="true">
                    {selected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="settings-section" aria-labelledby="pieces-heading">
          <div className="settings-section-head">
            <span className="settings-num">03</span>
            <h3 id="pieces-heading">{t('settings.piecesHeading')}</h3>
            <span className="settings-section-note">
              {t('settings.piecesNote')}
            </span>
          </div>
          <p className="settings-hint">{t('settings.piecesHint')}</p>

          <div className="piece-list">
            {PLAYER_NUMBERS.map((player) => {
              const color = pieceColor(skin, pieces, player);
              const image = pieceImage(pieces, player);
              const customColor = pieces.colors[player];
              const customImage = pieces.images[player];
              const busy = busyPlayer === player;
              const disabled = busyPlayer !== null;

              return (
                <div className="piece-row" key={player}>
                  <span
                    className="piece-preview"
                    style={stoneStyle(color, image)}
                    aria-hidden="true"
                  />

                  <span className="piece-identity">
                    <span className="piece-label">P{player}</span>
                    <span className="piece-role">
                      {player <= 2
                        ? t(PLAYER_ROLE_KEYS[player])
                        : t('settings.role.player', { player })}
                    </span>
                  </span>

                  <label className="piece-color">
                    <span>{t('settings.color')}</span>
                    <input
                      type="color"
                      value={color}
                      onChange={(event) =>
                        onPieceColorChange(player, event.target.value)
                      }
                      aria-label={t('settings.pieceColorAria', { player })}
                    />
                    <code>{color.toUpperCase()}</code>
                  </label>

                  {customColor ? (
                    <button
                      type="button"
                      className="text-btn piece-follow"
                      onClick={() => onPieceColorChange(player, null)}
                    >
                      {t('common.followTheme')}
                    </button>
                  ) : (
                    <span className="piece-follow-note">
                      {t('common.themeColor')}
                    </span>
                  )}

                  <span className="piece-image-actions">
                    <label
                      className={`piece-upload${disabled ? ' is-disabled' : ''}`}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => void handleUpload(player, event)}
                        disabled={disabled}
                      />
                      {busy
                        ? t('common.processing')
                        : image
                          ? t('settings.image.change')
                          : t('settings.image.upload')}
                    </label>
                    {customImage && (
                      <button
                        type="button"
                        className="text-btn"
                        onClick={() => onPieceImageChange(player, null)}
                      >
                        {t('common.remove')}
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="settings-piece-foot">
            <span>{t('settings.imageSupport')}</span>
            {custom && (
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setError(null);
                  onResetPieces();
                }}
              >
                {t('settings.resetPieces')}
              </button>
            )}
          </div>
        </section>

        <section className="settings-section" aria-labelledby="board-heading">
          <div className="settings-section-head">
            <span className="settings-num">04</span>
            <h3 id="board-heading">{t('settings.boardHeading')}</h3>
            <span className="settings-section-note">
              {t('settings.boardNote')}
            </span>
          </div>

          <p className="settings-hint">{t('settings.boardHint')}</p>

          <div
            className="board-style-grid"
            role="group"
            aria-label={t('settings.boardStyleAria')}
          >
            {BOARD_STYLES.map((style) => {
              const selected = style === board.style;
              const meta = BOARD_STYLE_META[style];
              return (
                <button
                  key={style}
                  type="button"
                  className={`board-style-option${selected ? ' is-on' : ''}`}
                  onClick={() => onBoardStyleChange(style)}
                  aria-pressed={selected}
                >
                  <BoardStylePreview style={style} />
                  <span className="board-style-copy">
                    <span className="board-style-name">
                      {t(meta.nameKey)}
                    </span>
                    <span className="board-style-note">{meta.note}</span>
                  </span>
                  <span className="theme-check" aria-hidden="true">
                    {selected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="board-custom">
            <span
              className="board-swatch"
              style={{
                backgroundColor: boardFace,
                backgroundImage: board.image
                  ? `url("${board.image}")`
                  : undefined,
              }}
              aria-hidden="true"
            />
            <span className="board-custom-copy">
              <span className="board-custom-title">
                {t('settings.boardBackground')}
              </span>
              <span className="board-custom-note">
                {board.image
                  ? t('settings.boardImage')
                  : board.face
                    ? t('settings.boardFace')
                    : t('settings.boardFollow')}
              </span>
            </span>

            <label className="piece-color">
              <span>{t('settings.boardColor')}</span>
              <input
                type="color"
                value={boardFace}
                onChange={(event) => onBoardFaceChange(event.target.value)}
                aria-label={t('settings.boardColorAria')}
              />
              <code>{boardFace.toUpperCase()}</code>
            </label>

            {board.face ? (
              <button
                type="button"
                className="text-btn piece-follow"
                onClick={() => onBoardFaceChange(null)}
              >
                {t('common.followTheme')}
              </button>
            ) : (
              <span className="piece-follow-note">
                {t('common.themeColor')}
              </span>
            )}

            <span className="piece-image-actions">
              <label
                className={`piece-upload${boardBusy ? ' is-disabled' : ''}`}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => void handleBoardUpload(event)}
                  disabled={boardBusy}
                />
                {boardBusy
                  ? t('common.processing')
                  : board.image
                    ? t('settings.changeBackground')
                    : t('settings.uploadBackground')}
              </label>
              {board.image && (
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => onBoardImageChange(null)}
                >
                  {t('common.remove')}
                </button>
              )}
            </span>
          </div>

          {board.image && (
            <label className="board-veil-control">
              <span>{t('settings.veil')}</span>
              <input
                type="range"
                min={0}
                max={85}
                step={5}
                value={Math.round(board.veil * 100)}
                onChange={(event) =>
                  onBoardVeilChange(Number(event.target.value) / 100)
                }
              />
              <code>{Math.round(board.veil * 100)}%</code>
            </label>
          )}

          <div className="settings-piece-foot">
            <span>{t('settings.boardSupport')}</span>
            {customBoard && (
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setError(null);
                  onResetBoard();
                }}
              >
                {t('settings.resetBoard')}
              </button>
            )}
          </div>

          {error !== null && (
            <p className="settings-error" role="alert">
              {imageErrorMessage(error)}
            </p>
          )}
        </section>

        <footer className="settings-foot">
          <span className="settings-saved">{t('settings.saved')}</span>
          <button type="button" className="btn-solid" onClick={onClose}>
            {t('settings.done')}
          </button>
        </footer>
      </div>
    </div>
  );
}
