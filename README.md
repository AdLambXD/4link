# 4Link · 四连引力

> 重力棋盘上的连线游戏 —— **Drop. Stack. Link.**

方形围棋盘上，轮流选一列落子，棋子会落到该列最底部的交叉点。横、竖、两条斜线，任意方向连成指定数量即胜。

## 特性

- 6×6 / 8×8 / 12×12 / 16×16 四种方形棋盘（6、8 盘连 4，12、16 盘连 5）
- 本地 2–6 人轮流对战（hot-seat），棋子颜色随人数增加
- 人机对战三档（简单 / 普通 / 困难，仅 1v1）
- AI 在 Web Worker 中搜索，按棋盘尺寸自动限深
- 7 道残局谜题（1–3 步杀，6×6 / 8×8）：玩家固定先手，AI 最优防守，限步取胜
- 围棋式交叉点网格、星位、木框与行列坐标；棋子落在交叉点上
- 4 套可扩展**整站主题**：和纸 / 榧木 / 青瓷 / 蓝染（暗色），纸张、墨色、控件与棋盘一起切换
- 设置面板：整站主题、1–6 号棋子自定义颜色、棋子自定义图片，修改即时生效并持久化
- 上传图片自动居中裁切、压缩为 256×256 WebP / PNG 后保存在本机
- 落子动画、获胜连线高亮、悬停列提示与落点幽灵
- 悔棋、重开、提示、音效开关
- 键盘 `1`–`0` 落子，`Esc` 悔棋，`R` 重开
- 本场胜局记分；双人战绩与残局进度持久化（localStorage）

## 快速开始

需要 Node.js **22.12+**（Vite 8 / Vitest 5 的要求，推荐 24 LTS）。

```bash
npm install
npm run dev      # 开发
npm run build    # 类型检查 + 生产构建
npm run preview  # 预览构建产物
npm test         # 规则、AI、残局与外观测试
```

## 一键启动

| 系统 | 文件 | 用法 |
| --- | --- | --- |
| Windows | `start-windows.bat` | 双击运行 |
| Linux / macOS | `start-linux.sh` | `chmod +x start-linux.sh && ./start-linux.sh` |

脚本会检查 Node.js 版本，首次运行时自动 `npm install`，然后启动开发服务器并打开浏览器。关闭窗口或按 `Ctrl+C` 停止。

如果脚本在 Linux 上提示权限不足：

```bash
chmod +x start-linux.sh
```

## GitHub Pages 部署

仓库已附带 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：推送到 `main` 后会自动安装依赖、跑测试、构建并发布到 GitHub Pages。

1. 打开仓库的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
3. 推送代码到 `main`，或在 **Actions → Deploy to GitHub Pages** 手动运行。
4. 部署完成后访问 `https://<用户名>.github.io/<仓库名>/`。

默认地址是 `https://<用户名>.github.io/<仓库名>/`。如果账号的用户站（`<用户名>.github.io`）配置了自定义域名，项目站会继承为 `https://<自定义域名>/<仓库名>/`。

构建时的资源前缀会自动从仓库名推导，因此仓库改名或 fork 后无需改代码。只有**给当前仓库单独设置自定义域名**（站点位于域名根路径 `/`）时，才需要在 **Settings → Secrets and variables → Actions → Variables** 添加 `BASE_PATH=/`；继承用户站域名时保持留空。

## 玩法

1. 棋盘是正方形。列标从左到右为 `A`–`Q`（跳过 `I`），行号从下往上为 `1`–`16`。
2. 2–6 位玩家按 `1 → 2 → … → N → 1` 轮流选一列落子，棋子落到该列最底部的空交叉点。
3. 横、竖、`↗`、`↘` 任一方向连续同色棋子达到目标数即胜：
   - 6×6、8×8：**4 连**
   - 12×12、16×16：**5 连**
4. 棋盘填满且无人达标，判和棋。
5. 人机模式固定 1v1；3 人以上只支持本地轮流，且不显示提示按钮。

### 残局谜题

- 从菜单进入「残局谜题」，选择 7 道预设残局之一；玩家固定执先手，AI 执后手。
- 每道题给出一个未完成的盘面，在限定步数内连成目标数即胜；步数只计算玩家的落子。
- AI 会用精确求解器选择最优防守；「提示」给出当前仍可强制取胜的一手。
- 解开后记录本关最佳步数；进度和最佳步数保存在本机 `localStorage`。

完整规则、示例对局、盘面结构分析和 AI 设计见 **[docs/GAME_DESIGN.md](docs/GAME_DESIGN.md)**。

### 6×6 的三个实用结论

- 中心 C、D 两列各参与 **48 条**胜利线，边列只有 24 条 —— 开局先抢中间。
- 斜线是主战场：竖四基本靠对手漏防，横四常要叠在对手棋子上。
- 6×6 四子棋已被求解：**后手必胜**，完美对局会在第 36 手（满盘）结束。所以本项目的「困难」是强启发式搜索，不是完美解。8×8 以上没有做求解。

## 外观与设置

点击菜单报头或对局顶部的设置按钮打开「设置」。它控制的是**整站外观**，不只棋盘：

- **整站主题**：和纸 / 榧木 / 青瓷 / 蓝染。每套主题同时定义页面纸张、墨色、规则线、强调色、棋盘面子和 1–6 号默认棋子颜色；蓝染为暗色主题。
- **棋子颜色**：1–6 号玩家可分别覆盖主题色，未自定义的玩家继续跟随主题；可随时「跟随主题」恢复。
- **棋子图片**：为任意玩家上传 PNG / JPG / WebP（最大 8 MB）。图片会居中裁成正方形、压缩到 256×256，再以 data URL 保存在本机；棋盘、结算面板和菜单预览会同步显示。
- 设置修改立即生效。「全部恢复主题」可一次清除所有棋子自定义。

