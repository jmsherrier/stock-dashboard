import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';

const AnalystRatingsComponent = ({ stock, onUpdate, config, onOpenScoringEditor }) => {
  const strongBuy = stock.components?.analystRatingStrongBuy?.value || '';
  const buy = stock.components?.analystRatingBuy?.value || '';
  const hold = stock.components?.analystRatingHold?.value || '';
  const sell = stock.components?.analystRatingSell?.value || '';
  const strongSell = stock.components?.analystRatingStrongSell?.value || '';
  
  // Calculate weighted score: StrongBuy=2, Buy=1, Hold=0, Sell=-1, StrongSell=-2
  const totalAnalysts = (parseInt(strongBuy) || 0) + (parseInt(buy) || 0) + (parseInt(hold) || 0) + (parseInt(sell) || 0) + (parseInt(strongSell) || 0);
  const weightedScore = totalAnalysts > 0 ? 
    (((parseInt(strongBuy) || 0) * 2) + ((parseInt(buy) || 0) * 1) + ((parseInt(hold) || 0) * 0) + ((parseInt(sell) || 0) * -1) + ((parseInt(strongSell) || 0) * -2)) / totalAnalysts : 0;
  
  const score = calculateComponentScore('analystRatings', weightedScore);
  const scoreColor = getComponentScoreColor(score);

  // Check if we're being used in criteria grid mode
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    return (
      <div className="criteria-input">
        <label>Analyst Ratings</label>
        <div className="analyst-ratings-grid">
          <div className="rating-input">
            <label>Strong Buy</label>
            <input
              type="number"
              value={strongBuy}
              onChange={(e) => onUpdate(stock.id, 'analystRatingStrongBuy', { value: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="rating-input">
            <label>Buy</label>
            <input
              type="number"
              value={buy}
              onChange={(e) => onUpdate(stock.id, 'analystRatingBuy', { value: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="rating-input">
            <label>Hold</label>
            <input
              type="number"
              value={hold}
              onChange={(e) => onUpdate(stock.id, 'analystRatingHold', { value: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="rating-input">
            <label>Sell</label>
            <input
              type="number"
              value={sell}
              onChange={(e) => onUpdate(stock.id, 'analystRatingSell', { value: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="rating-input">
            <label>Strong Sell</label>
            <input
              type="number"
              value={strongSell}
              onChange={(e) => onUpdate(stock.id, 'analystRatingStrongSell', { value: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>
        <div className="rating-summary">
          <span>Total: {totalAnalysts}</span>
          <span className={`score-badge score-${scoreColor}`}>
            {score > 0 ? '+' : ''}{score}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="modular-component analyst-ratings-component">
      <div className="component-header">
        <label>Analyst Ratings</label>
        <div className="header-actions">
          {totalAnalysts > 0 && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('analystRatings')}
              title="Edit scoring criteria"
            >
              ⚙
            </button>
          )}
        </div>
      </div>
      <div className="component-content">
        <div className="analyst-ratings-grid">
          <div className="rating-row">
            <span className="rating-label">Strong Buy:</span>
            <input
              type="number"
              value={strongBuy}
              onChange={(e) => onUpdate(stock.id, 'analystRatingStrongBuy', { value: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="rating-row">
            <span className="rating-label">Buy:</span>
            <input
              type="number"
              value={buy}
              onChange={(e) => onUpdate(stock.id, 'analystRatingBuy', { value: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="rating-row">
            <span className="rating-label">Hold:</span>
            <input
              type="number"
              value={hold}
              onChange={(e) => onUpdate(stock.id, 'analystRatingHold', { value: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="rating-row">
            <span className="rating-label">Sell:</span>
            <input
              type="number"
              value={sell}
              onChange={(e) => onUpdate(stock.id, 'analystRatingSell', { value: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="rating-row">
            <span className="rating-label">Strong Sell:</span>
            <input
              type="number"
              value={strongSell}
              onChange={(e) => onUpdate(stock.id, 'analystRatingStrongSell', { value: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>
        <div className="rating-summary">
          <span>Total Analysts: {totalAnalysts}</span>
          {totalAnalysts > 0 && (
            <span>Avg Score: {weightedScore.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalystRatingsComponent;