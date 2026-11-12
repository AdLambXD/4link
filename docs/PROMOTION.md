# 4Link 推广文案与发布计划

> 目标：在 SignPath Foundation 复审前拿到 **50+ stars、300+ 下载**，同时为项目积累第一批真实玩家。
> 所有文案可直接复制，替换括号内的占位内容即可。

## 一、事实卡（写任何文案都用这一版）

| 项 | 内容 |
| --- | --- |
| 名称 | 4Link · 四连引力 |
| 一句话 | 重力棋盘上的四子连线，网页 / Android / Windows 三端离线可玩 |
| 网址 | <https://adlambxd.github.io/4link/> |
| 仓库 | <https://github.com/AdLambXD/4link> |
| 下载 | <https://github.com/AdLambXD/4link/releases/latest> |
| 体积 | APK 3.4 MB · portable EXE 106 MB · setup EXE 117 MB |
| 许可 | MIT |
| 亮点 | 6×6→16×16 四种盘、2–6 人同屏、三档 AI、12 道残局、6 节教程、无尽模式、旋转模式、联机 1v1、10 种语言、6 种格线、4 套主题 |

## 二、素材

| 文件 | 用途 |
| --- | --- |
| `docs/screenshots/menu.png` | 封面 / 首图 |
| `docs/screenshots/board-washi.png` | 对局展示（浅色） |
| `docs/screenshots/board-neon.png` | 对局展示（暗色，视觉冲击强，优先用作封面） |
| `docs/screenshots/settings-board-styles.png` | 6 种格线，功能展示 |
| `docs/screenshots/settings-themes.png` | 4 套主题 + 10 种语言 |

> 建议：手机端截图另拍一张竖图（浏览器开发者工具切 390×844 再截），小红书 / B 站封面用竖图效果更好。

---

## 三、各平台文案

### 1. Hacker News（Show HN）

标题（不超过 80 字符，不要带感叹号）：

```
Show HN: 4Link – Four-in-a-row on a Go board, in the browser, Android and Windows
```

正文：

```
Hi HN,

4Link is a four-in-a-row game played on square Go-style boards. You pick a column,
your stone falls to the lowest free intersection, and you win by lining up 4 (small
boards) or 5 (large boards) in any direction.

I built it because I wanted the Connect Four feel with the spatial freedom of a Go
board — the diagonal play changes a lot once the grid is bigger than 7 columns.

Things that might be interesting to this crowd:

- The rules engine is framework-free TypeScript and shared by the UI, the AI worker
  and the online host, so all three agree on legality.
- The AI runs in a Web Worker with a depth limit scaled to board size. 6x6 is a
  solved game (second player wins), so "hard" is a strong heuristic, not a solver.
- Rotation mode turns the board 90 degrees after every move and re-settles the
  stones; lines created by the rotation count as wins, which breaks the usual
  static evaluation, so the AI simulates rotate-and-fall at every ply.
- Endless mode is a defence-only variant: the AI always moves first and you score
  by surviving.
- One codebase ships as a static site, an Android APK (Capacitor) and a Windows app
  (Electron). Everything works offline; online play is WebRTC with an optional
  WebSocket relay.

Play in the browser: https://adlambxd.github.io/4link/
Source (MIT): https://github.com/AdLambXD/4link

Feedback on the rules balance and the AI would be very welcome.
```

> 发布时间：美东时间 **周二至周四 08:00–10:00**（北京时间 20:00–22:00）。
> 当天留出 3 小时回复评论，HN 的排名很大程度看前两小时的互动。

---

### 2. Reddit

**r/WebGames**

```
[Game] 4Link – a four-in-a-row game on a Go board, with a rotation mode that flips the board 90° after every move

I made a browser game where you drop stones into columns on a square Go-style board.
4 in a row on 6x6/8x8, 5 in a row on 12x12/16x16.

The mode I ended up playing most is Rotation: after every move the whole board turns
90° clockwise and the stones re-settle, so a line you were building can become a line
for your opponent. It makes the game feel completely different.

Also has: three AI levels, 12 limited-move puzzles, an interactive tutorial, endless
defence mode, local 2–6 player hot-seat, and online 1v1 via room codes.

No install, no account: https://adlambxd.github.io/4link/
```

**r/AndroidGaming**

