import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { commonStyles } from '../styles/theme';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!user) {
    return (
      <nav className="bg-[#1E1E1E] text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Goon Leaderboard
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className={`${commonStyles.button.outline} text-sm`}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className={`${commonStyles.button.primary} text-sm`}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-[#1E1E1E] text-white border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Goon Leaderboard
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-purple-400 transition-colors duration-300">
              🏠 Home
            </Link>
            <Link to="/leaderboard" className="hover:text-purple-400 transition-colors duration-300">
              🏆 Leaderboard
            </Link>
            <Link to="/stats" className="hover:text-purple-400 transition-colors duration-300">
              📈 My Stats
            </Link>
            <Link to="/log" className="hover:text-purple-400 transition-colors duration-300">
              ⏱️ Log Session
            </Link>
            <Link to="/profile" className="hover:text-purple-400 transition-colors duration-300">
              👤 Profile
            </Link>
            <button
              onClick={handleLogout}
              className="hover:text-purple-400 transition-colors duration-300"
            >
              🚪 Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-purple-400 focus:outline-none transition-colors duration-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-[#1E1E1E] border-t border-gray-800">
              <Link
                to="/"
                className="block px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-purple-400 transition-all duration-300"
                onClick={toggleMenu}
              >
                🏠 Home
              </Link>
              <Link
                to="/leaderboard"
                className="block px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-purple-400 transition-all duration-300"
                onClick={toggleMenu}
              >
                🏆 Leaderboard
              </Link>
              <Link
                to="/stats"
                className="block px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-purple-400 transition-all duration-300"
                onClick={toggleMenu}
              >
                📈 My Stats
              </Link>
              <Link
                to="/log"
                className="block px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-purple-400 transition-all duration-300"
                onClick={toggleMenu}
              >
                ⏱️ Log Session
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-purple-400 transition-all duration-300"
                onClick={toggleMenu}
              >
                👤 Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-purple-400 transition-all duration-300"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation; 