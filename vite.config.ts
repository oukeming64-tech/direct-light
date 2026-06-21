import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  // Base path differs per target:
  //  - Tauri desktop build (`vite build --mode tauri`) → './' relative, so assets
  //    load from the app's custom protocol regardless of mount path.
  //  - GitHub Pages production build → '/direct-light/' (project site subpath).
  //  - Dev / preview / preview harness → root '/'.
  base: mode === 'tauri' ? './' : command === 'build' ? '/direct-light/' : '/',
  plugins: [react(), tailwindcss()],
  // Honor a PORT env var (e.g. from the preview harness) so the dev server can
  // be assigned an open port instead of always grabbing 5173.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
}))
