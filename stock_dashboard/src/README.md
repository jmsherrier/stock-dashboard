# Momentum Tracker - Technical Documentation

## Overview

A React-based stock analysis platform with modular components, real-time data fetching, and multi-strategy support. Built with drag-and-drop functionality, customizable presets, and comprehensive scoring algorithms.

## Project Preview

[Add demo video here - stock_dashboard-demo.mp4]

## Architecture

### Core Technologies
- React 19.1.1 with Hooks
- @dnd-kit for drag-and-drop
- Express/SQLite backend
- Alpha Vantage API integration
- bcrypt authentication

### Project Structure

```
src/
├── components/
│   ├── modular/              Component system
│   │   ├── ComponentRegistry.js    Central registry
│   │   ├── TickerComponent.js
│   │   ├── PriceComponent.js
│   │   ├── PercentRiseComponent.js
│   │   ├── RelativeVolumeComponent.js
│   │   ├── FloatComponent.js
│   │   ├── MarketCapComponent.js
│   │   ├── BetaComponent.js
│   │   ├── Week52HighComponent.js
│   │   ├── MovingAverage50Component.js
│   │   ├── MovingAverage200Component.js
│   │   ├── AnalystTargetComponent.js
│   │   ├── SectorComponent.js
│   │   ├── IndustryComponent.js
│   │   ├── ProfitMarginComponent.js
│   │   ├── RevenueGrowthComponent.js
│   │   ├── PERatioComponent.js
│   │   ├── SharesOutstandingComponent.js
│   │   ├── RestrictedSharesComponent.js
│   │   ├── NewsComponent.js
│   │   ├── NotesComponent.js
│   │   └── BonusChecksComponent.js
│   ├── ModularStockPaper.js    Main stock card
│   ├── SortableStockPaper.js   Drag wrapper
│   ├── PresetMenu.js           Strategy config
│   ├── SettingsModal.js        User settings
│   ├── AboutModal.js           App info
│   └── ApiKeyPrompt.js         Auth interface
├── contexts/
│   └── AuthContext.js          Auth state
├── hooks/
│   ├── useStocks.js            Stock management
│   └── useApiCounters.js       Rate limiting
├── services/
│   └── stockService.js         API integration
├── utils/
│   ├── scoreCalculator.js      Scoring logic
│   └── stockUtils.js           Data helpers
├── api/
│   └── client.js               Backend API
└── App.js                      Main component
```

## Key Features

### 1. Modular Components

Each component is self-contained with:
- Value storage and display
- Scoring algorithm
- Color-coding (green/orange/red)
- Editable criteria ranges

Components can be enabled/disabled per strategy preset.

### 2. Scoring System

Maximum score: 38 points across 16 scored components

Scoring components:
- Price: 0-3 points (lower = better for momentum)
- Percent Rise: -2 to +3 points
- Relative Volume: -2 to +2 points
- Float: -2 to +3 points
- Market Cap: -2 to +3 points
- Beta: -1 to +3 points
- 52-Week High: -2 to +3 points
- 50-Day MA: -2 to +3 points
- 200-Day MA: -2 to +3 points
- Analyst Target: -2 to +3 points
- Profit Margin: 0 to +2 points
- Revenue Growth: -2 to +3 points
- Bonus Checks: Variable points per criterion

### 3. Strategy Presets

Built-in presets:
- Momentum Trading: Focus on price action and volume
- Value Investing: Fundamentals-driven
- News Trading: Catalyst-based
- Day Trading: Short-term technicals

Custom presets:
- User-defined component selection
- Editable descriptions
- Custom bonus criteria
- Reset to defaults
- Delete custom strategies

### 4. Drag-and-Drop

Features:
- Reorder stocks by dragging
- Visual feedback during drag
- Lock button to pin positions
- Locked stocks stay in place during sort
- Preserved order across sessions

### 5. Auto-Update System

Configurable intervals:
- 10s, 15s, 20s, 30s, 1min, 2min, 5min
- Rate limiting validation
- Countdown timer to daily limit
- Auto-disabled when exceeds limits
- Checkbox + dropdown unified button

Settings:
- Auto-sort on update (enabled by default)
- Auto-update on preset apply

### 6. Authentication

Features:
- Email/password login
- bcrypt password hashing
- API key per user
- Dev mode (code: 1907)
- Session persistence

### 7. Data Management

Storage:
- SQLite backend for authenticated users
- localStorage for guest users
- Auto-save on changes
- Undo functionality
- Export/import (coming soon)

## Component Details

### Price Component
- Range: 0-10+ dollars
- Lower prices score higher (momentum strategy)
- Auto-updated from Alpha Vantage

### Percent Rise Component
- Daily percentage change
- Positive changes score higher
- Color-coded arrows for change direction

### Relative Volume Component
- Current volume / average volume
- Higher relative volume = stronger signal
- Multiplier display (e.g., 3.5x)

### Float Component
- Auto-calculated from shares outstanding - restricted
- Lower float = higher volatility potential
- Displayed in millions with "M" suffix

