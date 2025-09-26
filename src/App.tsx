import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Main Pages
import Home from './pages/Home';
import MyInvestments from "./pages/MyInvestments";
import InvestmentDetails from "./pages/InvestmentDetails";
import Invest from './pages/Invest';
import Team from './pages/Team';
import Profile from './pages/Profile';
import Recharge from './pages/Recharge';
import Withdraw from './pages/Withdraw';
import BankDetails from "./pages/BankDetails";
import FundingRecord from "./pages/FundingRecord";
import WithdrawRecords from "./pages/WithdrawRecords";
import ChangePassword from "./pages/ChangePassword";



const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="home" element={<Home />} />
              <Route path="/my-investments" element={<ProtectedRoute><MyInvestments /></ProtectedRoute>} />
              <Route path="/investments/:id" element={<ProtectedRoute><InvestmentDetails /></ProtectedRoute>} />
              <Route path="invest" element={<Invest />} />
              <Route path="team" element={<Team />} />
              <Route path="me" element={<Profile />} />
            </Route>

            {/* Standalone Protected Routes */}
            <Route path="/recharge" element={
              <ProtectedRoute>
                <Recharge />
              </ProtectedRoute>
            } />
            <Route path="/withdraw" element={
              <ProtectedRoute>
                <Withdraw />
              </ProtectedRoute>
            } />
            <Route path="/bank-details" element={
              <ProtectedRoute>
                <BankDetails />
              </ProtectedRoute>
            } />
            <Route path="/funding-records" element={
              <ProtectedRoute>
                <FundingRecord />
              </ProtectedRoute>
            } />
            <Route path="/withdraw-records" element={
              <ProtectedRoute>
                <WithdrawRecords />
              </ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>

          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color: '#ffffff',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;