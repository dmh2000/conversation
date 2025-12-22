import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/alice/",
  plugins: [react()],
  publicDir: 'public',
})
