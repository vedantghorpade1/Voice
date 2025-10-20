import mongoose, { Mongoose } from 'mongoose';
import { env } from '@/config/env';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Augment the NodeJS global type to include our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If a connection is already cached, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise doesn't exist, create it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(env.MONGODB_URI, opts);
  }

  // Await the promise and cache the connection object
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
