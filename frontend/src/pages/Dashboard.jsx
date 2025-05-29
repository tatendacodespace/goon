import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessions } from '../services/api';
import { commonStyles } from '../styles/theme';
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
import Badge from '../components/Badge';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NotificationProvider, { useNotification } from '../components/NotificationProvider';
import notificationSound from '../assets/notification.mp3';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = window.location;
  const [timeframe, setTimeframe] = useState('week');

  const fetchStats = useCallback(() => sessions.getStats(timeframe), [timeframe]);
  const fetchLeaderboard = useCallback(() => sessions.getLeaderboard(timeframe), [timeframe]);

  // Fetch user stats with real-time updates
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useRealtimeUpdates(
    {
      totalSessions: 0,
      totalDuration: 0,
      averageDuration: 0,
      recentSessions: []
    },
    async () => {
      const [stats, allSessions] = await Promise.all([
        sessions.getStats(timeframe),
        sessions.getAll()
      ]);
      // Attach recent sessions (last 5)
      // Also recalculate totalTime and averageDuration for the selected timeframe
      const now = new Date();
      let filteredSessions = allSessions;
      if (timeframe === 'day') {
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        filteredSessions = allSessions.filter(s => new Date(s.date) >= today);
      } else if (timeframe === 'week') {
        filteredSessions = allSessions.filter(s => new Date(s.date) >= new Date(now - 7 * 24 * 60 * 60 * 1000));
      } else if (timeframe === 'month') {
        filteredSessions = allSessions.filter(s => new Date(s.date) >= new Date(now - 30 * 24 * 60 * 60 * 1000));
      }
      const totalTime = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
      const sessionCount = filteredSessions.length;
      const averageDuration = sessionCount > 0 ? totalTime / sessionCount : 0;
      return {
        ...stats,
        totalTime,
        averageDuration,
        recentSessions: allSessions.slice(0, 5)
      };
    },
    10000 // 10 seconds for live updates
  );

  // Fetch leaderboard with real-time updates
  const { data: leaderboard, loading: leaderboardLoading, error: leaderboardError, refetch: refetchLeaderboard } = useRealtimeUpdates(
    [],
    fetchLeaderboard,
    10000 // 10 seconds for live updates
  );

  // Refetch immediately if navigated from LogSession
  useEffect(() => {
    if (window.history.state && window.history.state.usr && window.history.state.usr.sessionLogged) {
      refetchStats();
      refetchLeaderboard();
      // Remove the flag so it doesn't refetch again on next mount
      window.history.replaceState({ ...window.history.state, usr: { ...window.history.state.usr, sessionLogged: false } }, '');
    }
  }, [refetchStats, refetchLeaderboard]);

  // Force refresh when timeframe changes
  useEffect(() => {
    refetchLeaderboard();
  }, [timeframe, refetchLeaderboard]);

  // Get user's rank from leaderboard
  const userRank = leaderboard?.findIndex(u => String(u._id) === String(user.id)) ?? -1;

  const getBadgeForRank = (index) => {
    switch (index) {
      case 0:
        return 'GOON_KING';
      case 1:
        return 'EDGE_EMPEROR';
      case 2:
        return 'STROKE_SAGE';
      default:
        return null;
    }
  };

  const getTimeframeLabel = (tf) => {
    switch (tf) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
      default: return tf;
    }
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  // Progress bar for weekly/monthly goals
  const progress = stats?.totalTime && stats?.goal ? Math.min(100, Math.round((stats.totalTime / stats.goal) * 100)) : 0;

  // Example motivational message
  const motivationalMessages = [
    "Keep up the streak!",
    "You're crushing it!",
    "One more session to greatness!",
    "Consistency is key!",
    "Goon legend in the making!"
  ];
  const greeting = `Welcome back, ${user.username}!`;
  const motivation = motivationalMessages[user.username.length % motivationalMessages.length];

  const { notify } = useNotification();

  // Example: Notify on stat update
  useEffect(() => {
    if (!statsLoading && stats && stats.totalSessions > 0) {
      notify('Stats updated!', 'success');
      const audio = new Audio(notificationSound);
      audio.play();
      // Optionally, add haptic feedback for mobile
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
  }, [stats, statsLoading, notify]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className={commonStyles.card}>
            <h1 className={`${commonStyles.heading.h2} text-center`}>
              Please log in to view your dashboard
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background p-4 sm:p-8 font-mono">
        <div className="max-w-7xl mx-auto">
          {/* Personalized Greeting & Progress */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                {greeting} <span className="text-2xl">😈</span>
              </h1>
              <p className="text-accent mt-2 text-lg">{motivation}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg shadow-glow w-full md:w-auto"
              onClick={() => navigate('/log-session')}
            >
              Log New Session
            </motion.button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-sm">Weekly Progress</span>
              <span className="text-gray-400 text-sm">{progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-lg shadow-lg flex flex-col items-center">
              <h3 className="text-lg font-semibold text-white mb-2">Total Sessions</h3>
              <p className="text-3xl font-bold text-primary">{stats?.totalSessions || 0}</p>
            </div>
            <div className="bg-surface p-6 rounded-lg shadow-lg flex flex-col items-center">
              <h3 className="text-lg font-semibold text-white mb-2">Total Time</h3>
              <p className="text-3xl font-bold text-secondary">
                {stats?.totalTime ? stats.totalTime.toFixed(2) : '0.00'} min
              </p>
            </div>
            <div className="bg-surface p-6 rounded-lg shadow-lg flex flex-col items-center">
              <h3 className="text-lg font-semibold text-white mb-2">Average Duration</h3>
              <p className="text-3xl font-bold text-accent">
                {stats?.averageDuration ? stats.averageDuration.toFixed(2) : '0.00'} min
              </p>
            </div>
          </div>

          {/* Badges/Achievements Section */}
          <div className="bg-surface p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">Your Badges <span>🏅</span></h2>
            <div className="flex flex-wrap gap-4 items-center">
              {userRank !== undefined && userRank !== -1 && userRank < leaderboard.length && userRank < 3 ? (
                <div className="relative flex flex-col items-center scale-110">
                  <Badge
                    type={getBadgeForRank(userRank)}
                    size="lg"
                    showTooltip={true}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center opacity-40">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl">🔒</div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-surface p-6 rounded-lg shadow-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <div className="flex space-x-2">
                {['day', 'week', 'month', 'all'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => handleTimeframeChange(tf)}
                    className={`px-3 py-1 rounded ${
                      timeframe === tf
                        ? 'bg-primary text-white'
                        : 'bg-surface-light text-gray-400 hover:text-white'
                    }`}
                  >
                    {getTimeframeLabel(tf)}
                  </button>
                ))}
              </div>
            </div>
            {stats?.recentSessions && stats.recentSessions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentSessions.map((session) => (
                  <div
                    key={session.id || session._id}
                    className="flex items-center justify-between p-4 bg-surface-light rounded-lg border border-primary/20 hover:border-primary/60 transition-all duration-300 shadow-sm"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {new Date(session.startTime || session.date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400">
                        Duration: {session.duration ? session.duration.toFixed(2) : '0.00'} minutes
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.badges?.map((badge) => (
                        <Badge key={badge} type={badge} size="sm" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No sessions logged yet</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Link
              to="/leaderboard"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-center py-4 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition"
            >
              View Leaderboard
            </Link>
            <Link
              to="/my-stats"
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 text-center py-4 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition"
            >
              View My Stats
            </Link>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default Dashboard;