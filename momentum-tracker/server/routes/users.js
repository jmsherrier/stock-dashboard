const express = require('express');
const Database = require('../db/database');
const { authenticateAPIKey } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

// Get user profile
router.get('/profile', authenticateAPIKey, async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user settings
router.get('/settings', authenticateAPIKey, async (req, res) => {
  try {
    const settings = await db.get(
      'SELECT settings FROM user_settings WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ 
      settings: settings ? JSON.parse(settings.settings) : {} 
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;