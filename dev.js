#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Team Task Manager (dev mode)...\n');

// Start backend server
const serverProcess = spawn('node', ['server/server.js'], {
  stdio: 'inherit',
  cwd: __dirname,
});

// Give server time to start before starting frontend
setTimeout(() => {
  // Start frontend dev server
  const clientProcess = spawn('vite', [], {
    stdio: 'inherit',
    cwd: __dirname,
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    serverProcess.kill();
    clientProcess.kill();
    process.exit(0);
  });
}, 2000);

// Handle server errors
serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
