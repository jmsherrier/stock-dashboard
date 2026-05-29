// Sort options for the stock grid. `score` is computed by the caller and
// attached as `_score` on each stock before sorting.

export const SORT_OPTIONS = [
  { key: 'score', label: 'Score' },
  { key: 'ticker', label: 'Ticker' },
  { key: 'price', label: 'Price' },
  { key: 'percentChange', label: '% Change' },
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'added', label: 'Recently added' },
];

function valueFor(stock, key) {
  switch (key) {
    case 'score':
      return stock._score?.total ?? -Infinity;
    case 'ticker':
      return stock.ticker || '';
    case 'price':
      return parseFloat(stock.data?.price);
    case 'percentChange':
      return parseFloat(stock.data?.percentChange);
    case 'marketCap':
      return parseFloat(stock.data?.marketCap);
    case 'added':
      // Newer stocks are inserted at the front; preserve insertion order.
      return 0;
    default:
      return 0;
  }
}

export function sortStocks(stocks, { key, dir }) {
  if (key === 'added') {
    return dir === 'asc' ? [...stocks].reverse() : stocks;
  }

  const factor = dir === 'asc' ? 1 : -1;
  const isText = key === 'ticker';

  return [...stocks].sort((a, b) => {
    const va = valueFor(a, key);
    const vb = valueFor(b, key);

    if (isText) {
      return factor * String(va).localeCompare(String(vb));
    }

    const na = isFinite(va) ? va : -Infinity;
    const nb = isFinite(vb) ? vb : -Infinity;
    // Missing data always sinks to the bottom regardless of direction.
    if (na === -Infinity && nb !== -Infinity) return 1;
    if (nb === -Infinity && na !== -Infinity) return -1;
    return factor * (na - nb);
  });
}
