import React, { useState } from 'react';

function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('app-theme') || 'dark',
    autoSave: localStorage.getItem('auto-save') === 'true',
    showScores: localStorage.getItem('show-scores') !== 'false',
    defaultPreset: localStorage.getItem('default-preset') || 'momentum',
    apiTimeout: parseInt(localStorage.getItem('api-timeout')) || 10000,
    refreshInterval: parseInt(localStorage.getItem('refresh-interval')) || 300000
  });

  if (!isOpen) return null;

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Save to localStorage immediately
    localStorage.setItem(key.replace(/([A-Z])/g, '-$1').toLowerCase(), value.toString());
  };

  const handleSaveSettings = () => {
    // Settings are already saved to localStorage on change
    onClose();
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaultSettings = {
        theme: 'dark',
        autoSave: true,
        showScores: true,
        defaultPreset: 'momentum',
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

  return (
    <div className="preset-menu-overlay">
      <div className="preset-menu">
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
                <label className="setting-label">Default Strategy Preset</label>
                <select 
                  value={settings.defaultPreset}
                  onChange={(e) => handleSettingChange('defaultPreset', e.target.value)}
                  className="setting-select"
                >
                  <option value="momentum">Momentum</option>
                  <option value="value">Value</option>
                  <option value="growth">Growth</option>
                  <option value="income">Income</option>
                  <option value="custom">Custom</option>
                </select>
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
        </div>

        <div className="preset-footer">
          <button 
            onClick={handleResetSettings}
            className="cancel-btn"
          >
            Reset to Defaults
          </button>
          <button 
            onClick={handleSaveSettings}
            className="apply-btn"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;