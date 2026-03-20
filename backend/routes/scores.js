const express = require('express');
const Score = require('../models/Score');
const User = require('../models/User');
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

    await User.findByIdAndUpdate(req.user._id, {
      totalTests: allUserScores.length,
      bestWpm: Math.max(user.bestWpm, wpm),
      bestAccuracy: Math.max(user.bestAccuracy, accuracy),
      averageWpm: avgWpm,
    });

    res.status(201).json({ score });
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
    const department = req.query.department;

    // Build match stage
    const matchStage = { duration };

    // Get top score per user for the given duration
    const pipeline = [
      { $match: matchStage },
      { $sort: { wpm: -1 } },
      {
        $group: {
          _id: '$user',
          bestWpm: { $first: '$wpm' },
          bestAccuracy: { $first: '$accuracy' },
          scoreId: { $first: '$_id' },
          createdAt: { $first: '$createdAt' },
          wordsTyped: { $first: '$wordsTyped' },
        },
      },
      { $sort: { bestWpm: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];

    // Filter by department if provided
    if (department && department !== 'all') {
      pipeline.push({ $match: { 'user.department': department } });
    }

    // Count total
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Score.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Paginate
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    const results = await Score.aggregate(pipeline);

    const leaderboard = results.map((entry, index) => ({
      rank: (page - 1) * limit + index + 1,
      userId: entry._id,
      name: entry.user.name,
      rollNumber: entry.user.rollNumber,
      department: entry.user.department,
      wpm: entry.bestWpm,
      accuracy: entry.bestAccuracy,
      wordsTyped: entry.wordsTyped,
      achievedAt: entry.createdAt,
    }));

    res.json({ leaderboard, total, page, pages: Math.ceil(total / limit) });
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
