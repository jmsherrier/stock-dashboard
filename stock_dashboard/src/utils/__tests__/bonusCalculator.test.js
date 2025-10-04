import { calculateBonusCriteria, applyAutoBonusCriteria } from '../bonusCalculator';

describe('calculateBonusCriteria', () => {
  it('should detect blue sky breakout when price equals or exceeds 52-week high', () => {
    const stock = {
      components: {
        price: { value: '105' },
        week52High: { value: '100' }
      }
    };
    
    const result = calculateBonusCriteria(stock, {});
    expect(result.blueSkyBreakout).toBe(true);
  });

  it('should detect consistent dividends when both yield and per share exist', () => {
    const stock = {
      components: {
        dividendYield: { value: '3.5' },
        dividendPerShare: { value: '2.40' }
      }
    };
    
    const result = calculateBonusCriteria(stock, {});
    expect(result.consistentDividends).toBe(true);
  });

  it('should detect insider buying when ownership >= 10%', () => {
    const stock = {
      components: {
        insiderOwnership: { value: '12.5' }
      }
    };
    
    const result = calculateBonusCriteria(stock, {});
    expect(result.insiderBuying).toBe(true);
  });

  it('should detect golden cross when MA50 > MA200', () => {
    const stock = {
      components: {
        movingAverage50: { value: '52.50' },
        movingAverage200: { value: '48.20' }
      }
    };
    
    const result = calculateBonusCriteria(stock, {});
    expect(result.goldenCross).toBe(true);
  });

  it('should detect volume breakout when relative volume >= 3', () => {
    const stock = {
      components: {
        relativeVolume: { value: '3.5' }
      }
    };
    
    const result = calculateBonusCriteria(stock, {});
    expect(result.volumeBreakout).toBe(true);
  });

  it('should detect all-time high when price is at 52-week high', () => {
    const stock = {
      components: {
        price: { value: '100' },
        week52High: { value: '100' }
      }
    };
    
    const result = calculateBonusCriteria(stock, {});
    expect(result.allTimeHigh).toBe(true);
  });

  it('should detect consolidation when price is 95-99% of 52-week high', () => {
    const stock = {
      components: {
        price: { value: '97' },
        week52High: { value: '100' }
      }
    };
    
    const result = calculateBonusCriteria(stock, {});
    expect(result.consolidation).toBe(true);
    expect(result.allTimeHigh).toBeUndefined();
  });
});

describe('applyAutoBonusCriteria', () => {
  it('should update bonus checks based on auto-calculated criteria', () => {
    const stock = {
      components: {
        price: { value: '105' },
        week52High: { value: '100' },
        bonusChecks: {
          checks: {}
        }
      },
      bonusChecksConfig: {
        blueSkyBreakout: { points: 3, description: 'Breaking through resistance' }
      }
    };
    
    const result = applyAutoBonusCriteria(stock, {});
    expect(result.components.bonusChecks.checks.blueSkyBreakout).toBe(true);
  });

  it('should only update criteria that exist in bonusChecksConfig', () => {
    const stock = {
      components: {
        price: { value: '105' },
        week52High: { value: '100' },
        relativeVolume: { value: '4.0' },
        bonusChecks: {
          checks: {}
        }
      },
      bonusChecksConfig: {
        blueSkyBreakout: { points: 3, description: 'Breaking through resistance' }
        // volumeBreakout not in config, so shouldn't be added
      }
    };
    
    const result = applyAutoBonusCriteria(stock, {});
    expect(result.components.bonusChecks.checks.blueSkyBreakout).toBe(true);
    expect(result.components.bonusChecks.checks.volumeBreakout).toBeUndefined();
  });

  it('should preserve existing manual checks', () => {
    const stock = {
      components: {
        price: { value: '105' },
        week52High: { value: '100' },
        bonusChecks: {
          checks: {
            recentIPO: true // Manually set by user
          }
        }
      },
      bonusChecksConfig: {
        recentIPO: { points: 2, description: 'Recent IPO' },
        blueSkyBreakout: { points: 3, description: 'Breaking through resistance' }
      }
    };
    
    const result = applyAutoBonusCriteria(stock, {});
    expect(result.components.bonusChecks.checks.recentIPO).toBe(true);
    expect(result.components.bonusChecks.checks.blueSkyBreakout).toBe(true);
  });
});
