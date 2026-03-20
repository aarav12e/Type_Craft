const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wpm: {
      type: Number,
      required: true,
      min: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    duration: {
      type: Number, // seconds (15, 30, 60, 120)
      required: true,
      enum: [15, 30, 60, 120],
    },
    correctChars: {
      type: Number,
      required: true,
    },
    incorrectChars: {
      type: Number,
      required: true,
    },
    totalChars: {
      type: Number,
      required: true,
    },
    rawWpm: {
      type: Number,
      required: true,
    },
    wordsTyped: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// ─── Index for leaderboard queries ───────────────────────────────────────────
scoreSchema.index({ duration: 1, wpm: -1 });
scoreSchema.index({ user: 1, duration: 1 });

module.exports = mongoose.model('Score', scoreSchema);
