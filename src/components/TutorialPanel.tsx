import type { TutorialLesson } from '../game/tutorial';
import { useI18n } from '../i18n';

interface TutorialPanelProps {
  lesson: TutorialLesson;
  nextLesson: TutorialLesson | null;
  visible: boolean;
  onAgain: () => void;
  onNext: () => void;
  onMenu: () => void;
}

export function TutorialPanel({
  lesson,
  nextLesson,
  visible,
  onAgain,
  onNext,
  onMenu,
}: TutorialPanelProps) {
  const { t, text } = useI18n();
  if (!visible) return null;

  return (
    <div className="result">
      <div className="slip slip-p1">
        <div className="slip-head">
          <span>
            {t('tutorial.head', {
              no: String(lesson.no).padStart(2, '0'),
            })}
          </span>
          <span>
            {nextLesson ? t('tutorial.nextUnlocked') : t('tutorial.allComplete')}
          </span>
        </div>

        <div className="slip-body">
          <span className="slip-disc p1" />
          <h2>{t('tutorial.complete')}</h2>
          <p>{text(lesson.done)}</p>
          {nextLesson ? (
            <p className="slip-note">
              {t('tutorial.nextLesson', {
                title: text(nextLesson.title),
              })}
            </p>
          ) : (
            <p className="slip-note">{t('tutorial.mastered')}</p>
          )}
        </div>

        <div className="slip-actions">
          {nextLesson ? (
            <>
              <button className="btn-solid" onClick={onNext}>
                {t('tutorial.next')}
              </button>
              <button className="btn-line" onClick={onAgain}>
                {t('tutorial.practice')}
              </button>
            </>
          ) : (
            <button className="btn-solid" onClick={onAgain}>
              {t('tutorial.practice')}
            </button>
          )}
          <button className="btn-plain" onClick={onMenu}>
            {t('tutorial.menu')}
          </button>
        </div>

        <span className="stamp">{t('tutorial.stamp')}</span>
      </div>
    </div>
  );
}
