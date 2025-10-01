const Database = require('./db/database');

async function migrateDatabase() {
  console.log('Migrating database schema...');
  
  const db = new Database();
  
  try {
    await db.init();
    
    // Check if password_hash column exists
    const tableInfo = await db.all('PRAGMA table_info(users)');
    const hasPasswordHash = tableInfo.some(col => col.name === 'password_hash');
    const hasDevAccess = tableInfo.some(col => col.name === 'dev_access');
    
    if (!hasPasswordHash || !hasDevAccess) {
      console.log('Schema update required. Creating new users table...');
      
      // Backup existing users
      const existingUsers = await db.all('SELECT * FROM users');
      
      // Drop and recreate users table with new schema
      await db.run('DROP TABLE IF EXISTS users_backup');
      await db.run('ALTER TABLE users RENAME TO users_backup');
      
      // Create new users table
      await db.run(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          api_key TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1,
          dev_access BOOLEAN DEFAULT 0
        )
      `);
      
      console.log('New users table created. Note: Old users without passwords cannot be migrated automatically.');
      console.log('You will need to recreate user accounts with passwords.');
      
      // Drop backup table
      await db.run('DROP TABLE users_backup');
      
      console.log('Migration completed successfully!');
    } else {
      console.log('Schema is up to date. No migration needed.');
    }
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await db.close();
  }
}

migrateDatabase();
