import { describe, expect, it } from 'vitest';
import { pickText } from '../i18n';
import { canDrop, drop } from './rules';
import {
  TUTORIALS,
  createTutorialState,
  getNextTutorial,
  getTutorial,
  isTutorialComplete,
} from './tutorial';

describe('新手教程', () => {
  it('课程编号和 id 唯一', () => {
    expect(new Set(TUTORIALS.map((lesson) => lesson.id)).size).toBe(TUTORIALS.length);
    expect(TUTORIALS.map((lesson) => lesson.no)).toEqual(
      Array.from({ length: TUTORIALS.length }, (_, i) => i + 1),
    );
  });

  for (const lesson of TUTORIALS) {
    it(`#${lesson.no}「${pickText(lesson.title, 'zh-CN')}」的步骤可以完整走通`, () => {
      let state = createTutorialState(lesson);
      expect(state.status).toBe('playing');
      expect(lesson.human).toBe(1);
      expect(lesson.turn).toBe(1);
      expect(lesson.steps.length).toBeGreaterThan(0);
      expect(isTutorialComplete(lesson, state, 0)).toBe(false);

      for (let i = 0; i < lesson.steps.length; i++) {
        const step = lesson.steps[i];
        expect(pickText(step.prompt, 'zh-CN').trim().length).toBeGreaterThan(0);
        expect(canDrop(state, step.expect)).toBe(true);

        state = drop(state, step.expect);
        if (state.status !== 'playing') {
          expect(i).toBe(lesson.steps.length - 1);
          break;
        }

        if (step.reply !== undefined) {
          expect(canDrop(state, step.reply)).toBe(true);
          state = drop(state, step.reply);
          // 教程里的对手应手不能提前结束对局。
          expect(state.status).toBe('playing');
        }
      }

      if (lesson.finish === 'win') {
        expect(state.status).toBe('won');
        expect(state.winner).toBe(lesson.human);
        expect(state.winLine?.length ?? 0).toBeGreaterThanOrEqual(state.config.win);
        expect(isTutorialComplete(lesson, state, 0)).toBe(true);
      } else {
        expect(state.status).toBe('playing');
        expect(isTutorialComplete(lesson, state, lesson.steps.length - 1)).toBe(false);
        expect(isTutorialComplete(lesson, state, lesson.steps.length)).toBe(true);
      }
    });
  }

  it('按编号查找并支持下一课与最后一课', () => {
    expect(getTutorial('gravity')?.no).toBe(1);
    expect(getTutorial('missing')).toBeNull();
    expect(getTutorial(null)).toBeNull();

    for (let i = 0; i < TUTORIALS.length - 1; i++) {
      expect(getNextTutorial(TUTORIALS[i].id)?.id).toBe(TUTORIALS[i + 1].id);
    }
    expect(getNextTutorial(TUTORIALS[TUTORIALS.length - 1].id)).toBeNull();
  });
});
