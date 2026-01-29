const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const careerTestRoutes = require('./routes/careerTest.routes');
const skillTestRoutes = require('./routes/skillTest.routes');
const userRoutes = require('./routes/user.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://codebasics.io', 'https://admin.codebasics.io']
    : '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Codebasics Assess API is running',
    timestamp: new Date().toISOString(),
    version: config.apiVersion,
  });
});

// API routes
const apiPrefix = `/api/${config.apiVersion}`;
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/career-tests`, careerTestRoutes);
app.use(`${apiPrefix}/skill-tests`, skillTestRoutes);
app.use(`${apiPrefix}/user`, userRoutes);
app.use(`${apiPrefix}/leaderboard`, leaderboardRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
