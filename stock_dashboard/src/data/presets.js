// Strategy presets. A preset is a *view*: the set of criteria visible on every
// card plus a default sort. Because the scoring engine sums points over the
// visible criteria, choosing a preset also reshapes what the score expresses.
//
// `price` and `percentChange` always render in the card header, so presets
// don't need to list them — but listing them is harmless.

export const BUILTIN_PRESETS = [
  {
    id: 'momentum',
    name: 'Momentum',
    description: 'Volatile movers — volume surge, price action, proximity to highs.',
    criteria: [
      'relativeVolume',
      'beta',
      'week52High',
      'movingAverage50',
      'marketCap',
    ],
    sort: { key: 'score', dir: 'desc' },
  },
  {
    id: 'value',
    name: 'Value',
    description: 'Undervalued, profitable companies with reasonable multiples.',
    criteria: [
      'peRatio',
      'priceToBook',
      'priceToSales',
      'dividendYield',
      'roe',
      'marketCap',
    ],
    sort: { key: 'score', dir: 'desc' },
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Top-line and earnings expansion with healthy margins.',
    criteria: [
      'revenueGrowth',
      'earningsGrowth',
      'profitMargin',
      'operatingMargin',
      'forwardPE',
      'pegRatio',
    ],
    sort: { key: 'score', dir: 'desc' },
  },
  {
    id: 'dividend',
    name: 'Dividend',
    description: 'Income focus — yield, payout, and return on equity.',
    criteria: [
      'dividendYield',
      'dividendPerShare',
      'peRatio',
      'roe',
      'profitMargin',
      'marketCap',
    ],
    sort: { key: 'score', dir: 'desc' },
  },
  {
    id: 'overview',
    name: 'Overview',
    description: 'A balanced snapshot across company, valuation, and technicals.',
    criteria: [
      'companyName',
      'sector',
      'marketCap',
      'peRatio',
      'dividendYield',
      'week52High',
    ],
    sort: { key: 'ticker', dir: 'asc' },
  },
];

export const BUILTIN_PRESETS_BY_ID = Object.fromEntries(
  BUILTIN_PRESETS.map((p) => [p.id, p])
);

const CUSTOM_KEY = 'dashboard_custom_presets_v2';

export function loadCustomPresets() {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveCustomPresets(presets) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(presets));
  } catch {
    /* ignore quota */
  }
}

// Create a new custom preset from the given view. Named "Untitled" by default;
// the caller can rename it afterward. IDs are unique and name-independent so
// multiple "Untitled" presets can coexist until renamed.
export function addCustomPreset({ name = 'Untitled', criteria, sort }) {
  const presets = loadCustomPresets();
  const id = `custom:${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  const preset = { id, name, custom: true, criteria, sort };
  presets.push(preset);
  saveCustomPresets(presets);
  return preset;
}

export function renameCustomPreset(id, name) {
  const next = loadCustomPresets().map((p) =>
    p.id === id ? { ...p, name: name.trim() || 'Untitled' } : p
  );
  saveCustomPresets(next);
}

export function deleteCustomPreset(id) {
  saveCustomPresets(loadCustomPresets().filter((p) => p.id !== id));
}
