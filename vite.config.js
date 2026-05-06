import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mount-express-backend',
      apply: 'serve',
      async configureServer(server) {
        // Load the Express app from the server folder
        const { app, initBackend } = require('./server/app');

        // Initialize backend (DB connection + seed) before handling requests
        try {
          await initBackend();
          console.log('[vite] Express backend mounted successfully');
        } catch (err) {
          console.error('[vite] Failed to initialize backend:', err);
        }

        // Mount the Express app as middleware in the Vite dev server
        // This way /api/* requests go directly to Express, no proxy needed
        server.middlewares.use(app);
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
  },
});
