// User-level display settings, persisted to localStorage. These are pure
// presentation preferences (no server round-trip): accent color, card
// density, whether to show score badges, and the auto-refresh interval.
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const SETTINGS_KEY = 'dashboard_settings_v2';

export const ACCENTS = [
  { id: 'indigo', label: 'Indigo', value: '#6c8cff' },
  { id: 'violet', label: 'Violet', value: '#b46bff' },
  { id: 'emerald', label: 'Emerald', value: '#34d399' },
  { id: 'amber', label: 'Amber', value: '#fbbf24' },
  { id: 'rose', label: 'Rose', value: '#fb7185' },
  { id: 'cyan', label: 'Cyan', value: '#22d3ee' },
];

export const ACCENTS_BY_ID = Object.fromEntries(ACCENTS.map((a) => [a.id, a]));

// Refresh intervals in milliseconds. 0 = off.
export const REFRESH_INTERVALS = [
  { id: 'off', label: 'Off', ms: 0 },
  { id: '1m', label: '1 min', ms: 60_000 },
  { id: '5m', label: '5 min', ms: 300_000 },
  { id: '15m', label: '15 min', ms: 900_000 },
];

const DEFAULTS = {
  accent: 'indigo',
  density: 'comfortable', // 'comfortable' | 'compact'
  showScores: true,
  refreshInterval: 'off',
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

const SettingsContext = createContext(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota */
    }
  }, [settings]);

  // Reflect accent + density onto the document root so CSS variables cascade.
  useEffect(() => {
    const root = document.documentElement;
    const accent = ACCENTS_BY_ID[settings.accent] || ACCENTS_BY_ID.indigo;
    root.style.setProperty('--accent', accent.value);
    root.dataset.density = settings.density;
  }, [settings.accent, settings.density]);

  const value = useMemo(
    () => ({
      settings,
      update: (patch) => setSettings((s) => ({ ...s, ...patch })),
      reset: () => setSettings({ ...DEFAULTS }),
    }),
    [settings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
