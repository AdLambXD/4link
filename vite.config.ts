import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages 项目站点的路径是 /<repo>/，用户站点是 /。
 * 自定义域名可以在仓库变量里设置 BASE_PATH=/ 覆盖。
 */
const env = process.env;
const repo = env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isUserSite = repo.endsWith('.github.io');
const explicitBase = env.BASE_PATH?.trim();
// 桌面（Electron）与移动端（Capacitor）安装包用相对路径加载资源。
const appBuild = env.APP_BUILD === '1';
const base = appBuild
  ? './'
  : explicitBase ||
    (env.GITHUB_ACTIONS && repo && !isUserSite ? `/${repo}/` : '/');

export default defineConfig({
  base,
  plugins: [react()],
});
