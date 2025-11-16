import app from './app';
import config from './config/environment';
import pool from './config/database';

const PORT = config.port;

// Test database connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }
  console.log('✅ Database connected successfully');
});

// Start server
const server = app.listen(PORT, () => {
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
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

export default server;
