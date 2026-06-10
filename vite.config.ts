import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 动态 base 路径：GitHub Pages 部署时自动适配仓库名
const githubRepo = process.env.GITHUB_REPOSITORY
const base = githubRepo ? `/${githubRepo.split('/')[1]}/` : '/'

// 仅在开发环境加载调试插件，避免生产构建依赖问题
const devPlugins = []
if (!process.env.CI) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    devPlugins.push(require('unplugin-vue-dev-locator/vite').default())
  } catch (e) {
    // 忽略
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    devPlugins.push(require('vite-plugin-trae-solo-badge').default())
  } catch (e) {
    // 忽略
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [vue(), ...devPlugins],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
