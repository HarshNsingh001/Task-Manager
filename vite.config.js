import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';

let backendProcess;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'start-backend',
      apply: 'serve',
      configResolved() {
        // Start backend server once during dev server startup
        if (!backendProcess) {
          console.log('\n[v0] MongoDB Atlas connection starting...\n');
          backendProcess = spawn('node', ['server/server.js'], {
            stdio: 'inherit',
            cwd: process.cwd(),
            env: {
              ...process.env,
              NODE_ENV: 'development',
              SEED_DEMO: 'true',
            },
          });

          backendProcess.on('error', (err) => {
            console.error('[v0] Backend process error:', err);
          });

          backendProcess.on('exit', (code) => {
            console.log('[v0] Backend process exited with code:', code);
            backendProcess = null;
          });

          setTimeout(() => {
            console.log('[v0] Backend server initialized\n');
          }, 2000);
        }
      },
    },
  ],
  root: '.',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
