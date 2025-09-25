import React, { useState, memo } from 'react';
import CriteriaInput from './CriteriaInput';
import NewsSection from './NewsSection';
import { getScorePoints, getWarning, SCORING_RANGES } from '../constants/scoring';

function StockPaper({ stock, score, rank, onUpdate, onRemove, onUpdateSingle, perStockUpdating, dragListeners }) {
  const [isEditingTicker, setIsEditingTicker] = useState(false);
  const [tickerValue, setTickerValue] = useState(stock.ticker);
  
  const handleTickerSave = () => {
    const newTicker = tickerValue.trim().toUpperCase();
    if (newTicker && newTicker !== stock.ticker) {
      onUpdate(stock.id, 'ticker', newTicker);
    }
    setIsEditingTicker(false);
  };

  const handleTickerCancel = () => {
    setTickerValue(stock.ticker);
    setIsEditingTicker(false);
  };

  const handleTickerKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTickerSave();
    } else if (e.key === 'Escape') {
      handleTickerCancel();
    }
  };
  


  // Convert scoring ranges to display format for scales
  const priceScale = SCORING_RANGES.price.map(r => ({
    range: r.max === Infinity ? `${r.min}+` : `${r.min}-${r.max}`,
    points: r.points
  }));
  
  const percentRiseScale = SCORING_RANGES.percentRise.map(r => ({
    range: r.min === -Infinity ? `<${r.max}` : r.max === Infinity ? `${r.min}+` : `${r.min}-${r.max}`,
    points: r.points
  }));
  
  const relativeVolumeScale = SCORING_RANGES.relativeVolume.map(r => ({
    range: r.max === Infinity ? `${r.min}+` : `${r.min}-${r.max}`,
    points: r.points
  }));
  
  const floatScale = SCORING_RANGES.float.map(r => ({
    range: r.max === Infinity ? `${r.min}+` : `${r.min}-${r.max}`,
    points: r.points
  }));

  return (
    <div className="stock-paper">
      {dragListeners && <div className="drag-bg-handle" {...dragListeners} title="Drag to reorder" />}
      <button 
        className="remove-x" 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(stock.id);
        }}
      >
        ×
      </button>
      <div className="stock-header">
        <div className="header-box update-btn" onPointerDown={(e) => e.stopPropagation()}>
          <button 
            className="update-btn-inner" 
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSingle && onUpdateSingle(stock.id);
            }} 
            disabled={perStockUpdating && perStockUpdating[stock.id]}
          >
            {perStockUpdating && perStockUpdating[stock.id] ? 'Updating...' : 'Update'}
          </button>
        </div>
        
        <div className="header-box ticker-box" onPointerDown={(e) => e.stopPropagation()}>
          {isEditingTicker || !stock.ticker ? (
            <input
              value={tickerValue}
              onChange={(e) => setTickerValue(e.target.value)}
              onKeyDown={handleTickerKeyPress}
              onBlur={handleTickerSave}
              onClick={(e) => e.stopPropagation()}
              className="ticker-input"
              autoFocus
              maxLength="10"
              placeholder="Ticker"
            />
          ) : (
            <span 
              className="ticker-display" 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTicker(true);
              }}
              title="Click to edit ticker"
            >
              {stock.ticker || 'Ticker'}
            </span>
          )}
        </div>
        
        <div className="header-box points-box" onPointerDown={(e) => e.stopPropagation()}>
          <span className="main-score">
            {score}
          </span>
        </div>
      </div>

      <div className="criteria-grid">
        <CriteriaInput
          label="Price"
          value={stock.price || ''}
          onChange={(value) => onUpdate(stock.id, 'price', value)}
          type="number"
          step="0.01"
          suffix="$"
          currentPoints={getScorePoints(stock.price, 'price')}
          warning={getWarning(stock.price, 'price')}
          scale={priceScale}
        />

        <CriteriaInput
          label="Percent Risen"
          value={stock.percentRise || ''}
          onChange={(value) => onUpdate(stock.id, 'percentRise', value)}
          type="number"
          step="0.01"
          suffix="%"
          currentPoints={getScorePoints(stock.percentRise, 'percentRise')}
          warning={getWarning(stock.percentRise, 'percentRise')}
          scale={percentRiseScale}
        />

        <CriteriaInput
          label="Relative Volume"
          value={stock.relativeVolume || ''}
          onChange={(value) => onUpdate(stock.id, 'relativeVolume', value)}
          type="number"
          step="0.1"
          suffix="x"
          currentPoints={getScorePoints(stock.relativeVolume, 'relativeVolume')}
          warning={getWarning(stock.relativeVolume, 'relativeVolume')}
          scale={relativeVolumeScale}
        />

        <CriteriaInput
          label="Float"
          value={stock.float || ''}
          onChange={(value) => onUpdate(stock.id, 'float', value)}
          type="number"
          step="0.1"
          suffix="M"
          currentPoints={getScorePoints(stock.float, 'float')}
          warning={getWarning(stock.float, 'float')}
          scale={floatScale}
          manualOnly={true}
        />
      </div>

      <NewsSection
        title="News & Catalysts"
        items={[...(stock.positiveCatalysts || []), ...(stock.marketDrivers || [])]}
        onUpdate={(items) => {
          onUpdate(stock.id, 'positiveCatalysts', items);
          onUpdate(stock.id, 'marketDrivers', []);
        }}
      />

      <div className="bonus-criteria">
        <div className="bonus-header">
          <h4>Bonus Criteria</h4>
          <div className="bonus-score">
            {(() => {
              const totalBonus = (stock.bonusChecks?.recentIPO ? 1 : 0) + 
                                (stock.bonusChecks?.recentReverseSplit ? 1 : 0) + 
                                (stock.bonusChecks?.blueSkyBreakout ? 1 : 0);
              return totalBonus > 0 ? (
                <span className="bonus-points-positive">
                  +{totalBonus} pts
                </span>
              ) : null;
            })()}
          </div>
        </div>
        <div className="bonus-criteria-items">
          <label>
            <input
              type="checkbox"
              checked={stock.bonusChecks?.recentIPO || false}
              onChange={(e) => onUpdate(stock.id, 'bonusChecks', { 
                ...(stock.bonusChecks || {}), 
                recentIPO: e.target.checked 
              })}
            />
            Recent IPO
          </label>
          <label>
            <input
              type="checkbox"
              checked={stock.bonusChecks?.recentReverseSplit || false}
              onChange={(e) => onUpdate(stock.id, 'bonusChecks', { 
                ...(stock.bonusChecks || {}), 
                recentReverseSplit: e.target.checked 
              })}
            />
            Recent Reverse Split
          </label>
          <label>
            <input
              type="checkbox"
              checked={stock.bonusChecks?.blueSkyBreakout || false}
              onChange={(e) => onUpdate(stock.id, 'bonusChecks', { 
                ...(stock.bonusChecks || {}), 
                blueSkyBreakout: e.target.checked 
              })}
            />
            Blue Sky Breakout
          </label>
        </div>
      </div>

      <div className="notes-section">
        <h4>Notes</h4>
        <textarea
          value={stock.notes || ''}
          onChange={(e) => onUpdate(stock.id, 'notes', e.target.value)}
          placeholder="Trading notes, observations, setup details..."
        />
      </div>
    </div>
  );
}

// Memoize StockPaper to prevent unnecessary re-renders
export default memo(StockPaper, (prevProps, nextProps) => {
  // Only re-render if the stock data, score, or updating state has changed
  return (
    prevProps.stock.id === nextProps.stock.id &&
    prevProps.score === nextProps.score &&
    prevProps.rank === nextProps.rank &&
    prevProps.perStockUpdating[prevProps.stock.id] === nextProps.perStockUpdating[nextProps.stock.id] &&
    JSON.stringify(prevProps.stock) === JSON.stringify(nextProps.stock)
  );
});
