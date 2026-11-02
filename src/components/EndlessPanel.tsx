import { useI18n } from '../i18n';

interface EndlessPanelProps {
  size: number;
  moves: number;
  scrolls: number;
  best: number;
  newBest: boolean;
  visible: boolean;
  onAgain: () => void;
  onMenu: () => void;
}

/** 无尽模式结算：只有 AI 连成四子时才会出现。 */
export function EndlessPanel({
  size,
  moves,
  scrolls,
  best,
  newBest,
  visible,
  onAgain,
  onMenu,
}: EndlessPanelProps) {
  const { t, tp } = useI18n();
  if (!visible) return null;

  return (
    <div className="result">
      <div className="slip slip-p2">
        <div className="slip-head">
          <span>{t('endless.head', { size })}</span>
          <span>{newBest ? t('endless.newBest') : 'HARD'}</span>
        </div>

        <div className="slip-body">
          <span className="slip-disc p2" />
          <h2>{t('endless.aiWins')}</h2>
          <p>{tp('endless.survived', moves)}</p>
          <p className="slip-note">{tp('endless.scrolls', scrolls)}</p>
          <p className="slip-note">{tp('endless.best', best)}</p>
        </div>

        <div className="slip-actions">
          <button className="btn-solid" onClick={onAgain}>
            {t('endless.again')}
          </button>
          <button className="btn-plain" onClick={onMenu}>
            {t('endless.menu')}
          </button>
        </div>

        <span className="stamp">{t('endless.stamp')}</span>
      </div>
    </div>
  );
}
