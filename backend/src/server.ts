import { createServer } from 'http';
import app from './app';
import config from './config/environment';
import pool from './config/database';
import { initializeSocketIO } from './services/socket.service';

const PORT = config.port;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const io = initializeSocketIO(server);
console.log('Socket.IO initialized:', io ? 'success' : 'failed');

// Test database connection (non-blocking - don't exit if fails initially)
const testDatabaseConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    console.log('⚠️  Application will continue to start. Database connection will be retried.');
    return false;
  }
};

// Start server immediately (don't wait for database)
server.listen(PORT, async () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║        🚀 Diskusi Bisnis Backend API Server Started 🚀        ║');
  console.log('║                                                                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Environment: ${config.nodeEnv.padEnd(49)}║`);
  console.log(`║  Port: ${String(PORT).padEnd(56)}║`);
  console.log(`║  URL: http://localhost:${PORT}${' '.repeat(36)}║`);
  console.log(`║  Health Check: http://localhost:${PORT}/health${' '.repeat(23)}║`);
  console.log(`║  WebSocket: ws://localhost:${PORT}${' '.repeat(32)}║`);
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Test database connection after server starts
  const dbConnected = await testDatabaseConnection();

  if (!dbConnected) {
    console.log('⏳ Will retry database connection in background...');
    // Retry connection after 5 seconds
    setTimeout(async () => {
      const retrySuccess = await testDatabaseConnection();
      if (!retrySuccess) {
        console.log('⚠️  Database still not available. Check your DATABASE_URL configuration.');
      }
    }, 5000);
  }
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
// force restart 1
