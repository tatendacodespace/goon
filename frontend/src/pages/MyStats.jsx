import React, { useState, useEffect, useCallback } from 'react';
import { sessions } from '../services/api';
import { commonStyles } from '../styles/theme';
import { useNavigate } from 'react-router-dom';

function MyStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fast fetch using summary stats endpoint
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const summary = await sessions.getStats('all');
      setStats(summary);
    } catch (err) {
      if (err.message && (err.message.includes('401') || err.message.includes('403') || err.message.toLowerCase().includes('unauthorized'))) {
        setError('Session expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      setError(err.message || 'Failed to load statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  // Guard: if stats is null, show a fallback
  if (!stats) {
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

  return (
    <div className="min-h-screen bg-background text-white p-4 sm:p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        <h1 className={`${commonStyles.heading.h1} text-center`}>
          📊 My Stats
        </h1>
        <p className="text-accent text-center mb-8">Track your goon stats, see your progress, and compare with gooners around the world. Keep logging to improve your rank!</p>
        
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
              {getStatDescription('averageDuration', stats.averageDuration ? stats.averageDuration : 0)}
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
            {recentSessions.length === 0 ? (
              <div className="text-center text-gray-400">No sessions yet. Start logging to see your stats grow!</div>
            ) : (
              recentSessions.map((session) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyStats;