/**
 * Auto-calculate bonus criteria based on stock data
 * Returns an object with bonus criteria keys and boolean values
 */

export function calculateBonusCriteria(stock, apiData) {
  const results = {};
  
  // Extract values from stock data (either old or new format)
  const price = parseFloat(stock.components?.price?.value || stock.price || apiData?.price || 0);
  const week52High = parseFloat(stock.components?.week52High?.value || stock.week52High || apiData?.week52High || 0);
  const week52Low = parseFloat(stock.components?.week52Low?.value || stock.week52Low || apiData?.week52Low || 0);
  const ma50 = parseFloat(stock.components?.movingAverage50?.value || stock.movingAverage50 || apiData?.movingAverage50 || 0);
  const ma200 = parseFloat(stock.components?.movingAverage200?.value || stock.movingAverage200 || apiData?.movingAverage200 || 0);
  const relativeVolume = parseFloat(stock.components?.relativeVolume?.value || stock.relativeVolume || apiData?.relativeVolume || 0);
  const dividendYield = parseFloat(stock.components?.dividendYield?.value || stock.dividendYield || apiData?.dividendYield || 0);
  const dividendPerShare = parseFloat(stock.components?.dividendPerShare?.value || stock.dividendPerShare || apiData?.dividendPerShare || 0);
  const insiderOwnership = parseFloat(stock.components?.insiderOwnership?.value || stock.insiderOwnership || apiData?.insiderOwnership || 0);

  // MOMENTUM PRESET CRITERIA
  
  // Blue Sky Breakout - price breaking above 52-week high
  if (price > 0 && week52High > 0 && price >= week52High * 1.00) {
    results.blueSkyBreakout = true;
  }

  // VALUE INVESTING PRESET CRITERIA
  
  // Consistent Dividends - has dividend yield and dividend per share
  if (dividendYield > 0 && dividendPerShare > 0) {
    results.consistentDividends = true;
  }

  // Insider Buying - significant insider ownership (>10%)
  if (insiderOwnership >= 10) {
    results.insiderBuying = true;
  }

  // TECHNICAL BREAKOUT PRESET CRITERIA
  
  // Golden Cross - 50-day MA crossed above 200-day MA
  if (ma50 > 0 && ma200 > 0 && ma50 > ma200) {
    results.goldenCross = true;
  }

  // Volume Breakout - relative volume > 3x average
  if (relativeVolume >= 3.0) {
    results.volumeBreakout = true;
  }

  // All-Time High (approximation using 52-week high)
  if (price > 0 && week52High > 0 && price >= week52High * 0.999) {
    results.allTimeHigh = true;
  }

  // Consolidation - price within 5% of 52-week high but not breaking out
  if (price > 0 && week52High > 0 && price >= week52High * 0.95 && price < week52High * 0.999) {
    results.consolidation = true;
  }

  return results;
}

/**
 * Apply auto-calculated bonus criteria to a stock's bonus checks
 * Only updates criteria that exist in the stock's bonusChecksConfig
 */
export function applyAutoBonusCriteria(stock, apiData) {
  if (!stock.components?.bonusChecks?.checks || !stock.bonusChecksConfig) {
    return stock;
  }

  const autoCalculated = calculateBonusCriteria(stock, apiData);
  const availableCriteria = stock.bonusChecksConfig;
  const currentChecks = stock.components.bonusChecks.checks || {};

  // Update checks - only set to true if auto-calculated
  // Don't override user's manual unchecking
  const updatedChecks = { ...currentChecks };
  
  Object.keys(availableCriteria).forEach(criteriaKey => {
    if (autoCalculated[criteriaKey] === true) {
      updatedChecks[criteriaKey] = true;
    }
  });

  return {
    ...stock,
    components: {
      ...stock.components,
      bonusChecks: {
        ...stock.components.bonusChecks,
        checks: updatedChecks
      }
    }
  };
}
