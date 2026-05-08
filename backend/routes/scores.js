const express = require('express');
const Score = require('../models/Score');
const User = require('../models/User');
const LeaderboardCache = require('../models/LeaderboardCache');
const { updateRelevantCaches } = require('../utils/cacheManager');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/scores — Submit a test result ──────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { wpm, accuracy, duration, correctChars, incorrectChars, totalChars, rawWpm, wordsTyped } = req.body;

    // Validate
    if (!wpm || !accuracy || !duration) {
      return res.status(400).json({ message: 'Missing required score fields' });
    }

    const score = await Score.create({
      user: req.user._id,
      wpm,
      accuracy,
      duration,
      correctChars,
      incorrectChars,
      totalChars,
      rawWpm,
      wordsTyped,
    });

    // Update user stats
    const user = await User.findById(req.user._id);
    const allUserScores = await Score.find({ user: req.user._id });

    const totalWpm = allUserScores.reduce((sum, s) => sum + s.wpm, 0);
    const avgWpm = Math.round(totalWpm / allUserScores.length);

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      totalTests: allUserScores.length,
      bestWpm: Math.max(user.bestWpm, wpm),
      bestAccuracy: Math.max(user.bestAccuracy, accuracy),
      averageWpm: avgWpm,
    }, { new: true });

    // Asynchronously update the JSON leaderboard cache for this duration and department
    updateRelevantCaches(duration, updatedUser.department).catch(err => 
      console.error('Background cache update failed:', err)
    );

    res.status(201).json({ score, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save score' });
  }
});

// ─── GET /api/scores/leaderboard?duration=60&limit=10 ────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const duration = parseInt(req.query.duration) || 60;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const page = parseInt(req.query.page) || 1;
    const department = req.query.department || 'all';

    // 1. Fetch the pre-calculated JSON leaderboard from the cache
    let cache = await LeaderboardCache.findOne({ duration, department });

    // 2. If no cache exists yet (first run), generate an empty payload
    if (!cache) {
      return res.json({ leaderboard: [], total: 0, page, pages: 0 });
    }

    // 3. Paginate the cached array
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRankings = cache.rankings.slice(startIndex, endIndex);

    res.json({
      leaderboard: paginatedRankings,
      total: cache.totalParticipants,
      page,
      pages: Math.ceil(cache.totalParticipants / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

// ─── GET /api/scores/my-scores — User's own score history ────────────────────
router.get('/my-scores', protect, async (req, res) => {
  try {
    const duration = req.query.duration ? parseInt(req.query.duration) : null;
    const query = { user: req.user._id };
    if (duration) query.duration = duration;

    const scores = await Score.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ scores });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch scores' });
  }
});

// ─── GET /api/scores/stats — User stats summary ───────────────────────────────
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Score.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$duration',
          bestWpm: { $max: '$wpm' },
          avgWpm: { $avg: '$wpm' },
          bestAccuracy: { $max: '$accuracy' },
          avgAccuracy: { $avg: '$accuracy' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// ─── GET /api/scores/departments — All unique departments ─────────────────────
router.get('/departments', async (req, res) => {
  try {
    const departments = await User.distinct('department');
    res.json({ departments: departments.sort() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
});

module.exports = router;
