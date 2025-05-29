import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import LogSession from './pages/LogSession';
import MyStats from './pages/MyStats';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext.jsx';
import AuthContext from "./context/AuthContext.jsx";
import { Helmet } from 'react-helmet';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Footer from './components/Footer';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log-session"
          element={
            <ProtectedRoute>
              <LogSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-stats"
          element={
            <ProtectedRoute>
              <MyStats />
            </ProtectedRoute>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#121212]">
          <AppRoutes />
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;