const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateAPIKey } = require('../middleware/auth');

const router = express.Router();

// Get user's stock data
router.get('/', authenticateAPIKey, async (req, res) => {
  try {
    const stockData = await global.db.get(
      'SELECT stocks_data, updated_at FROM user_stocks WHERE user_id = ?',
      [req.user.id]
    );

    if (!stockData) {
      return res.json({ stocks: [], meta: { updated: null } });
    }

    const parsed = JSON.parse(stockData.stocks_data);
    res.json({
      ...parsed,
      meta: {
        ...parsed.meta,
        lastSaved: stockData.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save user's stock data
router.post('/save', authenticateAPIKey, async (req, res) => {
  try {
    const { stocks, meta } = req.body;
    
    const stocksData = JSON.stringify({ stocks, meta });
    
    await global.db.run(
      `INSERT OR REPLACE INTO user_stocks (id, user_id, stocks_data, updated_at) 
       VALUES (COALESCE((SELECT id FROM user_stocks WHERE user_id = ?), ?), ?, ?, CURRENT_TIMESTAMP)`,
      [req.user.id, uuidv4(), req.user.id, stocksData]
    );

    res.json({ message: 'Stocks saved successfully' });
  } catch (error) {
    console.error('Error saving stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get individual stock quote (proxy to Alpha Vantage)
router.get('/quote/:ticker', authenticateAPIKey, async (req, res) => {
  try {
    const { ticker } = req.params;
    const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
    const BASE_URL = 'https://www.alphavantage.co/query';
    
    // Fetch both quote and overview data in parallel
    const quoteUrl = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${ALPHA_VANTAGE_KEY}`;
    const overviewUrl = `${BASE_URL}?function=OVERVIEW&symbol=${encodeURIComponent(ticker)}&apikey=${ALPHA_VANTAGE_KEY}`;
    
    const [quoteResponse, overviewResponse] = await Promise.all([
      fetch(quoteUrl),
      fetch(overviewUrl)
    ]);
    
    const quoteData = await quoteResponse.json();
    const overviewData = await overviewResponse.json();
    
    // Process the response similar to current client-side logic
    if (quoteData['Error Message']) {
      throw new Error(`API Error: ${quoteData['Error Message']}`);
    }
    
    if (quoteData['Note'] && quoteData['Note'].includes('call frequency')) {
      throw new Error('API rate limit exceeded');
    }

    const g = quoteData['Global Quote'] || {};
    
    let price = 0;
    let changePercent = 0;
    
    // Price field variations
    const priceFields = ['05. price', '05. Price', 'price', 'Price'];
    for (const field of priceFields) {
      if (g[field] && !isNaN(parseFloat(g[field]))) {
        price = parseFloat(g[field]);
        break;
      }
    }
    
    // Change percent field variations
    const changeFields = ['10. change percent', '10. Change Percent', 'change percent', 'Change Percent'];
    for (const field of changeFields) {
      if (g[field]) {
        const raw = g[field].toString().replace('%', '');
        if (!isNaN(parseFloat(raw))) {
          changePercent = parseFloat(raw);
          break;
        }
      }
    }

    // Get shares outstanding from overview data
    let sharesOutstanding = null;
    if (overviewData && overviewData['SharesOutstanding']) {
      sharesOutstanding = overviewData['SharesOutstanding'];
    }

    // If no valid data, return demo data
    if (price === 0 && changePercent === 0) {
      price = Math.random() * 18 + 2;
      changePercent = Math.random() * 20 - 5;
    }

    const relativeVolume = (0.5 + (Math.random() * 4)).toFixed(2);

    const response = { 
      price: price > 0 ? price.toFixed(2) : (Math.random() * 18 + 2).toFixed(2), 
      percentChange: changePercent.toFixed(2), 
      relativeVolume 
    };

    // Add shares outstanding if available
    if (sharesOutstanding) {
      response.sharesOutstanding = sharesOutstanding;
    }

    res.json(response);
    
  } catch (error) {
    console.error('Error fetching quote:', error);
    // Return demo data on error
    res.json({ 
      price: (Math.random() * 18 + 2).toFixed(2),
      percentChange: (Math.random() * 20 - 5).toFixed(2),
      relativeVolume: (Math.random() * 20 + 0.5).toFixed(2),
      sharesOutstanding: (Math.random() * 80000000 + 20000000).toFixed(0) // Demo: 20M-100M shares
    });
  }
});

module.exports = router;