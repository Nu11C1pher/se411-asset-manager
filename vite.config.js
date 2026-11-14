import { defineConfig } from 'vite';
export default defineConfig({ base: '/', server: { proxy: { '/api': 'http://localhost:8080' } }, test: { environment: 'jsdom', setupFiles: './src/test-setup.js' } });
