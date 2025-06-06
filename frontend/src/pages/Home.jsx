import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessions } from '../services/api';
import { commonStyles } from '../styles/theme';
import Badge from '../components/Badge';
import NotificationProvider, { useNotification } from '../components/NotificationProvider';
import notificationSound from '../assets/notification.mp3';

function Home() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [topGooners, setTopGooners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('daily');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching leaderboard...');
      const data = await sessions.getLeaderboard(timeframe, 1, 3);
      // Defensive: handle both array and object response
      let topArr = Array.isArray(data) ? data : (Array.isArray(data.leaderboard) ? data.leaderboard : []);
      setTopGooners(topArr.slice(0, 3)); // Get top 3 users
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // Set up auto-refresh every 2 minutes (was 30 seconds)
    const interval = setInterval(fetchLeaderboard, 120000);
    return () => clearInterval(interval);
  }, [timeframe]);

  useEffect(() => {
    if (user) {
      notify('Welcome to Goon Leaderboard!', 'success');
      const audio = new Audio(notificationSound);
      audio.play();
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
  }, [user, notify]);

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
    <NotificationProvider>
      <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className={`${commonStyles.heading.h1} mb-6`}>
              Compete with other gooners world-wide <span className="text-4xl align-middle">😈</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              The internet's most competitive goon leaderboard. Log your sessions, climb the ranks, and see how you stack up against gooners everywhere. Join the fun and make your mark!
            </p>
            {!user ? (
              <div className="flex justify-center space-x-4">
                <Link
                  to="/register"
                  className={`${commonStyles.button.primary} px-8 py-3`}
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className={`${commonStyles.button.secondary} px-8 py-3`}
                >
                  Log In
                </Link>
              </div>
            ) : (
              <Link
                to="/log-session"
                className={`${commonStyles.button.primary} px-8 py-3 inline-block`}
              >
                Log New Session
              </Link>
            )}
          </div>

          {/* Top Gooners Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={commonStyles.card}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`${commonStyles.heading.h3}`}>
                  Top Gooners 🏆
                </h2>
                <div className="flex space-x-2">
                  {['daily', 'weekly', 'monthly'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 text-sm rounded-lg transition-all duration-300 ${
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
              ) : topGooners.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No gooners have logged sessions for this timeframe yet. Be the first!
                </div>
              ) : (
                <div className="space-y-4">
                  {topGooners.map((user, index) => (
                    <div
                      key={user?._id || index}
                      className={`bg-gray-800/50 p-1 md:p-3 rounded-lg border border-gray-700 hover:border-primary/30 transition-all duration-300 flex items-center justify-between ${index === 0 ? 'ring-4 ring-yellow-400' : index === 1 ? 'ring-2 ring-purple-500' : index === 2 ? 'ring-2 ring-blue-400' : ''}`}
                      style={{ minHeight: '2.5rem' }}
                    >
                      <div className="flex items-center space-x-2 md:space-x-4">
                        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-base ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 shadow-lg' : index === 1 ? 'bg-gradient-to-r from-purple-400 to-purple-700 text-purple-100 shadow-md' : index === 2 ? 'bg-gradient-to-r from-blue-400 to-blue-700 text-blue-100 shadow-md' : 'bg-gray-700 text-gray-300'}`}>{index + 1}</div>
                        <div className="flex items-center space-x-1 md:space-x-2">
                          <h3 className="text-xs md:text-base font-semibold">
                            @{user.username}
                          </h3>
                          <Badge type={getBadgeForRank(index)} size="sm" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs md:text-sm text-gray-400">
                          {user.totalDuration ? (user.totalDuration / 60).toFixed(2) : '0.00'} hours
                        </p>
                        <p className="text-xs md:text-sm text-gray-400">
                          Avg: {user.sessionCount ? ((user.totalDuration / user.sessionCount) / 60).toFixed(2) : '0.00'} hrs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 text-center">
                <Link
                  to="/leaderboard"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  See the full leaderboard →
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={commonStyles.card}>
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Track Your Stats</h3>
                <p className="text-gray-400">
                  Watch your numbers grow and see your progress over time. Compete for the top spot!
                </p>
              </div>

              <div className={commonStyles.card}>
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold mb-2">Climb the Ranks</h3>
                <p className="text-gray-400">
                  Challenge other gooners, get on the leaderboard, and see who comes out on top.
                </p>
              </div>

              <div className={commonStyles.card}>
                <div className="text-3xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold mb-2">Earn Badges</h3>
                <p className="text-gray-400">
                  Unlock achievements for your dedication and consistency. Show off your badges!
                </p>
              </div>

              <div className={commonStyles.card}>
                <div className="text-3xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                <p className="text-gray-400">
                  Your stats are private and secure. Compete anonymously and have fun!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default Home;