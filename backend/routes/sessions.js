const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const auth = require('../middleware/auth');

// Public routes
// Get leaderboard (public route)
const getLeaderboard = async (req, res) => {
  try {
    console.log('Leaderboard request received:', req.query);
    const { timeframe = 'daily' } = req.query;
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

    console.log('Using date filter:', dateFilter);

    const leaderboard = await Session.aggregate([
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
      { $sort: { totalDuration: -1 } },
      { $limit: 10 }
    ]);

    console.log('Leaderboard results:', leaderboard);
    res.json(leaderboard);
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

    // Validate duration
    if (!duration || isNaN(duration) || duration <= 0) {
      return res.status(400).json({ message: 'Valid duration is required' });
    }

    const session = new Session({
      user: req.user._id,
      duration: parseInt(duration),
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
    const sessions = await Session.find({ user: req.user._id })
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get session statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const totalSessions = await Session.countDocuments({ user: req.user._id });
    const totalDuration = await Session.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    const stats = {
      totalSessions,
      totalDuration: totalDuration[0]?.total || 0,
      averageDuration: totalSessions > 0 ? (totalDuration[0]?.total || 0) / totalSessions : 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export both the router and the leaderboard handler
module.exports = {
  router,
  getLeaderboard
}; 