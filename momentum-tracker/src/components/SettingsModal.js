import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

function SettingsModal({ isOpen, onClose, user: propUser }) {
  const { user: contextUser, logout, loadUser } = useAuth();
  const user = propUser || contextUser;
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('app-theme') || 'dark',
    autoSave: localStorage.getItem('auto-save') === 'true',
    showScores: localStorage.getItem('show-scores') !== 'false',
    apiTimeout: parseInt(localStorage.getItem('api-timeout')) || 10000,
    refreshInterval: parseInt(localStorage.getItem('refresh-interval')) || 300000
  });
  const [devCode, setDevCode] = useState('');
  const [devCodeError, setDevCodeError] = useState('');

  if (!isOpen) return null;

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Save to localStorage immediately
    localStorage.setItem(key.replace(/([A-Z])/g, '-$1').toLowerCase(), value.toString());
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaultSettings = {
        theme: 'dark',
        autoSave: true,
        showScores: true,
        apiTimeout: 10000,
        refreshInterval: 300000
      };
      
      Object.entries(defaultSettings).forEach(([key, value]) => {
        const storageKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        localStorage.setItem(storageKey, value.toString());
      });
      
      setSettings(defaultSettings);
    }
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      onClose();
    }
  };

  const handleManageAccount = () => {
    // For now, just show account info in an alert
    // In the future, this could open a dedicated account management modal
    if (user) {
      alert(`Account Information:\n\nEmail: ${user.email}\nAccount created: ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}\nDev Access: ${user.devAccess ? 'Enabled' : 'Disabled'}\n\nTo change account settings or delete your account, please contact support.`);
    }
  };

  const handleEnableDevMode = async () => {
    if (!devCode.trim()) {
      setDevCodeError('Please enter access code');
      return;
    }

    try {
      await apiClient.enableDevMode(devCode);
      alert('Dev mode access enabled successfully!');
      setDevCode('');
      setDevCodeError('');
      // Reload user data to reflect dev access change
      await loadUser();
    } catch (error) {
      setDevCodeError('Invalid access code');
    }
  };

  return (
    <div className="preset-menu-overlay" onClick={onClose}>
      <div className="preset-menu" onClick={(e) => e.stopPropagation()}>
        <div className="preset-header">
          <h3>Settings</h3>
          <button 
            onClick={onClose}
            className="close-btn"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#888', 
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        <div className="preset-content">
          <div className="settings-section">
            <h4>Display Preferences</h4>
            <div className="settings-group">
              <div className="setting-item">
                <label className="setting-label">Theme</label>
                <select 
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="setting-select"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light (Coming Soon)</option>
                </select>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input 
                    type="checkbox"
                    checked={settings.showScores}
                    onChange={(e) => handleSettingChange('showScores', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Show stock scores
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h4>Data & Performance</h4>
            <div className="settings-group">
              <div className="setting-item">
                <label className="setting-label">
                  <input 
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Auto-save changes
                </label>
              </div>

              <div className="setting-item">
                <label className="setting-label">API Timeout (ms)</label>
                <input 
                  type="number"
                  value={settings.apiTimeout}
                  onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value))}
                  className="setting-input"
                  min="5000"
                  max="30000"
                  step="1000"
                />
              </div>

              <div className="setting-item">
                <label className="setting-label">Auto-refresh Interval (ms)</label>
                <input 
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                  className="setting-input"
                  min="60000"
                  max="3600000"
                  step="60000"
                />
                <small className="setting-help">Time between automatic data updates</small>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h4>Account Management</h4>
            <div className="settings-group">
              {user ? (
                <>
                  <div className="setting-item">
                    <div className="account-info">
                      <span className="account-email">Signed in as: {user.email}</span>
                      {user.devAccess && <span className="dev-badge"> 🔧 Dev Access</span>}
                    </div>
                  </div>

                  {!user.devAccess && (
                    <div className="setting-item">
                      <label className="setting-label">Enable Dev Mode Access</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <input
                            type="password"
                            value={devCode}
                            onChange={(e) => {
                              setDevCode(e.target.value);
                              setDevCodeError('');
                            }}
                            placeholder="Enter access code"
                            className="setting-input"
                          />
                          {devCodeError && <small style={{ color: '#ff4444' }}>{devCodeError}</small>}
                        </div>
                        <button 
                          onClick={handleEnableDevMode}
                          className="account-btn manage-btn"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          Enable
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="setting-item">
                    <div className="account-actions">
                      <button 
                        onClick={handleManageAccount}
                        className="account-btn manage-btn"
                      >
                        👤 Manage Account
                      </button>
                      <button 
                        onClick={handleSignOut}
                        className="account-btn signout-btn"
                      >
                        � Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="preset-footer">
          <button 
            onClick={handleResetSettings}
            className="cancel-btn"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;