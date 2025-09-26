const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateAPIKey } = require('../middleware/auth');

const router = express.Router();

// Create new user with API key
router.post('/create', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if user already exists
    const existingUser = await global.db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const userId = uuidv4();
    const apiKey = uuidv4();

    await global.db.run(
      'INSERT INTO users (id, email, api_key) VALUES (?, ?, ?)',
      [userId, email, apiKey]
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

// Get user info by API key
router.get('/me', authenticateAPIKey, async (req, res) => {
  try {
    const user = await global.db.get(
      'SELECT id, email, created_at, is_active FROM users WHERE id = ?',
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