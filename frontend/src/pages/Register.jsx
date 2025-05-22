import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/api';
import { commonStyles } from '../styles/theme';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await auth.register(formData.username, formData.password);
      login(response.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Register Form */}
          <div className={commonStyles.card}>
            <h1 className={`${commonStyles.heading.h1} text-center mb-8`}>
              Join the Goon Squad! 🚀
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-medium mb-2">
                  Choose a Username
                </label>
                <input
                  type="text"
                  name="username"
                  className={commonStyles.input}
                  required
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-lg font-medium mb-2">
                  Create Password
                </label>
                <input
                  type="password"
                  name="password"
                  className={commonStyles.input}
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-lg font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={commonStyles.input}
                  required
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`${commonStyles.button.primary} w-full ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              <p className="text-center text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Log in
                </Link>
              </p>
            </form>
          </div>

          {/* Features & Benefits */}
          <div className="space-y-8">
            <div className={commonStyles.card}>
              <h2 className={`${commonStyles.heading.h3} mb-6`}>
                Start Your Journey 🎯
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <span className="text-2xl">📈</span>
                  <div>
                    <h3 className="text-lg font-semibold">Track Progress</h3>
                    <p className="text-gray-400">
                      Monitor your sessions and watch your stats grow
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h3 className="text-lg font-semibold">Join Leaderboards</h3>
                    <p className="text-gray-400">
                      Compete with other gooners and climb the ranks
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <h3 className="text-lg font-semibold">Earn Badges</h3>
                    <p className="text-gray-400">
                      Unlock achievements and show off your dedication
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={commonStyles.card}>
              <h2 className={`${commonStyles.heading.h3} mb-6`}>
                Community Highlights 🌟
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-3xl font-bold text-primary mb-1">
                    24/7
                  </p>
                  <p className="text-sm text-gray-400">Active Community</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-3xl font-bold text-secondary mb-1">
                    100%
                  </p>
                  <p className="text-sm text-gray-400">Privacy Focused</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register; 