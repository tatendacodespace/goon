import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessions } from '../services/api';
import { commonStyles } from '../styles/theme';
import Badge from '../components/Badge';

function Home() {
  const { user } = useAuth();
  const [topGooners, setTopGooners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('daily');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching leaderboard...');
      const data = await sessions.getLeaderboard(timeframe);
      console.log('Leaderboard data:', data);
      setTopGooners(data.slice(0, 3)); // Get top 3 users
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
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className={`${commonStyles.heading.h1} mb-6`}>
            Welcome to Goon Leaderboard 🚀
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Track your progress, compete with others, and become the ultimate goon master!
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
                No data available for this timeframe
              </div>
            ) : (
              <div className="space-y-4">
                {topGooners.map((user, index) => (
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
                          Avg: {Math.round(user.totalDuration / user.sessionCount)} min
                        </p>
                      </div>
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
                View Full Leaderboard →
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={commonStyles.card}>
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-400">
                Monitor your sessions and watch your stats grow
              </p>
            </div>

            <div className={commonStyles.card}>
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Compete</h3>
              <p className="text-gray-400">
                Join the leaderboard and climb the ranks
              </p>
            </div>

            <div className={commonStyles.card}>
              <div className="text-3xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold mb-2">Earn Badges</h3>
              <p className="text-gray-400">
                Unlock achievements for your dedication
              </p>
            </div>

            <div className={commonStyles.card}>
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-gray-400">
                Your data is secure and private
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;