import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="w-full py-6 mt-12 bg-gray-900 text-gray-400 text-center text-sm font-mono border-t border-gray-800">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-2">
      <span>&copy; {new Date().getFullYear()} Goon Leaderboard</span>
      <span className="hidden sm:inline mx-2">|</span>
      <Link to="/privacy-policy" className="hover:text-primary underline transition-colors">Privacy Policy</Link>
      <span className="mx-2">|</span>
      <Link to="/terms-of-service" className="hover:text-primary underline transition-colors">Terms of Service</Link>
    </div>
  </footer>
);

export default Footer;
