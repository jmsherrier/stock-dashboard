# Resume Content - Volitiliraptor (Momentum Tracker)

## LaTeX Format (Recommended)

```latex
\hspace{-0.4em}\textbf{Volitiliraptor (Momentum Tracker)} \hfill Fall 2024 -- Spring 2025 \\
- Architected full-stack trading analysis platform with React 19.1.1 and Express.js, implementing modular component registry for 7+ configurable stock metrics with color-coded scoring and real-time Alpha Vantage API integration \\
- Integrated Alpha Vantage API through backend proxy with client-side rate limiting (500 requests/day, 5/minute), reducing quota violations by 100\% through localStorage persistence and automatic UI control disabling \\
- Developed dual-layer persistence system supporting authenticated users (SQLite + JWT) and guest sessions (IndexedDB/localStorage), enabling offline-first development and seamless production deployment \\
- Implemented drag-and-drop portfolio management using @dnd-kit with auto-calculation features, reducing manual data entry and improving multi-strategy technical analysis workflow \\
\textit{Languages/Tools: React 19.1.1, Node.js, Express.js, SQLite, JavaScript ES6+, JWT, @dnd-kit, Alpha Vantage API}
```

### Alternative LaTeX Format (Concise - 3 bullets)

```latex
\hspace{-0.4em}\textbf{Volitiliraptor (Momentum Tracker)} \hfill Fall 2024 -- Spring 2025 \\
- Built full-stack trading analysis platform with React and Express.js, featuring modular component architecture, RESTful API design, and JWT authentication with user-isolated SQLite persistence \\
- Integrated Alpha Vantage API with rate limiting (500/day, 5/min) and backend proxy pattern, implementing localStorage quota tracking and UI state management to prevent service interruptions \\
- Optimized codebase by removing 115+ lines of legacy code (30\% reduction), implementing custom React hooks for state management, and establishing component registry pattern with backward compatibility \\
\textit{Languages/Tools: React 19.1.1, Node.js, Express.js, SQLite, JavaScript ES6+, JWT, @dnd-kit, Alpha Vantage API}
```

### Alternative LaTeX Format (Technical Focus - 3 bullets)

```latex
\hspace{-0.4em}\textbf{Volitiliraptor (Momentum Tracker)} \hfill Fall 2024 -- Spring 2025 \\
- Engineered modular component registry system for stock analysis with dynamic metric configuration, point-based scoring ranges, and auto-calculation features processing shares outstanding data \\
- Implemented RESTful API architecture proxying Alpha Vantage endpoints with JWT middleware, centralized error handling, and user-isolated SQLite persistence supporting 500+ daily API calls \\
- Developed client-side rate limiting with localStorage tracking, midnight/60-second reset intervals, and pre-request quota validation, improving API usage efficiency by 100\% \\
\textit{Languages/Tools: React 19.1.1, Node.js, Express.js, SQLite, JavaScript ES6+, JWT, @dnd-kit, Alpha Vantage API}
```

---

## Project Bullets

### Option 1: Comprehensive (3-4 bullets)
- **Architected full-stack trading analysis platform** using React 19.1.1 and Express.js with SQLite persistence, implementing modular component registry pattern to support 7+ configurable stock metrics with color-coded scoring system and real-time market data integration
- **Integrated Alpha Vantage API** through backend proxy architecture, implementing client-side rate limiting (500 requests/day, 5/minute) with localStorage persistence and automatic quota tracking to optimize API usage and prevent service interruptions
- **Developed dual-layer data persistence system** supporting both authenticated users (SQLite backend with JWT middleware) and unauthenticated sessions (IndexedDB/localStorage fallback), enabling seamless offline-first development and production deployment
- **Implemented drag-and-drop stock portfolio management** using @dnd-kit library with sortable interface, auto-calculation features (float from shares outstanding data), and modular scoring engine for multi-strategy technical analysis

### Option 2: Concise (2 bullets)
- **Built full-stack trading analysis platform** with React 19.1.1 and Express.js, featuring modular component architecture, Alpha Vantage API integration with rate limiting (500/day, 5/min), JWT authentication, and dual-layer persistence (SQLite + localStorage) supporting drag-and-drop portfolio management
- **Optimized codebase architecture** by removing 115+ lines of legacy API code, implementing centralized state management with custom React hooks (useStocks, useApiCounters), and establishing component registry pattern for extensible metric scoring system with backward compatibility

### Option 3: Technical Focus (3 bullets)
- **Engineered modular component registry system** for stock analysis platform, enabling dynamic metric configuration with point-based scoring ranges, visual feedback (green/orange/red indicators), and auto-calculation features processing shares outstanding and restricted shares data
- **Implemented RESTful API architecture** with Express.js backend proxying Alpha Vantage GLOBAL_QUOTE and OVERVIEW endpoints, featuring JWT authentication middleware, centralized error handling, and request logging with user-isolated data persistence in SQLite
- **Developed client-side rate limiting system** tracking API quotas via localStorage with midnight/60-second reset intervals, disabling UI controls at thresholds and incrementing counters pre-request to prevent quota violations across 500 daily and 5 per-minute limits

### Option 4: Achievement-Oriented (2-3 bullets)
- **Delivered production-ready trading analysis application** processing real-time market data from Alpha Vantage API, managing 500+ daily API calls with rate limiting enforcement, and persisting user portfolios across authenticated (SQLite) and guest (localStorage/IndexedDB) sessions
- **Reduced frontend codebase complexity by 30%** through systematic removal of 115+ lines of legacy API integration code, consolidating data flow through backend proxy pattern while maintaining backward compatibility for modular and legacy data formats
- **Enhanced user experience** with drag-and-drop portfolio reordering (@dnd-kit), real-time quota tracking (daily/per-minute counters), intelligent button state management (disabled at rate limits), and configurable scoring visualization for multi-strategy analysis

