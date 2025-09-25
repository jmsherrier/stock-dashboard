// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.apiKey = localStorage.getItem('momentum_api_key');
    this.baseURL = API_BASE_URL;
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('momentum_api_key', apiKey);
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth methods
  async createUser(email) {
    return this.request('/auth/create', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getUser() {
    return this.request('/auth/me');
  }

  async updateSettings(settings) {
    return this.request('/auth/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  }

  // Stock methods
  async getUserStocks() {
    return this.request('/stocks');
  }

  async saveUserStock(stockData) {
    return this.request('/stocks/save', {
      method: 'POST',
      body: JSON.stringify(stockData),
    });
  }

  async getStockQuote(ticker) {
    return this.request(`/stocks/quote/${ticker}`);
  }

  // Clear all user data
  async clearUserData() {
    return this.request('/users/clear-data', {
      method: 'DELETE'
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiClient();