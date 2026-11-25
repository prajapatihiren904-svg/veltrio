import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

let server;
let isShuttingDown = false;

async function shutdown(signal, exitCode = 0) {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`${signal} received: shutting down gracefully`);

  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);

  forceExit.unref();

  try {
    if (server && server.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await disconnectDB();

    console.log('VELTRIO server shutdown complete.');
    process.exit(exitCode);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

async function start() {
  try {
    await connectDB();

    server = createApp().listen(env.port, () => {
      console.log(
        `VELTRIO API listening on http://localhost:${env.port} (${env.nodeEnv})`
      );
    });

    server.on('error', async (error) => {
      console.error(
        error.code === 'EADDRINUSE'
          ? `Port ${env.port} is already in use`
          : error
      );

      await shutdown('SERVER_ERROR', 1);
    });

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled promise rejection:', reason);
      shutdown('UNHANDLED_REJECTION', 1);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      shutdown('UNCAUGHT_EXCEPTION', 1);
    });

  } catch (error) {
    console.error('Server startup failed:', error);

    await disconnectDB().catch((dbError) => {
      console.error('Database cleanup failed:', dbError);
    });

    process.exit(1);
  }
}

start();