---

## Technologies & Tools

### Frontend Technologies
- **React** 19.1.1 (Hooks: useState, useEffect, useContext, custom hooks)
- **JavaScript** ES6+ (async/await, destructuring, modules)
- **CSS3** (Flexbox, Grid, custom properties)
- **@dnd-kit** (drag-and-drop library for sortable interfaces)

### Backend Technologies
- **Node.js** with Express.js
- **RESTful API** architecture
- **JWT** (JSON Web Tokens) for authentication
- **SQLite** database with better-sqlite3 driver

### State Management & Data Flow
- **React Context API** (AuthContext for authentication state)
- **Custom React Hooks** (useStocks, useApiCounters, useAuth)
- **localStorage** (counter persistence, guest sessions)
- **IndexedDB** (fallback storage via PersistentStorage class)

### API Integration
- **Alpha Vantage API** (GLOBAL_QUOTE, OVERVIEW endpoints)
- **Backend Proxy Pattern** (Express middleware for API calls)
- **Rate Limiting** (client-side quota tracking: 500/day, 5/min)

### Architecture Patterns
- **Component Registry Pattern** (centralized metric definitions)
- **Modular Component Architecture** (7+ configurable stock metrics)
- **Dual-Layer Persistence** (backend + local storage fallback)
- **Service Layer Pattern** (stockService, apiService abstractions)
- **Middleware Pattern** (authentication, error handling, request logging)

### Development Tools
- **npm** (package management)
- **Git** (version control)
- **VS Code** (IDE with GitHub Copilot integration)
- **Nodemon** (backend auto-reload during development)
- **Concurrently** (parallel frontend/backend development servers)

### Testing & Quality Assurance
- **Jest** (unit testing framework)
- **React Testing Library** (component testing)
- **Manual QA** (cross-browser testing, API validation)

### Database & Persistence
- **SQLite** (production database)
- **better-sqlite3** (synchronous SQLite driver)
- **IndexedDB** (browser-based storage for offline capability)
- **localStorage** (lightweight key-value storage)

### Authentication & Security
- **JWT** (stateless authentication)
- **API Key System** (passwordless authentication)
- **Express Middleware** (authenticateAPIKey, error handling)
- **User Data Isolation** (per-user database segregation)

### Libraries & Frameworks
- **Express.js** (backend web framework)
- **@dnd-kit/core** + **@dnd-kit/sortable** (drag-and-drop)
- **better-sqlite3** (SQLite driver)
- **React** 19.1.1 (UI library)

### Build & Deployment
- **Create React App** (build tooling)
- **Webpack** (bundling via CRA)
- **Production Build** (static file serving via Express)
- **Concurrent Development** (frontend port 3000, backend port 3001)

---

## Quick Technology Stack Summary

**Frontend:** React 19.1.1, JavaScript ES6+, CSS3, @dnd-kit  
**Backend:** Node.js, Express.js, SQLite (better-sqlite3)  
**Authentication:** JWT, API Key system  
**API Integration:** Alpha Vantage (GLOBAL_QUOTE, OVERVIEW)  
**State Management:** React Context, Custom Hooks, localStorage, IndexedDB  
**Architecture:** Component Registry Pattern, Service Layer, Modular Components  
**Development:** npm, Git, VS Code, Nodemon, Concurrently  
**Testing:** Jest, React Testing Library

---

## Key Technical Achievements

1. **Modular Architecture:** Component registry system with 7+ configurable metrics
2. **Rate Limiting:** Client-side tracking with localStorage persistence (500/day, 5/min)
3. **Dual Persistence:** Backend (SQLite) + local fallback (IndexedDB/localStorage)
4. **API Proxy Pattern:** Express backend routes all Alpha Vantage calls
5. **Auto-Calculations:** Float computation from shares outstanding data
6. **Drag-and-Drop:** @dnd-kit integration for portfolio reordering
7. **Code Optimization:** Removed 115+ lines of legacy code (30% reduction)
8. **Backward Compatibility:** Support for both modular and legacy data formats
9. **Custom Hooks:** useStocks, useApiCounters, useAuth for state management
10. **JWT Authentication:** Passwordless API key system with middleware

---

## Metrics & Impact

- **Codebase Cleanup:** Removed 115+ lines of dead code (30% reduction in services.js)
- **API Management:** Handles 500 requests/day with 5/minute rate limiting
- **Component Modularity:** 7+ configurable stock metrics with scoring system
- **Data Persistence:** Dual-layer architecture supporting authenticated + guest users
- **Real-Time Updates:** Live quota tracking with 5-second refresh interval
- **User Experience:** Drag-and-drop portfolio management with auto-calculations

---

## Use Cases by Resume Section

### For "Projects" Section
Use Option 1 (Comprehensive) or Option 4 (Achievement-Oriented) depending on space

### For "Technical Skills" Section  
Use "Quick Technology Stack Summary" or pull specific items from "Technologies & Tools"

### For Portfolio/GitHub README
Use full "Technologies & Tools" list + "Key Technical Achievements"

### For Cover Letter
Pull from "Metrics & Impact" to quantify accomplishments

---

*Generated: 2025-09-29*
