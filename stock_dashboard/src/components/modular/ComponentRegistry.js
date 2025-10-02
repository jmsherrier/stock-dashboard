// Component registry for modular paper system

// Info components
import TickerComponent from './info/TickerComponent';
import CompanyNameComponent from './info/CompanyNameComponent';
import CompanyDescriptionComponent from './info/CompanyDescriptionComponent';
import SectorComponent from './info/SectorComponent';
import IndustryComponent from './info/IndustryComponent';
import AssetTypeComponent from './info/AssetTypeComponent';
import NewsComponent from './info/NewsComponent';
import NotesComponent from './info/NotesComponent';
import BonusChecksComponent from './info/BonusChecksComponent';

// Scoring components
import PriceComponent from './scoring/PriceComponent';
import PercentRiseComponent from './scoring/PercentRiseComponent';
import FloatComponent from './scoring/FloatComponent';
import SharesOutstandingComponent from './scoring/SharesOutstandingComponent';
import RestrictedSharesComponent from './scoring/RestrictedSharesComponent';
import MarketCapComponent from './scoring/MarketCapComponent';
import BetaComponent from './scoring/BetaComponent';
import PERatioComponent from './scoring/PERatioComponent';
import AnalystTargetComponent from './scoring/AnalystTargetComponent';
import PEGRatioComponent from './scoring/PEGRatioComponent';
import PriceToBookComponent from './scoring/PriceToBookComponent';
import ROEComponent from './scoring/ROEComponent';
import DividendYieldComponent from './scoring/DividendYieldComponent';
import EPSComponent from './scoring/EPSComponent';
import OperatingMarginComponent from './scoring/OperatingMarginComponent';
import InstitutionalOwnershipComponent from './scoring/InstitutionalOwnershipComponent';
import ForwardPEComponent from './scoring/ForwardPEComponent';
import PriceToSalesComponent from './scoring/PriceToSalesComponent';
import BookValueComponent from './scoring/BookValueComponent';
import EBITDAComponent from './scoring/EBITDAComponent';
import EarningsGrowthComponent from './scoring/EarningsGrowthComponent';
import InsiderOwnershipComponent from './scoring/InsiderOwnershipComponent';
import ROAComponent from './scoring/ROAComponent';
import TrailingPEComponent from './scoring/TrailingPEComponent';
import DividendPerShareComponent from './scoring/DividendPerShareComponent';
import EVToRevenueComponent from './scoring/EVToRevenueComponent';
import EVToEBITDAComponent from './scoring/EVToEBITDAComponent';
import RevenuePerShareComponent from './scoring/RevenuePerShareComponent';
import AnalystRatingsComponent from './scoring/AnalystRatingsComponent';
import ProfitMarginComponent from './scoring/ProfitMarginComponent';
import RevenueGrowthComponent from './scoring/RevenueGrowthComponent';

// Technical components
import RelativeVolumeComponent from './technical/RelativeVolumeComponent';
import MovingAverage50Component from './technical/MovingAverage50Component';
import MovingAverage200Component from './technical/MovingAverage200Component';
import Week52HighComponent from './technical/Week52HighComponent';
import Week52LowComponent from './technical/Week52LowComponent';

