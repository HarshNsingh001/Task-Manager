const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { seedDemoData } = require('./seed');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
if (!isProd) app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (isProd) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

let initPromise = null;

const initBackend = async () => {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await connectDB();
    if (process.env.SEED_DEMO !== 'false') {
      try {
        await seedDemoData();
      } catch (err) {
        console.error('Seed error:', err.message);
      }
    }
    console.log('[backend] Initialization complete');
  })();
  return initPromise;
};

module.exports = { app, initBackend };
