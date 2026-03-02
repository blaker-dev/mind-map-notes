import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Since you're using Tailwind 4

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})