### Market Cap Component
- Company size in millions/billions
- Micro/small caps score highest
- Auto-formatted display ($45M, $2.5B)

### Beta Component
- Volatility measure vs market
- Higher beta = more momentum potential
- Decimal display (e.g., 1.45)

### 52-Week High Component
- Current price vs 52-week high
- Shows percentage of high
- Breaking new highs scores highest

### Moving Average Components (50/200-day)
- Price vs moving average
- Shows percentage difference
- Above MA = bullish momentum

### Analyst Target Component
- Consensus price target
- Shows upside/downside percentage
- Higher upside scores better

### Sector/Industry Components
- Informational only (no scoring)
- Context for market movements
- Text display

### Profit Margin Component
- Company profitability
- Accepts negative for growth stocks
- Percentage display

### Revenue Growth Component
- Quarterly YoY growth
- Higher growth scores better
- Percentage display

### P/E Ratio Component
- Informational only
- Valuation context
- Decimal display

### News Component
- Add/edit/delete news items
- URL links
- Timestamp tracking
- Modal interface

### Notes Component
- Free-form text area
- Per-stock notes
- Persistent across sessions

### Bonus Checks Component
- Custom criteria (e.g., "Recent IPO", "Short Squeeze")
- Editable point values
- Checkbox interface
- Configurable per preset

## API Integration

### Alpha Vantage Endpoints

Used endpoints:
- GLOBAL_QUOTE: Real-time price data
- OVERVIEW: Company fundamentals

Rate limits:
- 500 requests/day
- 5 requests/minute
- 2 API calls per stock update

### Backend API Routes

Authentication:
- POST /api/auth/login
- POST /api/auth/create
- GET /api/auth/me

Stocks:
- GET /api/stocks
- POST /api/stocks/save
- GET /api/stocks/quote/:ticker

Settings:
- GET /api/settings
- PUT /api/settings

## Development

### Adding New Components

1. Create component file in `src/components/modular/`
2. Implement standard interface:
   - Props: stock, onUpdate, isEditingMode
   - State: value, scoring logic
   - Render: display + edit modes
3. Add to ComponentRegistry.js:
   - Import component
   - Add to COMPONENT_REGISTRY
   - Define criteria and scoring
4. Add styling to App.css
5. Test with demo data
6. Test with real API data

### Modifying Scoring

Edit criteria.ranges in ComponentRegistry.js:

```javascript
criteria: {
  ranges: [
    { min: 0, max: 10, points: 3, color: 'green' },
    { min: 10, max: 20, points: 1, color: 'orange' },
    { min: 20, max: Infinity, points: -1, color: 'red' }
  ]
}
```

### Testing

Run tests:
```bash
npm test
```

Test coverage includes:
- Component rendering
- Scoring calculations
- Stock utilities
- API integration
- Drag-and-drop
- Authentication

### Building

Development:
```bash
npm start
```

Production:
```bash
npm run build
```

Server:
```bash
npm run server
```

## Configuration

### Environment Variables

Frontend (.env):
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ALPHA_VANTAGE_KEY=your_key
```

Backend (server/.env):
```
PORT=3001
JWT_SECRET=your_secret
ALPHA_VANTAGE_API_KEY=your_key
```

### Settings

User configurable:
- Theme (dark/light)
- Auto-save
- Show scores
- Auto-update on preset
- Auto-sort on update
- API timeout
- Refresh interval

### Keyboard Shortcuts

- A: Add new stock paper
- U: Update all stocks
- Delete: Remove selected stock

## Security

Features:
- bcrypt password hashing
- API key authentication
- Rate limiting
- SQL injection protection
- CORS headers
- Helmet security
- Input validation
- Session management

## Performance

Optimizations:
- Component memoization
- Selective re-rendering
- Debounced API calls
- Local caching
- Lazy loading
- Code splitting
- Optimized queries

## Known Limitations

1. Alpha Vantage free tier limits (500/day)
2. No real-time streaming data
3. No pre-market/after-hours data
4. No short interest data
5. No technical indicators (RSI, MACD)
6. No chart integration
7. No options data
8. No historical backtesting

## Future Enhancements

Planned features:
- Export/import portfolios
- Chart integration
- Technical indicators
- Alerts/notifications
- Mobile app
- Real-time WebSocket updates
- Advanced filtering
- Performance analytics
- Paper trading simulation
- Multi-user collaboration

## Troubleshooting

Common issues:

API key errors:
- Verify Alpha Vantage API key
- Check rate limits
- Test API in browser

Authentication issues:
- Clear localStorage
- Check backend connection
- Verify credentials

Data not saving:
- Check authentication
- Verify backend running
- Check browser console

Drag-and-drop not working:
- Ensure stock not locked
- Check for console errors
- Verify @dnd-kit installed

## Support

For issues or questions:
1. Check console for errors
2. Verify API connectivity
3. Review documentation
4. Check GitHub issues
5. Contact support

## License

MIT License - See LICENSE file for details
