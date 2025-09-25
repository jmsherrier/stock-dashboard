import { getScorePoints } from '../constants/scoring';

export const calculateScore = (stock) => {
  let score = 0;
  
  // Handle both legacy and modular formats
  const data = stock.components ? {
    price: stock.components.price?.value,
    percentRise: stock.components.percentRise?.value,
    relativeVolume: stock.components.relativeVolume?.value,
    float: stock.components.float?.value,
    bonusChecks: stock.components.bonusChecks?.checks || {},
    positiveCatalysts: stock.components.news?.items || [],
    marketDrivers: []
  } : {
    price: stock.price,
    percentRise: stock.percentRise,
    relativeVolume: stock.relativeVolume,
    float: stock.float,
    bonusChecks: stock.bonusChecks || {},
    positiveCatalysts: stock.positiveCatalysts || [],
    marketDrivers: stock.marketDrivers || []
  };
  
  // Apply scoring for each criteria
  score += getScorePoints(data.price, 'price');
  score += getScorePoints(data.percentRise, 'percentRise');
  score += getScorePoints(data.relativeVolume, 'relativeVolume');
  score += getScorePoints(data.float, 'float');
  
  // News catalysts scoring
  const positiveCatalystsScore = data.positiveCatalysts.reduce((sum, item) => sum + (item.points || 0), 0);
  const marketDriversScore = data.marketDrivers.reduce((sum, item) => sum + (item.points || 0), 0);
  score += positiveCatalystsScore + marketDriversScore;
  
  // Bonus checkboxes (+1 each)
  if (data.bonusChecks.recentIPO) score += 1;
  if (data.bonusChecks.recentReverseSplit) score += 1;
  if (data.bonusChecks.blueSkyBreakout) score += 1;
  
  return score;
};