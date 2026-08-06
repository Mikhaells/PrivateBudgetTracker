import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' membuat asset path relatif sehingga build bisa
// langsung di-deploy ke GitHub Pages (repo apa pun / sub-path apa pun).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
