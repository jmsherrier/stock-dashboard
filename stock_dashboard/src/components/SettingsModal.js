import React, { useEffect } from 'react';
import {
  useSettings,
  ACCENTS,
  REFRESH_INTERVALS,
} from '../contexts/SettingsContext';

export default function SettingsModal({ onClose }) {
  const { settings, update, reset } = useSettings();

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2 className="modal__title">Settings</h2>
          <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal__body">
          {/* Accent color */}
          <div className="setting">
            <div className="setting__label">Accent color</div>
            <div className="swatch-row">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  className={`swatch ${settings.accent === a.id ? 'swatch--active' : ''}`}
                  style={{ background: a.value }}
                  onClick={() => update({ accent: a.id })}
                  title={a.label}
                  aria-label={a.label}
                />
              ))}
            </div>
          </div>

          {/* Density */}
          <div className="setting">
            <div className="setting__label">Card density</div>
            <div className="segmented">
              {[
                { id: 'comfortable', label: 'Comfortable' },
                { id: 'compact', label: 'Compact' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  className={`segmented__option ${
                    settings.density === opt.id ? 'segmented__option--active' : ''
                  }`}
                  onClick={() => update({ density: opt.id })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Show scores */}
          <div className="setting setting--row">
            <div>
              <div className="setting__label">Show score badges</div>
              <div className="setting__hint">
                Rank stocks by how well they fit the visible criteria.
              </div>
            </div>
            <button
              className={`toggle ${settings.showScores ? 'toggle--on' : ''}`}
              role="switch"
              aria-checked={settings.showScores}
              onClick={() => update({ showScores: !settings.showScores })}
            >
              <span className="toggle__knob" />
            </button>
          </div>

          {/* Auto-refresh */}
          <div className="setting">
            <div className="setting__label">Auto-refresh quotes</div>
            <div className="setting__hint">
              Periodically re-fetch all quotes. Mind your Alpha Vantage rate limit.
            </div>
            <div className="segmented" style={{ marginTop: 10 }}>
              {REFRESH_INTERVALS.map((opt) => (
                <button
                  key={opt.id}
                  className={`segmented__option ${
                    settings.refreshInterval === opt.id ? 'segmented__option--active' : ''
                  }`}
                  onClick={() => update({ refreshInterval: opt.id })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={reset}>
            Reset to defaults
          </button>
          <button className="btn btn--primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
