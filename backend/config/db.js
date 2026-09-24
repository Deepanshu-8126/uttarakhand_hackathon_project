import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('CRITICAL: Neither MONGODB_URI nor MONGO_URI is set.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 30000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Notice] Database connection failed (${error.message}).`);
    if (process.env.NODE_ENV === 'production') {
      console.error('Critical: MongoDB connection required in production mode.');
      process.exit(1);
    } else {
      console.log('[MongoDB Notice] Continuing server startup in development mode.');
    }
  }
};