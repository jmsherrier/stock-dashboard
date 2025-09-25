import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function ApiKeyPrompt() {
  const { login, createAccount } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'create'
  const [apiKey, setApiKey] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await login(apiKey.trim());
    
    if (!result.success) {
      setError(result.error || 'Invalid API key');
    }
    
    setLoading(false);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await createAccount(email.trim());
    
    if (result.success) {
      setSuccess(
        `Account created successfully! Your API key is: ${result.apiKey}. ` +
        'Please save this key securely - you will need it to access your account.'
      );
      setApiKey(result.apiKey);
      setMode('login');
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
              <label>API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                disabled={loading}
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
              />
              <small>We'll create your account and generate a secure API key</small>
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
            <strong>Note:</strong> Your API key is your unique identifier. 
            Keep it secure and don't share it with others.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyPrompt;