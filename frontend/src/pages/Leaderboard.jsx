import React, { useState, useEffect } from 'react';
import { sessions } from '../services/api';
import { commonStyles } from '../styles/theme';
import Badge from '../components/Badge';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('weekly');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await sessions.getLeaderboard(timeframe);
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const getTimeframeLabel = (tf) => {
    switch (tf) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      case 'all':
        return 'All Time';
      default:
        return 'Today';
    }
  };

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

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className={commonStyles.card}>
          <div className="flex justify-between items-center mb-8">
            <h1 className={`${commonStyles.heading.h2}`}>
              Leaderboard 🏆
            </h1>
            <div className="flex space-x-2">
              {['daily', 'weekly', 'monthly'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    timeframe === tf
                      ? 'bg-primary text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {getTimeframeLabel(tf)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl">
              {error}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No data available for this timeframe
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((user, index) => (
                <div
                  key={user._id}
                  className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold">
                          {user.username}
                        </h3>
                        <Badge type={getBadgeForRank(index)} size="md" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {user.totalDuration} minutes
                      </p>
                      <p className="text-sm text-gray-400">
                        {user.sessionCount} sessions
                      </p>
                      <p className="text-sm text-gray-400">
                        Avg: {Math.round(user.totalDuration / user.sessionCount)} min
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard; 