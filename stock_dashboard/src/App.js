import React from 'react';
import './App.css';
import './styles/main.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="login">
        <div style={{ color: 'var(--text-muted)' }}>Loading…</div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
