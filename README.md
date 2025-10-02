# Volitiliraptor - Multi-Strategy Trading Analysis Platform

## Current Version
v3.2.0 - Component Refactoring & Improved Scoring Criteria

### Latest Changes (v3.2.0)
- **Component Organization**: Refactored all components into logical folders (scoring/, info/, technical/)
- **Enhanced Configuration Menu**: All 47+ components now properly organized in 11 categories
- **Improved Scoring Criteria**: Updated 8+ components with more accurate trading-based scoring
- **Smart Category Ordering**: Components within each category ordered by trading importance
- **New Categories**: Added Valuation Ratios, Financial Metrics, Market Sentiment, and Company Info categories
- **Better Risk Assessment**: Price and volume scoring now reflects actual trading risk profiles
- **Enhanced Metrics**: ROE, ROA, EPS, Profit Margin, and Dividend Yield now have more granular ranges

### Configuration Menu Organization
Components are organized in **11 categories**, ordered by trading importance within each:

**Price & Momentum** (2 components)
- Price, Percent Rise

**Volume & Float** (2 components)  
- Relative Volume, Float

**Technical Indicators** (6 components)
- 52-Week High %, 50-Day MA, 200-Day MA, 52-Week Low %, Beta, Institutional Ownership

**Fundamentals** (16 components)
- Revenue Growth, Earnings Growth, EPS, Profit Margin, Operating Margin
- ROE, ROA, EBITDA, P/E Ratio, Forward P/E, Trailing P/E
- PEG Ratio, Price-to-Book, Price-to-Sales, Book Value, Dividend Yield

**Valuation Ratios** (2 components)
- EV/Revenue, EV/EBITDA

**Financial Metrics** (2 components)
- Dividend Per Share, Revenue Per Share

**Market Sentiment** (2 components)
- Analyst Ratings, Analyst Target

**Company Size** (4 components)
- Market Cap, Shares Outstanding, Restricted Shares, Insider Ownership

**Classification** (2 components)
- Sector, Industry

**Company Info** (3 components - no editors)
- Company Name, Asset Type, Company Description

**Analysis** (1 component)
- News & Catalysts

## Overview
Volitiliraptor is a comprehensive trading analysis platform that transforms traditional stock screening into a flexible, multi-strategy system. Built with React and Express, it provides modular components with a dynamic 2D infinite grid layout system for organizing stocks spatially, real-time data integration, sophisticated scoring systems, and advanced keyboard-based controls.

## Key Features

### Infinite Grid Canvas
- **Click-Based Selection**: Click stocks to select them (highlighted border), click off to deselect
- **Keyboard Navigation**: Use arrow keys to move selected stocks to adjacent empty cells
- **Configurable Keybinds**: Customize keyboard shortcuts including delete key modifier support
- **Duplicate Detection**: Visual warning when keybinds conflict
- **Mouse Position Tracking**: Real-time hover detection on empty cells without rendering all cells
- **Smooth Zoom**: 0.25x to 2x zoom with touchpad-optimized sensitivity (0.0003 delta)
- **Zoom Persistence**: Zoom level saved across sessions
- **Pan Control**: Click and drag empty space to navigate the infinite canvas
- **Precise Drag Movement**: Zoom-compensated drag distance for accurate stock placement

### Multi-Strategy System
- **Momentum Strategy**: Focus on price movement and volume
- **Growth Strategy**: Emphasize fundamental growth metrics
- **Value Strategy**: Concentrate on valuation indicators
- **Custom Strategies**: Create your own trading criteria
- **Preset Persistence**: Last selected preset automatically restored on load

### Modular Component Architecture
- **Drag-and-Drop Interface**: Move stocks to any position with visual feedback
- **Lock Position Feature**: Lock stocks to prevent accidental movement (checkbox only, not label text)
- **Click-to-Add**: Click empty grid cells to instantly add new stocks
- **Visual Feedback**: Green outlines with plus signs on empty cell hover, grey outlines when dragging
- **Smart Sort**: Viewport-aware auto-sort arranges stocks left-to-right, top-to-bottom with zoom compensation
- **Flexible Components**: Each metric is a standalone, configurable component
- **Dual-Format Support**: Works with legacy and modern data structures
- **Auto-Calculations**: Float automatically calculated from shares data

### Advanced Scoring System
- **Color-Coded Scoring**: Green (positive), Orange (neutral), Red (negative)
- **Custom Ranges**: Define your own scoring criteria
- **Bonus Checks**: Additional strategy-specific criteria
- **Real-Time Updates**: Live score recalculation

