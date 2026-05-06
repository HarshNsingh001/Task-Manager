const { app, initBackend } = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await initBackend();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
