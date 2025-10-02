# Copilot Instructions for Volitiliraptor (Stock Dashboard)

## Project Overview
- **Volitiliraptor** is a modular multi-strategy trading analysis platform built with React 19.1.1 (frontend) and Express.js (backend).
- The architecture supports drag-and-drop stock management (@dnd-kit), modular scoring components, and real-time data integration via Alpha Vantage API.
- Data persistence is handled via SQLite (see `server/data/stock_dashboard.db`) with dual-layer storage (database + localStorage).

## Key Architectural Patterns
- **Component Registry System**: All metric components are registered in `src/components/modular/ComponentRegistry.js` with metadata (scoring criteria, categories, defaults). This is the single source of truth for available components.
- **Dual-Mode Components**: Components support both legacy CriteriaInput format and modern modular format. Check `config.criteriaMode` prop in components like `PriceComponent.js`.
- **Data Flow**: React Context (`AuthContext`) → Custom Hooks (`useStocks`, `useApiCounters`) → Services (`stockService.js`) → API Client (`api/client.js`) → Backend Routes.
- **Authentication**: Passwordless API key system with localStorage persistence. Keys are validated via `server/middleware/auth.js` and user data is isolated per API key.
- **Scoring Engine**: Color-coded scoring (green/orange/red) defined in component registry, calculated in `utils/scoreCalculator.js` with bonus checks support.

## Developer Workflows
- Do not run npm start or build commands unless specifically instructed
- Assume backend and frontend are running in separate terminal tabs/windows
- **Full Setup**: `npm run install:all` → `npm run dev` (starts both frontend and backend concurrently)
- **Backend Only**: `npm run server` or `npm run server:dev` (nodemon, port 3001)
- **Frontend Only**: `npm start` (React dev server, port 3000)
- **Production**: `npm run build:full` → `npm run server` (serves static files from `/build`)
- **Tests**: `npm test` (frontend with coverage: `npm run test:coverage`), `npm run test:server` (backend)
- **Environment Setup**: Copy `.env.example` to `.env` and `server/.env.example` to `server/.env`, add `ALPHA_VANTAGE_API_KEY`
- **Database**: Auto-initialized on first server start, schema in `server/setup-db.js`

## Project-Specific Conventions
- **Component Registration**: New components MUST be added to `COMPONENT_REGISTRY` in `ComponentRegistry.js` with proper metadata (scoring, categories, size).
- **Dual-Mode Rendering**: Components check `config.criteriaMode !== false` to switch between CriteriaInput (legacy) and modular formats.
- **Data Structure**: Stock data uses `components` object with `{componentId: {value, ...}}` format. Legacy format uses direct properties.
- **State Management**: Use custom hooks (`useStocks`, `useApiCounters`) for complex state. Simple UI state can use component-level `useState`.
- **API Error Handling**: All API calls in services layer should handle errors gracefully with fallback data or user-friendly messages.
- **Scoring Logic**: Implement scoring in component registry, not individual components. Use `calculateComponentScore()` and `getComponentScoreColor()` helpers.

## Integration Points
- **Alpha Vantage API**: Configure API key in `server/.env`. All stock quote requests route through backend (`/api/stocks/quote/:ticker`).
- **Database**: SQLite file at `server/data/stock_dashboard.db`. Schema documented in README.
- **Frontend-Backend Communication**: All data flows through RESTful API endpoints (see `server/routes/`).
- **Authentication Flow**: `ApiKeyPrompt` → `AuthContext.login()` → `apiClient.setApiKey()` → Backend validates via `authenticateAPIKey` middleware.
- **Data Persistence**: Frontend uses `localStorage` for temporary data, backend handles permanent storage. Both layers sync via `saveStocksToBackend()`.

## Examples & References
- **Modular Component Example**: `src/components/modular/PriceComponent.js` (scoring, dual-mode)
- **Component Registry**: `src/components/modular/ComponentRegistry.js` (metadata, scoring definitions)
- **Custom Hooks**: `src/hooks/useStocks.js` (state management), `src/hooks/useApiCounters.js` (API tracking)
- **Service Layer**: `src/services/stockService.js` (data management), `src/api/client.js` (HTTP client)
- **Authentication Flow**: `src/contexts/AuthContext.js`, `server/middleware/auth.js`
- **Database Schema**: `server/db/database.js`, `server/setup-db.js`

