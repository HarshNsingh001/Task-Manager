const mongoose = require('mongoose');

let memoryServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    let label = 'MongoDB';

    // If no URI or if it's production without URI, handle it
    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGO_URI environment variable is required in production');
      }
      // Use in-memory MongoDB for development
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      label = 'MongoDB (in-memory dev)';
    } else {
      // If we have a URI, try to connect but fall back to in-memory on auth failure
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log(`${label} connected`);
        return;
      } catch (err) {
        if (err.message.includes('bad auth') || err.message.includes('authentication')) {
          console.error(`[v0] MongoDB Atlas auth failed: ${err.message}, falling back to in-memory...`);
          // Fall back to in-memory MongoDB for development
          if (process.env.NODE_ENV !== 'production') {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            memoryServer = await MongoMemoryServer.create();
            uri = memoryServer.getUri();
            label = 'MongoDB (in-memory dev - fallback)';
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    }

    await mongoose.connect(uri);
    console.log(`${label} connected`);
  } catch (err) {
    console.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};

module.exports = { connectDB, disconnectDB };
