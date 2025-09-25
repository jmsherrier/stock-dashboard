/*
=== SETUP INSTRUCTIONS ===

1. Prerequisites:
   - Node.js (v16 or higher)
   - npm or yarn package manager

2. Create the project:
   ```bash
   npx create-react-app momentum-tracker
   cd momentum-tracker
   ```

3. Install dependencies:
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities axios date-fns
   npm install --save-dev electron electron-builder concurrently wait-on
   ```

4. Replace files:
   - Copy all code above into respective files
   - Create src/components/ directory
   - Move StockPaper.js, CriteriaInput.js, NewsList.js, AddStockModal.js, SortableStockPaper.js to src/components/
   - Replace package.json with provided version
   - Replace public/index.html and add manifest.json

5. Get Alpha Vantage API key:
   - Go to https://www.alphavantage.co/support/#api-key
   - Sign up for free API key (500 requests/day)
   - Replace 'YOUR_API_KEY_HERE' in src/services.js

6. Development:
   ```bash
   # For web development
   npm start

   # For Electron development
   npm run electron-dev
   ```

7. Build for production:
   ```bash
   # Build web version
   npm run build

   # Build desktop app
   npm run electron-build
   ```

8. Project Structure:
   ```
   momentum-tracker/
   ├── public/
   │   ├── electron.js
   │   ├── index.html
   │   └── manifest.json
   ├── src/
   │   ├── components/
   │   │   ├── StockPaper.js
   │   │   ├── CriteriaInput.js
   │   │   ├── NewsList.js
   │   │   ├── AddStockModal.js
   │   │   └── SortableStockPaper.js
   │   ├── App.js
   │   ├── App.css
   │   ├── index.js
   │   ├── index.css
   │   └── services.js
   ├── package.json
   └── README.md
   ```

=== FEATURES IMPLEMENTED ===

✅ Dark, sleek UI with grayscale design
✅ Stock paper layout with drag-and-drop
✅ Updated point scales (2-4$ = +++, 20%+ = +++, 20x+ = +++)
✅ Real-time scoring and automatic ranking
✅ Keyboard shortcuts (A, U, Delete)
✅ News management with right-click editing
✅ Bonus criteria checkboxes
✅ API integration with rate limiting
✅ Debounced auto-save (500ms)
✅ Auto-backup every 3 minutes
✅ Undo functionality
✅ Persistent storage across sessions
✅ Responsive design
✅ Modal for adding stocks
✅ Warning indicators for out-of-range values
✅ Color-coded scoring system

=== KEYBOARD SHORTCUTS ===

- A: Add new ticker
- U: Update all stocks
- Delete: Remove selected stock
- Escape: Close modal
- Enter: Submit form

=== API USAGE ===

The app tracks API usage and shows:
- Daily requests: 0-500 (resets daily)
- Per-minute requests: 0-5 (resets every minute)
- Color indicators: Green (safe), Yellow (warning), Orange (near limit)

=== NOTES ===

- For testing without API: Use getStockDataDemo() in services.js
- All data is stored in localStorage
- Backups are created automatically
- Right-click news items to edit
- Drag stocks to manually reorder
- Press 'U' to auto-sort by score
- Empty news sections show [-3] penalty
- All criteria use discrete point scales

=== TROUBLESHOOTING ===

If you encounter issues:
1. Make sure all dependencies are installed
2. Check that your API key is valid
3. Clear localStorage if data seems corrupted
4. For Electron issues, try: npm install electron --save-dev
5. For build issues, delete node_modules and run npm install

=== CUSTOMIZATION ===

To modify scoring:
- Edit calculateScore() function in App.js
- Adjust scale arrays in StockPaper.js
- Update getScorePoints() function for point calculations

The codebase is intentionally minimal and focused on performance while maintaining readability for future modifications.
*/