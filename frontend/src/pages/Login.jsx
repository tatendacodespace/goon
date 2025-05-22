import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { commonStyles } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
      console.log('Attempting login with:', formData);
      const result = await login(formData.username, formData.password);
      console.log('Login result:', result);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className={commonStyles.heading.h1}>Login to the Goon Squad</h1>
          <p className="text-text-secondary">Track your progress and compete with others</p>
        </div>

        <div className={commonStyles.card}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Username
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Password
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
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary/80">
                Join the Goon Squad
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-text-secondary space-y-2">
          <p>Track your progress</p>
          <p>Compete with others</p>
          <p>View leaderboards</p>
        </div>
      </div>
    </div>
  );
}

export default Login; 