import type { TutorialLesson } from '../game/tutorial';

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
  if (!visible) return null;

  return (
    <div className="result">
      <div className="slip slip-p1">
        <div className="slip-head">
          <span>TUTORIAL NO.{String(lesson.no).padStart(2, '0')}</span>
          <span>{nextLesson ? '下一课已解锁' : '全部完成'}</span>
        </div>

        <div className="slip-body">
          <span className="slip-disc p1" />
          <h2>教程完成</h2>
          <p>{lesson.done}</p>
          {nextLesson ? (
            <p className="slip-note">下一课：{nextLesson.title}</p>
          ) : (
            <p className="slip-note">你已经掌握了落子、连线、封堵和胜负优先级。</p>
          )}
        </div>

        <div className="slip-actions">
          {nextLesson ? (
            <>
              <button className="btn-solid" onClick={onNext}>
                下一课
              </button>
              <button className="btn-line" onClick={onAgain}>
                再练一次
              </button>
            </>
          ) : (
            <button className="btn-solid" onClick={onAgain}>
              再练一次
            </button>
          )}
          <button className="btn-plain" onClick={onMenu}>
            返回菜单
          </button>
        </div>

        <span className="stamp">成</span>
      </div>
    </div>
  );
}
