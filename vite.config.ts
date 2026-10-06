import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves the site from /jpv/; dev stays at the root.
  base: command === 'build' ? '/jpv/' : '/',
}));
