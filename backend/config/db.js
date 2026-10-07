import mongoose from 'mongoose';
import fs from 'fs';

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('CRITICAL: Neither MONGODB_URI nor MONGO_URI is set.');
    process.exit(1);
  }

  // If running inside a container and uri points to localhost/127.0.0.1, route to host.docker.internal
  const isInsideContainer = process.env.RUNNING_IN_DOCKER === 'true' || (typeof process !== 'undefined' && process.platform !== 'win32' && fs.existsSync('/.dockerenv'));
  if (isInsideContainer && (uri.includes('127.0.0.1:27017') || uri.includes('localhost:27017'))) {
    uri = uri.replace('127.0.0.1:27017', 'host.docker.internal:27017').replace('localhost:27017', 'host.docker.internal:27017');
  }

  const connectWithRetry = async (retries = 5, delay = 2000) => {
    for (let i = 1; i <= retries; i++) {
      try {
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 15000,
          connectTimeoutMS: 20000,
          socketTimeoutMS: 30000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (error) {
        console.warn(`[MongoDB Warning] Attempt ${i}/${retries} failed: ${error.message}`);
        if (i === retries) {
          if (process.env.NODE_ENV === 'production') {
            console.error('Critical: MongoDB connection required in production mode.');
            process.exit(1);
          } else {
            console.log('[MongoDB Notice] Continuing in development mode with auto-reconnect.');
          }
        } else {
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
  };

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB Notice] Disconnected from Atlas. Attempting reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB Notice] Reconnected to Atlas successfully.');
  });

  return connectWithRetry();
};