export const COMPONENT_REGISTRY = {
  ticker: {
    id: 'ticker',
    name: 'Ticker Symbol',
    description: 'Stock ticker symbol',
    component: TickerComponent,
    required: true,
    removable: false,
    category: 'core',
    defaultSize: 'small'
  },
  price: {
    id: 'price',
    name: 'Price',
    description: 'Current stock price',
    component: PriceComponent,
    required: false,
    category: 'Price & Momentum',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 1, points: -2, color: 'red' },            // Sub-dollar (high risk)
        { min: 1, max: 2, points: 1, color: 'green' },           // Low price momentum plays
        { min: 2, max: 5, points: 2, color: 'green' },           // Ideal momentum range
        { min: 5, max: 10, points: 1, color: 'green' },          // Mid-range momentum
        { min: 10, max: 20, points: 0, color: 'orange' },        // Higher capital requirement
        { min: 20, max: 50, points: -1, color: 'orange' },       // Large position cost
        { min: 50, max: Infinity, points: -2, color: 'red' }     // Very expensive per share
      ]
    }
  },
  percentRise: {
    id: 'percentRise',
    name: 'Percent Rise',
    description: 'Daily percentage change',
    component: PercentRiseComponent,
    required: false,
    category: 'Price & Momentum',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: 3, points: -3, color: 'red' },
        { min: 3, max: 5, points: -2, color: 'red' },
        { min: 5, max: 7, points: -1, color: 'orange' },
        { min: 7, max: 10, points: 1, color: 'green' },
        { min: 10, max: 15, points: 2, color: 'green' },
        { min: 15, max: Infinity, points: 3, color: 'green' }
      ]
    }
  },
  relativeVolume: {
    id: 'relativeVolume',
    name: 'Relative Volume',
    description: 'Volume relative to average',
    component: RelativeVolumeComponent,
    required: false,
    category: 'Volume & Float',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 1, points: -3, color: 'red' },            // Very low interest
        { min: 1, max: 2, points: -2, color: 'red' },            // Below average volume
        { min: 2, max: 3, points: -1, color: 'orange' },         // Slightly low volume
        { min: 3, max: 5, points: 1, color: 'green' },           // Good volume increase
        { min: 5, max: 10, points: 2, color: 'green' },          // Strong volume
        { min: 10, max: 20, points: 3, color: 'green' },         // Exceptional volume
        { min: 20, max: Infinity, points: 1, color: 'orange' }   // Extreme spike (may reverse)
      ]
    }
  },
  float: {
    id: 'float',
    name: 'Float',
    description: 'Free float shares (auto-calculated from outstanding - restricted)',
    component: FloatComponent,
    required: false,
    category: 'Volume & Float',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 10, points: 3, color: 'green' },
        { min: 10, max: 15, points: 1, color: 'green' },
        { min: 15, max: 20, points: -1, color: 'orange' },
        { min: 20, max: 30, points: -2, color: 'red' },
        { min: 30, max: 50, points: -2, color: 'red' },
        { min: 50, max: Infinity, points: -3, color: 'red' }
      ]
    }
  },
  sharesOutstanding: {
    id: 'sharesOutstanding',
    name: 'Shares Outstanding',
    description: 'Total shares outstanding',
    component: SharesOutstandingComponent,
    required: false,
    category: 'Company Size',
    defaultSize: 'small',
    scoring: 'range',
    criteria: {
      ranges: [
        { min: 0, max: 10000000, points: 3, color: 'green', label: 'Micro (< 10M)' },
        { min: 10000000, max: 50000000, points: 2, color: 'green', label: 'Small (10M-50M)' },
        { min: 50000000, max: 200000000, points: 1, color: 'orange', label: 'Medium (50M-200M)' },
        { min: 200000000, max: Infinity, points: 0, color: 'red', label: 'Large (> 200M)' }
      ]
    }
  },
  restrictedShares: {
    id: 'restrictedShares',
    name: 'Restricted Shares',
    description: 'Restricted/insider shares',
    component: RestrictedSharesComponent,
    required: false,
    category: 'Company Size',
    defaultSize: 'small',
    scoring: 'range',
    criteria: {
      ranges: [
        { min: 0, max: 1000000, points: 3, color: 'green', label: 'Very Low (< 1M)' },
        { min: 1000000, max: 5000000, points: 2, color: 'green', label: 'Low (1M-5M)' },
        { min: 5000000, max: 20000000, points: 1, color: 'orange', label: 'Moderate (5M-20M)' },
        { min: 20000000, max: Infinity, points: 0, color: 'red', label: 'High (> 20M)' }
      ]
    }
  },
  news: {
    id: 'news',
    name: 'News & Catalysts',
    description: 'News items and catalysts',
    component: NewsComponent,
    required: false,
    category: 'analysis',
    defaultSize: 'large',
    scoring: true
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    description: 'Personal notes and observations',
    component: NotesComponent,
    required: false,
    category: 'analysis',
    defaultSize: 'large',
    scoring: false
  },
  bonusChecks: {
    id: 'bonusChecks',
    name: 'Bonus Criteria',
    description: 'Additional scoring criteria',
    component: BonusChecksComponent,
    required: false,
    category: 'scoring',
    defaultSize: 'medium',
    scoring: true
  },
  marketCap: {
    id: 'marketCap',
    name: 'Market Cap',
    description: 'Total market capitalization',
    component: MarketCapComponent,
    required: false,
    category: 'Company Size',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 50, points: 2, color: 'green' },           // Micro cap
        { min: 50, max: 300, points: 1, color: 'green' },         // Small cap
        { min: 300, max: 2000, points: 0, color: 'orange' },      // Mid cap
        { min: 2000, max: 10000, points: -1, color: 'orange' },   // Large cap
        { min: 10000, max: Infinity, points: -2, color: 'red' }   // Mega cap
      ]
    }
  },
  beta: {
    id: 'beta',
    name: 'Beta',
    description: 'Volatility relative to market',
    component: BetaComponent,
    required: false,
    category: 'Technical Indicators',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: 0.5, points: -3, color: 'red' },   // Too stable (no movement)
        { min: 0.5, max: 1.0, points: -1, color: 'orange' },      // Low volatility
        { min: 1.0, max: 1.5, points: 1, color: 'green' },        // Market-like volatility
        { min: 1.5, max: 2.5, points: 2, color: 'green' },        // Good volatility for swings
        { min: 2.5, max: 4.0, points: 3, color: 'green' },        // High volatility (big moves)
        { min: 4.0, max: Infinity, points: 1, color: 'orange' }   // Extreme volatility (risky)
      ]
    }
  },
  week52High: {
    id: 'week52High',
    name: '52-Week High %',
    description: 'Current price as % of 52-week high',
    component: Week52HighComponent,
    required: false,
    category: 'Technical Indicators',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 50, points: -2, color: 'red' },            // Far from high
        { min: 50, max: 70, points: -1, color: 'orange' },        // Below high
        { min: 70, max: 85, points: 0, color: 'orange' },         // Approaching high
        { min: 85, max: 95, points: 1, color: 'green' },          // Near high
        { min: 95, max: 99, points: 2, color: 'green' },          // Very close
        { min: 99, max: 100, points: 2, color: 'green' },         // At high
        { min: 100, max: Infinity, points: 3, color: 'green' }    // New high!
      ]
    }
  },
  week52Low: {
    id: 'week52Low',
    name: '52-Week Low %',
    description: 'Current price as % above 52-week low',
    component: Week52LowComponent,
    required: false,
    category: 'Technical Indicators',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 10, points: -3, color: 'red' },            // At/near low
        { min: 10, max: 25, points: -2, color: 'red' },           // Close to low
        { min: 25, max: 50, points: -1, color: 'orange' },        // Below midpoint
        { min: 50, max: 100, points: 0, color: 'orange' },        // Above midpoint
        { min: 100, max: 200, points: 1, color: 'green' },        // Well above low
        { min: 200, max: 500, points: 2, color: 'green' },        // Far above low
        { min: 500, max: Infinity, points: 3, color: 'green' }    // Very high above low
      ]
    }
  },
  movingAverage50: {
    id: 'movingAverage50',
    name: '50-Day MA',
    description: '50-day moving average',
    component: MovingAverage50Component,
    required: false,
    category: 'Technical Indicators',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: 90, points: -2, color: 'red' },    // Well below
        { min: 90, max: 95, points: -1, color: 'orange' },        // Below
        { min: 95, max: 100, points: 0, color: 'orange' },        // At MA
        { min: 100, max: 105, points: 1, color: 'green' },        // Slightly above
        { min: 105, max: 110, points: 2, color: 'green' },        // Above
        { min: 110, max: Infinity, points: 2, color: 'green' }    // Well above
      ]
    }
  },
  movingAverage200: {
    id: 'movingAverage200',
    name: '200-Day MA',
    description: '200-day moving average',
    component: MovingAverage200Component,
    required: false,
    category: 'Technical Indicators',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: 90, points: -2, color: 'red' },    // Well below
        { min: 90, max: 95, points: -1, color: 'orange' },        // Below
        { min: 95, max: 100, points: 0, color: 'orange' },        // At MA
        { min: 100, max: 105, points: 1, color: 'green' },        // Slightly above
        { min: 105, max: 110, points: 2, color: 'green' },        // Above
        { min: 110, max: Infinity, points: 2, color: 'green' }    // Well above
      ]
    }
  },
  sector: {
    id: 'sector',
    name: 'Sector',
    description: 'Market sector',
    component: SectorComponent,
    required: false,
    category: 'Classification',
    defaultSize: 'small',
    scoring: 'categorical',
    categories: [
      'Technology',
      'Healthcare',
      'Financial Services',
      'Consumer Cyclical',
      'Industrials',
      'Energy',
      'Real Estate',
      'Communication Services',
      'Consumer Defensive',
      'Utilities',
      'Basic Materials'
    ],
    criteria: {
      categories: {}
    }
  },
  industry: {
    id: 'industry',
    name: 'Industry',
    description: 'Industry classification',
    component: IndustryComponent,
    required: false,
    category: 'Classification',
    defaultSize: 'small',
    scoring: 'categorical',
    categories: [
      'Software - Application',
      'Software - Infrastructure',
      'Semiconductors',
      'Internet Content & Information',
      'Electronic Components',
      'Computer Hardware',
      'Biotechnology',
      'Drug Manufacturers',
      'Medical Devices',
      'Diagnostics & Research',
      'Banks',
      'Insurance',
      'Asset Management',
      'Credit Services',
      'Auto Manufacturers',
      'Aerospace & Defense',
      'Construction',
      'Retail',
      'Restaurants',
      'Entertainment',
      'Other'
    ],
    criteria: {
      categories: {}
    }
  },
  profitMargin: {
    id: 'profitMargin',
    name: 'Profit Margin',
    description: 'Net profit margin percentage',
    component: ProfitMarginComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: -10, points: -3, color: 'red' },   // Deeply unprofitable
        { min: -10, max: 0, points: -1, color: 'orange' },        // Unprofitable (growth stage)
        { min: 0, max: 5, points: 0, color: 'orange' },           // Low margin
        { min: 5, max: 10, points: 1, color: 'green' },           // Acceptable margin
        { min: 10, max: 20, points: 2, color: 'green' },          // Good margin
        { min: 20, max: 30, points: 3, color: 'green' },          // Strong margin
        { min: 30, max: Infinity, points: 3, color: 'green' }     // Excellent margin
      ]
    }
  },
  revenueGrowth: {
    id: 'revenueGrowth',
    name: 'Revenue Growth',
    description: 'Quarterly revenue growth YoY',
    component: RevenueGrowthComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: 0, points: -2, color: 'red' },     // Declining
        { min: 0, max: 10, points: 0, color: 'orange' },          // Slow growth
        { min: 10, max: 25, points: 1, color: 'green' },          // Moderate growth
        { min: 25, max: 50, points: 2, color: 'green' },          // Strong growth
        { min: 50, max: Infinity, points: 3, color: 'green' }     // Explosive growth
      ]
    }
  },
  peRatio: {
    id: 'peRatio',
    name: 'P/E Ratio',
    description: 'Price-to-earnings ratio',
    component: PERatioComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: 0, points: 0, color: 'orange' },   // Negative earnings
        { min: 0, max: 15, points: 1, color: 'green' },           // Undervalued
        { min: 15, max: 30, points: 0, color: 'orange' },         // Fair value
        { min: 30, max: Infinity, points: -1, color: 'red' }      // Overvalued
      ]
    }
  },
  analystTarget: {
    id: 'analystTarget',
    name: 'Analyst Target',
    description: 'Analyst price target vs current price',
    component: AnalystTargetComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: 90, points: -2, color: 'red' },    // Target below price
        { min: 90, max: 100, points: -1, color: 'orange' },       // Target near price
        { min: 100, max: 110, points: 0, color: 'orange' },       // Slight upside
        { min: 110, max: 125, points: 1, color: 'green' },        // Moderate upside
        { min: 125, max: 150, points: 2, color: 'green' },        // Good upside
        { min: 150, max: Infinity, points: 3, color: 'green' }    // Significant upside
      ]
    }
  },
  pegRatio: {
    id: 'pegRatio',
    name: 'PEG Ratio',
    description: 'Price/Earnings to Growth ratio',
    component: PEGRatioComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 1, points: 3, color: 'green' },            // Excellent value
        { min: 1, max: 1.5, points: 2, color: 'green' },          // Good value
        { min: 1.5, max: 2, points: 1, color: 'green' },          // Fair value
        { min: 2, max: 3, points: -1, color: 'orange' },          // Slightly expensive
        { min: 3, max: Infinity, points: -2, color: 'red' }       // Overvalued
      ]
    }
  },
  priceToBook: {
    id: 'priceToBook',
    name: 'Price-to-Book',
    description: 'Price to book value ratio',
    component: PriceToBookComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 1, points: 3, color: 'green' },            // Deeply undervalued
        { min: 1, max: 2, points: 2, color: 'green' },            // Undervalued
        { min: 2, max: 3, points: 1, color: 'green' },            // Fair value
        { min: 3, max: 5, points: -1, color: 'orange' },          // Slightly expensive
        { min: 5, max: Infinity, points: -2, color: 'red' }       // Overvalued
      ]
    }
  },
  roe: {
    id: 'roe',
    name: 'Return on Equity',
    description: 'Return on equity percentage',
    component: ROEComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: 0, points: -3, color: 'red' },     // Negative ROE
        { min: 0, max: 5, points: -2, color: 'red' },             // Very poor (0-5%)
        { min: 5, max: 10, points: -1, color: 'orange' },         // Below average (5-10%)
        { min: 10, max: 15, points: 1, color: 'green' },          // Average (10-15%)
        { min: 15, max: 20, points: 2, color: 'green' },          // Good (15-20%)
        { min: 20, max: 30, points: 3, color: 'green' },          // Excellent (20-30%)
        { min: 30, max: Infinity, points: 3, color: 'green' }     // Outstanding (30%+)
      ]
    }
  },
  dividendYield: {
    id: 'dividendYield',
    name: 'Dividend Yield',
    description: 'Annual dividend yield percentage',
    component: DividendYieldComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 1, points: -1, color: 'red' },             // No dividend
        { min: 1, max: 2, points: 0, color: 'orange' },           // Low yield (1-2%)
        { min: 2, max: 3, points: 1, color: 'green' },            // Moderate yield (2-3%)
        { min: 3, max: 5, points: 2, color: 'green' },            // Good yield (3-5%)
        { min: 5, max: 7, points: 3, color: 'green' },            // Strong yield (5-7%)
        { min: 7, max: 10, points: 2, color: 'green' },           // High yield (7-10%)
        { min: 10, max: Infinity, points: 0, color: 'orange' }    // Very high (unsustainable risk)
      ]
    }
  },
  eps: {
    id: 'eps',
    name: 'EPS',
    description: 'Earnings per share',
    component: EPSComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: -1, points: -3, color: 'red' },    // Deeply negative earnings
        { min: -1, max: 0, points: -1, color: 'orange' },         // Negative (growth stage OK)
        { min: 0, max: 0.5, points: 0, color: 'orange' },         // Minimal earnings
        { min: 0.5, max: 1.5, points: 1, color: 'green' },        // Low but positive
        { min: 1.5, max: 3, points: 2, color: 'green' },          // Moderate earnings
        { min: 3, max: 5, points: 3, color: 'green' },            // Strong earnings
        { min: 5, max: Infinity, points: 3, color: 'green' }      // Excellent earnings
      ]
    }
  },
  operatingMargin: {
    id: 'operatingMargin',
    name: 'Operating Margin',
    description: 'Operating profit margin percentage',
    component: OperatingMarginComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 0.05, points: -2, color: 'red' },          // Poor (0-5%)
        { min: 0.05, max: 0.10, points: -1, color: 'orange' },    // Below average (5-10%)
        { min: 0.10, max: 0.15, points: 1, color: 'green' },      // Average (10-15%)
        { min: 0.15, max: 0.25, points: 2, color: 'green' },      // Good (15-25%)
        { min: 0.25, max: Infinity, points: 3, color: 'green' }   // Excellent (25%+)
      ]
    }
  },
  institutionalOwnership: {
    id: 'institutionalOwnership',
    name: 'Institutional Ownership',
    description: 'Percentage owned by institutions',
    component: InstitutionalOwnershipComponent,
    required: false,
    category: 'Technical Indicators',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 0.20, points: -1, color: 'orange' },       // Low institutional (0-20%)
        { min: 0.20, max: 0.40, points: 0, color: 'orange' },     // Moderate (20-40%)
        { min: 0.40, max: 0.60, points: 1, color: 'green' },      // Good (40-60%)
        { min: 0.60, max: 0.80, points: 2, color: 'green' },      // Strong (60-80%)
        { min: 0.80, max: Infinity, points: 1, color: 'green' }   // Very high (80%+, less volatile)
      ]
    }
  },
  forwardPE: {
    id: 'forwardPE',
    name: 'Forward P/E',
    description: 'Forward price-to-earnings ratio',
    component: ForwardPEComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 10, points: 3, color: 'green' },           // Deeply undervalued
        { min: 10, max: 15, points: 2, color: 'green' },          // Undervalued
        { min: 15, max: 20, points: 1, color: 'green' },          // Fair value
        { min: 20, max: 30, points: -1, color: 'orange' },        // Slightly expensive
        { min: 30, max: Infinity, points: -2, color: 'red' }      // Overvalued
      ]
    }
  },
  trailingPE: {
    id: 'trailingPE',
    name: 'Trailing P/E',
    description: 'Trailing twelve month P/E ratio',
    component: TrailingPEComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 12, points: 3, color: 'green' },           // Deeply undervalued
        { min: 12, max: 18, points: 2, color: 'green' },          // Undervalued
        { min: 18, max: 25, points: 1, color: 'green' },          // Fair value
        { min: 25, max: 35, points: -1, color: 'orange' },        // Slightly expensive
        { min: 35, max: Infinity, points: -2, color: 'red' }      // Overvalued
      ]
    }
  },
  dividendPerShare: {
    id: 'dividendPerShare',
    name: 'Dividend Per Share',
    description: 'Annual dividend payment per share',
    component: DividendPerShareComponent,
    required: false,
    category: 'Financial Metrics',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 0, points: -1, color: 'red' },            // No dividend
        { min: 0.01, max: 1.00, points: 0, color: 'orange' },    // Low dividend
        { min: 1.01, max: 2.00, points: 1, color: 'green' },     // Moderate dividend
        { min: 2.01, max: 4.00, points: 2, color: 'green' },     // Good dividend
        { min: 4.01, max: Infinity, points: 3, color: 'green' }  // High dividend
      ]
    }
  },
  evToRevenue: {
    id: 'evToRevenue',
    name: 'EV/Revenue',
    description: 'Enterprise Value to Revenue ratio',
    component: EVToRevenueComponent,
    required: false,
    category: 'Valuation Ratios',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 1, points: 3, color: 'green' },           // Very undervalued
        { min: 1, max: 3, points: 2, color: 'green' },           // Undervalued
        { min: 3, max: 6, points: 1, color: 'orange' },          // Fair value
        { min: 6, max: 10, points: 0, color: 'orange' },         // Overvalued
        { min: 10, max: Infinity, points: -2, color: 'red' }     // Very overvalued
      ]
    }
  },
  evToEbitda: {
    id: 'evToEbitda',
    name: 'EV/EBITDA',
    description: 'Enterprise Value to EBITDA ratio',
    component: EVToEBITDAComponent,
    required: false,
    category: 'Valuation Ratios',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 5, points: 3, color: 'green' },           // Very undervalued
        { min: 5, max: 10, points: 2, color: 'green' },          // Undervalued
        { min: 10, max: 15, points: 1, color: 'orange' },        // Fair value
        { min: 15, max: 25, points: 0, color: 'orange' },        // Overvalued
        { min: 25, max: Infinity, points: -2, color: 'red' }     // Very overvalued
      ]
    }
  },
  revenuePerShare: {
    id: 'revenuePerShare',
    name: 'Revenue Per Share',
    description: 'Revenue per share TTM',
    component: RevenuePerShareComponent,
    required: false,
    category: 'Financial Metrics',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 10, points: -1, color: 'red' },           // Low revenue/share
        { min: 10, max: 25, points: 0, color: 'orange' },        // Below average
        { min: 25, max: 50, points: 1, color: 'green' },         // Average
        { min: 50, max: 100, points: 2, color: 'green' },        // Good
        { min: 100, max: Infinity, points: 3, color: 'green' }   // Excellent
      ]
    }
  },
  analystRatings: {
    id: 'analystRatings',
    name: 'Analyst Ratings',
    description: 'Analyst buy/sell recommendations',
    component: AnalystRatingsComponent,
    required: false,
    category: 'Market Sentiment',
    defaultSize: 'large',
    scoring: true,
    criteria: {
      ranges: [
        { min: -2, max: -1.5, points: -3, color: 'red' },        // Strong sell consensus
        { min: -1.5, max: -0.5, points: -2, color: 'red' },      // Sell consensus
        { min: -0.5, max: 0.5, points: 0, color: 'orange' },     // Hold consensus
        { min: 0.5, max: 1.5, points: 2, color: 'green' },       // Buy consensus
        { min: 1.5, max: 2, points: 3, color: 'green' }          // Strong buy consensus
      ]
    }
  },
  assetType: {
    id: 'assetType',
    name: 'Asset Type',
    description: 'Type of security (Common Stock, ETF, etc.)',
    component: AssetTypeComponent,
    required: false,
    category: 'Company Info',
    defaultSize: 'small',
    scoring: false
  },
  companyName: {
    id: 'companyName',
    name: 'Company Name',
    description: 'Full legal company name',
    component: CompanyNameComponent,
    required: false,
    category: 'Company Info',
    defaultSize: 'medium',
    scoring: false
  },
  companyDescription: {
    id: 'companyDescription',
    name: 'Company Description',
    description: 'Business description and overview',
    component: CompanyDescriptionComponent,
    required: false,
    category: 'Company Info',
    defaultSize: 'large',
    scoring: false
  },
  priceToSales: {
    id: 'priceToSales',
    name: 'Price-to-Sales',
    description: 'Price to sales ratio',
    component: PriceToSalesComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 1, points: 3, color: 'green' },            // Excellent value
        { min: 1, max: 2, points: 2, color: 'green' },            // Good value
        { min: 2, max: 4, points: 1, color: 'green' },            // Fair value
        { min: 4, max: 7, points: -1, color: 'orange' },          // Expensive
        { min: 7, max: Infinity, points: -2, color: 'red' }       // Very expensive
      ]
    }
  },
  bookValue: {
    id: 'bookValue',
    name: 'Book Value',
    description: 'Book value per share',
    component: BookValueComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 5, points: -2, color: 'red' },             // Very low
        { min: 5, max: 15, points: -1, color: 'orange' },         // Low
        { min: 15, max: 30, points: 1, color: 'green' },          // Moderate
        { min: 30, max: 50, points: 2, color: 'green' },          // Good
        { min: 50, max: Infinity, points: 3, color: 'green' }     // Excellent
      ]
    }
  },
  ebitda: {
    id: 'ebitda',
    name: 'EBITDA',
    description: 'Earnings before interest, taxes, depreciation, and amortization',
    component: EBITDAComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: 0, points: -3, color: 'red' },     // Negative EBITDA
        { min: 0, max: 50000000, points: -1, color: 'orange' },   // Low (<$50M)
        { min: 50000000, max: 200000000, points: 1, color: 'green' }, // Moderate ($50M-$200M)
        { min: 200000000, max: 1000000000, points: 2, color: 'green' }, // Good ($200M-$1B)
        { min: 1000000000, max: Infinity, points: 3, color: 'green' } // Excellent (>$1B)
      ]
    }
  },
  earningsGrowth: {
    id: 'earningsGrowth',
    name: 'Earnings Growth (QoQ)',
    description: 'Quarterly earnings growth year-over-year',
    component: EarningsGrowthComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: -0.10, points: -3, color: 'red' }, // Declining (<-10%)
        { min: -0.10, max: 0, points: -1, color: 'orange' },      // Slight decline (0% to -10%)
        { min: 0, max: 0.10, points: 1, color: 'green' },         // Modest growth (0-10%)
        { min: 0.10, max: 0.25, points: 2, color: 'green' },      // Good growth (10-25%)
        { min: 0.25, max: Infinity, points: 3, color: 'green' }   // Excellent growth (>25%)
      ]
    }
  },
  insiderOwnership: {
    id: 'insiderOwnership',
    name: 'Insider Ownership',
    description: 'Percentage owned by insiders',
    component: InsiderOwnershipComponent,
    required: false,
    category: 'Company Size',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 0.05, points: -1, color: 'orange' },       // Very low (0-5%)
        { min: 0.05, max: 0.10, points: 1, color: 'green' },      // Low (5-10%)
        { min: 0.10, max: 0.20, points: 2, color: 'green' },      // Moderate (10-20%)
        { min: 0.20, max: 0.40, points: 3, color: 'green' },      // High (20-40%)
        { min: 0.40, max: Infinity, points: 1, color: 'green' }   // Very high (>40%, may lack liquidity)
      ]
    }
  },
  roa: {
    id: 'roa',
    name: 'Return on Assets',
    description: 'Return on assets percentage',
    component: ROAComponent,
    required: false,
    category: 'Fundamentals',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: -Infinity, max: 0, points: -3, color: 'red' },     // Negative ROA
        { min: 0, max: 2, points: -2, color: 'red' },             // Very poor (0-2%)
        { min: 2, max: 5, points: -1, color: 'orange' },          // Below average (2-5%)
        { min: 5, max: 8, points: 1, color: 'green' },            // Average (5-8%)
        { min: 8, max: 12, points: 2, color: 'green' },           // Good (8-12%)
        { min: 12, max: 20, points: 3, color: 'green' },          // Excellent (12-20%)
        { min: 20, max: Infinity, points: 3, color: 'green' }     // Outstanding (20%+)
      ]
    }
  }
};

