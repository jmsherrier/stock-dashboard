# Copilot Instructions for Volitiliraptor (Momentum Tracker)

## Project Overview
- **Volitiliraptor** is a modular multi-strategy trading analysis platform built with React (frontend) and Express.js (backend).
- The architecture supports drag-and-drop stock management, modular scoring components, and real-time data integration via Alpha Vantage API.
- Data persistence is handled via SQLite (see `server/data/momentum_tracker.db`).

## Key Architectural Patterns
- **Frontend**: Modular React components in `src/components/` and `src/components/modular/`. Each metric (e.g., Price, Float, News) is a standalone, configurable component.
- **Backend**: Express server in `server/server.js` with routes in `server/routes/` and middleware in `server/middleware/`. Database logic in `server/db/database.js`.
- **Authentication**: API key-based (no passwords), managed via JWT. See `server/middleware/auth.js` and `server/routes/auth.js`.
- **Strategy System**: Strategies and presets are managed via API endpoints and stored in the database. See `server/routes/strategies.js` and frontend `StrategyMenu.js`.

## Developer Workflows
- **Start Backend**: `npm run server` (runs on port 3001)
- **Start Frontend**: `npm start` (React dev server)
- **Production Build**: `npm run build` (frontend), `npm run server:prod` (backend)
- **Tests**: `npm test` (frontend), `npm run test:server` (backend)
- **Debug Mode**: Set `DEBUG=true` in `.env` or `server/.env` for verbose logging
- **Development Bypass**: Use bypass mode to skip authentication for rapid prototyping

## Project-Specific Conventions
- **Component Design**: All new components should support dual-mode rendering for legacy and modern data formats. See examples in `src/components/modular/`.
- **Scoring**: Color-coded scoring (green/orange/red) and bonus checks are implemented in modular components. See `BonusChecksComponent.js` and scoring logic in each metric component.
- **Data Normalization**: Ensure all data passed between frontend and backend is normalized for compatibility.
- **API Usage**: All real-time data fetches use Alpha Vantage API, with fallback to demo data if unavailable.
- **User Data**: Each user has isolated data and settings, managed via database tables (`users`, `user_settings`, `user_stocks`, etc.).

## Integration Points
- **Alpha Vantage API**: Configure API key in `server/.env`. All stock quote requests route through backend (`/api/stocks/quote/:ticker`).
- **Database**: SQLite file at `server/data/momentum_tracker.db`. Schema documented in README.
- **Frontend-Backend Communication**: All data flows through RESTful API endpoints (see `server/routes/`).

## Examples & References
- **Modular Component Example**: `src/components/modular/PriceComponent.js` (scoring, dual-mode)
- **Strategy Example**: `src/components/StrategyMenu.js`, `server/routes/strategies.js`
- **Authentication Example**: `server/middleware/auth.js`, `server/routes/auth.js`
- **Database Logic**: `server/db/database.js`

## Troubleshooting
- Backend must run on port 3001 for frontend to connect
- API key issues: check `server/.env` and server logs
- Drag-and-drop: verify `@dnd-kit` is installed
- Data persistence: check SQLite file permissions

---

**Feedback:** If any section is unclear or missing, please specify what needs improvement or additional detail.