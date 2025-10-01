import { 
  getScorePoints, 
  getScoreColor, 
  getWarning, 
  SCORING_RANGES, 
  SCORE_COLORS 
} from '../scoring';

describe('Scoring Constants and Utilities', () => {
  describe('getScorePoints', () => {
    test('returns 0 for null, undefined, or empty values', () => {
      expect(getScorePoints(null, 'price')).toBe(0);
      expect(getScorePoints(undefined, 'price')).toBe(0);
      expect(getScorePoints('', 'price')).toBe(0);
      expect(getScorePoints(0, 'price')).toBe(0);
    });

    test('returns 0 for invalid numbers', () => {
      expect(getScorePoints('abc', 'price')).toBe(0);
      expect(getScorePoints(NaN, 'price')).toBe(0);
    });

    test('calculates correct price scores', () => {
      expect(getScorePoints(1.5, 'price')).toBe(3);  // 0-2 range
      expect(getScorePoints(2.5, 'price')).toBe(2);  // 2-3 range
      expect(getScorePoints(4, 'price')).toBe(1);    // 3-5 range
      expect(getScorePoints(6, 'price')).toBe(-1);   // 5-8 range
      expect(getScorePoints(9, 'price')).toBe(-2);   // 8-10 range
      expect(getScorePoints(12, 'price')).toBe(-2);  // 10-15 range
      expect(getScorePoints(18, 'price')).toBe(-3);  // 15+ range
    });

    test('calculates correct percentRise scores', () => {
      expect(getScorePoints(2, 'percentRise')).toBe(-3);  // <3
      expect(getScorePoints(4, 'percentRise')).toBe(-2);  // 3-5
      expect(getScorePoints(6, 'percentRise')).toBe(-1);  // 5-7
      expect(getScorePoints(8, 'percentRise')).toBe(1);   // 7-10
      expect(getScorePoints(12, 'percentRise')).toBe(2);  // 10-15
      expect(getScorePoints(18, 'percentRise')).toBe(3);  // 15+
    });

    test('calculates correct relativeVolume scores', () => {
      expect(getScorePoints(1.5, 'relativeVolume')).toBe(-3);  // <2
      expect(getScorePoints(2.5, 'relativeVolume')).toBe(-2);  // 2-3
      expect(getScorePoints(4, 'relativeVolume')).toBe(-1);    // 3-5
      expect(getScorePoints(6, 'relativeVolume')).toBe(1);     // 5-8
      expect(getScorePoints(10, 'relativeVolume')).toBe(2);    // 8-12
      expect(getScorePoints(15, 'relativeVolume')).toBe(3);    // 12+
    });

    test('calculates correct float scores', () => {
      expect(getScorePoints(5, 'float')).toBe(3);    // 0-10
      expect(getScorePoints(12, 'float')).toBe(1);   // 10-15
      expect(getScorePoints(18, 'float')).toBe(-1);  // 15-20
      expect(getScorePoints(25, 'float')).toBe(-2);  // 20-30
      expect(getScorePoints(40, 'float')).toBe(-2);  // 30-50
      expect(getScorePoints(60, 'float')).toBe(-3);  // 50+
    });

    test('returns 0 for unknown types', () => {
      expect(getScorePoints(10, 'unknown')).toBe(0);
    });
  });

  describe('getScoreColor', () => {
    test('returns correct colors for score ranges', () => {
      expect(getScoreColor(15)).toBe(SCORE_COLORS.green);   // >= 10
      expect(getScoreColor(7)).toBe(SCORE_COLORS.green);    // >= 5
      expect(getScoreColor(2)).toBe(SCORE_COLORS.neutral);  // >= 0
      expect(getScoreColor(-3)).toBe(SCORE_COLORS.orange);  // >= -5
      expect(getScoreColor(-8)).toBe(SCORE_COLORS.red);    // < -5
    });
  });

  describe('getWarning', () => {
    test('returns null for empty or zero values', () => {
      expect(getWarning('', 'price')).toBeNull();
      expect(getWarning(0, 'price')).toBeNull();
      expect(getWarning(null, 'price')).toBeNull();
    });

    test('returns correct price warnings', () => {
      expect(getWarning(1, 'price')).toBe('Outside $2-20 range');
      expect(getWarning(25, 'price')).toBe('Outside $2-20 range');
      expect(getWarning(10, 'price')).toBeNull(); // within range
    });

    test('returns correct percentRise warnings', () => {
      expect(getWarning(5, 'percentRise')).toBe('Below 7% minimum');
      expect(getWarning(10, 'percentRise')).toBeNull(); // above minimum
    });

    test('returns correct relativeVolume warnings', () => {
      expect(getWarning(3, 'relativeVolume')).toBe('Below 5x minimum');
      expect(getWarning(8, 'relativeVolume')).toBeNull(); // above minimum
    });

    test('returns correct float warnings', () => {
      expect(getWarning(25, 'float')).toBe('Above 20M limit');
      expect(getWarning(15, 'float')).toBeNull(); // within limit
    });

    test('returns null for unknown types', () => {
      expect(getWarning(10, 'unknown')).toBeNull();
    });
  });

  describe('SCORING_RANGES', () => {
    test('contains all required metric types', () => {
      expect(SCORING_RANGES).toHaveProperty('price');
      expect(SCORING_RANGES).toHaveProperty('percentRise');
      expect(SCORING_RANGES).toHaveProperty('relativeVolume');
      expect(SCORING_RANGES).toHaveProperty('float');
    });

    test('all ranges have required properties', () => {
      Object.values(SCORING_RANGES).forEach(ranges => {
        ranges.forEach(range => {
          expect(range).toHaveProperty('min');
          expect(range).toHaveProperty('max');
          expect(range).toHaveProperty('points');
          expect(range).toHaveProperty('color');
        });
      });
    });
  });
});