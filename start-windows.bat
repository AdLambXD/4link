@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo   4Link - 四连引力
echo   -----------------------------
echo.

where node >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" (
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
  ) else (
    echo [错误] 未找到 Node.js。
    echo 请先安装 Node.js 22.12 或更高版本：https://nodejs.org/
    echo.
    pause
    exit /b 1
  )
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [错误] 找到 Node.js，但没有找到 npm。
  echo 请重新安装 Node.js，或把 npm 加入 PATH。
  echo.
  pause
  exit /b 1
)

node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=12)?0:1)"
if errorlevel 1 (
  echo [错误] Node.js 版本过低：请升级到 22.12 或更高版本。
  echo 当前版本：
  node -v
  echo.
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -v') do set "NODE_VERSION=%%v"
echo [信息] Node.js %NODE_VERSION%

if not exist "node_modules\" (
  echo [信息] 首次运行，正在安装依赖...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo [错误] 依赖安装失败，请检查上方日志。
    pause
    exit /b 1
  )
)

echo [信息] 启动开发服务器...
echo [信息] 浏览器会自动打开；关闭此窗口或按 Ctrl+C 停止。
echo.
call npm run dev -- --open --port 5173

if errorlevel 1 (
  echo.
  echo [错误] 启动失败，请检查上方日志。
  pause
)

endlocal