export const COMPONENT_CATEGORIES = {
  core: {
    name: 'Core',
    description: 'Essential components',
    color: '#3b82f6'
  },
  'Price & Momentum': {
    name: 'Price & Momentum',
    description: 'Price action and momentum indicators',
    color: '#10b981'
  },
  'Volume & Float': {
    name: 'Volume & Float',
    description: 'Volume and share availability metrics',
    color: '#06b6d4'
  },
  'Company Size': {
    name: 'Company Size',
    description: 'Share structure and market cap',
    color: '#8b5cf6'
  },
  'Technical Indicators': {
    name: 'Technical Indicators',
    description: 'Technical analysis metrics',
    color: '#f59e0b'
  },
  'Classification': {
    name: 'Classification',
    description: 'Sector and industry categorization',
    color: '#6b7280'
  },
  'Fundamentals': {
    name: 'Fundamentals',
    description: 'Financial and business fundamentals',
    color: '#ec4899'
  },
  'Valuation Ratios': {
    name: 'Valuation Ratios',
    description: 'Enterprise value and valuation metrics',
    color: '#f97316'
  },
  'Financial Metrics': {
    name: 'Financial Metrics',
    description: 'Per-share financial metrics',
    color: '#06b6d4'
  },
  'Market Sentiment': {
    name: 'Market Sentiment',
    description: 'Analyst opinions and market sentiment',
    color: '#84cc16'
  },
  'Company Info': {
    name: 'Company Info',
    description: 'Company identification and description',
    color: '#64748b'
  },
  analysis: {
    name: 'Analysis',
    description: 'Qualitative analysis tools',
    color: '#14b8a6'
  },
  scoring: {
    name: 'Scoring',
    description: 'Scoring and evaluation',
    color: '#a855f7'
  }
};

