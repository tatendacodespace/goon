import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '../styles/theme';
import { sessions } from '../services/api';
import { useAuth } from '../context/AuthContext';

function LogSession() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    duration: ''
  });
  const [loading, setLoading] = useState(false); //lethabo
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

    // Debug logs
    console.log('Current user object:', user);
    console.log('User ID:', user?.id);

    if (!user?.id) {
      setError('User not authenticated. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      // Convert duration to minutes
      const durationInMinutes = parseInt(formData.duration);
      if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
        throw new Error('Please enter a valid duration');
      }

      const sessionData = {
        duration: durationInMinutes
      };

      console.log('Creating session with data:', sessionData);
      await sessions.create(sessionData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Session creation error:', err);
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={commonStyles.heading.h1}>Log New Session</h1>
          <p className="text-text-secondary">Record your progress</p>
        </div>

        <div className={commonStyles.card}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                className={commonStyles.input}
                required
                min="1"
                placeholder="Enter duration in minutes"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="bg-error/20 border border-error text-text-primary p-4 rounded-xl">
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
                  Creating session...
                </div>
              ) : (
                'Create Session'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LogSession;