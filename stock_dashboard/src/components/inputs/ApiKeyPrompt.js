import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function ApiKeyPrompt() {
  const { login, createAccount } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'create'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await login(email.trim(), password.trim());
    
    if (!result.success) {
      setError(result.error || 'Invalid email or password');
    }
    
    setLoading(false);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await createAccount(email.trim(), password.trim());
    
    if (result.success) {
      setSuccess(
        `Account created successfully! Logging you in...`
      );
      // Auto-login after account creation
      setTimeout(async () => {
        await login(email.trim(), password.trim());
      }, 1500);
    } else {
      setError(result.error || 'Failed to create account');
    }
    
    setLoading(false);
  };

  return (
    <div className="api-key-prompt">
      <div className="prompt-container">
        <div className="prompt-header">
          <h1>Volitiliraptor</h1>
          <p>Multi-strategy trading analysis platform</p>
        </div>

        <div className="prompt-tabs">
          <button 
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login');
              setError('');
              setSuccess('');
            }}
          >
            Login
          </button>
          <button 
            className={mode === 'create' ? 'active' : ''}
            onClick={() => {
              setMode('create');
              setError('');
              setSuccess('');
            }}
          >
            Create Account
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="prompt-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateAccount} className="prompt-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 4 characters)"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="prompt-footer">
          <p>
            <strong>Note:</strong> Your data is stored securely and is accessible only with your login credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyPrompt;