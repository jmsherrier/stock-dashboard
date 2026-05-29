import { sortStocks } from './sorting';

const mk = (ticker, data, score) => ({
  id: ticker,
  ticker,
  data,
  _score: score != null ? { total: score } : undefined,
});

describe('sortStocks', () => {
  test('sorts by price descending', () => {
    const out = sortStocks(
      [mk('A', { price: '10' }), mk('B', { price: '30' }), mk('C', { price: '20' })],
      { key: 'price', dir: 'desc' }
    );
    expect(out.map((s) => s.ticker)).toEqual(['B', 'C', 'A']);
  });

  test('sorts by price ascending', () => {
    const out = sortStocks(
      [mk('A', { price: '10' }), mk('B', { price: '30' }), mk('C', { price: '20' })],
      { key: 'price', dir: 'asc' }
    );
    expect(out.map((s) => s.ticker)).toEqual(['A', 'C', 'B']);
  });

  test('missing numeric data always sinks to the bottom', () => {
    const out = sortStocks(
      [mk('A', { price: '10' }), mk('B', {}), mk('C', { price: '20' })],
      { key: 'price', dir: 'desc' }
    );
    expect(out[out.length - 1].ticker).toBe('B');
  });

  test('missing data sinks to bottom even when ascending', () => {
    const out = sortStocks(
      [mk('A', { price: '10' }), mk('B', {}), mk('C', { price: '20' })],
      { key: 'price', dir: 'asc' }
    );
    expect(out[out.length - 1].ticker).toBe('B');
  });

  test('sorts by ticker alphabetically', () => {
    const out = sortStocks(
      [mk('GOOG', {}), mk('AAPL', {}), mk('MSFT', {})],
      { key: 'ticker', dir: 'asc' }
    );
    expect(out.map((s) => s.ticker)).toEqual(['AAPL', 'GOOG', 'MSFT']);
  });

  test('sorts by attached _score', () => {
    const out = sortStocks(
      [mk('A', {}, 1), mk('B', {}, 5), mk('C', {}, 3)],
      { key: 'score', dir: 'desc' }
    );
    expect(out.map((s) => s.ticker)).toEqual(['B', 'C', 'A']);
  });

  test('does not mutate the input array', () => {
    const input = [mk('A', { price: '10' }), mk('B', { price: '30' })];
    const copy = [...input];
    sortStocks(input, { key: 'price', dir: 'desc' });
    expect(input).toEqual(copy);
  });
});
