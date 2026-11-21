const app = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/database');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(config.PORT, () => {
      console.log(`🚀 HomeServe Backend Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      console.log(`📡 Base API URL: http://localhost:${config.PORT}/api/v1`);
    });

    const shutdown = async () => {
      console.log('\n🛑 Gracefully shutting down...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('❌ Server failed to start:', err.message);
    process.exit(1);
  }
};

startServer();
