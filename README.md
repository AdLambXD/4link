# 4Link · 四连引力

> 重力棋盘上的四子连线 —— **Drop. Stack. Link.**

6×6 的重力棋盘，轮流选一列落子，棋子会落到底。横、竖、两条斜线，任意方向连成 **4 个**即胜。

![status](https://img.shields.io/badge/status-v0.1-6ea8ff)
![stack](https://img.shields.io/badge/stack-Vite%20%2B%20React%20%2B%20TS-35e0c8)

## 特性

- 6×6 经典四子棋规则，重力落子
- 本地双人 / 人机对战（简单 / 普通 / 困难）
- AI 在 Web Worker 中搜索，思考时界面不卡
- 落子动画、连四高亮、悬停列提示
- 悔棋、重开、AI 提示、音效开关
- 键盘 `1`–`6` 落子，`Esc` 悔棋，`R` 重开
- 战绩持久化（localStorage），移动端适配

## 快速开始

需要 Node.js **22.12+**（Vite 8 / Vitest 5 的要求，推荐 24 LTS）。

```bash
npm install
npm run dev      # 开发
npm run build    # 类型检查 + 生产构建
npm run preview  # 预览构建产物
npm test         # 规则与 AI 单元测试
```

## 玩法

1. 棋盘 6 列（A–F）× 6 行（1–6），行号从下往上。
2. 双方轮流选一列落子，棋子落到该列最底部的空位。
3. 横、竖、`↗`、`↘` 任一方向连续同色 ≥ 4 即胜。
4. 36 格填满且无人连四，判和棋。

完整规则、示例对局、盘面结构分析和 AI 设计见 **[docs/GAME_DESIGN.md](docs/GAME_DESIGN.md)**。

### 三个实用结论

- 中心 C、D 两列各参与 **48 条**胜利线，边列只有 24 条 —— 开局先抢中间。
- 斜线是主战场：竖四基本靠对手漏防，横四常要叠在对手棋子上。
- 6×6 四子棋已被求解：**后手必胜**，完美对局会在第 36 手（满盘）结束。所以本项目的「困难」是强启发式搜索，不是完美解。

## 项目结构

```
src/
├─ game/
│  ├─ rules.ts          # 纯函数规则：落子、判胜、和棋、悔棋 reducer
│  └─ rules.test.ts     # perft + 四方向判胜
├─ ai/
│  ├─ engine.ts         # negamax + alpha-beta + Zobrist 置换表 + 迭代加深
│  ├─ engine.test.ts    # 赢棋 / 挡棋 / 合法性
│  └─ worker.ts         # Web Worker 入口
├─ hooks/
│  ├─ useAiEngine.ts    # Worker 请求封装
│  └─ useStats.ts       # 战绩持久化
├─ components/
│  ├─ Board.tsx         # 棋盘、落子动画、连四高亮
│  ├─ Menu.tsx          # 模式选择
│  ├─ Controls.tsx      # 悔棋 / 重开 / 提示 / 音效
│  └─ ResultPanel.tsx   # 结算面板
├─ lib/sound.ts         # WebAudio 音效
├─ App.tsx
├─ main.tsx
└─ styles.css
```

## 设计取舍

- **规则层不可变**：`drop()` 返回新状态，UI 与测试都好推理。
- **AI 层可变**：`Uint8Array` 棋盘 + 模块级缓存，避免深搜时产生大量对象。
- **不用外部状态库**：一局棋用 `useReducer` 足够。
- **AI 放 Worker**：困难档默认 1.4s 预算，避免阻塞主线程。

## 已知限制

- 困难档不是完美解；真正的完美解需要预计算查表（6×6 约 690 亿局面）。
- 暂无联机对战与棋谱复盘（见路线图）。

## Roadmap

- [x] v0.1 经典 6×6、双人 + AI 三档
- [ ] v0.2 两局换先结算、战绩细分
- [ ] v0.3 残局谜题模式
- [ ] v0.4 重力旋转变体
- [ ] 联机对战 / 复盘

## 参考

- [Christophe Steininger · c4 solver](https://github.com/ChristopheSteininger/c4)
- [John Tromp · Connect Four Playground](https://tromp.github.io/c4/c4.html)
- [Wikipedia · Connect Four](https://en.wikipedia.org/wiki/Connect_Four)

## License

MIT
