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

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await sessions.getLeaderboard(timeframe);
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }, [timeframe]);

  const { data: leaderboard, loading, error } = useRealtimeUpdates(
    [],
    fetchLeaderboard,
    120000 // 2 minutes
  );

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

  useEffect(() => {
    if (leaderboard && user) {
      const currentRank = leaderboard.findIndex(u => u._id === user._id);
      if (lastRank !== null && currentRank !== -1 && currentRank < lastRank) {
        notify('You moved up the leaderboard!', 'success');
        const audio = new Audio(notificationSound);
        audio.play();
        if (window.navigator.vibrate) window.navigator.vibrate(50);
      }
      setLastRank(currentRank);
    }
  }, [leaderboard, user, lastRank, notify]);

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
          Error loading leaderboard: {error && error.message ? error.message : String(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <div className="flex space-x-2">
            {['day', 'week', 'month', 'all'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
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

        {leaderboard?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No leaderboard data available for this timeframe
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard?.map((entry, index) => (
              <motion.div
                key={entry._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-surface p-4 rounded-lg shadow-lg ${
                  entry._id === user?._id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-white">
                        {entry.username}
                      </h3>
                      {index < 3 && <Badge type={getBadgeForRank(index)} size="sm" />}
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
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;