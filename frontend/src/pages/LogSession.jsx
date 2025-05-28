import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '../styles/theme';
import { sessions } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RetroTimer from '../components/RetroTimer';

function LogSession() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const MAX_SECONDS = 120 * 60; // 120 minutes

  // Warn on reload/close if timer is running
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (timerRunning) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [timerRunning]);

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            handleStop(true); // auto-stop
            return MAX_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [timerRunning]);

  const handleStart = () => {
    setError('');
    setSeconds(0);
    setTimerRunning(true);
  };

  const handleStop = async (auto = false) => {
    setTimerRunning(false);
    if (seconds < 60 && !auto) {
      setError('Session must be at least 1 minute.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (!user?.id) throw new Error('User not authenticated. Please log in again.');
      const durationInMinutes = Math.floor(seconds / 60);
      if (durationInMinutes <= 0) throw new Error('Session must be at least 1 minute.');
      await sessions.create({ duration: durationInMinutes });
      navigate('/dashboard', { state: { sessionLogged: true } });
    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
      setSeconds(0);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={commonStyles.heading.h1}>Log New Session</h1>
          <p className="text-text-secondary">Record your progress</p>
        </div>
        <div className={commonStyles.card + ' flex flex-col items-center'}>
          {!timerRunning && (
            <button
              onClick={handleStart}
              className={commonStyles.button.primary + ' w-full mb-4'}
              disabled={loading}
            >
              Start Goon Session
            </button>
          )}
          {timerRunning && (
            <>
              <RetroTimer seconds={seconds} maxSeconds={MAX_SECONDS} running={timerRunning} />
              <button
                onClick={() => handleStop(false)}
                className={commonStyles.button.primary + ' w-full mt-4'}
                disabled={loading}
              >
                Stop Session
              </button>
              <div className="text-xs text-pink-400 mt-2">Session auto-stops at 120:00</div>
            </>
          )}
          {error && (
            <div className="bg-error/20 border border-error text-text-primary p-4 rounded-xl mt-4">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogSession;