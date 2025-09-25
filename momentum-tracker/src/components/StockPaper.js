import React, { useState } from 'react';
import CriteriaInput from './CriteriaInput';
import NewsSection from './NewsSection';

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
  
  // Helper function to calculate individual criteria scores
  const getScorePoints = (value, type) => {
    const val = parseFloat(value) || 0;
    
    switch (type) {
      case 'price':
        if (val >= 15) return -3;
        if (val >= 10) return -2;
        if (val >= 8) return -1;
        if (val >= 5) return 1;
        if (val >= 3) return 2;
        if (val >= 2) return 3;
        return 0;
      
      case 'percentRise':
        if (val < 3) return -3;
        if (val < 5) return -2;
        if (val < 7) return -1;
        if (val < 10) return 1;
        if (val < 15) return 2;
        if (val >= 15) return 3;
        return 0;
      
      case 'relativeVolume':
        if (val < 2) return -3;
        if (val < 3) return -2;
        if (val < 5) return -1;
        if (val < 8) return 1;
        if (val < 12) return 2;
        if (val >= 12) return 3;
        return 0;
      
      case 'float':
        if (val > 50) return -3;
        if (val > 30) return -2;
        if (val > 20) return -1;
        if (val > 15) return 1;
        if (val > 10) return 2;
        if (val > 0 && val <= 10) return 3;
        return 0;
      
      default:
        return 0;
    }
  };

  const getWarning = (value, type) => {
    const val = parseFloat(value) || 0;
    if (!value || val === 0) return null; // No warning for empty/zero values
    
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
    }
    return null;
  };

  const getScoreColor = (score) => {
    if (score >= 10) return '#22c55e'; // bright green
    if (score >= 5) return '#84cc16'; // green  
    if (score >= 0) return '#666'; // neutral
    if (score >= -5) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const priceScale = [
    { range: '$15-20', points: -3 },
    { range: '$10-15', points: -2 },
    { range: '$8-10', points: -1 },
    { range: '$5-8', points: 1 },
    { range: '$3-5', points: 2 },
    { range: '$2-3', points: 3 }
  ];

  const percentRiseScale = [
    { range: '<3%', points: -3 },
    { range: '3-5%', points: -2 },
    { range: '5-7%', points: -1 },
    { range: '7-10%', points: 1 },
    { range: '10-15%', points: 2 },
    { range: '15%+', points: 3 }
  ];

  const relativeVolumeScale = [
    { range: '<2x', points: -3 },
    { range: '2-3x', points: -2 },
    { range: '3-5x', points: -1 },
    { range: '5-8x', points: 1 },
    { range: '8-12x', points: 2 },
    { range: '12x+', points: 3 }
  ];

  const floatScale = [
    { range: '>50M', points: -3 },
    { range: '30-50M', points: -2 },
    { range: '20-30M', points: -1 },
    { range: '15-20M', points: 1 },
    { range: '10-15M', points: 2 },
    { range: '<10M', points: 3 }
  ];

  return (
    <div className="stock-paper" {...(dragListeners || {})}>
      <div className="stock-header">
        <div className="header-left">
          <button 
            className="update-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSingle && onUpdateSingle(stock.id);
            }} 
            disabled={perStockUpdating && perStockUpdating[stock.id]}
          >
            {perStockUpdating && perStockUpdating[stock.id] ? 'Updating...' : 'Update'}
          </button>
          <button 
            className="remove-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(stock.id);
            }}
          >
            Remove
          </button>
        </div>
        
        <div className="header-center">
          {isEditingTicker || !stock.ticker ? (
            <div className="ticker-edit">
              <input
                value={tickerValue}
                onChange={(e) => setTickerValue(e.target.value)}
                onKeyDown={handleTickerKeyPress}
                onBlur={handleTickerSave}
                onClick={(e) => e.stopPropagation()}
                className="ticker-input"
                autoFocus
                maxLength="10"
                placeholder="Enter ticker"
              />
            </div>
          ) : (
            <h2 
              className="ticker-display" 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTicker(true);
              }}
              title="Click to edit ticker"
            >
              {stock.ticker}
            </h2>
          )}
        </div>
        
        <div className="header-right">
          <div className="main-score">
            {score > 0 ? '+' : ''}{score}
          </div>
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
          label="% Rise"
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
            {((stock.bonusChecks?.recentIPO ? 1 : 0) + 
              (stock.bonusChecks?.recentReverseSplit ? 1 : 0) + 
              (stock.bonusChecks?.blueSkyBreakout ? 1 : 0)) > 0 ? '+' : ''}
            {(stock.bonusChecks?.recentIPO ? 1 : 0) + 
             (stock.bonusChecks?.recentReverseSplit ? 1 : 0) + 
             (stock.bonusChecks?.blueSkyBreakout ? 1 : 0)}
          </div>
        </div>
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

export default StockPaper;
