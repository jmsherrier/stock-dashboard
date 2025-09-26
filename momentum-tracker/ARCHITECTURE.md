# Volitiliraptor - Multi-Strategy Trading Analysis Platform

# Test API key
PVJHQQP8W1YPYAYP

## Overview
Volitiliraptor is a modular, multi-strategy trading analysis platform that allows users to analyze stocks using different trading strategies with customizable paper layouts and scoring systems.

## Architecture

### Frontend (React)
```
src/
├── components/
│   ├── modular/                 # Modular component system
│   │   ├── ComponentRegistry.js # Central registry of all components
│   │   ├── TickerComponent.js   # Stock ticker input
│   │   ├── PriceComponent.js    # Price display with scoring
│   │   ├── PercentRiseComponent.js # Daily % change
│   │   ├── RelativeVolumeComponent.js # Volume analysis
│   │   ├── FloatComponent.js    # Auto-calculated float
│   │   ├── SharesOutstandingComponent.js # Raw shares data
│   │   ├── RestrictedSharesComponent.js # Restricted shares
│   │   ├── NewsComponent.js     # News/catalyst management
│   │   ├── NotesComponent.js    # Free-form notes
│   │   └── BonusChecksComponent.js # Bonus scoring criteria
│   ├── ApiKeyPrompt.js          # Authentication interface
│   ├── PresetMenu.js            # Strategy configuration modal
│   ├── PaperSettings.js         # Component visibility settings
│   ├── ModularStockPaper.js     # Main stock analysis card
│   ├── SortableStockPaper.js    # Drag-and-drop wrapper for stock papers
│   ├── StockPaper.js            # Legacy stock paper (maintained for compatibility)
│   ├── AddStockModal.js         # Stock addition interface
│   ├── CriteriaInput.js         # Legacy criteria input component
│   ├── ScaleBar.js              # Visual scoring display
│   └── NewsSection.js           # News display component
├── contexts/
│   └── AuthContext.js           # User authentication state
├── api/
│   └── client.js                # Backend API communication
└── services.js                  # Alpha Vantage API integration
```

### Backend (Express/SQLite)
```
server/
├── server.js                    # Main Express server
├── db/
│   └── database.js              # SQLite database management
├── routes/
│   ├── auth.js                  # User authentication
│   ├── users.js                 # User management
│   ├── stocks.js                # Stock data operations
│   └── strategies.js            # Strategy CRUD operations
└── middleware/
    └── auth.js                  # API key authentication
```

## Key Concepts

### 1. Modular Component System
Each stock paper is composed of **modular components** that can be enabled/disabled per strategy:

- **Core Components**: Essential (ticker)
- **Metrics Components**: Quantitative data with scoring (price, % rise, volume, float)
- **Data Components**: Raw data storage (shares outstanding, restricted shares)
- **Analysis Components**: Qualitative tools (news, notes)
- **Scoring Components**: Additional scoring criteria (bonus checks)

### 2. Drag-and-Drop System
Stock papers can be reordered via drag-and-drop using `@dnd-kit`:
- **SortableStockPaper**: Wrapper component providing drag functionality
- **Drag handles**: Background areas of stock papers are draggable
- **Visual feedback**: Opacity changes during drag operations
- **Preservation**: Order is maintained in local storage and backend

### 3. Strategy System
Strategies define:
- Which components are visible
- Custom bonus criteria with editable points
- Scoring ranges for metrics  
- Default configurations for new stocks

### 4. Dual-Format Data System
Components support both legacy and modular data formats:
- **Legacy format**: Direct properties (e.g., `stock.ticker`)
- **Modular format**: Component-based (e.g., `stock.components.ticker.value`)
- **Automatic normalization**: Data is converted between formats as needed
- **Backward compatibility**: Existing data continues to work

### 5. Scoring System
Each component can contribute points based on predefined ranges:
- **Green**: Positive scores (good for strategy)
- **Orange**: Neutral/warning scores
- **Red**: Negative scores (bad for strategy)

## Development Workflow

### Adding New Components
1. Create component file in `src/components/modular/`
2. Implement dual-mode rendering (support both legacy and modular formats)
3. Add to imports in `ComponentRegistry.js`
4. Define component config in `COMPONENT_REGISTRY`
5. Add proper data normalization in the component
6. Add styling in `App.css`
7. Test with both data formats

### Adding New Strategies
1. Add preset to `STRATEGY_PRESETS` in `ComponentRegistry.js`
2. Define `paperConfig` (which components are visible)
3. Define custom `bonusChecks` with points and descriptions
4. Test strategy switching in the PresetMenu

