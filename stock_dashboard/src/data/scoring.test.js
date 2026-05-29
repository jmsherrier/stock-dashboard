import { scoreStock, scoreBand, SCORABLE_KEYS } from './scoring';

const stock = (data) => ({ ticker: 'TEST', data });

describe('scoreStock', () => {
  test('sums points only over visible criteria that have data', () => {
    // peRatio 10 → +2 (upTo 15), dividendYield 0.04 → +2 (upTo 0.05)
    const s = scoreStock(stock({ peRatio: '10', dividendYield: '0.04' }), [
      'peRatio',
      'dividendYield',
    ]);
    expect(s.total).toBe(4);
    expect(s.scoredCount).toBe(2);
    expect(s.max).toBe(6); // 2 metrics * 3 max points
  });

  test('ignores criteria that are not visible', () => {
    const s = scoreStock(stock({ peRatio: '10', dividendYield: '0.04' }), [
      'peRatio',
    ]);
    expect(s.total).toBe(2);
    expect(s.scoredCount).toBe(1);
  });

  test('skips criteria with missing or empty data', () => {
    const s = scoreStock(stock({ peRatio: '', dividendYield: null }), [
      'peRatio',
      'dividendYield',
    ]);
    expect(s.scoredCount).toBe(0);
    expect(s.total).toBe(0);
    expect(s.ratio).toBe(0.5); // neutral when nothing scored
  });

  test('non-scorable criteria (e.g. sector) contribute nothing', () => {
    expect(SCORABLE_KEYS.has('sector')).toBe(false);
    const s = scoreStock(stock({ sector: 'Technology', peRatio: '10' }), [
      'sector',
      'peRatio',
    ]);
    expect(s.scoredCount).toBe(1);
    expect(s.total).toBe(2);
  });

  test('penalizes a poor metric (high P/E) with negative points', () => {
    const s = scoreStock(stock({ peRatio: '120' }), ['peRatio']);
    expect(s.total).toBe(-2);
    expect(s.breakdown[0].level).toBe('bad');
  });

  test('ratio normalizes total into 0..1', () => {
    // Two perfect +3 metrics → total 6, max 6 → ratio 1
    const s = scoreStock(stock({ revenueGrowth: '0.6', profitMargin: '0.3' }), [
      'revenueGrowth',
      'profitMargin',
    ]);
    expect(s.total).toBe(6);
    expect(s.ratio).toBe(1);
  });

  test('price-level metrics score relative to current price', () => {
    // price 100, week52High 100 → pct 100 → band upTo Infinity (>100) gives +3
    const s = scoreStock(stock({ price: '100', week52High: '100' }), [
      'week52High',
    ]);
    expect(s.breakdown[0].level).toBe('good');
    expect(s.total).toBeGreaterThan(0);
  });
});

describe('scoreBand', () => {
  test('maps ratios to semantic bands', () => {
    expect(scoreBand(0.9)).toBe('good');
    expect(scoreBand(0.5)).toBe('neutral');
    expect(scoreBand(0.2)).toBe('bad');
  });
});