### Robust Backend
- **User Authentication**: Email and password authentication system
- **Data Persistence**: SQLite database with comprehensive user storage
- **Account Preservation**: "Clear All Data" preserves authentication without logout
- **Separate Data Controls**: "Clear Stocks" vs "Clear All Data" options
- **Real-Time Data**: Alpha Vantage API integration with fallback demo data
- **Multi-User Support**: Individual user spaces and settings
- **Developer Access**: Optional dev mode accessible via settings with access code

### Modern UI/UX
- **Clean Interface**: Streamlined design focused on data analysis
- **Settings Menu**: Easy access to configuration and data management
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Professional appearance optimized for extended use
- **Duplicate Keybind Warning**: Red highlighting when multiple shortcuts use same key

## Technical Stack
- **Frontend**: React 19.1.1 with @dnd-kit for drag-and-drop
- **Grid System**: Custom infinite canvas with mouse position tracking and zoom compensation
- **Backend**: Express.js with SQLite database
- **Authentication**: Email/password authentication with bcrypt hashing (preserved on data clear)
- **APIs**: Alpha Vantage for real-time stock data
- **Storage**: Multi-layer persistence (database + localStorage) with selective clearing
- **Keybind System**: Configurable keyboard shortcuts with modifier support and conflict detection
- **Styling**: CSS Grid and Flexbox with custom dark theme, pointer-events management, z-index layering

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Alpha Vantage API key (free tier available)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd stock_dashboard

# Install dependencies
npm install
npm run install:server

# Set up environment variables
cp .env.example .env
cp server/.env.example server/.env

# Configure your Alpha Vantage API key in server/.env
echo "ALPHA_VANTAGE_API_KEY=your_key_here" >> server/.env

# Run database migrations and seed initial user
cd server
npm run migrate
npm run seed
cd ..
```

### Development
```bash
# Start the backend server (Terminal 1)
npm run server

# Start the React development server (Terminal 2)  
npm start
```

### Production
```bash
# Build the frontend
npm run build

# Start production server
npm run server:prod
```

## Usage Guide

### Getting Started
1. **Authentication**: Create account with email and password, or login with existing credentials
2. **Initial Setup**: Application starts with one default stock paper already on the grid
3. **Add More Stocks**: 
   - Click any empty grid cell to add a new stock (first click off a selected stock deselects it)
   - Or use keyboard: Press 'A' to add stock at current mouse position
4. **Navigate Grid**: 
   - **Pan**: Click and drag on empty space to move your view around the infinite grid
   - **Zoom**: Use mousewheel to zoom in (2x) or out (0.25x) - zoom level persists across sessions
5. **Select & Move Stocks**:
   - **Select**: Click on a stock paper to select it (shows white border)
   - **Deselect**: Click on empty space (first click deselects, subsequent clicks add stock)
   - **Move with Keyboard**: Use arrow keys (Up/Down/Left/Right) to move selected stock to adjacent cells
   - **Move with Mouse**: Drag stocks to any position - movement compensates for zoom level
   - **Delete**: Select stock, then press configured delete key (default: Delete)
   - **Lock Position**: Click the small checkbox (not the label text) to prevent accidental movement
6. **Enter Data**: Click on any field to edit stock information
7. **Update Prices**: Click "Update" button on individual stocks or "Update All" for all stocks
8. **Sort Stocks**: Click "Sort" button to automatically arrange all unlocked stocks in a viewport-aware grid pattern
9. **Configure Strategy**: Use "Configure" menu to adjust strategy presets, enable/disable components, and set bonus criteria
   - **Note**: When you change presets, all stock papers resize automatically and zoom/preset persist
10. **Settings**: 
    - Configure keyboard shortcuts with modifier support (Ctrl+Key, Shift+Key, Alt+Key)
    - Duplicate keybinds show red warning
    - Access grid layout options and account management
    - Use "Clear Stocks" to remove all stocks and reset zoom
    - Use "Clear All Data" to reset everything except account login

### Keyboard Shortcuts
- **Stock Selected**:
  - Arrow Keys: Move stock to adjacent empty cell (works repeatedly without re-clicking)
  - Delete Key: Remove stock (configurable, supports modifiers like Ctrl+D)
- **General**:
  - A: Add new stock at mouse position
  - U: Update all stocks with latest data
  - Ctrl+Z: Undo last action
  - Mouse Wheel: Zoom in/out

### Developer Mode
- Access developer features through Settings → Account Management
- Enter access code to enable advanced functionality
- Dev access badge appears when enabled
- Provides additional debugging and testing capabilities

### Strategy Configuration
1. Click the "Set Preset" button to open strategy menu
2. Choose from predefined strategies or create custom ones
3. Configure which components are visible
4. Set custom bonus criteria with point values
5. Apply to new stocks automatically
6. Preset selection persists across sessions

### Component Types
- **Ticker**: Stock symbol input
- **Price**: Current stock price with scoring
- **Percent Rise**: Daily percentage change
- **Relative Volume**: Volume compared to average
- **Float**: Tradeable shares (auto-calculated from outstanding - restricted)
- **News**: Catalyst and news management
- **Notes**: Free-form text notes
- **Bonus Checks**: Custom strategy-specific criteria
- **Lock Position**: Checkbox to prevent stock movement

## Architecture

### Component Organization
The application follows a hierarchical folder structure to organize components by type:

```
src/components/
  modular/               # Core component system
    ComponentRegistry.js # Single source of truth for all components
    scoring/             # Components with scoring criteria
      PriceComponent.js
      PERatioComponent.js
      DividendYieldComponent.js
      ... (30 scoring components)
    info/                # Information-only components (no scoring)
      TickerComponent.js
      CompanyNameComponent.js
      CompanyDescriptionComponent.js
      SectorComponent.js
      NewsComponent.js
      ... (9 info components)
    technical/           # Technical indicators
      MovingAverage50Component.js
      MovingAverage200Component.js
      Week52HighComponent.js
      ChangeIndicator.js
      ... (6 technical components)
  
  layout/                # Grid and paper layout components
    GridCanvas.js        # Infinite grid canvas
    GridCell.js          # Individual grid cells
    ModularStockPaper.js # Modern modular stock paper
    StockPaper.js        # Legacy stock paper
    SortableStockPaper.js # Draggable wrapper
  
  modal/                 # Modal dialogs and editors
    AboutModal.js
    SettingsModal.js
    ScoringEditor.js
    NewsEditor.js
    BonusEditor.js
    CategoricalEditor.js
  
  inputs/                # Input components and controls
    CriteriaInput.js
    ScaleBar.js
    PresetMenu.js
    ApiKeyPrompt.js