export const DEFAULT_COMPONENT_ORDER = [
  'ticker',
  'price',
  'percentRise',
  'relativeVolume',
  'float',
  'marketCap',
  'beta',
  'week52High',
  'week52Low',
  'movingAverage50',
  'movingAverage200',
  'institutionalOwnership',
  'insiderOwnership',
  'profitMargin',
  'operatingMargin',
  'revenueGrowth',
  'earningsGrowth',
  'peRatio',
  'pegRatio',
  'forwardPE',
  'trailingPE',
  'dividendPerShare',
  'evToRevenue',
  'evToEbitda',
  'revenuePerShare',
  'analystRatings',
  'priceToBook',
  'priceToSales',
  'bookValue',
  'roe',
  'roa',
  'dividendYield',
  'eps',
  'ebitda',
  'analystTarget',
  'assetType',
  'companyName',
  'companyDescription',
  'sharesOutstanding',
  'restrictedShares',
  'news',
  'sector',
  'industry',
  'notes',
  'bonusChecks'
];

// Strategy presets
export const STRATEGY_PRESETS = {
  momentum: {
    id: 'momentum',
    name: 'Momentum Trading',
    description: 'Targets low-float stocks under $5 with strong volume and positive price action. Ideal for finding volatile small-cap breakout opportunities with minimal downside risk. Focuses on technical momentum rather than fundamentals.',
    paperConfig: {
      ticker: true,
      price: true,
      percentRise: true,
      relativeVolume: true,
      float: true,
      news: true,
      bonusChecks: true,
      notes: true
    },
    bonusChecks: {
      recentIPO: { points: 1, description: 'Recent IPO (within 12 months)' },
      recentReverseSplit: { points: 1, description: 'Recent reverse split' },
      blueSkyBreakout: { points: 1, description: 'Breaking through resistance' }
    }
  },
  valueInvesting: {
    id: 'valueInvesting',
    name: 'Value Investing',
    description: 'Classic fundamental analysis targeting undervalued companies with strong balance sheets. Emphasizes profitability, growth, and valuation metrics.',
    paperConfig: {
      ticker: true,
      price: true,
      marketCap: true,
      peRatio: true,
      pegRatio: true,
      priceToBook: true,
      roe: true,
      eps: true,
      profitMargin: true,
      revenueGrowth: true,
      beta: true,
      sector: true,
      industry: true,
      bonusChecks: true,
      notes: true
    },
    bonusChecks: {
      dividendYield: { points: 2, description: 'Consistent dividend payments (3+ years)' },
      debtToEquity: { points: 2, description: 'Low debt-to-equity ratio (<0.5)' },
      cashReserves: { points: 1, description: 'Strong cash reserves (>$100M)' }
    }
  },
  growthMomentum: {
    id: 'growthMomentum',
    name: 'Technical Breakout',
    description: 'Pure technical analysis strategy focusing on chart patterns and moving averages. Tracks stocks breaking 52-week highs with institutional backing.',
    paperConfig: {
      ticker: true,
      price: true,
      week52High: true,
      week52Low: true,
      movingAverage50: true,
      movingAverage200: true,
      beta: true,
      institutionalOwnership: true,
      float: true,
      bonusChecks: true,
      notes: true
    },
    bonusChecks: {
      goldenCross: { points: 3, description: '50-day MA crossed above 200-day MA (golden cross)' },
      volumeSpike: { points: 2, description: 'Volume 200%+ above average' },
      consolidation: { points: 2, description: 'Consolidating near 52-week high (within 5%)' }
    }
  }
};

