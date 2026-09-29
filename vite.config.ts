import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Gitee Pages 部署在 https://<用户名>.gitee.io/<仓库名>/ 子路径下，
  // 因此 base 必须设置为仓库名，否则 JS/CSS 资源会 404
  base: '/zhilian-jingzhuo-agent/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
