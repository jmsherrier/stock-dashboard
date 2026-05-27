// Single source of truth for all criteria available on stock cards.
// Each entry maps an Alpha Vantage field (proxied by our server) to a label
// + formatter. Order within a group is preserved in the picker.

const fmt = {
  currency: (v) => {
    const n = parseFloat(v);
    if (!isFinite(n)) return null;
    return `$${n.toFixed(2)}`;
  },
  percent: (v) => {
    const n = parseFloat(v);
    if (!isFinite(n)) return null;
    return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
  },
  // server returns ratios as decimals (0.27 = 27%)
  decimalPercent: (v) => {
    const n = parseFloat(v);
    if (!isFinite(n)) return null;
    return `${(n * 100).toFixed(2)}%`;
  },
  number: (v) => {
    const n = parseFloat(v);
    if (!isFinite(n)) return null;
    return n.toFixed(2);
  },
  ratio: (v) => {
    const n = parseFloat(v);
    if (!isFinite(n)) return null;
    return `${n.toFixed(2)}x`;
  },
  largeCurrency: (v) => {
    const n = parseFloat(v);
    if (!isFinite(n)) return null;
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
    return `$${n.toFixed(2)}`;
  },
  shareCount: (v) => {
    const n = parseFloat(v);
    if (!isFinite(n)) return null;
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
    return n.toFixed(0);
  },
  text: (v) => (v == null || v === '' ? null : String(v)),
};

// Define criteria. The `key` matches the field the /stocks/quote endpoint
// returns. `group` is purely for UI grouping in the picker.
export const CRITERIA = [
  // Price + movement (shown in card header by default; still selectable)
  { key: 'price', label: 'Price', group: 'Price', format: fmt.currency, header: true },
  { key: 'percentChange', label: 'Change', group: 'Price', format: fmt.percent, header: true },
  { key: 'relativeVolume', label: 'Rel Volume', group: 'Price', format: fmt.ratio },

  // Company
  { key: 'companyName', label: 'Company', group: 'Company', format: fmt.text },
  { key: 'sector', label: 'Sector', group: 'Company', format: fmt.text },
  { key: 'industry', label: 'Industry', group: 'Company', format: fmt.text },
  { key: 'assetType', label: 'Asset Type', group: 'Company', format: fmt.text },

  // Valuation
  { key: 'marketCap', label: 'Market Cap', group: 'Valuation', format: fmt.largeCurrency },
  { key: 'peRatio', label: 'P/E Ratio', group: 'Valuation', format: fmt.number },
  { key: 'forwardPE', label: 'Forward P/E', group: 'Valuation', format: fmt.number },
  { key: 'trailingPE', label: 'Trailing P/E', group: 'Valuation', format: fmt.number },
  { key: 'pegRatio', label: 'PEG Ratio', group: 'Valuation', format: fmt.number },
  { key: 'priceToBook', label: 'P/B Ratio', group: 'Valuation', format: fmt.number },
  { key: 'priceToSales', label: 'P/S Ratio', group: 'Valuation', format: fmt.number },
  { key: 'evToRevenue', label: 'EV / Revenue', group: 'Valuation', format: fmt.number },
  { key: 'evToEbitda', label: 'EV / EBITDA', group: 'Valuation', format: fmt.number },

  // Financials
  { key: 'eps', label: 'EPS', group: 'Financials', format: fmt.currency },
  { key: 'bookValue', label: 'Book Value', group: 'Financials', format: fmt.currency },
  { key: 'ebitda', label: 'EBITDA', group: 'Financials', format: fmt.largeCurrency },
  { key: 'revenuePerShare', label: 'Revenue / Share', group: 'Financials', format: fmt.currency },
  { key: 'dividendPerShare', label: 'Dividend / Share', group: 'Financials', format: fmt.currency },
  { key: 'dividendYield', label: 'Dividend Yield', group: 'Financials', format: fmt.decimalPercent },

  // Margins & Growth
  { key: 'profitMargin', label: 'Profit Margin', group: 'Margins & Growth', format: fmt.decimalPercent },
  { key: 'operatingMargin', label: 'Operating Margin', group: 'Margins & Growth', format: fmt.decimalPercent },
  { key: 'revenueGrowth', label: 'Revenue Growth (YoY)', group: 'Margins & Growth', format: fmt.decimalPercent },
  { key: 'earningsGrowth', label: 'Earnings Growth (YoY)', group: 'Margins & Growth', format: fmt.decimalPercent },
  { key: 'roe', label: 'Return on Equity', group: 'Margins & Growth', format: fmt.decimalPercent },
  { key: 'roa', label: 'Return on Assets', group: 'Margins & Growth', format: fmt.decimalPercent },

  // Technical
  { key: 'beta', label: 'Beta', group: 'Technical', format: fmt.number },
  { key: 'week52High', label: '52W High', group: 'Technical', format: fmt.currency },
  { key: 'week52Low', label: '52W Low', group: 'Technical', format: fmt.currency },
  { key: 'movingAverage50', label: 'MA (50)', group: 'Technical', format: fmt.currency },
  { key: 'movingAverage200', label: 'MA (200)', group: 'Technical', format: fmt.currency },

  // Ownership
  { key: 'sharesOutstanding', label: 'Shares Out', group: 'Ownership', format: fmt.shareCount },
  { key: 'actualFloat', label: 'Float', group: 'Ownership', format: fmt.shareCount },
  { key: 'insiderOwnership', label: 'Insider %', group: 'Ownership', format: fmt.decimalPercent },
  { key: 'institutionalOwnership', label: 'Institutional %', group: 'Ownership', format: fmt.decimalPercent },

  // Analyst
  { key: 'analystTarget', label: 'Analyst Target', group: 'Analyst', format: fmt.currency },
];

export const CRITERIA_BY_KEY = Object.fromEntries(
  CRITERIA.map((c) => [c.key, c])
);

// Default criteria visible on a fresh install
export const DEFAULT_VISIBLE = [
  'marketCap',
  'peRatio',
  'dividendYield',
  'sector',
];

// All groups in display order
export const CRITERIA_GROUPS = (() => {
  const seen = new Set();
  const result = [];
  for (const c of CRITERIA) {
    if (!seen.has(c.group)) {
      seen.add(c.group);
      result.push(c.group);
    }
  }
  return result;
})();
