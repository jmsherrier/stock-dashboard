import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, createAccount } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (!result.success) setError(result.error || 'Login failed');
      } else {
        const created = await createAccount(email, password);
        if (!created.success) {
          setError(created.error || 'Could not create account');
        } else {
          // Auto-login after registration
          const result = await login(email, password);
          if (!result.success) setError(result.error || 'Login failed');
        }
      }
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={submit}>
        <div className="login__brand">
          <div className="header__logo">V</div>
          <h1 className="login__title">Volitiliraptor</h1>
        </div>
        <p className="login__subtitle">
          {mode === 'login'
            ? 'Sign in to your dashboard.'
            : 'Create an account to get started.'}
        </p>

        <div className="login__field">
          <label className="login__label" htmlFor="email">Email</label>
          <input
            id="email"
            className="login__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="login__field">
          <label className="login__label" htmlFor="password">Password</label>
          <input
            id="password"
            className="login__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={6}
          />
        </div>

        <button type="submit" className="login__submit" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        {error && <div className="login__error">{error}</div>}

        <div className="login__toggle">
          {mode === 'login' ? (
            <>
              New here?
              <button type="button" onClick={() => { setMode('register'); setError(''); }}>
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?
              <button type="button" onClick={() => { setMode('login'); setError(''); }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
