import { useI18n } from '../i18n';
import { BulbIcon, RestartIcon, SpeakerIcon, SpeakerOffIcon, UndoIcon } from './Icons';

interface ControlsProps {
  onUndo: () => void;
  onRestart: () => void;
  onHint: () => void;
  onToggleSound: () => void;
  soundOn: boolean;
  canUndo: boolean;
  canHint: boolean;
  hintLoading: boolean;
  showHint: boolean;
}

export function Controls({
  onUndo,
  onRestart,
  onHint,
  onToggleSound,
  soundOn,
  canUndo,
  canHint,
  hintLoading,
  showHint,
}: ControlsProps) {
  const { t } = useI18n();

  return (
    <div className="controls">
      <button className="ticket" onClick={onUndo} disabled={!canUndo}>
        <UndoIcon />
        <span>{t('controls.undo')}</span>
        <kbd>Esc</kbd>
      </button>
      <button className="ticket" onClick={onRestart}>
        <RestartIcon />
        <span>{t('controls.restart')}</span>
        <kbd>R</kbd>
      </button>
      {showHint && (
        <button className="ticket" onClick={onHint} disabled={!canHint}>
          <BulbIcon />
          <span>
            {hintLoading ? t('controls.thinking') : t('controls.hint')}
          </span>
        </button>
      )}
      <button
        className="ticket ticket-icon"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? t('controls.soundOn') : t('controls.soundOff')}
      >
        {soundOn ? <SpeakerIcon /> : <SpeakerOffIcon />}
      </button>
    </div>
  );
}
