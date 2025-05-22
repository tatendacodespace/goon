import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessions } from '../services/api';
import { commonStyles } from '../styles/theme';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import Badge from '../components/Badge';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('weekly');

  // Fetch user stats with real-time updates
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useRealtimeUpdates(
    {
      totalSessions: 0,
      totalDuration: 0,
      averageDuration: 0
    },
    () => sessions.getStats(),
    60000 // Update every 60 seconds
  );

  // Fetch leaderboard with real-time updates
  const { data: leaderboard, loading: leaderboardLoading, error: leaderboardError, refetch: refetchLeaderboard } = useRealtimeUpdates(
    [],
    () => sessions.getLeaderboard(timeframe),
    60000 // Update every 60 seconds
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
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      default:
        return 'Today';
    }
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

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Stats */}
          <div className="lg:col-span-2 space-y-8">
            <div className={commonStyles.card}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`${commonStyles.heading.h3}`}>
                  Quick Stats
                </h2>
                <button
                  onClick={() => refetchStats()}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Refresh Stats
                </button>
              </div>
              {statsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : statsError ? (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl">
                  {statsError}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-gray-400">Total Sessions</p>
                    <p className="text-2xl font-bold">{stats.totalSessions}</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-gray-400">Total Duration</p>
                    <p className="text-2xl font-bold">{stats.totalDuration} min</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-gray-400">Average Duration</p>
                    <p className="text-2xl font-bold">{Math.round(stats.averageDuration)} min</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className={commonStyles.card}>
              <h2 className={`${commonStyles.heading.h3} mb-6`}>
                Recent Activity
              </h2>
              {leaderboardLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : leaderboardError ? (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl">
                  {leaderboardError}
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard?.slice(0, 5).map((user, index) => (
                    <div
                      key={user._id}
                      className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">
                              {user.username}
                            </h3>
                            <Badge type={getBadgeForRank(index)} size="sm" />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">
                            {user.totalDuration} minutes
                          </p>
                          <p className="text-sm text-gray-400">
                            {user.sessionCount} sessions
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* User Rank */}
            <div className={commonStyles.card}>
              <h2 className={`${commonStyles.heading.h3} mb-6`}>
                Your Rank
              </h2>
              {leaderboardLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : leaderboardError ? (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl">
                  {leaderboardError}
                </div>
              ) : (
                <div className="text-center">
                  {userRank >= 0 ? (
                    <>
                      <div className="text-4xl font-bold mb-2">#{userRank + 1}</div>
                      <p className="text-gray-400 mb-4">
                        out of {leaderboard?.length} users
                      </p>
                      {userRank < 3 && (
                        <div className="flex justify-center">
                          <Badge type={getBadgeForRank(userRank)} size="lg" />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400">
                      Start logging sessions to get ranked!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className={commonStyles.card}>
              <h2 className={`${commonStyles.heading.h3} mb-6`}>
                Quick Actions
              </h2>
              <div className="space-y-4">
                <Link
                  to="/log-session"
                  className={`${commonStyles.button.primary} block text-center`}
                >
                  Log New Session
                </Link>
                <Link
                  to="/my-stats"
                  className={`${commonStyles.button.secondary} block text-center`}
                >
                  View Detailed Stats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 