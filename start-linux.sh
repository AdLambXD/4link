#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo
echo "  4Link - 四连引力"
echo "  -----------------------------"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "[错误] 未找到 Node.js。"
  echo "请先安装 Node.js 22.12 或更高版本：https://nodejs.org/"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[错误] 找到 Node.js，但没有找到 npm。"
  echo "请重新安装 Node.js，或把 npm 加入 PATH。"
  exit 1
fi

if ! node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>22||(a===22&&b>=12)?0:1)'; then
  echo "[错误] Node.js 版本过低：$(node -v)，需要 22.12 或更高版本。"
  exit 1
fi

echo "[信息] Node.js $(node -v)"

if [ ! -d node_modules ]; then
  echo "[信息] 首次运行，正在安装依赖..."
  npm install --no-audit --no-fund
fi

echo "[信息] 启动开发服务器..."
echo "[信息] 浏览器会自动打开；按 Ctrl+C 停止。"
echo
exec npm run dev -- --open --port 5173
