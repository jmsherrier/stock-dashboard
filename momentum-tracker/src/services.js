const ALPHA_VANTAGE_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://www.alphavantage.co/query';

// local counters key
const COUNTERS_KEY = 'momentum_api_counters_v1';

function now() { return Date.now(); }

function loadCounters() {
  try {
    const raw = localStorage.getItem(COUNTERS_KEY);
    if (!raw) return { daily: 0, minute: 0, lastReset: now() };
    return JSON.parse(raw);
  } catch (e) {
    return { daily: 0, minute: 0, lastReset: now() };
  }
}

function saveCounters(c) {
  try { localStorage.setItem(COUNTERS_KEY, JSON.stringify(c)); } catch(e){}
}

function resetDailyIfNeeded(counters) {
  const c = { ...counters };
  const today = new Date().toDateString();
  const last = new Date(c.lastReset).toDateString();
  if (today !== last) {
    c.daily = 0;
    c.lastReset = now();
  }
  return c;
}

export const apiService = {
  async getQuote(ticker, { useDemoIfLimit = true } = {}) {
    // Basic client-side rate limiting enforcement
    let counters = loadCounters();
    counters = resetDailyIfNeeded(counters);

    // reset per-minute if older than 60s
    if ((now() - (counters.minuteTs || 0)) > 60000) {
      counters.minute = 0;
      counters.minuteTs = now();
    }

    if (counters.daily >= 500 || counters.minute >= 5) {
      if (useDemoIfLimit) return this.getStockDataDemo(ticker);
      throw new Error('API limit reached');
    }

    // increment counters and persist
    counters.daily = (counters.daily || 0) + 1;
    counters.minute = (counters.minute || 0) + 1;
    counters.minuteTs = counters.minuteTs || now();
    saveCounters(counters);

    // Call Alpha Vantage TIME_SERIES_INTRADAY for minute-level and GLOBAL_QUOTE for price
    try {
      // We'll use GLOBAL_QUOTE then a demo relative volume from a quick FX demo (Alpha Vantage doesn't provide rel vol)
      const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${ALPHA_VANTAGE_KEY}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Network ${resp.status}`);
      const data = await resp.json();

      // example shape: { 'Global Quote': { '05. price': '...', '10. change percent': '0.23%' } }
      const g = data['Global Quote'] || {};
      const price = parseFloat(g['05. price'] || g['05. Price'] || '0');
      const changePercentRaw = (g['10. change percent'] || '0%').replace('%','');
      const percentChange = parseFloat(changePercentRaw) || 0;

      // relativeVolume not available via Global Quote; use demo heuristic: random around 1
      const relativeVolume = (1 + (Math.random() * 3)).toFixed(2);

      return { percentChange: percentChange.toFixed(2), relativeVolume };
    } catch (err) {
      console.warn('API call failed, falling back to demo data:', err.message || err);
      // ensure counters reflect attempted call (already incremented) but return demo
      return this.getStockDataDemo(ticker);
    }
  },

  getStockDataDemo(ticker) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ percentChange: (Math.random() * 10 - 5).toFixed(2), relativeVolume: (Math.random() * 20 + 0.5).toFixed(2) });
      }, 150);
    });
  },

  getCounters() {
    let c = loadCounters();
    c = resetDailyIfNeeded(c);
    return c;
  }
};

export const storage = {
  save(data) {
    try { localStorage.setItem('momentum_data', JSON.stringify(data)); } catch (e) { console.error(e); }
  },
  load() {
    try { const raw = localStorage.getItem('momentum_data'); return raw ? JSON.parse(raw) : null; } catch(e){return null}
  },
  backup(data) {
    try { localStorage.setItem(`momentum_backup_${new Date().toISOString()}`, JSON.stringify(data)); } catch(e){}
  }
};