## Troubleshooting
- Backend must run on port 3001 for frontend to connect
- API key issues: check `server/.env` and server logs
- Drag-and-drop: verify `@dnd-kit` is installed
- Data persistence: check SQLite file permissions

### Server Stability & Process Management
- **Dedicated Terminal Required**: Backend server must run in dedicated terminal tab/window. VS Code terminal sends SIGINT signals to background processes when executing subsequent commands in same terminal.
- **Port Conflicts**: If `EADDRINUSE` error occurs on port 3001, check for orphaned node processes: `Get-Process node` then `Stop-Process -Name node -Force`
- **Server Won't Stay Active**: Verify `server.js` calls `app.listen()` inside async database initialization block (after `await db.init()`)
- **Database Initialization**: Server must complete "Database initialization completed" before accepting requests. Check for invalid table/index references in `database.js`
- **Starting Server**: Use dedicated terminal tab with `cd .\stock_dashboard\server; npm run dev` or separate window with `npm run dev:windows`
- **Testing Server**: Use separate terminal tab for API requests (curl/Invoke-RestMethod). Health check: `http://localhost:3001/api/health`

---

**Feedback:** If any section is unclear or missing, please specify what needs improvement or additional detail.

# Chatbot Interaction Guidelines

## Core Principles

### Communication Style
- Maintain professional, direct communication without decorative elements
- Provide minimal viable responses that fully address the request
- Avoid unnecessary elaboration or filler content
- Use passive, objective language structures

### Response Format
- Exclude emojis, symbols, or visual decorations unless specifically requested
- Use clear, straightforward language
- Focus on actionable information and direct answers
- Employ passive voice constructions (e.g., "Implementing changes" vs "I'll implement changes")
- Avoid first-person references and conversational transitions

### Scope of Action
- Execute only explicitly requested tasks
- Seek explicit permission before performing additional or related actions
- Do not make assumptions about unstated requirements or preferences
- Do not run npm start or build commands unless specifically instructed
- Assume backend and frontend are running in separate terminal tabs/windows

### Documentation Requirements
- Update README.md after implementing changes to reflect current state
- Document new features, interface modifications, and technical updates
- Maintain version tracking and change logs in project documentation
- Unless directed, do not create new .md files - only contribute to and update existing .md files
- Focus on enhancing existing documentation rather than creating additional documentation files

## Implementation
These guidelines ensure efficient, focused interactions that respect user intentions and time constraints while maintaining helpful assistance within defined boundaries.

## Command line / Terminal
Generally, working folder is volatiliraptor/stock_dashboard/

### PowerShell Syntax
- Use semicolon (`;`) syntax to join commands on a single line when needed
- Example: `cd .\stock_dashboard\; npm install` `set PORT="3001"; npm start`
- This ensures compatibility with Windows PowerShell command execution

## Code Modernization & Legacy Cleanup

### Architecture Standards
- Maintain fully modular component architecture using `components` data structure
- All stock data must use modular format: `stock.components.ticker.value` pattern
- Remove legacy format conversion functions when no longer needed
- Eliminate unused components, functions, and API endpoints systematically

### Component Management
- Remove unused components immediately when identified
- Update all imports and references when removing components
- Maintain ComponentRegistry as single source of truth for modular components
- Ensure all component dependencies are properly traced and validated

### Database & API Cleanup
- Remove unused database tables and API routes when functionality is deprecated
- Update server routing to exclude removed endpoints
- Clean up unused API client methods that no longer have corresponding backend routes
- Remove legacy database schema elements that support deprecated features

### Testing & Quality Assurance
- Update test files to remove references to deleted functions and components
- Run tests after major cleanup operations to verify system integrity
- Remove legacy test cases that test deprecated functionality
- Ensure all remaining tests validate current, active code paths

### CSS & Styling
- Remove unused CSS classes and styles for deleted components
- Clean up legacy styles that are no longer referenced in the codebase
- Maintain consistent styling architecture aligned with current component structure

### Code Quality & ESLint
- Fix ESLint errors when prudent and when they improve code quality
- Do not run ESLint after corrections unless explicitly requested by the user
- Prioritize functional fixes over cosmetic ESLint rule compliance
- Address ESLint warnings that indicate potential bugs or performance issues

### Documentation Maintenance
- Only expand existing .md files; do not create new documentation files
- Document all major changes in README.md or relevant existing documentation
- Remove references to deprecated features in documentation
- Update README.md when major architectural changes are implemented
- Ensure documentation accurately represents the modernized codebase