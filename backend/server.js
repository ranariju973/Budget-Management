const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput } = require('./middleware/sanitize');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Trust first proxy (Render, Heroku, etc.) so rate-limiter reads real client IP
app.set('trust proxy', 1);

// ─── Security Middleware ─────────────────────────────────────────────

// Helmet: sets secure HTTP headers (XSS filter, HSTS, no-sniff, etc.)
app.use(helmet());

// CORS: restrict origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // Cache preflight for 24 hours
}));

// Body parser with size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Custom input sanitization (NoSQL injection + XSS + null bytes)
app.use(sanitizeInput);

// Prevent HTTP parameter pollution
app.use(hpp());

// Rate limiting — global
app.use('/api', apiLimiter);

// Stricter rate limit on auth routes (brute force protection)
app.use('/api/auth', authLimiter);

// Disable X-Powered-By header (Helmet does this too, but belt & suspenders)
app.disable('x-powered-by');

// ─── API Routes ──────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/income', require('./routes/incomeRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/borrows', require('./routes/borrowRoutes'));
app.use('/api/lends', require('./routes/lendRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes'));
app.use('/api/budget-goals', require('./routes/budgetGoalRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler — never leak stack traces in production
app.use((err, req, res, _next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server with graceful shutdown
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
