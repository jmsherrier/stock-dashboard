// Project configuration constants
export const APP_CONFIG = {
  name: 'Volitiliraptor',
  version: '3.0.0',
  description: 'Multi-Strategy Trading Analysis Platform',
  
  // API Configuration
  api: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? '/api' 
      : 'http://localhost:3001/api',
    timeout: 10000,
    retryAttempts: 3
  },
  
  // Alpha Vantage API limits
  apiLimits: {
    dailyLimit: 500,
    minuteLimit: 5,
    resetHour: 0 // Midnight UTC
  },
  
  // Default stock paper configuration
  defaultPaperConfig: {
    components: ['ticker', 'price', 'percentRise', 'relativeVolume', 'float', 'notes', 'news', 'bonusChecks'],
    strategy: 'momentum',
    autoUpdate: false
  },
  
  // UI Configuration
  ui: {
    autoFocusDelay: 100,
    counterRefreshInterval: 5000,
    stockGridMinWidth: 420,
    maxUndoSteps: 10
  },
  
  // Storage keys
  storage: {
    stocksKey: 'momentum-tracker-stocks',
    settingsKey: 'momentum-tracker-settings',
    countersKey: 'momentum-tracker-counters'
  }
};

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

export const isDevelopment = () => process.env.NODE_ENV !== 'production';
export const isProduction = () => process.env.NODE_ENV === 'production';