import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import { CloseIcon } from './Icons';
import {
  PLAYER_NUMBERS,
  hasPieceCustomization,
  pieceColor,
  pieceImage,
  type PieceCustomization,
  type PlayerNumber,
} from '../pieces';
import { imageFileToDataUrl } from '../lib/pieceImage';
import { SKINS, type Skin, type SkinId } from '../skins';

interface SettingsProps {
  skin: Skin;
  pieces: PieceCustomization;
  onSkinChange: (id: SkinId) => void;
  onPieceColorChange: (player: PlayerNumber, color: string | null) => void;
  onPieceImageChange: (player: PlayerNumber, image: string | null) => void;
  onResetPieces: () => void;
  onClose: () => void;
}

const PLAYER_ROLES: Record<PlayerNumber, string> = {
  1: '先手',
  2: '后手',
  3: '玩家 3',
  4: '玩家 4',
  5: '玩家 5',
  6: '玩家 6',
};

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
  onSkinChange,
  onPieceColorChange,
  onPieceImageChange,
  onResetPieces,
  onClose,
}: SettingsProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [busyPlayer, setBusyPlayer] = useState<PlayerNumber | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError(
        uploadError instanceof Error ? uploadError.message : '图片处理失败，请重试',
      );
    } finally {
      setBusyPlayer(null);
    }
  }

  const custom = hasPieceCustomization(pieces);

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
            <h2 id="settings-title">设置</h2>
            <p>整站主题与棋子外观，修改会立即应用。</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="settings-close"
            onClick={onClose}
            aria-label="关闭设置"
          >
            <CloseIcon />
          </button>
        </header>

        <section className="settings-section" aria-labelledby="theme-heading">
          <div className="settings-section-head">
            <span className="settings-num">01</span>
            <h3 id="theme-heading">整站主题</h3>
            <span className="settings-section-note">颜色 / 纸张 / 棋盘</span>
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
                    <span className="theme-name">{option.name}</span>
                    <span className="theme-note">
                      {option.note} · {option.scheme === 'dark' ? '暗色' : '亮色'}
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
            <span className="settings-num">02</span>
            <h3 id="pieces-heading">棋子</h3>
            <span className="settings-section-note">颜色 / 图片</span>
          </div>
          <p className="settings-hint">
            未自定义的颜色会跟随主题；图片会被裁成圆形，保存在本机。
          </p>

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
                    <span className="piece-role">{PLAYER_ROLES[player]}</span>
                  </span>

                  <label className="piece-color">
                    <span>颜色</span>
                    <input
                      type="color"
                      value={color}
                      onChange={(event) =>
                        onPieceColorChange(player, event.target.value)
                      }
                      aria-label={`玩家 ${player} 棋子颜色`}
                    />
                    <code>{color.toUpperCase()}</code>
                  </label>

                  {customColor ? (
                    <button
                      type="button"
                      className="text-btn piece-follow"
                      onClick={() => onPieceColorChange(player, null)}
                    >
                      跟随主题
                    </button>
                  ) : (
                    <span className="piece-follow-note">主题色</span>
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
                      {busy ? '处理中…' : image ? '更换图片' : '上传图片'}
                    </label>
                    {customImage && (
                      <button
                        type="button"
                        className="text-btn"
                        onClick={() => onPieceImageChange(player, null)}
                      >
                        移除
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {error && (
            <p className="settings-error" role="alert">
              {error}
            </p>
          )}

          <div className="settings-piece-foot">
            <span>图片支持 PNG / JPG / WebP，最大 8 MB。</span>
            {custom && (
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setError(null);
                  onResetPieces();
                }}
              >
                全部恢复主题
              </button>
            )}
          </div>
        </section>

        <footer className="settings-foot">
          <span className="settings-saved">外观保存在本机</span>
          <button type="button" className="btn-solid" onClick={onClose}>
            完成
          </button>
        </footer>
      </div>
    </div>
  );
}
