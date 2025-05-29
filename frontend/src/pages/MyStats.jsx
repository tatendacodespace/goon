import React, { useState, useEffect, useCallback } from 'react';
import { sessions } from '../services/api';
import { commonStyles } from '../styles/theme';
import NotificationProvider, { useNotification } from '../components/NotificationProvider';
import notificationSound from '../assets/notification.mp3';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

function MyStats() {
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const { notify } = useNotification();

  // Memoized fetch function with retry logic
  const fetchStats = useCallback(async (retryCount = 0) => {
    if (isFetching) return;
    // REMOVE CACHE CHECK: always fetch fresh data
    try {
      setIsFetching(true);
      setError('');
      // Get all sessions data (ignore backend stats)
      const sessionsData = await sessions.getAll();
      // Process the data
      const processedStats = {
        totalTime: 0,
        sessionCount: 0,
        averageDuration: 0,
        todayTime: 0,
        todaySessions: 0,
        weekTime: 0,
        weekSessions: 0
      };
      // Calculate today's and this week's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      // Filter for today and week
      const todaySessions = sessionsData.filter(session => new Date(session.date) >= today);
      const weekSessions = sessionsData.filter(session => new Date(session.date) >= weekStart);
      processedStats.todayTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
      processedStats.todaySessions = todaySessions.length;
      processedStats.weekTime = weekSessions.reduce((sum, s) => sum + s.duration, 0);
      processedStats.weekSessions = weekSessions.length;
      // All time
      processedStats.totalTime = sessionsData.reduce((sum, s) => sum + s.duration, 0);
      processedStats.sessionCount = sessionsData.length;
      processedStats.averageDuration = processedStats.sessionCount > 0 ? processedStats.totalTime / processedStats.sessionCount : 0;
      setStats(processedStats);
      setRecentSessions(sessionsData.slice(0, 5));
      setLastFetchTime(now.getTime());
    } catch (err) {
      console.error('Error fetching stats:', err);
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          fetchStats(retryCount + 1);
        }, RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
        return;
      }
      
      setError('Failed to load statistics. Please try again later.');
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  }, [isFetching, lastFetchTime, stats]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refetch immediately if navigated from LogSession
  useEffect(() => {
    if (window.history.state && window.history.state.usr && window.history.state.usr.sessionLogged) {
      fetchStats();
      // Remove the flag so it doesn't refetch again on next mount
      window.history.replaceState({ ...window.history.state, usr: { ...window.history.state.usr, sessionLogged: false } }, '');
    }
  }, [fetchStats]);

  // Auto-refresh every 10 seconds for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    if (!loading && stats && stats.sessionCount > 0) {
      notify('Stats updated!', 'success');
      const audio = new Audio(notificationSound);
      audio.play();
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
  }, [stats, loading, notify]);

  const getStatEmoji = (stat) => {
    const emojis = {
      totalTime: '⏱️',
      sessionCount: '🎯',
      averageDuration: '📊',
      todayTime: '🔥',
      todaySessions: '⚡',
      weekTime: '📈',
      weekSessions: '🌟'
    };
    return emojis[stat] || '📌';
  };

  const getStatDescription = (stat, value) => {
    const descriptions = {
      totalTime: value > 1000 ? 'Absolute Goon Legend' : 'Getting There',
      sessionCount: value > 50 ? 'Session Master' : 'Keep Going',
      averageDuration: value > 60 ? 'Edge King' : 'Building Stamina',
      todayTime: value > 120 ? 'Today\'s Champion' : 'Warm Up',
      todaySessions: value > 3 ? 'Session Warrior' : 'Getting Started',
      weekTime: value > 500 ? 'Weekly Dominator' : 'Making Progress',
      weekSessions: value > 10 ? 'Consistency King' : 'Building Habits'
    };
    return descriptions[stat] || 'Keep Going';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white p-4 sm:p-8 font-mono">
        <div className="max-w-7xl mx-auto">
          <h1 className={`${commonStyles.heading.h1} text-center`}>
            📊 My Stats
          </h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-white p-4 sm:p-8 font-mono">
        <div className="max-w-7xl mx-auto">
          <h1 className={`${commonStyles.heading.h1} text-center`}>
            📊 My Stats
          </h1>
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background text-white p-4 sm:p-8 font-mono">
        <div className="max-w-7xl mx-auto">
          <h1 className={`${commonStyles.heading.h1} text-center`}>
            📊 My Stats
          </h1>
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={commonStyles.card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Total Time</h3>
                <span className="text-2xl">{getStatEmoji('totalTime')}</span>
              </div>
              <p className="text-4xl font-bold text-primary mb-2">
                {stats.totalTime ? stats.totalTime.toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-gray-400">
                {getStatDescription('totalTime', stats.totalTime)}
              </p>
            </div>
            
            <div className={commonStyles.card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Sessions</h3>
                <span className="text-2xl">{getStatEmoji('sessionCount')}</span>
              </div>
              <p className="text-4xl font-bold text-secondary mb-2">
                {stats.sessionCount}
              </p>
              <p className="text-sm text-gray-400">
                {getStatDescription('sessionCount', stats.sessionCount)}
              </p>
            </div>
            
            <div className={commonStyles.card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Average Duration</h3>
                <span className="text-2xl">{getStatEmoji('averageDuration')}</span>
              </div>
              <p className="text-4xl font-bold text-accent mb-2">
                {stats.averageDuration ? stats.averageDuration.toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-gray-400">
                {getStatDescription('averageDuration', Math.round(stats.totalTime / stats.sessionCount))}
              </p>
            </div>
          </div>

          {/* Today and Week Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={commonStyles.card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Today's Progress</h3>
                <span className="text-2xl">{getStatEmoji('todayTime')}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-2xl font-bold text-primary mb-1">
                    {stats.todayTime ? stats.todayTime.toFixed(2) : '0.00'}
                  </p>
                  <p className="text-sm text-gray-400">Minutes</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-2xl font-bold text-secondary mb-1">
                    {stats.todaySessions}
                  </p>
                  <p className="text-sm text-gray-400">Sessions</p>
                </div>
              </div>
            </div>
            
            <div className={commonStyles.card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">This Week</h3>
                <span className="text-2xl">{getStatEmoji('weekTime')}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-2xl font-bold text-primary mb-1">
                    {stats.weekTime ? stats.weekTime.toFixed(2) : '0.00'}
                  </p>
                  <p className="text-sm text-gray-400">Minutes</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-2xl font-bold text-secondary mb-1">
                    {stats.weekSessions}
                  </p>
                  <p className="text-sm text-gray-400">Sessions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className={commonStyles.card}>
            <h2 className={`${commonStyles.heading.h3} mb-6`}>
              Recent Sessions
            </h2>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-medium">
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                      {session.notes && (
                        <p className="text-sm text-gray-400 mt-1">
                          {session.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {session.duration ? session.duration.toFixed(2) : '0.00'}
                      </p>
                      <p className="text-sm text-gray-400">minutes</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default MyStats;