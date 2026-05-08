const mongoose = require('mongoose');

const leaderboardCacheSchema = new mongoose.Schema(
  {
    duration: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      required: true,
      default: 'all',
    },
    totalParticipants: {
      type: Number,
      default: 0,
    },
    rankings: [
      {
        rank: Number,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: String,
        rollNumber: String,
        department: String,
        wpm: Number,
        accuracy: Number,
        wordsTyped: Number,
        achievedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

// Compound index to quickly fetch the cache by duration and department
leaderboardCacheSchema.index({ duration: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('LeaderboardCache', leaderboardCacheSchema);
