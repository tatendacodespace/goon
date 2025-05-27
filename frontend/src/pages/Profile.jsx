import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessions } from '../services/api';
import { commonStyles } from '../styles/theme';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import Badge from '../components/Badge';
import { Link } from 'react-router-dom';

function Profile() {
  const { user } = useAuth();
  const timeframe = 'weekly';  // Since we're not using setTimeframe, we can just use a constant

  const fetchStats = useCallback(() => sessions.getStats(), []);
  const fetchLeaderboard = useCallback(() => sessions.getLeaderboard(timeframe), [timeframe]);

  // Fetch user stats with real-time updates
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useRealtimeUpdates(
    {
      totalSessions: 0,
      totalDuration: 0,
      averageDuration: 0
    },
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
              Please log in to view your profile
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
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className={commonStyles.card}>
              <h2 className={`${commonStyles.heading.h3} mb-6`}>
                Profile Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-2xl font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user.username}</h3>
                    <p className="text-gray-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className={commonStyles.card}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`${commonStyles.heading.h3}`}>
                  Your Stats
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
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Badges */}
            <div className={commonStyles.card}>
              <h2 className={`${commonStyles.heading.h3} mb-6`}>
                Your Badges
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
                <div className="space-y-6">
                  {userRank < 3 ? (
                    <div className="text-center">
                      <Badge type={getBadgeForRank(userRank)} size="lg" />
                      <p className="mt-4 text-gray-400">
                        You are currently ranked #{userRank + 1} in the {getTimeframeLabel(timeframe)} leaderboard!
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 mb-4">
                        Keep practicing to earn badges!
                      </p>
                      <p className="text-sm text-gray-500">
                        Current rank: #{userRank + 1}
                      </p>
                    </div>
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

export default Profile;