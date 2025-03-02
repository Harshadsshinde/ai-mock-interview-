import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,  // Change the port to 3000
    strictPort: true,  // Ensures Vite fails if port 3000 is not available
    host: 'localhost'
  }
})
