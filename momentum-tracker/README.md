# Volitiliraptor - Multi-Strategy Trading Analysis Platform

## Current Version
v3.0.0 - Modular Architecture & Multi-Strategy Support

## Overview
Volitiliraptor is a comprehensive trading analysis platform that transforms traditional stock screening into a flexible, multi-strategy system. Built with React and Express, it provides modular components that can be configured for different trading strategies with real-time data integration and sophisticated scoring systems.

## Key Features

### 🎯 Multi-Strategy System
- **Momentum Strategy**: Focus on price movement and volume
- **Growth Strategy**: Emphasize fundamental growth metrics
- **Value Strategy**: Concentrate on valuation indicators
- **Custom Strategies**: Create your own trading criteria

### 🧩 Modular Component Architecture
- **Drag-and-Drop Interface**: Reorder stocks intuitively
- **Flexible Components**: Each metric is a standalone, configurable component
- **Dual-Format Support**: Works with legacy and modern data structures
- **Auto-Calculations**: Float automatically calculated from shares data

### 📊 Advanced Scoring System
- **Color-Coded Scoring**: Green (positive), Orange (neutral), Red (negative)
- **Custom Ranges**: Define your own scoring criteria
- **Bonus Checks**: Additional strategy-specific criteria
- **Real-Time Updates**: Live score recalculation

### 🔐 Robust Backend
- **User Authentication**: API key-based system (no passwords)
- **Data Persistence**: SQLite database with comprehensive user storage
- **Real-Time Data**: Alpha Vantage API integration with fallback demo data
- **Multi-User Support**: Individual user spaces and settings

### 🎨 Modern UI/UX
- **Clean Interface**: Streamlined design focused on data analysis
- **Settings Menu**: Easy access to configuration and data management
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Professional appearance optimized for extended use

## Technical Stack
- **Frontend**: React 19.1.1 with @dnd-kit for drag-and-drop
- **Backend**: Express.js with SQLite database
- **Authentication**: API key-based system with JWT
- **APIs**: Alpha Vantage for real-time stock data
- **Storage**: Multi-layer persistence (database + localStorage)
- **Styling**: CSS Grid and Flexbox with custom dark theme

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Alpha Vantage API key (free tier available)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd momentum-tracker

# Install dependencies
npm install
npm run install:server

# Set up environment variables
cp .env.example .env
cp server/.env.example server/.env

# Configure your Alpha Vantage API key in server/.env
echo "ALPHA_VANTAGE_API_KEY=your_key_here" >> server/.env
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
1. **Authentication**: Enter your email to create an account (no password required)
2. **Add Stocks**: Press 'A' or click "Add Ticker" to add a new stock
3. **Enter Data**: Click on any field to edit stock information
4. **Update Prices**: Click "Update" button to fetch real-time data
5. **Reorder**: Drag stock papers to rearrange them
6. **Configure**: Use settings menu to clear data or adjust preferences

### Strategy Configuration
1. Click the "Set Preset" button to open strategy menu
2. Choose from predefined strategies or create custom ones
3. Configure which components are visible
4. Set custom bonus criteria with point values
5. Apply to new stocks automatically

### Component Types
- **Ticker**: Stock symbol input
- **Price**: Current stock price with scoring
- **Percent Rise**: Daily percentage change
- **Relative Volume**: Volume compared to average
- **Float**: Tradeable shares (auto-calculated from outstanding - restricted)
- **News**: Catalyst and news management
- **Notes**: Free-form text notes
- **Bonus Checks**: Custom strategy-specific criteria

## Architecture

### Database Schema
```sql
-- Users table
users (id, email, api_key, created_at, updated_at)

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
POST /api/auth/create - Create user account
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

## License
MIT License - See LICENSE file for details

## Support
For issues, feature requests, or contributions, please use the GitHub issue tracker.