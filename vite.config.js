// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import flowbiteReact from "flowbite-react/plugin/vite";

export default defineConfig({
  plugins: [react(), flowbiteReact()],
  server: {
    host: '0.0.0.0',
    port: 5173 // ou outro que quiser
  }
})