# Volitiliraptor

A focused stock-screening dashboard built with **React 19** and **Express**. Track a watchlist as a responsive grid of cards, choose which fundamentals and technicals to display, and let a transparent scoring engine rank each name against the strategy you're currently looking at. Live data comes from the Alpha Vantage API, proxied through the backend.

![React](https://img.shields.io/badge/React-19.1-blue) ![Express](https://img.shields.io/badge/Express-4-green) ![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## What it does

- **Watchlist as a card grid.** Add tickers and each becomes a "stock paper" in a CSS Grid. Cards are evenly spaced with consistent margins and reflow responsively to any viewport width.
- **Cards grow with information.** The more criteria you choose to display, the wider the cards become — the minimum column width scales with the criteria count, so the grid stays balanced whether you show 3 metrics or 12.
- **Pick what you see.** A searchable Criteria panel exposes ~38 metrics (valuation, margins, growth, technicals, ownership, analyst targets) grouped by category. Your selection is the single thing that drives both the card layout and the score.
- **Strategy presets.** One click swaps in a curated set of criteria plus a default sort — Momentum, Value, Growth, Dividend, or Overview. Save your own current view as a custom preset.
- **Transparent scoring.** Each scorable metric maps its raw value to points (good / neutral / bad). A card's score is simply the sum of points across the criteria *currently visible* — so the score always means "how well does this stock fit the view I'm looking at." Switch to the Value preset and the score expresses value quality; switch to Momentum and it expresses momentum.
- **Sort & summarize.** Sort by score, ticker, price, % change, market cap, or recency. A toolbar shows at-a-glance counts of gainers/losers and the average score.
- **Settings.** Accent color, comfortable/compact density, score-badge visibility, and optional auto-refresh (1/5/15 min) — all persisted locally.
- **Accounts & persistence.** Email/password auth with bcrypt; watchlists persist to SQLite per user and mirror to localStorage so the app works offline and survives a backend hiccup.

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19, Create React App (react-scripts 5) |
| State | Hooks + React Context (auth, settings, toasts) |
| Styling | Hand-rolled CSS with design tokens (CSS custom properties), CSS Grid + Flexbox, dark theme |
| Backend | Express, SQLite |
| Auth | Email/password, bcrypt hashing, API-key header |
| Data | Alpha Vantage (`GLOBAL_QUOTE` + `OVERVIEW`), proxied & normalized server-side, with demo fallback |

## Quick start

### Prerequisites
- Node.js 16+ and npm
- An [Alpha Vantage API key](https://www.alphavantage.co/support/#api-key) (free tier: 25 requests/day, 5/min; each ticker costs ~2 requests). The app runs without one using built-in demo data.

### Install
```bash
cd stock_dashboard
npm run install:all          # installs frontend + server deps
```

### Configure the server
Create `stock_dashboard/server/.env`:
```env
NODE_ENV=development
PORT=3001
DATABASE_PATH=./data/momentum_tracker.db
JWT_SECRET=change-me
ALPHA_VANTAGE_KEY=your_key_here   # or "demo" for the limited demo endpoint
CORS_ORIGINS=http://localhost:3000
SEED_EMAIL=admin@example.com      # optional dev account
SEED_PASSWORD=changeme123
```

### Run
```bash
npm run dev      # starts backend (3001) and frontend (3000) together
```
Or run them separately:
```bash
npm run server   # backend on :3001
npm start        # frontend on :3000
```

### Production build
```bash
npm run build:full
npm run server
```

## Using the dashboard

1. **Sign in** (or register). With the dev seed configured you can log in with `SEED_EMAIL` / `SEED_PASSWORD`.
2. **Add a ticker** in the header. The card appears immediately and fills in once the quote returns.
3. **Choose a strategy** from the toolbar chips, or open **Criteria** to hand-pick exactly which metrics show on every card.
4. **Read the score.** The badge on each card sums the visible criteria; per-row coloring shows which metrics helped (green) or hurt (red).
5. **Sort** with the toolbar's sort control; missing data always sinks to the bottom.
6. **Save a view.** Tweak your criteria + sort, then "Save view" to store it as a custom preset.
7. **Tune the experience** in Settings (gear icon): accent color, density, score badges, auto-refresh.

## Architecture

```
stock_dashboard/
  src/
    api/client.js              # fetch wrapper; API-key auth header
    contexts/
      AuthContext.js           # user/session
      SettingsContext.js       # accent / density / scores / refresh (localStorage)
      ToastContext.js          # transient notifications
    hooks/
      useStocksV2.js           # watchlist state, fetch, persistence + legacy migration
    data/
      criteria.js              # single source of truth: every selectable metric + formatter
      scoring.js               # range-based scoring engine (bands → points/level)
      presets.js               # built-in + custom strategy views
      sorting.js               # sort options + comparator
    components/
      Login.js
      Header.js                # brand, add-ticker, update-all, criteria, settings
      Toolbar.js               # preset chips, save view, summary stats, sort
      StockGrid.js             # responsive grid; computes card min-width from criteria count
      StockCard.js             # price, score badge, criteria rows
      CriteriaPanel.js         # searchable, grouped metric picker
      SettingsModal.js
      Dashboard.js             # composes it all; scores + sorts the watchlist
  server/                      # Express + SQLite API
```

### Key design decisions

- **The visible criteria *are* the model.** Rather than maintaining a separate per-strategy scoring matrix, the score is computed over whatever criteria are on screen. This keeps presets, the card layout, and the score perfectly in sync and makes the number easy to explain. Presets are therefore just *views* — a criteria set plus a default sort — not scoring overrides.
- **Range-based scoring.** Each metric is scored with ascending "bands" (`{ upTo, pts }`). Price-level metrics (52-week high/low, moving averages, analyst target) are scored as a percentage of the current price so they're comparable across stocks. Ranges are written in the exact units Alpha Vantage returns (decimals for margins/yield/growth, plain numbers for ratios, price levels for technicals).
- **Cards that scale with content.** `StockGrid` sets `--card-min-width` from the number of body criteria; CSS Grid's `repeat(auto-fill, minmax(var(--card-min-width), 1fr))` then handles even spacing and reflow with zero JS layout math.
- **Resilient persistence.** `useStocksV2` reconciles backend and local state on load (and migrates the legacy `{ components: {...} }` shape to the lean `{ ticker, data }` shape) before writing anywhere, so a stale local snapshot can never clobber server data.

### Data API (backend)

```
POST /api/auth/login         # email + password → user + apiKey
POST /api/auth/create        # register
GET  /api/auth/me            # current user

GET  /api/stocks             # user's saved watchlist
POST /api/stocks/save        # persist watchlist
GET  /api/stocks/quote/:ticker  # live quote (GLOBAL_QUOTE + OVERVIEW), normalized
```

The quote endpoint normalizes Alpha Vantage's two payloads into a flat object (price, percentChange, marketCap, peRatio, margins, growth, moving averages, ownership, analyst target, etc.) and falls back to randomized demo data when the upstream returns nothing — handy for development without burning rate limits.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Frontend dev server (port 3000) |
| `npm run server` | Backend (port 3001) |
| `npm run dev` | Both, concurrently |
| `npm run build` | Production frontend build |
| `npm run build:full` | Build frontend + install server prod deps |
| `npm test` | Frontend tests (React Testing Library) |
| `npm run install:all` | Install frontend + server deps |

## Troubleshooting

- **Prices look wrong / fundamentals are blank.** You're almost certainly on the `demo` Alpha Vantage key, which only returns real data for a couple of sample tickers. Set a real `ALPHA_VANTAGE_KEY`.
- **`NetworkError` / quotes never load.** Confirm the backend is running on `:3001` and `CORS_ORIGINS` includes your frontend origin.
- **Hitting rate limits.** Free tier is 25 requests/day. Turn auto-refresh off in Settings and use "Update All" sparingly.

## License

MIT
