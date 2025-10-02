# Volatiliraptor Development Setup

## Quick Start

### Prerequisites
- Node.js 16+ installed
- npm package manager
- Alpha Vantage API key (free tier available)

### Ready to Run Files Created
✅ Frontend `.env` - React app configuration  
✅ Frontend `.env.example` - Template for frontend environment  
✅ Backend `.env` - Server configuration with API key  
✅ Backend `.env.example` - Template for backend environment  
✅ Database - SQLite database with proper schema  
✅ Initial User Account - Pre-seeded with credentials  

### Startup Scripts
- `start.bat` - Windows batch file to start both frontend and backend
- `start.ps1` - PowerShell script with better Windows integration
- `start.sh` - Unix/Linux/macOS shell script

### Manual Startup (Recommended for Development)

#### Option 1: Concurrent Development Mode
```bash
npm run dev
```
This starts both frontend and backend with hot reloading.

#### Option 2: Separate Terminals
Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm start
```

### Default Credentials
- **Email**: jmsherrier@gmail.com  
- **Password**: 1907  
- **API Key**: PVJHQQP8W1YPYAYP  
- **Dev Access**: Enabled  

### Environment Configuration

#### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL (http://localhost:3001/api)
- `GENERATE_SOURCEMAP`: Enable source maps for debugging
- `BROWSER`: Control browser auto-launch

#### Backend (server/.env)
- `PORT`: Server port (3001)
- `DATABASE_PATH`: SQLite database file location
- `JWT_SECRET`: JWT signing key
- `ALPHA_VANTAGE_KEY`: Alpha Vantage API key for real-time data
- `CORS_ORIGINS`: Allowed frontend origins

### Database Setup
The database is automatically initialized with:
- User authentication tables
- Stock data storage
- API usage tracking
- Strategy configurations
- Paper configurations

### Development Features
- Hot reloading for frontend changes
- Automatic database schema management
- API rate limiting and error handling
- JWT-based authentication
- Multi-user support with data isolation

### Troubleshooting

#### Port Already in Use
If port 3001 is busy, change the PORT in `server/.env`:
```
PORT=3002
```
And update frontend `.env`:
```
REACT_APP_API_URL=http://localhost:3002/api
```

#### Database Issues
Reset database:
```bash
cd server
rm data/momentum_tracker.db
npm run migrate
npm run seed
```

#### API Key Issues
Get a free Alpha Vantage API key at: https://www.alphavantage.co/support/#api-key
Update `ALPHA_VANTAGE_KEY` in `server/.env`

### Production Build
```bash
npm run build:full
```

### Testing
```bash
# Frontend tests
npm test

# Backend tests (when available)
npm run test:server
```

## Project Structure
- `src/` - React frontend application
- `server/` - Express backend API
- `public/` - Static frontend assets
- `server/data/` - SQLite database files
- `server/db/` - Database utilities
- `server/routes/` - API endpoints
- `server/middleware/` - Express middleware