const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config/env');
const requestId = require('./middleware/requestId');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const v1Router = require('./routes/v1');

const app = express();

// Security & utility middleware
app.use(helmet());
app.use(
  cors({
    origin: [config.APP_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(requestId);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiter
app.use(generalLimiter);

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', (req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  if (isReady) {
    return res.status(200).json({ status: 'ready', database: 'connected' });
  }
  res.status(503).json({ status: 'not_ready', database: 'disconnected' });
});

// Mount v1 API routes
app.use('/api/v1', v1Router);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
