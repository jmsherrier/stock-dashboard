const Database = require('./db/database');

async function setupDatabase() {
  console.log('Setting up database...');
  
  const db = new Database();
  
  try {
    // Initialize database
    await new Promise((resolve, reject) => {
      db.init();
      // Wait a moment for tables to be created
      setTimeout(() => {
        resolve();
      }, 2000);
    });
    
    console.log('Database setup completed!');
    
    // Test table creation
    try {
      const users = await db.all('SELECT name FROM sqlite_master WHERE type="table"');
      console.log('Created tables:', users.map(u => u.name));
    } catch (err) {
      console.error('Error checking tables:', err.message);
    }
    
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await db.close();
  }
}

setupDatabase();