import { calculateScore } from '../scoreCalculator';

describe('Score Calculator', () => {
  test('calculates score for modular format stock', () => {
    const modularStock = {
      id: 'test-1',
      components: {
        price: { value: '4.50' },        // 1 point (3-5 range)
        percentRise: { value: '12.5' },  // 2 points (10-15 range)
        relativeVolume: { value: '8.2' }, // 2 points (8-12 range)
        float: { value: '8.5' },         // 3 points (0-10 range)
        news: { 
          items: [
            { text: 'Good news', points: 2 },
            { text: 'Great news', points: 3 }
          ] 
        },
        bonusChecks: { 
          checks: { 
            recentIPO: true,           // 1 point
            recentReverseSplit: false,
            blueSkyBreakout: true      // 1 point
          } 
        }
      }
    };

    const score = calculateScore(modularStock);
    // 1 + 2 + 2 + 3 + 2 + 3 + 1 + 1 = 15
    expect(score).toBe(15);
  });

  test('calculates score for legacy format stock', () => {
    const legacyStock = {
      id: 'test-1',
      price: '2.75',                    // 2 points (2-3 range)
      percentRise: '8.5',               // 1 point (7-10 range)
      relativeVolume: '6.2',            // 1 point (5-8 range)
      float: '12.5',                    // 1 point (10-15 range)
      positiveCatalysts: [
        { text: 'Catalyst 1', points: 1 }
      ],
      marketDrivers: [
        { text: 'Driver 1', points: 2 }
      ],
      bonusChecks: {
        recentIPO: false,
        recentReverseSplit: true,       // 1 point
        blueSkyBreakout: false
      }
    };

    const score = calculateScore(legacyStock);
    // 2 + 1 + 1 + 1 + 1 + 2 + 1 = 9
    expect(score).toBe(9);
  });

  test('handles missing or empty values', () => {
    const stockWithMissingData = {
      id: 'test-1',
      components: {
        ticker: { value: 'TEST' },
        price: { value: '' },           // 0 points
        percentRise: { value: null },   // 0 points
        relativeVolume: { value: undefined }, // 0 points
        float: { value: '0' },          // 3 points (0-10 range)
        news: { items: [] },            // 0 points
        bonusChecks: { checks: {} }     // 0 points
      }
    };

    const score = calculateScore(stockWithMissingData);
    expect(score).toBe(3); // Only float contributes points for 0 value
  });

  test('handles stock without components (legacy format)', () => {
    const legacyStock = {
      id: 'test-1',
      ticker: 'LEGACY'
      // No other properties
    };

    const score = calculateScore(legacyStock);
    expect(score).toBe(0);
  });

  test('handles negative scores correctly', () => {
    const badStock = {
      id: 'test-1',
      components: {
        price: { value: '18.50' },       // -3 points (15+ range)
        percentRise: { value: '2.5' },   // -3 points (<3 range)
        relativeVolume: { value: '1.2' }, // -3 points (<2 range)
        float: { value: '60.0' },        // -3 points (50+ range)
        news: { items: [] },             // 0 points
        bonusChecks: { 
          checks: { 
            recentIPO: true              // 1 point
          } 
        }
      }
    };

    const score = calculateScore(badStock);
    // -3 + -3 + -3 + -3 + 0 + 1 = -11
    expect(score).toBe(-11);
  });
});