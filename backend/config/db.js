import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('CRITICAL: Neither MONGODB_URI nor MONGO_URI is set.');
    process.exit(1);
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