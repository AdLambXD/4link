/**
 * 新手教程：用短关卡逐步介绍重力、横 / 竖 / 斜线、封堵和胜负优先级。
 *
 * 每一步都要求玩家落在指定列；走对后可以自动播放一步对手应手。
 * 和残局不同，教程不依赖求解器，盘面与步骤都是人工编排的。
 */

import {
  createPositionState,
  type PositionDefinition,
} from './puzzle';
import type { GameState } from './rules';

export interface TutorialStep {
  /** 玩家必须点击的列 */
  readonly expect: number;
  /** 玩家走对后自动播放的对手落子列 */
  readonly reply?: number;
  /** 当前步骤的指导语 */
  readonly prompt: string;
}

export interface TutorialLesson extends PositionDefinition {
  readonly no: number;
  readonly title: string;
  readonly goal: string;
  readonly tip: string;
  /** 完成后的提示语 */
  readonly done: string;
  /** 以连成目标数结束，还是走完全部步骤即结束 */
  readonly finish: 'win' | 'steps';
  readonly steps: readonly TutorialStep[];
}

export const TUTORIALS: readonly TutorialLesson[] = [
  {
    id: 'gravity',
    no: 1,
    title: '落子与重力',
    goal: '把棋子放进井底，理解重力与叠子。',
    tip: '列标 A–F 在棋盘上方；棋子永远落在该列最高的空位上。',
    done: '你已经学会选列落子。棋子会一直落到该列最底部。',
    size: 6,
    human: 1,
    turn: 1,
    finish: 'steps',
    rows: ['......', '......', '......', '......', '......', '......'],
    steps: [
      {
        expect: 2,
        reply: 2,
        prompt: '点击 C 列，让棋子落到最底部。',
      },
      {
        expect: 2,
        prompt: '再点一次 C 列，看棋子如何叠在上一步的棋子上。',
      },
    ],
  },
  {
    id: 'horizontal',
    no: 2,
    title: '横向四连',
    goal: '横着连成四子。',
    tip: '横线是最直观的胜利线，先数清缺口在哪一列。',
    done: '底行四子连成一条横线。',
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', '......', '......', '.....O', 'XXX.OO'],
    steps: [
      {
        expect: 3,
        prompt: '底行已有三枚先手棋子，点击 D 列补上第四枚。',
      },
    ],
  },
  {
    id: 'vertical',
    no: 3,
    title: '竖向四连',
    goal: '竖着连成四子。',
    tip: '同一列可以不断叠高，竖向四连同样有效。',
    done: 'C 列叠成四层，竖向连线成立。',
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', '......', '..X...', '..X.O.', '..X.OO'],
    steps: [
      {
        expect: 2,
        prompt: 'C 列已有三枚先手棋子，点击 C 列把它补到四层。',
      },
    ],
  },
  {
    id: 'diagonal',
    no: 4,
    title: '斜线四连',
    goal: '斜着连成四子，同时封住对手。',
    tip: '斜线穿过多个列，落点必须正好补齐缺口。',
    done: '斜线补齐的同时，也挡住了对手的竖三。',
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', 'X.....', 'OX....', 'OOX...', 'OOO.X.'],
    steps: [
      {
        expect: 3,
        prompt: '先手三子已经排成斜线，点击 D 列补齐缺口。',
      },
    ],
  },
  {
    id: 'block',
    no: 5,
    title: '挡住对手',
    goal: '在对手下一手成线前封住缺口。',
    tip: '对手有三子时，先看它的缺口是否还能落子。',
    done: '底行的缺口已经封住，对手无法一手成线。',
    size: 6,
    human: 1,
    turn: 1,
    finish: 'steps',
    rows: ['......', '......', '......', '......', '....X.', 'OOO.XX'],
    steps: [
      {
        expect: 3,
        prompt: '对手底行已经三连，点击 D 列封住缺口。',
      },
    ],
  },
  {
    id: 'win-first',
    no: 6,
    title: '先赢再挡',
    goal: '在对手的威胁面前，优先完成自己的胜利。',
    tip: '能赢就先赢；挡棋只在没有胜着时才考虑。',
    done: '你抢在对手之前完成了自己的四连。',
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', '......', '.....O', '.....O', 'XXX..O'],
    steps: [
      {
        expect: 3,
        prompt: '你的胜利点在 D 列；对手也有竖三，但先完成自己的连线。',
      },
    ],
  },
];

export function getTutorial(id: string | null | undefined): TutorialLesson | null {
  if (!id) return null;
  return TUTORIALS.find((lesson) => lesson.id === id) ?? null;
}

export function getNextTutorial(id: string): TutorialLesson | null {
  const index = TUTORIALS.findIndex((lesson) => lesson.id === id);
  if (index < 0) return TUTORIALS[0] ?? null;
  return TUTORIALS[index + 1] ?? null;
}

export function createTutorialState(lesson: TutorialLesson): GameState {
  return createPositionState(lesson);
}

/** 走完全部步骤，或以玩家获胜结束。 */
export function isTutorialComplete(
  lesson: TutorialLesson,
  state: GameState,
  stepIndex: number,
): boolean {
  if (lesson.finish === 'win') {
    return state.status === 'won' && state.winner === lesson.human;
  }
  return state.status === 'playing' && stepIndex >= lesson.steps.length;
}
