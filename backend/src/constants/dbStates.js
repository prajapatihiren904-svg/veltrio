// Mongoose connection.readyState values -> readable names.
export const DB_STATES = Object.freeze(['disconnected', 'connected', 'connecting', 'disconnecting']);

export const resolveDbState = (readyState) => DB_STATES[readyState] ?? 'unknown';