```
[Dev] 4Link – offline four-in-a-row on a Go board, 3.4 MB APK, no ads, no IAP

Released v1.0 of my open-source puzzle/strategy game. It is a Connect Four variant
played on square Go-style boards (6x6 up to 16x16).

- 3.4 MB APK, works fully offline
- No ads, no in-app purchases, no accounts, no analytics
- 3 AI levels, 12 puzzles, tutorial, endless mode, rotation mode
- Local hot-seat for 2–6 players, online 1v1 with a room code
- 10 languages, 6 board grid styles, 4 themes

APK: https://github.com/AdLambXD/4link/releases/latest
Source (MIT): https://github.com/AdLambXD/4link
```

**r/coolgithubprojects**

```
4Link – four-in-a-row on a Go board, shipped to web, Android and Windows from one codebase

MIT-licensed React + TypeScript game. Rules engine is framework-free and shared by the
UI, the AI Web Worker and the online host. CI builds the Pages site, the Capacitor APK
and the Electron installers in one workflow and attaches all three to a GitHub Release.

Repo: https://github.com/AdLambXD/4link
Play: https://adlambxd.github.io/4link/
```

**r/opensource**（强调工程结构，不谈游戏手感）

```
4Link: a small MIT game project where the same rules engine drives the UI, the AI worker and the online host

Posting because the structure may be useful to others: a framework-free rules module,
a worker-based search, a host-authoritative network layer on top of the same rules, and
a CI workflow that produces a static site, an Android APK and Windows installers from one
tag. No backend, no accounts.

https://github.com/AdLambXD/4link
```

> Reddit 注意事项：每个账号同一游戏**最多发 2–3 个版块，间隔 24 小时以上**；
> 先在自己有历史的版块发（比如 r/WebGames），再考虑其它。发帖后 1 小时内回复所有评论。

---

### 3. V2EX（分享创造节点）

标题：

```
[分享创造] 4Link 四连引力：把四子棋放到围棋盘上，还加了个每步旋转 90° 的模式
```

正文：

```
最近把一个小项目做到了 1.0，纯前端，MIT 开源。

玩法：方形围棋盘，轮流选列落子，棋子落到该列最底部交叉点，横竖斜连成 4 子（6×6 / 8×8）
或 5 子（12×12 / 16×16）获胜。

自己最常玩的是「旋转模式」：每落一子整块棋盘顺时针转 90°，棋子重新塌落，
旋转过程中形成的四连也算赢。本来在给自己搭的线，可能一转就成对手的线了，
策略和普通四子棋完全是两套。

其它：三档 AI、12 道限步残局、6 节新手教程、无尽防守模式、2–6 人同屏、
房间码联机（WebRTC 直连或自建中继）、10 种语言、4 套主题、6 种格线样式。

网页直接玩：https://adlambxd.github.io/4link/
源码：https://github.com/AdLambXD/4link
APK / EXE：https://github.com/AdLambXD/4link/releases/latest

技术上比较想聊的两点：
1. 规则引擎是纯 TS，UI、AI Worker、联机房主三方共用同一份，联机时房主用同一套校验后再广播。
2. 旋转模式里 AI 每层都要完整模拟「落子 → 判胜 → 旋转 → 塌落 → 全场判胜」，
   静态评估完全失效，搜索成本比普通模式高不少。
```

---

### 4. 知乎

问题选择：「有哪些好玩的免费开源小游戏？」「如何评价自己独立开发的游戏？」

回答开头：

```
分享一个自己写的开源小游戏：4Link 四连引力。

它是四子棋的变体，但棋盘用的是围棋盘——19 路那种交叉点网格。
所以你落子的不是格子，是交叉点；连线的方向也不只是横竖，两条斜线同样算。

（中间插 board-neon.png）

做出 1.0 之后我自己最常开的是旋转模式：每落一子，整块棋盘顺时针转 90°，
棋子按新的重力方向重新塌落。这一步会把双方原本的布局全部打乱，
有时候你搭的三连转完就变成对手的四连。

其它功能：三档 AI、12 道残局、教程、无尽模式、2–6 人同屏、联机、10 种语言。

网页版免安装：https://adlambxd.github.io/4link/
代码（MIT）：https://github.com/AdLambXD/4link
```

---

### 5. 小红书

标题（选一个）：

```
把四子棋搬到围棋盘上，还加了个「每步转 90°」的模式
不用下载的免费小游戏，摸鱼刚好
安卓 3.4MB 的离线棋类小游戏，无广告无内购
```

正文：

