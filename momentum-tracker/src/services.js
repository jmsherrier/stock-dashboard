const ALPHA_VANTAGE_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://www.alphavantage.co/query';

export const apiService = {
  async getQuote(ticker) {
    // Minimal stub: return random demo data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ percentChange: (Math.random() * 4 - 2).toFixed(2), relativeVolume: (Math.random() * 10 + 1).toFixed(2) });
      }, 200);
    });
  }
};

export const storage = {
  save(data) {
    try {
      localStorage.setItem('momentum_data', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save', e);
    }
  },
  load() {
    try {
      const raw = localStorage.getItem('momentum_data');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Failed to load', e);
      return null;
    }
  }
};
