interface ControlsProps {
  onUndo: () => void;
  onRestart: () => void;
  onHint: () => void;
  onToggleSound: () => void;
  soundOn: boolean;
  canUndo: boolean;
  canHint: boolean;
  hintLoading: boolean;
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
}: ControlsProps) {
  return (
    <div className="controls">
      <button className="btn" onClick={onUndo} disabled={!canUndo}>
        悔棋 <kbd>Esc</kbd>
      </button>
      <button className="btn" onClick={onRestart}>
        重开 <kbd>R</kbd>
      </button>
      <button className="btn" onClick={onHint} disabled={!canHint}>
        {hintLoading ? '思考中…' : '提示'}
      </button>
      <button
        className="btn quiet sound"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? '关闭音效' : '开启音效'}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>
    </div>
  );
}
