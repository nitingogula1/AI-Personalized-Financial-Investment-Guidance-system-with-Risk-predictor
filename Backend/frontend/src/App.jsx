import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

/* Layout */
/* Layout */
import DashboardLayout from './layouts/DashboardLayout';


/* Public pages */
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerifyPage from './pages/OtpVerifyPage';

/* Dashboard pages */
import Dashboard from './pages/Dashboard';
import TradingPage from './pages/TradingPage';
import PortfolioPage from './pages/PortfolioPage';
import WatchlistPage from './pages/WatchlistPage';
import OrdersPage from './pages/OrdersPage';
import MarketsPage from './pages/MarketsPage';
import SmartInvestPage from './pages/SmartInvestPage';
import StopLossPage from './pages/StopLossPage';
import RiskAnalysisPage from './pages/RiskAnalysisPage';
import StockPicksPage from './pages/StockPicksPage';
import MyInvestmentsPage from './pages/MyInvestmentsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import OpportunitiesPage from './pages/OpportunitiesPage';

/* ---------- Protected Route Wrapper ---------- */
function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
}

/* ---------- App ---------- */
export default function App() {
    return (
        <Routes>
            {/* Public routes — Landing page opens first */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<OtpVerifyPage />} />

            {/* Protected dashboard routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/overview" element={<Dashboard />} />
                <Route path="/trading" element={<TradingPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/markets" element={<MarketsPage />} />
                <Route path="/smart-invest" element={<SmartInvestPage />} />
                <Route path="/stop-loss" element={<StopLossPage />} />
                <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
                <Route path="/stock-picks" element={<StockPicksPage />} />
                <Route path="/opportunities" element={<OpportunitiesPage />} />
                <Route path="/investments" element={<MyInvestmentsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Catch-all → Landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