### Development Environment Features
1. **Development Bypass**: Easy switching between login and main page during development
2. **Settings Menu**: Access to Clear Data, About, and configuration options
3. **Debug Logging**: Comprehensive console logging for troubleshooting
4. **Hot Reload**: Real-time updates during development

### Modifying Scoring
Edit the `criteria.ranges` array in `ComponentRegistry.js` for any scoring component:
```javascript
criteria: {
  ranges: [
    { min: 0, max: 10, points: 3, color: 'green' },
    { min: 10, max: 20, points: 1, color: 'orange' },
    // ...
  ]
}
```

### Backend API Routes

#### Authentication
- `POST /api/auth/create` - Create new user account
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/settings` - Update user settings

#### Stocks
- `GET /api/stocks` - Get user's saved stocks
- `POST /api/stocks/save` - Save stock data
- `GET /api/stocks/quote/:ticker` - Get live stock quote

#### Strategies
- `GET /api/strategies` - Get user's strategies
- `POST /api/strategies` - Create new strategy
- `PUT /api/strategies/:id` - Update strategy
- `DELETE /api/strategies/:id` - Delete strategy
- `GET /api/strategies/presets` - Get system presets

## Data Flow

### Stock Data Structure

**Current Modular Format:**
```javascript
{
  id: "stock-123",
  components: {
    ticker: { value: "AAPL" },
    price: { value: "150.00" },
    percentRise: { value: "2.5" },
    relativeVolume: { value: "1.5" },
    float: { value: "16.32" },
    sharesOutstanding: { value: "16320000000" },
    restrictedShares: { value: "0" },
    news: { items: [...] },
    notes: { value: "Strong earnings" },
    bonusChecks: { 
      checks: {
        recentIPO: true,
        shortSqueeze: false
      }
    }
  },
  paperConfig: {
    ticker: true,
    price: true,
    // ... visibility settings
  }
}
```

**Legacy Format (Still Supported):**
```javascript
{
  id: "stock-123",
  ticker: "AAPL",
  price: "150.00",
  percentRise: "2.5",
  relativeVolume: "1.5",
  // ... direct properties
}
```

**Data Normalization:**
The modular component system in `ModularStockPaper.js` handles all data in the standardized modular format with components structure.
```

### Authentication Flow
1. User enters API key on login screen
2. Frontend calls `/auth/create` or validates existing key
3. Backend returns user info and stores API key
4. All subsequent requests include `X-API-Key` header

### Auto-Calculation Example (Float)
1. User enters "Shares Outstanding" and "Restricted Shares"
2. FloatComponent automatically calculates: `(outstanding - restricted) / 1,000,000`
3. Float input becomes disabled and shows "(auto)" indicator
4. Scoring system uses calculated float value

## Configuration

### Environment Variables
```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ALPHA_VANTAGE_KEY=your_alpha_vantage_key

# Backend (server/.env)
PORT=3001
JWT_SECRET=your_jwt_secret
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

### Deployment
```bash
# Build frontend
npm run build

# Install server dependencies
npm run install:server

# Start production server
npm run server
```

## Common Tasks

### Change App Name/Branding
1. Update title in `App.js` header
2. Update `ApiKeyPrompt.js` header
3. Update `package.json` name fields
4. Update documentation

### Add New Bonus Criteria
Use the "Set Preset" menu to add custom bonus criteria with editable points and descriptions. These are stored per-strategy.

### Modify Scoring Ranges
Edit `ComponentRegistry.js` criteria ranges for any scoring component to adjust point values and color coding.

### Add New Data Source
1. Add API integration in `services.js` or `api/client.js`
2. Update backend routes if needed
3. Modify components to use new data
4. Update data storage structure

### Debug Issues
1. Check browser console for frontend errors
2. Check server logs for backend errors
3. Verify API key authentication
4. Check database connectivity
5. Verify component registry configuration
6. Test drag-and-drop functionality with multiple stocks
7. Verify data normalization between formats
8. Check update button functionality with API calls

### UI/UX Features
1. **Clean Interface**: Removed strategy selection bar for simplified UI
2. **Settings Dropdown**: Easy access to Clear Data, About, and Settings
3. **Drag Handles**: Background areas provide intuitive drag-and-drop
4. **Button Organization**: Cohesive button grouping in top-right corner
5. **Visual Feedback**: Loading states and hover effects
6. **Responsive Layout**: Works on various screen sizes

## Security Features
- API key-based authentication (no passwords)
- Rate limiting on API endpoints
- SQL injection protection via parameterized queries
- CORS protection
- Helmet security headers
- Input validation with Joi
- No vulnerable dependencies (npm audit clean)

## Performance Considerations
- Components only re-render when their data changes
- Database operations are optimized with indexes
- Frontend API calls are debounced
- Large datasets are paginated
- Auto-save is throttled to prevent excessive API calls