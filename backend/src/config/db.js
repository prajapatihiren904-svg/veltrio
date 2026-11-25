import mongoose from 'mongoose';
import { env } from './env.js';

// Reject unknown fields in query filters instead of silently ignoring them.
mongoose.set('strictQuery', true);

let listenersAttached = false;

function attachConnectionListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  mongoose.connection.on('error', (error) => console.error(`MongoDB error: ${error.message}`));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
}

/**
 * Connects to MongoDB Atlas. Throws on failure so the caller decides what to do.
 * The connection string is never logged.
 */
export async function connectDB() {
  attachConnectionListeners();
  try {
    const { connection } = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    console.log(`MongoDB connected: ${connection.host}/${connection.name}`);
    return connection;
  } catch (error) {
  console.error('\n========== MONGODB CONNECTION ERROR ==========');
  console.error('Error name:', error.name);
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('Error cause:', error.cause || 'Not available');
  console.error('================================================\n');

  throw error;
}
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
