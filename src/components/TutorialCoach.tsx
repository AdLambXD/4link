import type { TutorialLesson } from '../game/tutorial';

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
  const total = lesson.steps.length;
  const current = Math.min(stepIndex + 1, total);
  const prompt = complete
    ? lesson.done
    : thinking
      ? '对手回应中…'
      : (lesson.steps[stepIndex]?.prompt ?? lesson.done);

  return (
    <section
      className={`tutorial-coach${complete ? ' is-done' : ''}`}
      aria-live="polite"
    >
      <div className="tutorial-coach-head">
        <span className="tutorial-coach-no">
          TUTORIAL NO.{String(lesson.no).padStart(2, '0')}
        </span>
        <span className="tutorial-progress-text">
          {complete ? '完成' : `步骤 ${current} / ${total}`}
        </span>
      </div>

      <div className="tutorial-coach-body">
        <div className="tutorial-coach-copy">
          <h2>{lesson.title}</h2>
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
        !complete && <p className="tutorial-tip">{lesson.tip}</p>
      )}
    </section>
  );
}
