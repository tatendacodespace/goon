import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessions } from '../services/api';
import { commonStyles } from '../styles/theme';
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
import Badge from '../components/Badge';
import { Link } from 'react-router-dom';
import { useNotification } from '../components/NotificationProvider';
import notificationSound from '../assets/notification.mp3';

function Profile() {
  const { user } = useAuth();
  const timeframe = 'weekly';  // Since we're not using setTimeframe, we can just use a constant
  const { notify } = useNotification();

  const fetchStats = useCallback(async () => {
    const allSessions = await sessions.getAll();
    // Recalculate totalTime and averageDuration for the selected timeframe
    const now = new Date();
    let filteredSessions = allSessions;
    if (timeframe === 'daily' || timeframe === 'day') {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      filteredSessions = allSessions.filter(s => new Date(s.date) >= today);
    } else if (timeframe === 'weekly' || timeframe === 'week') {
      filteredSessions = allSessions.filter(s => new Date(s.date) >= new Date(now - 7 * 24 * 60 * 60 * 1000));
    } else if (timeframe === 'monthly' || timeframe === 'month') {
      filteredSessions = allSessions.filter(s => new Date(s.date) >= new Date(now - 30 * 24 * 60 * 60 * 1000));
    }
    const totalTime = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
    const sessionCount = filteredSessions.length;
    const averageDuration = sessionCount > 0 ? totalTime / sessionCount : 0;
    return {
      totalSessions: sessionCount,
      totalDuration: totalTime,
      averageDuration,
      totalTime,
      recentSessions: allSessions.slice(0, 5)
    };
  }, [timeframe]);
  const fetchLeaderboard = useCallback(() => sessions.getLeaderboard(timeframe), [timeframe]);

  // Fetch user stats with real-time updates
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useRealtimeUpdates(
    {
      totalSessions: 0,
      totalDuration: 0,
      averageDuration: 0,
      totalTime: 0,
      recentSessions: []
    },
    fetchStats,
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
      window.history.replaceState({ ...window.history.state, usr: { ...window.history.state.usr, sessionLogged: false } }, '');
    }
  }, [refetchStats, refetchLeaderboard]);

  // Force refresh when timeframe changes
  useEffect(() => {
    refetchLeaderboard();
  }, [timeframe, refetchLeaderboard]);

  // Support new API response shape
  const leaderboardArr = Array.isArray(leaderboard) ? leaderboard : (Array.isArray(leaderboard.leaderboard) ? leaderboard.leaderboard : []);
  const userRank = leaderboardArr.findIndex(u => String(u._id) === String(user.id));
  const isRanked = userRank !== undefined && userRank !== -1 && userRank < leaderboardArr.length;

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

  // Debug: Log leaderboard and user ID
  useEffect(() => {
    if (leaderboard && user) {
      console.log('Leaderboard:', leaderboard);
      console.log('Current user:', user);
      console.log('Current user.id:', user.id);
      // Defensive: always use leaderboardArr for array ops
      if (Array.isArray(leaderboardArr)) {
        const found = leaderboardArr.find(u => String(u._id) === String(user.id));
        console.log('User found in leaderboard:', found);
      }
    }
  }, [leaderboard, leaderboardArr, user]);

  useEffect(() => {
    if (!statsLoading && stats && stats.totalSessions > 0) {
      notify('Profile stats updated!', 'success');
      const audio = new Audio(notificationSound);
      audio.play();
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
  }, [stats, statsLoading, notify]);

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
    <div className="min-h-screen bg-background text-white p-4 sm:p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        <h1 className={`${commonStyles.heading.h1} text-center`}>
          Your Profile
        </h1>
        <p className="text-accent text-center mb-8">See your stats, badges, and how you rank among gooners everywhere. Keep logging and climb the leaderboard!</p>
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
                    <p className="text-2xl font-bold">{stats.totalDuration.toFixed(2)} min</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-gray-400">Average Duration</p>
                    <p className="text-2xl font-bold">{stats.averageDuration ? stats.averageDuration.toFixed(2) : '0.00'} min</p>
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
                  {isRanked && userRank < 3 ? (
                    <div className="text-center">
                      <Badge type={getBadgeForRank(userRank)} size="lg" />
                      <p className="mt-4 text-gray-400">
                        You are currently ranked #{userRank + 1} in the {getTimeframeLabel(timeframe)} leaderboard!
                      </p>
                    </div>
                  ) : isRanked ? (
                    <div className="text-center">
                      <p className="text-gray-400 mb-4">
                        Keep practicing to earn badges!
                      </p>
                      <p className="text-sm text-gray-500">
                        Current rank: #{userRank + 1}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 mb-4">
                        Keep practicing to earn badges!
                      </p>
                      <p className="text-sm text-gray-500">
                        Not ranked yet
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

            {/* Logout button at the bottom for mobile/desktop */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    window.localStorage.removeItem('user');
                    window.localStorage.removeItem('token');
                    window.location.href = '/login';
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow transition-colors w-full max-w-xs"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Recent Sessions</h2>
          <div className="space-y-4">
            {stats.recentSessions.length === 0 ? (
              <div className="text-center text-gray-400">No sessions yet. Start logging to build your streak!</div>
            ) : (
              stats.recentSessions.map((session, index) => (
                <div key={session._id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm">{new Date(session.date).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-xl font-bold">{session.duration.toFixed(2)} min</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;