// Helper functions
export function getComponentConfig(componentId) {
  return COMPONENT_REGISTRY[componentId];
}

export function getAvailableComponents() {
  return Object.values(COMPONENT_REGISTRY);
}

export function getComponentsByCategory(category) {
  return Object.values(COMPONENT_REGISTRY).filter(comp => comp.category === category);
}

export function calculateComponentScore(componentId, value, customCriteria = null) {
  const config = COMPONENT_REGISTRY[componentId];
  if (!config || !config.scoring) {
    return 0;
  }

  const criteria = customCriteria || config.criteria;
  if (!criteria) {
    return 0;
  }

  // Handle categorical scoring (sector, industry)
  if (config.scoring === 'categorical') {
    if (!value || !criteria.categories) return 0;
    return criteria.categories[value] || 0;
  }

  // Handle simple toggle scoring (news)
  if (config.scoring === 'simpleToggle') {
    return 0; // News scoring is handled separately in the component
  }

  // Handle range-based scoring
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 0;

  const range = criteria.ranges.find(r => numValue >= r.min && numValue < r.max);
  return range ? range.points : 0;
}

export function getComponentScoreColor(componentId, value, customCriteria = null) {
  const config = COMPONENT_REGISTRY[componentId];
  if (!config || !config.scoring) {
    return 'neutral';
  }

  const criteria = customCriteria || config.criteria;
  if (!criteria) {
    return 'neutral';
  }

  // Handle categorical scoring - determine color based on points
  if (config.scoring === 'categorical') {
    if (!value || !criteria.categories) return 'neutral';
    const points = criteria.categories[value] || 0;
    if (points > 0) return 'green';
    if (points < 0) return 'red';
    return 'neutral';
  }

  // Handle simple toggle scoring
  if (config.scoring === 'simpleToggle') {
    return 'neutral';
  }

  // Handle range-based scoring
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'neutral';

  const range = criteria.ranges.find(r => numValue >= r.min && numValue < r.max);
  return range ? range.color : 'neutral';
}