主题与自定义保存在 `localStorage`：主题使用 `4link.skin.v1`，棋子使用 `4link.pieces.v1`。存储损坏或超出配额时，外观仍会在当前页面生效。

| ID | 名称 | 气质 |
| --- | --- | --- |
| `washi` | 和纸 | 米色纸面 + 墨线 + 朱红 / 墨绿 |
| `kaya` | 榧木 | 蜂蜜色纸面与木盘 + 深褐格线 |
| `celadon` | 青瓷 | 灰绿釉面 + 青灰格线 |
| `indigo` | 蓝染 | 深蓝暗色主题 + 浅蓝格线，配高亮棋子 |

实现上，主题只是一组 CSS 变量（`src/skins.ts`），玩家覆盖再写到 `--p1`…`--p6` 与 `--p1-image`…`--p6-image`。新增主题只需在 `SKINS` 数组里追加一个对象，不需要改组件或样式表。

## 项目结构

```
.github/
└─ workflows/deploy.yml  # GitHub Pages 自动部署
start-windows.bat        # Windows 一键启动
start-linux.sh           # Linux / macOS 一键启动
vite.config.ts           # Vite 配置（自动适配 Pages 子路径）
src/
├─ game/
│  ├─ rules.ts          # 纯函数规则：尺寸/人数配置、落子、判胜、和棋、悔棋 reducer
│  ├─ rules.test.ts     # perft + 四方向判胜 + 多人轮转 + 载入残局
│  ├─ puzzle.ts         # 残局类型、ASCII 盘面校验、精确求解器、7 道关卡
│  └─ puzzle.test.ts    # 关卡合法性、限步强制胜、首着唯一性
├─ ai/
│  ├─ engine.ts         # 按尺寸参数化的 negamax + α-β + Zobrist + 迭代加深
│  ├─ engine.test.ts    # 赢棋 / 挡棋 / 合法性 / 大棋盘
│  └─ worker.ts         # Web Worker 入口
├─ hooks/
│  ├─ useAiEngine.ts    # Worker 请求封装
│  ├─ useAppearance.ts  # 整站主题与棋子覆盖注入、持久化
│  ├─ usePuzzleProgress.ts # 残局进度与最佳步数持久化
│  └─ useStats.ts       # 双人战绩持久化
├─ components/
│  ├─ Board.tsx         # 围棋式网格棋盘、交叉点棋子、落子动画
│  ├─ Menu.tsx          # 模式 / 人数 / 尺寸 / 难度 / 先手 / 外观入口 / 残局
│  ├─ Settings.tsx      # 整站主题、棋子颜色与图片设置面板
│  ├─ Controls.tsx      # 悔棋 / 重开 / 提示 / 音效
│  ├─ PuzzlePanel.tsx   # 残局成功 / 失败 / 下一题结算
│  └─ ResultPanel.tsx   # N 人结算面板
├─ skins.ts             # 整站主题注册表
├─ pieces.ts            # 棋子自定义校验、清洗与颜色 / 图片解析
├─ pieces.test.ts       # 自定义校验与主题变量完整性
├─ lib/
│  ├─ pieceImage.ts     # 图片校验、居中裁切与压缩
│  └─ sound.ts          # WebAudio 音效
├─ App.tsx
├─ main.tsx
└─ styles.css
```

## 设计取舍

- **规则层不可变**：`drop()` 返回新状态，UI 与测试都好推理；配置随状态保存，悔棋不会丢棋盘规格。
- **AI 层可变**：`Uint8Array` 棋盘 + 模块级缓存，避免深搜时产生大量对象；换尺寸时重建缓存。
- **AI 按尺寸限深**：6×6 深 14、8×8 深 9、12×12 深 6、16×16 深 5，时间预算同步收紧。
- **多人不接 AI**：现有 negamax 是两人博弈模型；3 人以上只做本地轮流。
- **残局单独求解**：常规 AI 是带时间预算的启发式搜索；谜题提示与防守改用短深度精确求解器，保证限步内的强制胜和最优拖延。
- **不用外部状态库**：一局棋用 `useReducer` 足够。
- **AI 放 Worker**：困难档最长约 1.4s，避免阻塞主线程；残局求解深度浅，直接在主线程计算。

## 已知限制

- 困难档不是完美解；真正的完美解需要预计算查表（6×6 约 690 亿局面）。
- 3–6 人模式没有 AI，也没有联机。
- 16×16 的 AI 会主动限深，强度低于小盘。
- 残局目前是 7 道固定关卡，没有关卡编辑器；新增关卡需在 `src/game/puzzle.ts` 写盘面并跑测试验证。
- 暂无棋谱复盘（见路线图）。

## Roadmap

- [x] v0.1 经典 6×6、双人 + AI 三档
- [x] v0.2 方形围棋盘、4 套皮肤、2–6 人本地对战、8/12/16 大棋盘
- [x] v0.3 残局谜题模式：7 道限步杀、AI 最优防守、提示与进度
- [x] v0.4 整站主题、设置面板、棋子自定义颜色与图片
- [ ] 联机对战 / 复盘

## 参考

- [Christophe Steininger · c4 solver](https://github.com/ChristopheSteininger/c4)
- [John Tromp · Connect Four Playground](https://tromp.github.io/c4/c4.html)
- [Wikipedia · Connect Four](https://en.wikipedia.org/wiki/Connect_Four)

## License

MIT
