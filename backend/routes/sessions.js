const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const auth = require('../middleware/auth');

// Public routes
// Get leaderboard (public route)
const getLeaderboard = async (req, res) => {
  try {
    console.log('Leaderboard request received:', req.query);
    const { timeframe = 'daily', limit = 20, page = 1, userId } = req.query;
    let dateFilter = {};

    // Set date filter based on timeframe
    if (timeframe === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter = { date: { $gte: today } };
    } else if (timeframe === 'weekly') {
      dateFilter = {
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      };
    } else if (timeframe === 'monthly') {
      dateFilter = {
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      };
    }

    const parsedLimit = Math.max(1, Math.min(parseInt(limit), 100));
    const parsedPage = Math.max(1, parseInt(page));
    const skip = (parsedPage - 1) * parsedLimit;

    // Get full leaderboard for rank calculation
    const fullLeaderboard = await Session.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$user',
          totalDuration: { $sum: '$duration' },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          username: '$user.username',
          totalDuration: 1,
          sessionCount: 1
        }
      },
      { $sort: { totalDuration: -1 } }
    ]);

    // Paginate
    const leaderboard = fullLeaderboard.slice(skip, skip + parsedLimit);

    // Find user rank if userId is provided
    let userEntry = null;
    let userRank = null;
    if (userId) {
      userRank = fullLeaderboard.findIndex(u => String(u._id) === String(userId));
      if (userRank !== -1) {
        userEntry = fullLeaderboard[userRank];
        userRank = userRank + 1; // 1-based rank
      }
    }

    res.json({
      leaderboard,
      total: fullLeaderboard.length,
      page: parsedPage,
      limit: parsedLimit,
      user: userEntry,
      userRank
    });
  } catch (error) {
    console.error('Leaderboard error details:', {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({ message: error.message });
  }
};

// Protected routes
// Create a new session
router.post('/', auth, async (req, res) => {
  try {
    const { duration } = req.body;
    console.log('Creating session with data:', { duration });
    console.log('req.user in session creation:', req.user); // <-- log user

    // Validate duration
    if (!duration || isNaN(duration) || duration < 0.083) { // 0.083 min = 5 seconds
      return res.status(400).json({ message: 'Valid duration is required (minimum 5 seconds)' });
    }

    const session = new Session({
      user: req.user.userId, // Use userId from JWT
      duration: duration, // Use float, not parseInt
      date: new Date() // Automatically set to current date/time
    });

    await session.save();
    console.log('Session created successfully:', session);

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add this route to expose the leaderboard endpoint
router.get('/leaderboard', getLeaderboard);


// Get all sessions for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const sessions = await Session.find({ user: userId })
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get session statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;

    // --- All-time stats ---
    const allTimeFilter = { user: userId };
    const totalSessions = await Session.countDocuments(allTimeFilter);
    const totalDurationAgg = await Session.aggregate([
      { $match: allTimeFilter },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);
    const totalDuration = totalDurationAgg[0]?.total || 0;
    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

    // --- Today's stats ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFilter = { user: userId, date: { $gte: today } };
    const todaySessions = await Session.countDocuments(todayFilter);
    const todayDurationAgg = await Session.aggregate([
      { $match: todayFilter },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);
    const todayTime = todayDurationAgg[0]?.total || 0;

    // --- This week's stats (last 7 days) ---
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekFilter = { user: userId, date: { $gte: weekAgo } };
    const weekSessions = await Session.countDocuments(weekFilter);
    const weekDurationAgg = await Session.aggregate([
      { $match: weekFilter },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);
    const weekTime = weekDurationAgg[0]?.total || 0;

    const stats = {
      totalSessions,
      totalDuration,
      averageDuration,
      todayTime,
      todaySessions,
      weekTime,
      weekSessions
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export both the router and the leaderboard handler
module.exports = { router };