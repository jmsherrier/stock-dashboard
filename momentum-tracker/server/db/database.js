const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.dbPath = process.env.DATABASE_PATH || './data/momentum_tracker.db';
    this.db = null;
  }

  init() {
    return new Promise((resolve, reject) => {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath, async (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          try {
            await this.createTables();
            resolve();
          } catch (createErr) {
            reject(createErr);
          }
        }
      });
    });
  }

  async createTables() {
    console.log('Creating database tables...');
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        api_key TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )`,

      // User settings
      `CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY,
        settings TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Stock data for each user
      `CREATE TABLE IF NOT EXISTS user_stocks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        stocks_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Strategy presets
      `CREATE TABLE IF NOT EXISTS strategies (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        config TEXT NOT NULL,
        is_default BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Paper configurations (modular components)
      `CREATE TABLE IF NOT EXISTS paper_configs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        components TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // User API request tracking
      `CREATE TABLE IF NOT EXISTS user_api_usage (
        user_id TEXT PRIMARY KEY,
        daily_requests INTEGER DEFAULT 0,
        minute_requests INTEGER DEFAULT 0,
        last_daily_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_minute_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`
    ];

    // Create tables sequentially
    for (let i = 0; i < tables.length; i++) {
      try {
        await this.run(tables[i]);
        console.log(`Table ${i + 1} created/verified successfully`);
      } catch (err) {
        console.error(`Error creating table ${i + 1}:`, err.message);
        throw err;
      }
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_api_key ON users (api_key)',
      'CREATE INDEX IF NOT EXISTS idx_user_stocks_user_id ON user_stocks (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_paper_configs_user_id ON paper_configs (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_api_usage_user_id ON user_api_usage (user_id)'
    ];

    for (const sql of indexes) {
      try {
        await this.run(sql);
      } catch (err) {
        console.error('Error creating index:', err.message);
      }
    }
    
    console.log('All database tables and indexes created successfully');
  }

  // Generic query methods
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database;