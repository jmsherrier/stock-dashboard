// Backend API integration and local storage management

// local counters key (fallback for dev mode)
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
  // Get counters - updated to work with both authenticated and dev mode
  getCounters() {
    return this.getLocalCounters();
  },

  getLocalCounters() {
    let counters = loadCounters();
    counters = resetDailyIfNeeded(counters);

    // reset per-minute at the end of each minute
    const currentMinute = Math.floor(now() / 60000);
    const lastMinute = Math.floor((counters.minuteTs || 0) / 60000);
    
    if (currentMinute > lastMinute) {
      counters.minute = 0;
      counters.minuteTs = now();
    }
    
    return counters;
  },

  // Increment counter for API calls
  incrementCounter() {
    let counters = this.getLocalCounters();
    
    // Increment both daily and per-minute counters
    counters.daily = (counters.daily || 0) + 1;
    counters.minute = (counters.minute || 0) + 1;
    counters.minuteTs = counters.minuteTs || now();
    
    saveCounters(counters);
    return counters;
  }
};

// Enhanced storage with multiple persistence methods
class PersistentStorage {
  constructor() {
    this.storageKey = 'momentum_data';
    this.dbName = 'MomentumTrackerDB';
    this.dbVersion = 1;
    this.storeName = 'stocks';
  }

  // Initialize IndexedDB
  async initDB() {
    if (!window.indexedDB) return null;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => resolve(null);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  // Save to IndexedDB
  async saveToIndexedDB(data) {
    try {
      const db = await this.initDB();
      if (!db) return false;

      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => resolve(false);
        
        store.put({ id: 'main', data, timestamp: Date.now() });
      });
    } catch (e) {
      return false;
    }
  }

  // Load from IndexedDB
  async loadFromIndexedDB() {
    try {
      const db = await this.initDB();
      if (!db) return null;

      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get('main');
        
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        
        request.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  // Save with multiple fallbacks
  async save(data) {
    const serialized = JSON.stringify(data);
    let saved = false;

    // Method 1: IndexedDB (most reliable)
    try {
      saved = await this.saveToIndexedDB(data);
    } catch (e) {
      // IndexedDB failed, will try localStorage
    }

    // Method 2: localStorage (fallback)
    if (!saved) {
      try {
        localStorage.setItem(this.storageKey, serialized);
        saved = true;
      } catch (e) {
        console.error('All storage methods failed');
      }
    }

    // Method 3: sessionStorage (temporary fallback)
    if (!saved) {
      try {
        sessionStorage.setItem(this.storageKey, serialized);
        saved = true;
        console.log('Data saved to sessionStorage (temporary)');
      } catch (e) {
        console.warn('sessionStorage save failed:', e);
      }
    }

    // Method 4: In-memory storage (last resort)
    if (!saved) {
      window._momentumBackup = data;
      console.log('Data saved to memory (will not persist across sessions)');
    }

    // Create backup in localStorage if primary save succeeded
    if (saved) {
      try {
        localStorage.setItem(`momentum_backup_${new Date().toISOString()}`, serialized);
      } catch (e) {
        // Backup failed, but primary save succeeded
      }
    }
  }

  // Load with multiple fallbacks
  async load() {
    let data = null;

    // Method 1: IndexedDB (primary)
    try {
      data = await this.loadFromIndexedDB();
      if (data) {
        console.log('Data loaded from IndexedDB');
        return data;
      }
    } catch (e) {
      console.warn('IndexedDB load failed:', e);
    }

    // Method 2: localStorage (fallback)
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        data = JSON.parse(raw);
        console.log('Data loaded from localStorage');
        return data;
      }
    } catch (e) {
      console.warn('localStorage load failed:', e);
    }

    // Method 3: sessionStorage (temporary fallback)
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      if (raw) {
        data = JSON.parse(raw);
        console.log('Data loaded from sessionStorage');
        return data;
      }
    } catch (e) {
      console.warn('sessionStorage load failed:', e);
    }

    // Method 4: In-memory storage (last resort)
    if (window._momentumBackup) {
      console.log('Data loaded from memory backup');
      return window._momentumBackup;
    }

    console.log('No saved data found');
    return null;
  }

  // Enhanced backup with rotation
  backup(data) {
    try {
      const timestamp = new Date().toISOString();
      const key = `momentum_backup_${timestamp}`;
      
      // Try to save backup
      localStorage.setItem(key, JSON.stringify(data));
      
      // Clean old backups (keep only 10 most recent)
      const allKeys = Object.keys(localStorage);
      const backupKeys = allKeys
        .filter(k => k.startsWith('momentum_backup_'))
        .sort()
        .reverse();
      
      // Remove old backups beyond the 10 most recent
      backupKeys.slice(10).forEach(oldKey => {
        try {
          localStorage.removeItem(oldKey);
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    } catch (e) {
      console.warn('Backup failed:', e);
    }
  }
}

export const storage = new PersistentStorage();