```
最近在玩自己写的一个小游戏，4Link 四连引力 🔴🔵

规则很好懂：选一列落子，棋子掉到最下面，连成 4 个就赢。
但棋盘是围棋盘那种交叉点网格，斜线特别好用。

最上头的是旋转模式——
每走一步，整个棋盘顺时针转 90°，棋子重新掉一次。
你搭好的三连，转完可能是对手的四连😵

📱 网页打开就能玩，不用下载
🤖 安卓 3.4MB，完全离线，无广告无内购
💻 Windows 也有免安装版
🌍 支持 10 种语言，6 种棋盘格线，4 套主题

搜索「4Link 四连引力」，或者评论区找我拿链接～

#独立游戏 #小游戏推荐 #摸鱼神器 #开源 #棋类游戏 #四子棋
```

> 小红书不能直接放外链，用「主页链接」或在评论区回复；封面用 `board-neon.png` 竖版裁切。

---

### 6. B 站 / 视频脚本（60 秒）

| 时间 | 画面 | 旁白 |
| --- | --- | --- |
| 0–5s | 旋转模式连下三手的录屏 | 「四子棋你肯定玩过，但每走一步棋盘转 90° 的呢？」 |
| 5–15s | 慢放一次旋转 + 塌落 | 「每落一子，整块棋盘顺时针转 90°，棋子按新的重力方向重新掉一遍。」 |
| 15–25s | 展示一次「转出来的四连」 | 「最坑的是——旋转过程中连成的四连，也算赢。你搭的线，转完可能是对手的。」 |
| 25–40s | 快速切：残局、无尽、教程、2–6 人同屏 | 「三档 AI、12 道残局、无尽防守、6 人同屏，全都有。」 |
| 40–50s | 设置面板：6 种格线 + 4 套主题 + 10 语言 | 「6 种棋盘格线，4 套主题，10 种语言。」 |
| 50–60s | 手机 + 电脑 + 网页三画面 | 「网页、安卓、Windows 都能玩，完全离线。链接在简介。」 |

标题建议：`把四子棋的棋盘每步转 90°，会发生什么？`

---

### 7. X / Twitter

```
Made a four-in-a-row game on a Go board.

The mode I can't stop playing: after every move the board rotates 90° and the stones
re-settle — so the line you were building can become your opponent's winning line.

Free, open source, works offline on web, Android and Windows.
https://adlambxd.github.io/4link/
```

---

### 8. itch.io 页面文案

| 字段 | 内容 |
| --- | --- |
| Title | 4Link |
| Short description | Four-in-a-row on a Go board, with a mode that rotates the board 90° after every move. |
| Classification | Game |
| Kind of project | HTML5 (also downloadable for Android / Windows) |
| Genre | Puzzle / Strategy |
| Tags | `connect-four`, `board-game`, `strategy`, `puzzle`, `2-player`, `local-multiplayer`, `singleplayer`, `html5` |
| Pricing | No payments |

长描述用 README.en.md 的 Features + Customisation 两段即可。

---

## 四、发布节奏

| 天 | 动作 |
| --- | --- |
| D0 | 确认 GitHub 仓库描述与 Topics 已设置；README 截图正常显示 |
| D1（周二） | V2EX 分享创造 + 小红书首帖 |
| D2（周三） | Reddit r/WebGames |
| D3（周四 北京时间 20:00） | Hacker News Show HN |
| D4 | 知乎回答 + itch.io 上架 |
| D5 | Reddit r/AndroidGaming（隔 24h） |
| D6 | B 站短视频 + X |
| D7 | 统计 stars / 下载量，决定是否补充 SignPath 复审 |

**不要同一天全平台铺开**：一是容易被判定为刷量，二是你没法同时回复评论，而互动量直接决定推荐量。

## 五、追踪指标

| 指标 | 现在 | 目标 |
| --- | --- | --- |
| GitHub stars | 2 | ≥ 50 |
| Release 资产下载 | 34 | ≥ 300 |
| Pages 独立访客 / 14 天 | 3 | ≥ 200 |

查看命令：

```bash
gh api repos/AdLambXD/4link --jq '.stargazers_count'
gh api "repos/AdLambXD/4link/releases?per_page=100" --paginate --jq '[.[].assets[].download_count] | add'
```

## 六、SignPath 复审时机

拿到 50+ stars 和 300+ 下载后，把 Reputation 一栏改成：

```
Since the initial release, 4Link has been covered on [平台名] and has been downloaded
[N] times across [M] releases, with [S] stars on GitHub. Live web version:
https://adlambxd.github.io/4link/
```
