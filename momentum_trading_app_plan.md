# Momentum Trading Tracker - Complete Project Plan
## Version History
**v1.0** - Initial plan  
**v1.1** - Added tech stack and API management  
**v1.2** - Updated point scales based on momentum trading principles  
**v1.3** - Added versioning system (reverted to v1.0 content)

## Core Structure
**"Paper Board" Interface**: Dark, sleek grayscale design with individual stock "papers" arranged in a grid or list, automatically sorted by total score (highest first).

## Stock Paper Components

### Header Section
- Ticker symbol (large, prominent)
- Current rank (#1, #2, etc.)
- Total score with color coding
- Small "Update" button and "Remove" button

### Criteria Sections (6-point scale for each)

#### Price ($2-20 range)
- Input field with current price
- Scale display with color coding: $15-20 (---), $10-15 (--), $8-10 (-), $5-8 (+), $3-5 (++), $2-3 (+++)
- Warning indicator if outside $2-20 range

#### % Rise (7%+ minimum)
- Input field for percentage
- Scale: <3% (---), 3-5% (--), 5-7% (-), 7-10% (+), 10-15% (++), 15%+ (+++)
- Warning if below 7%

#### Relative Volume (5x+ minimum)
- Input field for ratio
- Scale: <2x (---), 2-3x (--), 3-5x (-), 5-8x (+), 8-12x (++), 12x+ (+++)
- Warning if below 5x

#### News Catalyst
- Two separate lists: "Positive Catalysts" and "Market Drivers"
- Each entry: Title, link, brief description, custom point value (-3 to +3)
- Add button for each list
- Running total of news points displayed

#### Float (<20M shares)
- Input field for share count
- Scale: >50M (---), 30-50M (--), 20-30M (-), 15-20M (+), 10-15M (++), <10M (+++)
- Warning if over 20M

#### Bonus Checkboxes (+1 each)
- Recent IPO
- Recent Reverse Split  
- Blue Sky Breakout

### Notes Section
- Small text area at bottom of each paper
- Editable, saves automatically

## Data Persistence
Local storage with JSON export/import capability for backup and sharing watchlists.

## Trading Strategy Reference
**Moving average**
* Trade when above moving averages as support
* 9 ema
* 20 ema
* 200 ema
* Volume weighted average price
   * Resistance when below, support when above
* Volume bar
   * High volume buying candles, lower selling volume to enter
* Moving average convergence divergence
   * Relationship between moving averages
   * Price rises when 9 ema grows in relation to 20 ema
   * On first leg of growth before interception is profit