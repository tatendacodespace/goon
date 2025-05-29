import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { sessions } from '../services/api';
import Badge from '../components/Badge';
import { motion } from 'framer-motion';
import { useNotification } from '../components/NotificationProvider';
import notificationSound from '../assets/notification.mp3';

const Leaderboard = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('week');
  const { notify } = useNotification();
  const [lastRank, setLastRank] = useState(null);
  const [page, setPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState({ leaderboard: [], total: 0, page: 1, limit: 20, user: null, userRank: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessions.getLeaderboard(timeframe, page, 20, user?.id || user?._id);
      setLeaderboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [timeframe, page, user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (leaderboardData.leaderboard && user) {
      const currentRank = leaderboardData.leaderboard.findIndex(u => String(u._id) === String(user.id || user._id));
      if (lastRank !== null && currentRank !== -1 && currentRank < lastRank) {
        notify('You moved up the leaderboard!', 'success');
        const audio = new Audio(notificationSound);
        audio.play();
        if (window.navigator.vibrate) window.navigator.vibrate(50);
      }
      setLastRank(currentRank);
    }
  }, [leaderboardData, user, lastRank, notify]);

  const getBadgeForRank = (rank) => {
    switch (rank) {
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

  const totalPages = Math.ceil(leaderboardData.total / leaderboardData.limit);
  const userNotOnPage = leaderboardData.user && (leaderboardData.userRank < (page - 1) * leaderboardData.limit + 1 || leaderboardData.userRank > page * leaderboardData.limit);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-surface rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="text-error">
          Error loading leaderboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 font-mono">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <div className="flex space-x-2">
            {['day', 'week', 'month', 'all'].map((tf) => (
              <button
                key={tf}
                onClick={() => { setTimeframe(tf); setPage(1); }}
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

        {leaderboardData.leaderboard?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No gooners have logged sessions for this timeframe yet. Be the first!
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboardData.leaderboard.map((entry, index) => {
              const globalRank = (leaderboardData.page - 1) * leaderboardData.limit + index;
              const isUser = String(entry._id) === String(user?.id || user?._id);
              const isTop3 = globalRank < 3;
              return (
                <motion.div
                  key={entry._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-surface p-4 rounded-lg shadow-lg flex items-center justify-between ${
                    isUser ? 'ring-2 ring-primary' : ''
                  } ${isTop3 ? 'glow-top3' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      isTop3
                        ? globalRank === 0
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 shadow-lg'
                          : globalRank === 1
                          ? 'bg-gradient-to-r from-purple-400 to-purple-700 text-purple-100 shadow-md'
                          : 'bg-gradient-to-r from-blue-400 to-blue-700 text-blue-100 shadow-md'
                        : 'bg-gradient-to-r from-primary to-secondary text-white'
                    }`}>
                      {globalRank + 1}
                    </div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-lg font-semibold ${isTop3 ? 'text-glow' : 'text-white'}`}>{entry.username}</h3>
                      {isTop3 && <Badge type={getBadgeForRank(globalRank)} size="sm" />}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {entry.totalDuration ? Math.round(entry.totalDuration / 60) : 0} hours
                    </p>
                    <p className="text-sm text-gray-400">
                      {entry.sessionCount || 0} sessions
                    </p>
                  </div>
                </motion.div>
              );
            })}
            {/* If user is not on this page, show their row at the bottom */}
            {userNotOnPage && leaderboardData.user && (
              <motion.div
                key={leaderboardData.user._id + '-user'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-surface p-4 rounded-lg shadow-lg flex items-center justify-between ring-2 ring-primary mt-8"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-gradient-to-r from-primary to-secondary text-white">
                    {leaderboardData.userRank}
                  </div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-white">{leaderboardData.user.username}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {leaderboardData.user.totalDuration ? Math.round(leaderboardData.user.totalDuration / 60) : 0} hours
                  </p>
                  <p className="text-sm text-gray-400">
                    {leaderboardData.user.sessionCount || 0} sessions
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            className="px-4 py-2 rounded bg-surface-light text-gray-400 hover:text-white disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-white">Page {page} of {totalPages}</span>
          <button
            className="px-4 py-2 rounded bg-surface-light text-gray-400 hover:text-white disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      {/* Add styles for glow effect */}
      <style>{`
        .glow-top3 .text-glow {
          text-shadow: 0 0 8px #fff, 0 0 16px #ffd700;
        }
        .glow-top3 {
          box-shadow: 0 0 16px 4px #ffd70055, 0 0 32px 8px #fff2;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;