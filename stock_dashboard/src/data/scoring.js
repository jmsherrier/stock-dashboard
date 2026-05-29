// Range-based scoring engine.
//
// Each scorable metric maps a raw API value to a points contribution and a
// qualitative level (good / neutral / bad). The overall stock score is the
// sum of points across the criteria that are CURRENTLY VISIBLE and have data.
// This makes the score reflect the active strategy view: surface value
// metrics and the score expresses value quality; surface momentum metrics and
// it expresses momentum. The scoring thesis is "quality + momentum" — broadly
// sensible signals (volume surge, proximity to highs, growth, profitability,
// reasonable valuation, conviction ownership).
//
// IMPORTANT: ranges are expressed in the units the server actually returns.
// Alpha Vantage returns margins / growth / ownership / dividend yield as
// DECIMALS (0.27 = 27%); ratios and prices as plain numbers; 52-week and
// moving-average fields as PRICE LEVELS (so we derive a % vs current price).

const levelOf = (pts) => (pts > 0 ? 'good' : pts < 0 ? 'bad' : 'neutral');

// Build a band scorer. `bands` is ascending by `upTo`; the matching band is
// the first whose `upTo` strictly exceeds the value. Last band should use
// Infinity. Returns null when the value isn't a finite number.
function bands(spec) {
  return (value) => {
    const n = parseFloat(value);
    if (!isFinite(n)) return null;
    for (const b of spec) {
      if (n < b.upTo) return { points: b.pts, level: levelOf(b.pts) };
    }
    return { points: 0, level: 'neutral' };
  };
}

// Build a scorer for metrics that are price levels: score the ratio
// (price / level) * 100, i.e. "current price as a % of this level".
function pctOfPrice(spec, { invert = false } = {}) {
  const inner = bands(spec);
  return (value, data) => {
    const level = parseFloat(value);
    const price = parseFloat(data?.price);
    if (!isFinite(level) || !isFinite(price) || level === 0) return null;
    const pct = invert ? (level / price) * 100 : (price / level) * 100;
    return inner(pct);
  };
}

