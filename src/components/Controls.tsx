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
  return (
    <div className="controls">
      <button className="ticket" onClick={onUndo} disabled={!canUndo}>
        <UndoIcon />
        <span>悔棋</span>
        <kbd>Esc</kbd>
      </button>
      <button className="ticket" onClick={onRestart}>
        <RestartIcon />
        <span>重开</span>
        <kbd>R</kbd>
      </button>
      {showHint && (
        <button className="ticket" onClick={onHint} disabled={!canHint}>
          <BulbIcon />
          <span>{hintLoading ? '思考中' : '提示'}</span>
        </button>
      )}
      <button
        className="ticket ticket-icon"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? '关闭音效' : '开启音效'}
      >
        {soundOn ? <SpeakerIcon /> : <SpeakerOffIcon />}
      </button>
    </div>
  );
}
