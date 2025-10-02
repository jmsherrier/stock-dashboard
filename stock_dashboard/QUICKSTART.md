# Quick Start Guide

## Ready to Run! 🚀

Your Volatiliraptor Stock Dashboard is now configured and ready to use.

### What's Been Set Up

✅ **Dependencies**: All npm packages installed  
✅ **Database**: SQLite database initialized with proper schema  
✅ **User Account**: Pre-configured with credentials  
✅ **Environment**: Both frontend and backend `.env` files created  
✅ **API Key**: Alpha Vantage API key configured for real-time data  

### How to Start

#### Option 1: Automated Start (Windows)
Double-click `start.bat` or run `start.ps1` in PowerShell

#### Option 2: Development Mode (Recommended)
```bash
npm run dev
```
This starts both frontend and backend with hot reloading.

#### Option 3: Manual (Two Terminals)
Terminal 1:
```bash
npm run server
```

Terminal 2:
```bash
npm start
```

### Login Credentials
- **Email**: jmsherrier@gmail.com
- **Password**: 1907
- **Dev Access**: Enabled

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

### First Steps
1. Open http://localhost:3000 in your browser
2. Login with the credentials above
3. Click an empty grid cell to add your first stock
4. Enter a ticker symbol and start analyzing!

### Features Ready to Use
- 🎯 **Infinite Grid Canvas** - Click and drag to navigate
- 📊 **Real-time Stock Data** - Updates from Alpha Vantage API
- 🔄 **Multiple Strategies** - Momentum, Growth, Value, and Custom
- ⌨️ **Keyboard Controls** - Arrow keys to move selected stocks
- 🎨 **Modular Components** - Drag and drop stock papers
- 💾 **Data Persistence** - Your data is saved automatically
- 👤 **Multi-user Support** - Separate spaces for different users

### Need Help?
- Check `DEVELOPMENT.md` for detailed setup information
- Review the main `README.md` for comprehensive feature documentation
- Backend server logs appear in the terminal for troubleshooting

### Troubleshooting
- **Port 3001 busy?** Change `PORT` in `server/.env`
- **Can't connect?** Ensure both frontend and backend are running
- **Database issues?** Delete `server/data/momentum_tracker.db` and restart

Happy trading! 📈