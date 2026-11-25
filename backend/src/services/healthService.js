import mongoose from 'mongoose';
import { resolveDbState } from '../constants/dbStates.js';

/**
 * Reports process and database health.
 * "degraded" means the API is up but MongoDB is not connected.
 */
export function getHealthStatus() {
  const database = resolveDbState(mongoose.connection.readyState);
  return {
    status: database === 'connected' ? 'ok' : 'degraded',
    database,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}
