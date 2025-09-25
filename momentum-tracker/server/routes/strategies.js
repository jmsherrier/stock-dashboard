const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Database = require('../db/database');
const { authenticateAPIKey } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

// Get all strategies for user
router.get('/', authenticateAPIKey, async (req, res) => {
  try {
    const strategies = await db.all(
      'SELECT * FROM strategies WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const processedStrategies = strategies.map(strategy => ({
      ...strategy,
      config: JSON.parse(strategy.config)
    }));

    res.json({ strategies: processedStrategies });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new strategy
router.post('/', authenticateAPIKey, async (req, res) => {
  try {
    const { name, description, config, isDefault } = req.body;
    
    if (!name || !config) {
      return res.status(400).json({ error: 'Name and config are required' });
    }

    const strategyId = uuidv4();
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.run(
        'UPDATE strategies SET is_default = 0 WHERE user_id = ?',
        [req.user.id]
      );
    }

    await db.run(
      'INSERT INTO strategies (id, user_id, name, description, config, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [strategyId, req.user.id, name, description || '', JSON.stringify(config), isDefault ? 1 : 0]
    );

    res.status(201).json({
      message: 'Strategy created successfully',
      strategy: {
        id: strategyId,
        name,
        description,
        config,
        is_default: isDefault
      }
    });
  } catch (error) {
    console.error('Error creating strategy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update strategy
router.put('/:id', authenticateAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, config, isDefault } = req.body;
    
    // Check if strategy belongs to user
    const strategy = await db.get(
      'SELECT * FROM strategies WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.run(
        'UPDATE strategies SET is_default = 0 WHERE user_id = ? AND id != ?',
        [req.user.id, id]
      );
    }

    await db.run(
      `UPDATE strategies 
       SET name = ?, description = ?, config = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND user_id = ?`,
      [name, description || '', JSON.stringify(config), isDefault ? 1 : 0, id, req.user.id]
    );

    res.json({ message: 'Strategy updated successfully' });
  } catch (error) {
    console.error('Error updating strategy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete strategy
router.delete('/:id', authenticateAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run(
      'DELETE FROM strategies WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    res.json({ message: 'Strategy deleted successfully' });
  } catch (error) {
    console.error('Error deleting strategy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get default strategy presets
router.get('/presets', (req, res) => {
  const presets = [
    {
      id: 'momentum-scalper',
      name: 'Momentum Scalper',
      description: 'Quick momentum plays with tight criteria for scalping opportunities',
      config: {
        components: ['ticker', 'price', 'percentRise', 'relativeVolume', 'float', 'news'],
        criteria: {
          price: { min: 2, max: 15, weight: 1 },
          percentRise: { min: 10, weight: 2 },
          relativeVolume: { min: 8, weight: 2 },
          float: { max: 20, weight: 1.5 }
        },
        bonusChecks: ['recentIPO', 'blueSkyBreakout']
      }
    },
    {
      id: 'swing-trader',
      name: 'Swing Trader',
      description: 'Medium-term swing trading opportunities with balanced risk',
      config: {
        components: ['ticker', 'price', 'percentRise', 'relativeVolume', 'float', 'news', 'notes'],
        criteria: {
          price: { min: 3, max: 50, weight: 1 },
          percentRise: { min: 5, weight: 1.5 },
          relativeVolume: { min: 3, weight: 1.5 },
          float: { max: 100, weight: 1 }
        },
        bonusChecks: ['recentIPO', 'recentReverseSplit', 'blueSkyBreakout']
      }
    },
    {
      id: 'penny-momentum',
      name: 'Penny Momentum',
      description: 'High-risk penny stock momentum plays with explosive potential',
      config: {
        components: ['ticker', 'price', 'percentRise', 'relativeVolume', 'float', 'news'],
        criteria: {
          price: { min: 0.5, max: 5, weight: 2 },
          percentRise: { min: 15, weight: 3 },
          relativeVolume: { min: 10, weight: 3 },
          float: { max: 10, weight: 2 }
        },
        bonusChecks: ['recentIPO', 'recentReverseSplit', 'blueSkyBreakout']
      }
    },
    {
      id: 'large-cap-momentum',
      name: 'Large Cap Momentum',
      description: 'Safer momentum plays in established large-cap stocks',
      config: {
        components: ['ticker', 'price', 'percentRise', 'relativeVolume', 'news', 'notes'],
        criteria: {
          price: { min: 20, weight: 0.5 },
          percentRise: { min: 3, weight: 1 },
          relativeVolume: { min: 2, weight: 1 }
        },
        bonusChecks: ['blueSkyBreakout']
      }
    }
  ];

  res.json({ presets });
});

module.exports = router;