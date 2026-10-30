# 4Link 中继服务器

WebRTC 直连在对称 NAT、CGNAT、公司网络下会失败（STUN 只能发现地址，不能中继数据）。
中继把棋步转发一下，任何能出站 443 的网络都能连上；协议、房主权威、同步与重连逻辑
完全复用，客户端只是换了一个搬运工。

两种实现，客户端都只认 `wss://<host>/ws?room=CODE`：

| 目录 | 运行方式 | 适合 |
| --- | --- | --- |
| [`cloudflare/`](cloudflare/) | Workers + Durable Objects | 不想运维，免费额度足够棋类游戏 |
| [`node/`](node/) | 单文件 Node，零依赖 | 已有 VPS，想自己控制 |

## 线上信封

服务器只做转发，不解析棋局：

```
客户端 → 服务器   { "t": "msg", "to"?: "<peerId>", "payload": <NetMessage> }
服务器 → 客户端   { "t": "welcome", "id": "<peerId>", "peers": ["<peerId>"] }
                 { "t": "peer", "ev": "join" | "leave", "id": "<peerId>" }
                 { "t": "msg", "from": "<peerId>", "payload": <NetMessage> }
                 { "t": "full" }
                 { "t": "error", "message": "..." }
```

房间码与站点一致：5 位 `[A-Z2-9]`（去掉 I / O / 0 / 1）。每房最多 2 人，
单条消息 ≤ 64 KB，每连接每秒 ≤ 40 条；断线由客户端自动重连并重新同步局面。

## Cloudflare（推荐）

```bash
cd server/relay/cloudflare
npx wrangler login
npx wrangler deploy
```

输出形如 `https://4link-relay.<account>.workers.dev`，中继地址就是：

```
wss://4link-relay.<account>.workers.dev/ws
```

想用自己的域名：在 Cloudflare 控制台给 Worker 绑定 Custom Domain（例如
`relay.example.com`），地址变成 `wss://relay.example.com/ws`。

本地调试：

```bash
npx wrangler dev --port 8787
# 前端填 ws://127.0.0.1:8787/ws
```

免费计划即可；Durable Object 在房间空闲时休眠，棋类游戏的流量和时长都很小。
注意：免费额度按请求数与时长计算，公开站点建议加一条速率限制或只在小范围分享。

## 自建 VPS（Node）

`node/server.mjs` 自己实现了 RFC 6455 握手、帧解析和心跳，**不需要 npm install**：

```bash
node server/relay/node/server.mjs --port 8787
# 或
PORT=8787 HOST=127.0.0.1 node server/relay/node/server.mjs
```

生产环境放在 Caddy 后面自动签 TLS（只暴露 443，8787 只听 127.0.0.1）：

```caddyfile
relay.example.com {
    reverse_proxy 127.0.0.1:8787
}
```

systemd：

```ini
[Unit]
Description=4Link relay
After=network.target

[Service]
User=4link
WorkingDirectory=/opt/4link-relay
ExecStart=/usr/bin/node /opt/4link-relay/server.mjs --host 127.0.0.1 --port 8787
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now 4link-relay
curl https://relay.example.com/          # 4Link relay ok · 0 room(s)
```

## 让站点用上中继

按优先级：

1. 构建变量 `VITE_RELAY_URL`（推荐，玩家点一下「中继」就能用）：
   ```bash
   VITE_RELAY_URL=wss://relay.example.com/ws npm run build
   ```
   GitHub Actions 里在仓库 **Settings → Secrets and variables → Actions → Variables**
   添加 `RELAY_URL`，`deploy.yml` 会自动注入。
2. 玩家在联机面板里自己填地址（保存在本机 `localStorage['4link.net.relay.v1']`）。
3. 分享链接里的 `?relay=wss://…`（房主选什么，对手打开链接就用什么）。

## 快速验证

```bash
# 语法
node --check server/relay/node/server.mjs
node --check server/relay/cloudflare/worker.js

# 两个终端各连一次（wscat 需要 npx）
npx wscat -c "ws://127.0.0.1:8787/ws?room=ABCDE"
npx wscat -c "ws://127.0.0.1:8787/ws?room=ABCDE"
# 第二个连接应收到 welcome，第一个收到 peer join
```
