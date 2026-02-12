import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import StockDetail from './pages/StockDetail';
import Support from './pages/Support';
import Account from './pages/Account';
import Settings from './pages/Settings';
import Portfolio from './pages/Portfolio';
import RankShowcase from './pages/RankShowcase';
import Loading from './components/Loading';

// Wrapper component to handle route change loading
function AppContent() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loading on route change
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds for route changes

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {loading && <Loading message="Loading..." />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/account" element={<Account />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/support" element={<Support />} />
        <Route path="/rank-showcase" element={<RankShowcase />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
        <Route path="/stocks/:symbol" element={<StockDetail />} />
      </Routes>
    </>
  );
}

function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Show loading on initial website load
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000); // 2 seconds for initial load

    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return <Loading message="Welcome to Overview Invest" />;
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;


