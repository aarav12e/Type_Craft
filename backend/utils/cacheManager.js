const Score = require('../models/Score');
const LeaderboardCache = require('../models/LeaderboardCache');

/**
 * Recalculates the leaderboard for a specific duration and department
 * and updates the JSON document in the LeaderboardCache collection.
 */
const updateLeaderboardCache = async (duration, department = 'all') => {
  try {
    const matchStage = { duration };

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

    if (department !== 'all') {
      pipeline.push({ $match: { 'user.department': department } });
    }

    // Count total participants for this category
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Score.aggregate(countPipeline);
    const totalParticipants = countResult[0]?.total || 0;

    // Get the top 50 (or max you want to cache, let's say up to 100)
    pipeline.push({ $limit: 100 });

    const results = await Score.aggregate(pipeline);

    // Format the results
    const rankings = results.map((entry, index) => ({
      rank: index + 1,
      userId: entry._id,
      name: entry.user.name,
      rollNumber: entry.user.rollNumber,
      department: entry.user.department,
      wpm: entry.bestWpm,
      accuracy: entry.bestAccuracy,
      wordsTyped: entry.wordsTyped,
      achievedAt: entry.createdAt,
    }));

    // Update or create the cache document
    await LeaderboardCache.findOneAndUpdate(
      { duration, department },
      {
        duration,
        department,
        totalParticipants,
        rankings,
      },
      { upsert: true, new: true }
    );

    console.log(`[Cache Updated] Leaderboard for ${duration}s - Dept: ${department}`);
  } catch (error) {
    console.error(`[Cache Error] Failed to update leaderboard cache:`, error);
  }
};

/**
 * Updates both the 'all' department cache and the specific user's department cache.
 */
const updateRelevantCaches = async (duration, userDepartment) => {
  // Update the global leaderboard
  await updateLeaderboardCache(duration, 'all');

  // Update the specific department leaderboard
  if (userDepartment) {
    await updateLeaderboardCache(duration, userDepartment);
  }
};

module.exports = { updateLeaderboardCache, updateRelevantCaches };
