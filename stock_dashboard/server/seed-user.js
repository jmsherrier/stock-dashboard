const Database = require('./db/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seedUser() {
  console.log('Seeding user account...');
  
  const db = new Database();
  
  try {
    await db.init();
    
    // User details
    const email = process.env.SEED_EMAIL || 'admin@example.com';
    const password = process.env.SEED_PASSWORD || 'changeme123';
    const apiKey = 'your_alpha_vantage_api_key_here';
    
    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
      console.log('User already exists. Updating password and API key...');
      
      // Update existing user
      const passwordHash = await bcrypt.hash(password, 10);
      await db.run(
        'UPDATE users SET password_hash = ?, api_key = ? WHERE email = ?',
        [passwordHash, apiKey, email]
      );
      
      console.log('User updated successfully!');
    } else {
      // Create new user
      const userId = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);
      
      await db.run(
        'INSERT INTO users (id, email, password_hash, api_key, dev_access) VALUES (?, ?, ?, ?, ?)',
        [userId, email, passwordHash, apiKey, 1]
      );
      
      // Create default settings
      const defaultSettings = {
        theme: 'dark',
        autoRefresh: true,
        refreshInterval: 30000,
        defaultStrategy: null
      };
      
      await db.run(
        'INSERT INTO user_settings (user_id, settings) VALUES (?, ?)',
        [userId, JSON.stringify(defaultSettings)]
      );
      
      console.log('User created successfully!');
    }
    
    console.log(`\nAccount Details:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`API Key: ${apiKey}`);
    console.log(`Dev Access: Enabled`);
    
  } catch (error) {
    console.error('Error seeding user:', error);
  } finally {
    await db.close();
  }
}

seedUser();