```

### Database Schema
```sql
-- Users table
users (id, email, password_hash, api_key, created_at, updated_at, is_active, dev_access)

-- User settings
user_settings (id, user_id, settings_data, updated_at)

-- User stocks
user_stocks (id, user_id, stocks_data, updated_at)

-- Custom strategies
strategies (id, user_id, name, config, created_at, updated_at)

-- Paper configurations
paper_configs (id, user_id, config_name, components, updated_at)

-- API usage tracking
user_api_usage (id, user_id, endpoint, request_count, last_request, updated_at)
```

### API Endpoints
```
Authentication:
POST /api/auth/login - Login with email and password
POST /api/auth/create - Create user account
POST /api/auth/enable-dev-mode - Enable developer access
GET /api/auth/me - Get current user info

Stocks:  
GET /api/stocks - Get user's saved stocks
POST /api/stocks/save - Save stock data
GET /api/stocks/quote/:ticker - Get real-time quote

Strategies:
GET /api/strategies - Get user strategies
POST /api/strategies - Create new strategy
PUT /api/strategies/:id - Update strategy
DELETE /api/strategies/:id - Delete strategy
```

## Development Features

### Development Bypass
For easier development, use the bypass feature to switch between authenticated and unauthenticated modes without repeatedly entering credentials.

### Debug Mode
Enable debug logging by adding `DEBUG=true` to your environment variables. This provides detailed console output for troubleshooting.

### Component Development
When creating new components:
1. Implement dual-mode rendering for backward compatibility
2. Add proper data normalization
3. Include scoring criteria if applicable
4. Add comprehensive styling
5. Test with both data formats

## Contributing

### Code Style
- Use functional components with hooks
- Follow the modular component pattern
- Implement proper error handling
- Add comprehensive comments
- Maintain backward compatibility

### Testing
```bash
# Run frontend tests
npm test

# Run backend tests (when available)
npm run test:server
```

### Building
```bash
# Create production build
npm run build

# Analyze bundle size
npm run analyze
```

## Troubleshooting

### Common Issues
1. **"NetworkError"**: Ensure backend server is running on port 3001
2. **Update buttons not working**: Check API key configuration and server logs
3. **Drag-and-drop not working**: Verify @dnd-kit dependencies are installed
4. **Data not persisting**: Check database file permissions and SQLite installation

### Debug Steps
1. Check browser console for errors
2. Verify backend server is running (`npm run server`)
3. Test API endpoints directly (use curl or Postman)
4. Check database file exists and is writable
5. Verify environment variables are set correctly

## Support
For issues, feature requests, or contributions, please use the GitHub issue tracker.