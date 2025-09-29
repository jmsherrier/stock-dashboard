// Scoring constants and utilities
export const SCORING_RANGES = {
  price: [
    { min: 0, max: 2, points: 3, color: 'green' },
    { min: 2, max: 3, points: 2, color: 'green' },
    { min: 3, max: 5, points: 1, color: 'green' },
    { min: 5, max: 8, points: -1, color: 'orange' },
    { min: 8, max: 10, points: -2, color: 'red' },
    { min: 10, max: 15, points: -2, color: 'red' },
    { min: 15, max: Infinity, points: -3, color: 'red' }
  ],
  percentRise: [
    { min: -Infinity, max: 3, points: -3, color: 'red' },
    { min: 3, max: 5, points: -2, color: 'red' },
    { min: 5, max: 7, points: -1, color: 'orange' },
    { min: 7, max: 10, points: 1, color: 'green' },
    { min: 10, max: 15, points: 2, color: 'green' },
    { min: 15, max: Infinity, points: 3, color: 'green' }
  ],
  relativeVolume: [
    { min: 0, max: 2, points: -3, color: 'red' },
    { min: 2, max: 3, points: -2, color: 'red' },
    { min: 3, max: 5, points: -1, color: 'orange' },
    { min: 5, max: 8, points: 1, color: 'green' },
    { min: 8, max: 12, points: 2, color: 'green' },
    { min: 12, max: Infinity, points: 3, color: 'green' }
  ],
  float: [
    { min: 0, max: 10, points: 3, color: 'green' },
    { min: 10, max: 15, points: 1, color: 'green' },
    { min: 15, max: 20, points: -1, color: 'orange' },
    { min: 20, max: 30, points: -2, color: 'red' },
    { min: 30, max: 50, points: -2, color: 'red' },
    { min: 50, max: Infinity, points: -3, color: 'red' }
  ]
};

export const SCORE_COLORS = {
  green: '#22c55e',
  orange: '#f97316', 
  red: '#ef4444',
  neutral: '#666'
};

export const getScorePoints = (value, type) => {
  if (value === null || value === undefined || value === '' || value === 0) {
    return 0;
  }
  
  const val = parseFloat(value);
  if (isNaN(val)) return 0;
  
  const ranges = SCORING_RANGES[type];
  if (!ranges) return 0;
  
  for (const range of ranges) {
    if (val >= range.min && val < range.max) {
      return range.points;
    }
  }
  return 0;
};

export const getScoreColor = (score) => {
  if (score >= 10) return SCORE_COLORS.green;
  if (score >= 5) return SCORE_COLORS.green;
  if (score >= 0) return SCORE_COLORS.neutral;
  if (score >= -5) return SCORE_COLORS.orange;
  return SCORE_COLORS.red;
};

export const getWarning = (value, type) => {
  const val = parseFloat(value) || 0;
  if (!value || val === 0) return null;
  
  switch (type) {
    case 'price':
      if (val < 2 || val > 20) return 'Outside $2-20 range';
      break;
    case 'percentRise':
      if (val < 7) return 'Below 7% minimum';
      break;
    case 'relativeVolume':
      if (val < 5) return 'Below 5x minimum';
      break;
    case 'float':
      if (val > 20) return 'Above 20M limit';
      break;
    default:
      break;
  }
  return null;
};