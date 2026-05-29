import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Header({
  onAddStock,
  onRefreshAll,
  onToggleCriteria,
  onOpenSettings,
  criteriaCount,
  bulkLoading,
  stockCount,
}) {
  const { user, logout } = useAuth();
  const [ticker, setTicker] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const t = ticker.trim();
    if (!t) return;
    onAddStock(t);
    setTicker('');
  };

  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo">V</div>
        <div className="header__title">Volitiliraptor</div>
      </div>

      <form className="header__add-form" onSubmit={submit}>
        <input
          className="header__add-input"
          placeholder="Add ticker…"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          maxLength={8}
          aria-label="Add ticker"
        />
        <button type="submit" className="btn btn--primary btn--small" disabled={!ticker.trim()}>
          Add
        </button>
      </form>

      <span className="header__counter">
        {stockCount} {stockCount === 1 ? 'stock' : 'stocks'}
      </span>

      <div className="header__spacer" />

      <button className="btn" onClick={onRefreshAll} disabled={bulkLoading || stockCount === 0}>
        {bulkLoading ? 'Updating…' : 'Update All'}
      </button>

      <button className="btn" onClick={onToggleCriteria}>
        Criteria <span style={{ color: 'var(--text-muted)' }}>({criteriaCount})</span>
      </button>

      <button
        className="btn btn--icon"
        onClick={onOpenSettings}
        title="Settings"
        aria-label="Settings"
      >
        ⚙
      </button>

      {user && (
        <div className="header__user">
          <span title={user.email}>{user.email.split('@')[0]}</span>
          <button className="btn btn--ghost btn--small" onClick={logout} title="Sign out">
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
