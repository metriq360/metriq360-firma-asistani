import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'   // <--- BU SATIR ÇOK ÖNEMLİ, Vite’a index.html’i entry yapıyoruz
    }
  }
})