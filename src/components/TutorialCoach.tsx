import type { TutorialLesson } from '../game/tutorial';
import { useI18n } from '../i18n';

interface TutorialCoachProps {
  lesson: TutorialLesson;
  stepIndex: number;
  thinking: boolean;
  feedback: string | null;
  complete: boolean;
}

export function TutorialCoach({
  lesson,
  stepIndex,
  thinking,
  feedback,
  complete,
}: TutorialCoachProps) {
  const { t, text } = useI18n();
  const total = lesson.steps.length;
  const current = Math.min(stepIndex + 1, total);
  const prompt = complete
    ? text(lesson.done)
    : thinking
      ? t('coach.responding')
      : text(lesson.steps[stepIndex]?.prompt ?? lesson.done);

  return (
    <section
      className={`tutorial-coach${complete ? ' is-done' : ''}`}
      aria-live="polite"
    >
      <div className="tutorial-coach-head">
        <span className="tutorial-coach-no">
          {t('tutorial.head', {
            no: String(lesson.no).padStart(2, '0'),
          })}
        </span>
        <span className="tutorial-progress-text">
          {complete
            ? t('coach.complete')
            : t('coach.steps', { current, total })}
        </span>
      </div>

      <div className="tutorial-coach-body">
        <div className="tutorial-coach-copy">
          <h2>{text(lesson.title)}</h2>
          <p>{prompt}</p>
        </div>
        <div className="tutorial-dots" aria-hidden="true">
          {lesson.steps.map((_, index) => (
            <span
              key={index}
              className={
                complete || index < stepIndex
                  ? 'is-done'
                  : index === stepIndex
                    ? 'is-now'
                    : undefined
              }
            />
          ))}
        </div>
      </div>

      {feedback ? (
        <p className="tutorial-feedback" role="status">
          {feedback}
        </p>
      ) : (
        !complete && <p className="tutorial-tip">{text(lesson.tip)}</p>
      )}
    </section>
  );
}