// Scorers keyed by criterion key. Only keys present here are scorable.
export const SCORERS = {
  // --- Price action / momentum ---
  percentChange: bands([
    { upTo: 0, pts: -2 },
    { upTo: 3, pts: -1 },
    { upTo: 5, pts: 0 },
    { upTo: 10, pts: 1 },
    { upTo: 15, pts: 2 },
    { upTo: Infinity, pts: 3 },
  ]),
  relativeVolume: bands([
    { upTo: 1, pts: -2 },
    { upTo: 2, pts: -1 },
    { upTo: 3, pts: 0 },
    { upTo: 5, pts: 1 },
    { upTo: 10, pts: 2 },
    { upTo: Infinity, pts: 3 },
  ]),
  beta: bands([
    { upTo: 0.5, pts: -1 },
    { upTo: 1.0, pts: 0 },
    { upTo: 1.5, pts: 1 },
    { upTo: 2.5, pts: 2 },
    { upTo: 4.0, pts: 1 },
    { upTo: Infinity, pts: 0 },
  ]),

  // --- Technical (price-level metrics → % of current price) ---
  // Near or above the 52-week high is bullish.
  week52High: pctOfPrice([
    { upTo: 50, pts: -2 },
    { upTo: 70, pts: -1 },
    { upTo: 85, pts: 0 },
    { upTo: 95, pts: 1 },
    { upTo: 100, pts: 2 },
    { upTo: Infinity, pts: 3 },
  ]),
  // Far above the 52-week low is healthier than sitting on it.
  week52Low: pctOfPrice([
    { upTo: 110, pts: -2 },
    { upTo: 125, pts: -1 },
    { upTo: 150, pts: 0 },
    { upTo: 200, pts: 1 },
    { upTo: Infinity, pts: 2 },
  ]),
  // Trading above moving averages is bullish.
  movingAverage50: pctOfPrice([
    { upTo: 95, pts: -2 },
    { upTo: 100, pts: -1 },
    { upTo: 105, pts: 1 },
    { upTo: 115, pts: 2 },
    { upTo: Infinity, pts: 1 },
  ]),
  movingAverage200: pctOfPrice([
    { upTo: 95, pts: -2 },
    { upTo: 100, pts: -1 },
    { upTo: 105, pts: 1 },
    { upTo: 120, pts: 2 },
    { upTo: Infinity, pts: 1 },
  ]),
  // Analyst target above price implies upside.
  analystTarget: pctOfPrice(
    [
      { upTo: 95, pts: -2 },
      { upTo: 105, pts: 0 },
      { upTo: 120, pts: 1 },
      { upTo: 140, pts: 2 },
      { upTo: Infinity, pts: 3 },
    ],
    { invert: true } // target/price
  ),

  // --- Valuation (lower generally better) ---
  peRatio: bands([
    { upTo: 0, pts: -1 }, // negative earnings
    { upTo: 15, pts: 2 },
    { upTo: 25, pts: 1 },
    { upTo: 40, pts: 0 },
    { upTo: Infinity, pts: -2 },
  ]),
  forwardPE: bands([
    { upTo: 0, pts: -1 },
    { upTo: 12, pts: 2 },
    { upTo: 20, pts: 1 },
    { upTo: 30, pts: 0 },
    { upTo: Infinity, pts: -2 },
  ]),
  trailingPE: bands([
    { upTo: 0, pts: -1 },
    { upTo: 15, pts: 2 },
    { upTo: 25, pts: 1 },
    { upTo: 40, pts: 0 },
    { upTo: Infinity, pts: -2 },
  ]),
  pegRatio: bands([
    { upTo: 0, pts: 0 },
    { upTo: 1, pts: 3 },
    { upTo: 1.5, pts: 2 },
    { upTo: 2, pts: 1 },
    { upTo: 3, pts: -1 },
    { upTo: Infinity, pts: -2 },
  ]),
  priceToBook: bands([
    { upTo: 1, pts: 3 },
    { upTo: 2, pts: 2 },
    { upTo: 3, pts: 1 },
    { upTo: 5, pts: -1 },
    { upTo: Infinity, pts: -2 },
  ]),
  priceToSales: bands([
    { upTo: 1, pts: 3 },
    { upTo: 2, pts: 2 },
    { upTo: 4, pts: 1 },
    { upTo: 7, pts: -1 },
    { upTo: Infinity, pts: -2 },
  ]),
  evToRevenue: bands([
    { upTo: 1, pts: 3 },
    { upTo: 3, pts: 2 },
    { upTo: 6, pts: 1 },
    { upTo: 10, pts: 0 },
    { upTo: Infinity, pts: -2 },
  ]),
  evToEbitda: bands([
    { upTo: 5, pts: 3 },
    { upTo: 10, pts: 2 },
    { upTo: 15, pts: 1 },
    { upTo: 25, pts: 0 },
    { upTo: Infinity, pts: -2 },
  ]),

  // --- Financials / profitability (decimals) ---
  eps: bands([
    { upTo: 0, pts: -1 },
    { upTo: 0.5, pts: 0 },
    { upTo: 1.5, pts: 1 },
    { upTo: 3, pts: 2 },
    { upTo: Infinity, pts: 3 },
  ]),
  dividendYield: bands([
    { upTo: 0.01, pts: -1 },
    { upTo: 0.02, pts: 0 },
    { upTo: 0.03, pts: 1 },
    { upTo: 0.05, pts: 2 },
    { upTo: 0.07, pts: 3 },
    { upTo: 0.1, pts: 2 },
    { upTo: Infinity, pts: 0 },
  ]),
  profitMargin: bands([
    { upTo: -0.1, pts: -3 },
    { upTo: 0, pts: -1 },
    { upTo: 0.05, pts: 0 },
    { upTo: 0.1, pts: 1 },
    { upTo: 0.2, pts: 2 },
    { upTo: Infinity, pts: 3 },
  ]),
  operatingMargin: bands([
    { upTo: 0, pts: -2 },
    { upTo: 0.05, pts: -1 },
    { upTo: 0.1, pts: 0 },
    { upTo: 0.15, pts: 1 },
    { upTo: 0.25, pts: 2 },
    { upTo: Infinity, pts: 3 },
  ]),
  revenueGrowth: bands([
    { upTo: 0, pts: -2 },
    { upTo: 0.1, pts: 0 },
    { upTo: 0.25, pts: 1 },
    { upTo: 0.5, pts: 2 },
    { upTo: Infinity, pts: 3 },
  ]),
  earningsGrowth: bands([
    { upTo: 0, pts: -2 },
    { upTo: 0.1, pts: 0 },
    { upTo: 0.25, pts: 1 },
    { upTo: 0.5, pts: 2 },
    { upTo: Infinity, pts: 3 },
  ]),
  roe: bands([
    { upTo: 0, pts: -3 },
    { upTo: 0.05, pts: -2 },
    { upTo: 0.1, pts: -1 },
    { upTo: 0.15, pts: 1 },
    { upTo: 0.2, pts: 2 },
    { upTo: Infinity, pts: 3 },
  ]),
  roa: bands([
    { upTo: 0, pts: -3 },
    { upTo: 0.02, pts: -2 },
    { upTo: 0.05, pts: -1 },
    { upTo: 0.08, pts: 1 },
    { upTo: 0.12, pts: 2 },
    { upTo: Infinity, pts: 3 },
  ]),

  // --- Ownership (decimals) ---
  insiderOwnership: bands([
    { upTo: 0.05, pts: -1 },
    { upTo: 0.1, pts: 1 },
    { upTo: 0.2, pts: 2 },
    { upTo: 0.4, pts: 3 },
    { upTo: Infinity, pts: 1 },
  ]),
  institutionalOwnership: bands([
    { upTo: 0.2, pts: -1 },
    { upTo: 0.4, pts: 0 },
    { upTo: 0.6, pts: 1 },
    { upTo: 0.8, pts: 2 },
    { upTo: Infinity, pts: 1 },
  ]),
};

export const SCORABLE_KEYS = new Set(Object.keys(SCORERS));

// The best-case points a single metric can contribute, used to compute a
// score ceiling for color normalization.
const MAX_POINTS_PER_METRIC = 3;

/**
 * Score a stock against a set of visible criteria.
 * @returns {{ total:number, max:number, ratio:number, breakdown:Array }}
 *   breakdown entries: { key, points, level }
 */
export function scoreStock(stock, visibleCriteria) {
  const data = stock?.data || {};
  let total = 0;
  let scoredCount = 0;
  const breakdown = [];

  for (const key of visibleCriteria) {
    const scorer = SCORERS[key];
    if (!scorer) continue;
    const raw = data[key];
    if (raw == null || raw === '') continue;
    const result = scorer(raw, data);
    if (!result) continue;
    total += result.points;
    scoredCount += 1;
    breakdown.push({ key, points: result.points, level: result.level });
  }

  const max = scoredCount * MAX_POINTS_PER_METRIC;
  // Normalize to 0..1 across the theoretical [-max, +max] range.
  const ratio = max > 0 ? (total + max) / (2 * max) : 0.5;

  return { total, max, ratio, breakdown, scoredCount };
}

// Map a score ratio (0..1) to a semantic band for badge coloring.
export function scoreBand(ratio) {
  if (ratio >= 0.66) return 'good';
  if (ratio >= 0.4) return 'neutral';
  return 'bad';
}
