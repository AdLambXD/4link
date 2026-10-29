/**
 * 新手教程：用短关卡逐步介绍重力、横 / 竖 / 斜线、封堵和胜负优先级。
 *
 * 每一步都要求玩家落在指定列；走对后可以自动播放一步对手应手。
 * 和残局不同，教程不依赖求解器，盘面与步骤都是人工编排的。
 */

import { lt, type LocalizedText } from '../i18n';
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
  readonly prompt: LocalizedText;
}

export interface TutorialLesson extends PositionDefinition {
  readonly no: number;
  readonly title: LocalizedText;
  readonly goal: LocalizedText;
  readonly tip: LocalizedText;
  /** 完成后的提示语 */
  readonly done: LocalizedText;
  /** 以连成目标数结束，还是走完全部步骤即结束 */
  readonly finish: 'win' | 'steps';
  readonly steps: readonly TutorialStep[];
}

export const TUTORIALS: readonly TutorialLesson[] = [
  {
    id: 'gravity',
    no: 1,
    title: lt('落子与重力', '落子與重力', 'Drop and gravity'),
    goal: lt('把棋子放进井底，理解重力与叠子。', '把棋子放進井底，理解重力與疊子。', 'Drop a stone to the bottom and learn how gravity and stacking work.'),
    tip: lt('列标 A–F 在棋盘上方；棋子永远落在该列最高的空位上。', '欄標 A–F 在棋盤上方；棋子永遠落在該欄最低的空位上。', 'Column labels A–F sit above the board. A stone always lands on the lowest empty point in its column.'),
    done: lt('你已经学会选列落子。棋子会一直落到该列最底部。', '你已經學會選欄落子。棋子會一直落到該欄最底部。', 'You can now choose a column. The stone falls all the way to the bottom.'),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'steps',
    rows: ['......', '......', '......', '......', '......', '......'],
    steps: [
      {
        expect: 2,
        reply: 2,
        prompt: lt('点击 C 列，让棋子落到最底部。', '點擊 C 欄，讓棋子落到最底部。', 'Click column C to drop a stone to the bottom.'),
      },
      {
        expect: 2,
        prompt: lt('再点一次 C 列，看棋子如何叠在上一步的棋子上。', '再點一次 C 欄，看棋子如何疊在上一步的棋子上。', 'Click column C again and see it stack on the previous stone.'),
      },
    ],
  },
  {
    id: 'horizontal',
    no: 2,
    title: lt('横向四连', '橫向四連', 'Horizontal four'),
    goal: lt('横着连成四子。', '橫著連成四子。', 'Connect four stones horizontally.'),
    tip: lt('横线是最直观的胜利线，先数清缺口在哪一列。', '橫線是最直觀的勝利線，先數清缺口在哪一欄。', 'A horizontal line is the easiest to spot. First find which column has the gap.'),
    done: lt('底行四子连成一条横线。', '底行四子連成一條橫線。', 'Four stones form a horizontal line on the bottom row.'),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', '......', '......', '.....O', 'XXX.OO'],
    steps: [
      {
        expect: 3,
        prompt: lt('底行已有三枚先手棋子，点击 D 列补上第四枚。', '底行已有三枚先手棋子，點擊 D 欄補上第四枚。', 'Three first-player stones are on the bottom row. Click D to add the fourth.'),
      },
    ],
  },
  {
    id: 'vertical',
    no: 3,
    title: lt('竖向四连', '豎向四連', 'Vertical four'),
    goal: lt('竖着连成四子。', '豎著連成四子。', 'Connect four stones vertically.'),
    tip: lt('同一列可以不断叠高，竖向四连同样有效。', '同一欄可以不斷疊高，豎向四連同樣有效。', 'A column can keep stacking, and vertical fours count too.'),
    done: lt('C 列叠成四层，竖向连线成立。', 'C 欄疊成四層，豎向連線成立。', 'Column C is four high and the vertical line is complete.'),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', '......', '..X...', '..X.O.', '..X.OO'],
    steps: [
      {
        expect: 2,
        prompt: lt('C 列已有三枚先手棋子，点击 C 列把它补到四层。', 'C 欄已有三枚先手棋子，點擊 C 欄把它補到四層。', 'Column C already has three. Click C to make it four.'),
      },
    ],
  },
  {
    id: 'diagonal',
    no: 4,
    title: lt('斜线四连', '斜線四連', 'Diagonal four'),
    goal: lt('斜着连成四子，同时封住对手。', '斜著連成四子，同時封住對手。', 'Connect four diagonally while blocking the opponent.'),
    tip: lt('斜线穿过多个列，落点必须正好补齐缺口。', '斜線穿過多個欄，落點必須正好補齊缺口。', 'A diagonal crosses several columns, so the drop must fill the exact gap.'),
    done: lt(
      '斜线补齐的同时，也挡住了对手的竖三。',
      '斜線補齊的同時，也擋住了對手的豎三。',
      "The diagonal is complete, and the opponent's vertical three is blocked.",
    ),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', 'X.....', 'OX....', 'OOX...', 'OOO.X.'],
    steps: [
      {
        expect: 3,
        prompt: lt('先手三子已经排成斜线，点击 D 列补齐缺口。', '先手三子已經排成斜線，點擊 D 欄補齊缺口。', 'Three first-player stones already form a diagonal. Click D to fill the gap.'),
      },
    ],
  },
  {
    id: 'block',
    no: 5,
    title: lt('挡住对手', '擋住對手', 'Block the opponent'),
    goal: lt('在对手下一手成线前封住缺口。', '在對手下一手成線前封住缺口。', 'Block the gap before the opponent connects on the next move.'),
    tip: lt('对手有三子时，先看它的缺口是否还能落子。', '對手有三子時，先看它的缺口是否還能落子。', 'When the opponent has three, check whether the gap is still playable.'),
    done: lt('底行的缺口已经封住，对手无法一手成线。', '底行的缺口已經封住，對手無法一手成線。', 'The bottom-row gap is blocked; the opponent cannot win in one move.'),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'steps',
    rows: ['......', '......', '......', '......', '....X.', 'OOO.XX'],
    steps: [
      {
        expect: 3,
        prompt: lt('对手底行已经三连，点击 D 列封住缺口。', '對手底行已經三連，點擊 D 欄封住缺口。', 'The opponent has three on the bottom row. Click D to block the gap.'),
      },
    ],
  },
  {
    id: 'win-first',
    no: 6,
    title: lt('先赢再挡', '先贏再擋', 'Win before you block'),
    goal: lt('在对手的威胁面前，优先完成自己的胜利。', '在對手的威脅面前，優先完成自己的勝利。', 'When the opponent threatens, finish your own win first.'),
    tip: lt('能赢就先赢；挡棋只在没有胜着时才考虑。', '能贏就先贏；擋棋只在沒有勝著時才考慮。', 'If you can win, win. Only block when you have no winning move.'),
    done: lt('你抢在对手之前完成了自己的四连。', '你搶在對手之前完成了自己的四連。', 'You completed your four before the opponent could.'),
    size: 6,
    human: 1,
    turn: 1,
    finish: 'win',
    rows: ['......', '......', '......', '.....O', '.....O', 'XXX..O'],
    steps: [
      {
        expect: 3,
        prompt: lt('你的胜利点在 D 列；对手也有竖三，但先完成自己的连线。', '你的勝利點在 D 欄；對手也有豎三，但先完成自己的連線。', 'Your winning point is column D. The opponent also has a vertical three, but finish your own line first.'),
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
