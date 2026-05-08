const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const scoreRoutes = require('./routes/scores');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
// Allow all origins to simplify deployment connections (Vercel -> Backend)
// Since we use Bearer Tokens in headers (not cookies), strict CORS isn't strictly necessary.
app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TypeCraft API is running 🚀' });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// ─── Database + Server ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/typecraft';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
