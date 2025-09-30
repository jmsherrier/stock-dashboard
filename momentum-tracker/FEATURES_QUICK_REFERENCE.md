# Quick Reference: New Features

## Feature 1: Custom Strategies Start Empty

### Before
```
User clicks "Add Strategy"
→ Inherits currently selected preset configuration
→ Has 8-15 components already enabled
→ User must uncheck unwanted components
```

### After ✅
```
User clicks "Add Strategy"
→ All components start DISABLED
→ Clean slate with 0 components enabled
→ User checks only what they want
```

### Usage
1. Click "Add Strategy" button in PresetMenu
2. Enter custom strategy name
3. **All checkboxes start unchecked**
4. Select only the components you need
5. Configure scoring ranges if needed
6. Click "Apply Preset"

---

## Feature 2: Change Tracking Arrows

### Visual Examples

#### Normal Colors (Higher = Better)
```
Price:          $3.45 ↑   (was $3.20 - green arrow)
Percent Rise:   12.5% ↑   (was 8.3% - green arrow)
Rel. Volume:    8.2x  ↑   (was 5.1x - green arrow)
ROE:            18.5% ↑   (was 15.2% - green arrow)

Price:          $2.85 ↓   (was $3.10 - red arrow)
Percent Rise:   5.2%  ↓   (was 9.8% - red arrow)
Rel. Volume:    3.5x  ↓   (was 6.2x - red arrow)
ROE:            12.1% ↓   (was 16.8% - red arrow)
```

#### Reverse Colors (Lower = Better)
```
Float:          8.5M  ↓   (was 12.3M - green arrow, lower is better!)
PEG Ratio:      0.85  ↓   (was 1.2 - green arrow, better value!)
P/E Ratio:      18    ↓   (was 22 - green arrow, better value!)

Float:          15.2M ↑   (was 9.8M - red arrow, worse for momentum!)
PEG Ratio:      2.1   ↑   (was 1.5 - red arrow, worse value!)
P/E Ratio:      28    ↑   (was 20 - red arrow, worse value!)
```

### When Arrows Appear
- ✅ **After 2nd API update** - First update establishes baseline
- ✅ **Only if value changed** - Same value = no arrow
- ✅ **Next to input field** - Right side, before suffix
- ✅ **With tooltip** - Hover to see previous value

### When Arrows DON'T Appear
- ❌ First stock update (no previous value)
- ❌ Value unchanged from last update
- ❌ Manual edits (only for API-updated values)
- ❌ Invalid/empty values

---

## Component Coverage

### ✅ Currently Enabled (6 components)
1. **Price** - Normal colors
2. **Percent Rise** - Normal colors
3. **Relative Volume** - Normal colors
4. **Float** - Reverse colors (lower = better)
5. **PEG Ratio** - Reverse colors (lower = better)
6. **ROE** - Normal colors (higher = better)

### 🔜 Easy to Extend (30 more components)
All components with scoring ranges can easily add change tracking:
- Market Cap, Beta, 52-Week High
- Moving Averages (50-day, 200-day)
- P/E Ratio, Price-to-Book, Dividend Yield
- EPS, Operating Margin, Profit Margin
- Revenue Growth, Earnings Growth
- Forward P/E, Trailing P/E, Price-to-Sales
- Book Value, EBITDA
- Institutional Ownership, Insider Ownership
- ROA (Return on Assets)

**Implementation Pattern:**
```javascript
// 1. Import ChangeIndicator
import ChangeIndicator from './ChangeIndicator';

// 2. Add previousValue getter
const getPreviousValue = () => stock.components?.FIELD?.previousValue || '';
const previousValue = getPreviousValue();

// 3. Add to input wrapper
<ChangeIndicator 
  currentValue={value} 
  previousValue={previousValue}
  reverseColors={false}  // Set true for P/E, Float, etc.
/>
```

---

## Testing Workflow

### Test Custom Strategy Creation
1. Open PresetMenu (click gear icon)
2. Click "Add Strategy" button
3. **Verify**: All component checkboxes are UNCHECKED
4. Enter strategy name (e.g., "My Custom Strategy")
5. Check 3-5 components you want
6. Click "Apply Preset"
7. **Verify**: Only selected components show in stock papers

### Test Change Tracking
1. Add a stock ticker (e.g., AAPL)
2. Click "Update All Stocks" button
3. **Verify**: Values populate, but NO arrows yet (first update)
4. Wait 1 minute or manually change some values in component fields
5. Click "Update All Stocks" again
6. **Verify**: Arrows appear next to changed values
7. **Verify**: Green ↑ for increases in Price, %, Volume, ROE
8. **Verify**: Red ↑ for increases in Float, PEG (reverse colors)
9. Hover over arrow
10. **Verify**: Tooltip shows previous value

---

## Color Reference Card

### Normal Colors (Most Metrics)
```
🟢 ↑ Green Arrow   = Value went UP (generally good)
🔴 ↓ Red Arrow     = Value went DOWN (generally bad)
```

### Reverse Colors (Value Metrics)
```
🔴 ↑ Red Arrow     = Value went UP (worse for value/momentum)
🟢 ↓ Green Arrow   = Value went DOWN (better for value/momentum)
```

### Which Components Use Reverse?
- **Float** - Lower float = more volatility potential
- **PEG Ratio** - Lower PEG = better value
- **P/E Ratio** - Lower P/E = better value
- **Price-to-Book** - Lower P/B = better value
- **Price-to-Sales** - Lower P/S = better value

---

## Troubleshooting

### "I don't see any arrows"
- ✅ Did you update stocks at least TWICE?
- ✅ Did values actually change between updates?
- ✅ Are you looking at API-updated components (not manual)?

### "Arrows showing wrong colors"
- ✅ Check if it's a reverse-color component (Float, PEG, P/E)
- ✅ For reverse components: ↑ = red (worse), ↓ = green (better)

### "Custom strategy shows wrong components"
- ✅ Make sure you created it AFTER this update
- ✅ Old custom strategies may need to be reset
- ✅ Click "Reset to Default" button to clear selections

### "Arrow disappeared after manual edit"
- ✅ This is intentional - arrows only show API changes
- ✅ Manual edits don't store previousValue
- ✅ Next API update will restore arrow functionality

---

## Pro Tips

### 🎯 Strategy Creation
- Start with empty custom strategy
- Add components one category at a time
- Test with one stock before applying broadly
- Use "Reset to Default" to start over

### 📊 Change Tracking
- Update stocks regularly to build change history
- Watch for large changes (multiple updates with consistent direction)
- Green arrows in momentum metrics = building momentum
- Green arrows in value metrics (reverse) = improving value
- Combine with scoring to prioritize stocks with positive changes

### 🔧 Customization
- All components now track previous values automatically
- Easy to extend arrows to more components
- CSS can be customized for different arrow styles
- reverseColors prop makes any component configurable

---

**Last Updated**: 2025-09-30  
**Version**: 1.0  
**Build**: 95.88 kB gzipped
