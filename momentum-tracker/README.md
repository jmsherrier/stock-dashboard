# Momentum Tracker

## Current Version
v2.2.0 - Enhanced Persistence & News Management

## Core Features
- Stock momentum analysis with 6-point scoring system
- Real-time API integration with formatting preservation
- News section with edit-in-place and tooltips
- Enhanced data persistence (IndexedDB + localStorage fallbacks)
- Drag & drop reordering with score-based sorting
- Dark theme with consistent styling

## Key Components
- **Stock Cards**: Ticker, price, metrics with unit suffixes
- **Scoring System**: Color-coded points with live calculation
- **News Management**: Horizontal layout, edit mode, clickable URLs
- **Persistence**: Multi-layer storage (works without cookies)
- **Updates**: Preserve user formatting when refreshing data

## Technical Stack
- React SPA with responsive design
- IndexedDB primary storage, localStorage fallback
- Alpha Vantage API integration
- CSS Grid with dark theme styling