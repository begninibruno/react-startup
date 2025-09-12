// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import flowbiteReact from "flowbite-react/plugin/vite";

export default defineConfig({
  plugins: [react(), flowbiteReact()],
  server: {
     allowedHosts: [ 'kiwiless-u25l.onrender.com'], // permite todos os domínios do Render
  }
})