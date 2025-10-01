// Component registry for modular paper system
import TickerComponent from './TickerComponent';
import PriceComponent from './PriceComponent';
import PercentRiseComponent from './PercentRiseComponent';
import RelativeVolumeComponent from './RelativeVolumeComponent';
import FloatComponent from './FloatComponent';
import SharesOutstandingComponent from './SharesOutstandingComponent';
import RestrictedSharesComponent from './RestrictedSharesComponent';
import NewsComponent from './NewsComponent';
import NotesComponent from './NotesComponent';
import BonusChecksComponent from './BonusChecksComponent';

export const COMPONENT_REGISTRY = {
  ticker: {
    id: 'ticker',
    name: 'Ticker Symbol',
    description: 'Stock ticker symbol',
    component: TickerComponent,
    required: true,
    category: 'core',
    defaultSize: 'small'
  },
  price: {
    id: 'price',
    name: 'Price',
    description: 'Current stock price',
    component: PriceComponent,
    required: false,
    category: 'metrics',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 2, points: 3, color: 'green' },
        { min: 2, max: 3, points: 2, color: 'green' },
        { min: 3, max: 5, points: 1, color: 'green' },
        { min: 5, max: 8, points: -1, color: 'orange' },
        { min: 8, max: 10, points: -2, color: 'red' },
        { min: 10, max: 15, points: -2, color: 'red' },
        { min: 15, max: Infinity, points: -3, color: 'red' }
      ]
    }
  },
  percentRise: {
    id: 'percentRise',
    name: 'Percent Rise',
    description: 'Daily percentage change',
    component: PercentRiseComponent,
    required: false,
    category: 'metrics',
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
    category: 'metrics',
    defaultSize: 'small',
    scoring: true,
    criteria: {
      ranges: [
        { min: 0, max: 2, points: -3, color: 'red' },
        { min: 2, max: 3, points: -2, color: 'red' },
        { min: 3, max: 5, points: -1, color: 'orange' },
        { min: 5, max: 8, points: 1, color: 'green' },
        { min: 8, max: 12, points: 2, color: 'green' },
        { min: 12, max: Infinity, points: 3, color: 'green' }
      ]
    }
  },
  float: {
    id: 'float',
    name: 'Float',
    description: 'Free float shares (auto-calculated from outstanding - restricted)',
    component: FloatComponent,
    required: false,
    category: 'metrics',
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
    category: 'data',
    defaultSize: 'small',
    scoring: false
  },
  restrictedShares: {
    id: 'restrictedShares',
    name: 'Restricted Shares',
    description: 'Restricted/insider shares',
    component: RestrictedSharesComponent,
    required: false,
    category: 'data',
    defaultSize: 'small',
    scoring: false
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
  }
};

export const COMPONENT_CATEGORIES = {
  core: {
    name: 'Core',
    description: 'Essential components',
    color: '#3b82f6'
  },
  metrics: {
    name: 'Metrics',
    description: 'Quantitative measurements',
    color: '#10b981'
  },
  data: {
    name: 'Data',
    description: 'Raw data storage',
    color: '#6b7280'
  },
  analysis: {
    name: 'Analysis',
    description: 'Qualitative analysis tools',
    color: '#f59e0b'
  },
  scoring: {
    name: 'Scoring',
    description: 'Scoring and evaluation',
    color: '#8b5cf6'
  }
};

export const DEFAULT_COMPONENT_ORDER = [
  'ticker',
  'price',
  'percentRise',
  'relativeVolume',
  'float',
  'sharesOutstanding',
  'restrictedShares',
  'news',
  'bonusChecks',
  'notes'
];

// Strategy presets
export const STRATEGY_PRESETS = {
  momentum: {
    id: 'momentum',
    name: 'Momentum Trading',
    description: 'Focus on price momentum and volume indicators',
    paperConfig: {
      ticker: true,
      price: true,
      percentRise: true,
      relativeVolume: true,
      float: true,
      news: true,
      bonusChecks: true,
      notes: true,
      sharesOutstanding: false,
      restrictedShares: false
    },
    bonusChecks: {
      recentIPO: { points: 1, description: 'Recent IPO (within 12 months)' },
      recentReverseSplit: { points: 1, description: 'Recent reverse split' },
      blueSkyBreakout: { points: 1, description: 'Breaking through resistance' },
      unusualOptions: { points: 1, description: 'Unusual options activity' },
      shortSqueeze: { points: 2, description: 'Short squeeze potential' }
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

export function calculateComponentScore(componentId, value) {
  const config = COMPONENT_REGISTRY[componentId];
  if (!config || !config.scoring || !config.criteria) {
    return 0;
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 0;

  const range = config.criteria.ranges.find(r => numValue >= r.min && numValue < r.max);
  return range ? range.points : 0;
}

export function getComponentScoreColor(componentId, value) {
  const config = COMPONENT_REGISTRY[componentId];
  if (!config || !config.scoring || !config.criteria) {
    return 'neutral';
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'neutral';

  const range = config.criteria.ranges.find(r => numValue >= r.min && numValue < r.max);
  return range ? range.color : 'neutral';
}