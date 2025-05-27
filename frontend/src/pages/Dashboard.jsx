import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessions } from '../services/api';
import { commonStyles } from '../styles/theme';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import Badge from '../components/Badge';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('week');

  const fetchStats = useCallback(() => sessions.getStats(timeframe), [timeframe]);
  const fetchLeaderboard = useCallback(() => sessions.getLeaderboard(timeframe), [timeframe]);

  // Fetch user stats with real-time updates
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useRealtimeUpdates(
    null,
    fetchStats,
    120000 // 2 minutes
  );

  // Fetch leaderboard with real-time updates
  const { data: leaderboard, loading: leaderboardLoading, error: leaderboardError, refetch: refetchLeaderboard } = useRealtimeUpdates(
    [],
    fetchLeaderboard,
    120000 // 2 minutes
  );

  // Force refresh when timeframe changes
  useEffect(() => {
    refetchLeaderboard();
  }, [timeframe, refetchLeaderboard]);

  // Get user's rank from leaderboard
  const userRank = leaderboard?.findIndex(u => u._id === user?._id) ?? -1;

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

  if (statsLoading || leaderboardLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-surface rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (statsError || leaderboardError) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="text-error">
          {statsError && (
            <div>Error loading stats: {statsError && statsError.message ? statsError.message : String(statsError)}</div>
          )}
          {leaderboardError && (
            <div>Error loading leaderboard: {leaderboardError && leaderboardError.message ? leaderboardError.message : String(leaderboardError)}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user.username}!
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg shadow-glow"
            onClick={() => navigate('/log-session')}
          >
            Log New Session
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Total Sessions</h3>
            <p className="text-3xl font-bold text-primary">{stats?.totalSessions || 0}</p>
          </div>
          <div className="bg-surface p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Total Time</h3>
            <p className="text-3xl font-bold text-secondary">
              {Math.round(stats?.totalTime / 60) || 0} hours
            </p>
          </div>
          <div className="bg-surface p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Average Duration</h3>
            <p className="text-3xl font-bold text-accent">
              {Math.round(stats?.averageDuration / 60) || 0} min
            </p>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-lg">
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
          {stats?.recentSessions?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-surface-light rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">
                      {new Date(session.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400">
                      Duration: {Math.round(session.duration / 60)} minutes
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
      </div>
    </div>
  );
};

export default Dashboard;