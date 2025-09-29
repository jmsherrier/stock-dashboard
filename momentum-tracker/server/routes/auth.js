const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { authenticateAPIKey } = require('../middleware/auth');

const router = express.Router();

// Create new user with email and password
router.post('/create', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    // Check if user already exists
    const existingUser = await global.db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const userId = uuidv4();
    const apiKey = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await global.db.run(
      'INSERT INTO users (id, email, password_hash, api_key) VALUES (?, ?, ?, ?)',
      [userId, email, passwordHash, apiKey]
    );

    // Create default settings
    const defaultSettings = {
      theme: 'dark',
      autoRefresh: true,
      refreshInterval: 30000,
      defaultStrategy: null
    };

    await global.db.run(
      'INSERT INTO user_settings (user_id, settings) VALUES (?, ?)',
      [userId, JSON.stringify(defaultSettings)]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        apiKey
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user with password hash
    const user = await global.db.get(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return user data with API key
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        apiKey: user.api_key,
        devAccess: user.dev_access === 1
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enable dev mode access with code
router.post('/enable-dev-mode', authenticateAPIKey, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (code !== '1907') {
      return res.status(403).json({ error: 'Invalid access code' });
    }

    // Enable dev access for this user
    await global.db.run(
      'UPDATE users SET dev_access = 1 WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Dev mode access enabled', devAccess: true });
  } catch (error) {
    console.error('Error enabling dev mode:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user info by API key
router.get('/me', authenticateAPIKey, async (req, res) => {
  try {
    const user = await global.db.get(
      'SELECT id, email, created_at, is_active, dev_access FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const settings = await global.db.get(
      'SELECT settings FROM user_settings WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      user: {
        ...user,
        devAccess: user.dev_access === 1,
        settings: settings ? JSON.parse(settings.settings) : {}
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user settings
router.put('/settings', authenticateAPIKey, async (req, res) => {
  try {
    const { settings } = req.body;
    
    await global.db.run(
      `INSERT OR REPLACE INTO user_settings (user_id, settings, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [req.user.id, JSON.stringify(settings)]
    );

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;