import React, { useState } from 'react';
import { COMPONENT_REGISTRY } from './modular/ComponentRegistry';

function ModularStockPaper({ 
  stock, 
  score, 
  rank, 
  onUpdate, 
  onRemove, 
  onUpdateSingle, 
  perStockUpdating, 
  dragListeners
}) {
  // Normalize stock data to handle both old format (stock.ticker) and new format (stock.components.ticker.value)
  const normalizeStockData = (stock) => {
    if (stock.components) {
      // New format - convert to old format for display
      return {
        ...stock,
        ticker: stock.components.ticker?.value || '',
        price: stock.components.price?.value || '',
        percentRise: stock.components.percentRise?.value || '',
        relativeVolume: stock.components.relativeVolume?.value || '',
        float: stock.components.float?.value || '',
        notes: stock.components.notes?.value || '',
        positiveCatalysts: stock.components.news?.items || [],
        marketDrivers: [],
        bonusChecks: stock.components.bonusChecks?.checks || {}
      };
    }
    return stock; // Already in old format
  };

  const normalizedStock = normalizeStockData(stock);
  const [isEditingTicker, setIsEditingTicker] = useState(false);
  const [tickerValue, setTickerValue] = useState(normalizedStock.ticker || '');

  // Wrapper to handle both old and new update formats
  const handleUpdate = (stockId, field, value) => {
    if (stock.components) {
      // New format - update the component structure
      onUpdate(stockId, field, { value: value });
    } else {
      // Old format - direct update
      onUpdate(stockId, field, value);
    }
  };

  const handleTickerSave = () => {
    const newTicker = tickerValue.trim().toUpperCase();
    if (newTicker && newTicker !== normalizedStock.ticker) {
      handleUpdate(stock.id, 'ticker', newTicker);
    }
    setIsEditingTicker(false);
  };

  const handleTickerCancel = () => {
    setTickerValue(normalizedStock.ticker || '');
    setIsEditingTicker(false);
  };

  const handleTickerKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTickerSave();
    } else if (e.key === 'Escape') {
      handleTickerCancel();
    }
  };

  // Get components from registry
  const getComponent = (componentId) => {
    const componentConfig = COMPONENT_REGISTRY[componentId];
    return componentConfig ? componentConfig.component : null;
  };

  const TickerComponent = getComponent('ticker');
  const PriceComponent = getComponent('price');
  const PercentRiseComponent = getComponent('percentRise');
  const RelativeVolumeComponent = getComponent('relativeVolume');
  const FloatComponent = getComponent('float');
  const NewsComponent = getComponent('news');
  const BonusChecksComponent = getComponent('bonusChecks');
  const NotesComponent = getComponent('notes');

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

      {/* Header Section - Update Button, Ticker, Score */}
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
          {TickerComponent ? (
            <TickerComponent
              stock={normalizedStock}
              onUpdate={handleUpdate}
              isEditing={isEditingTicker}
              setIsEditing={setIsEditingTicker}
              tickerValue={tickerValue}
              setTickerValue={setTickerValue}
              onTickerSave={handleTickerSave}
              onTickerCancel={handleTickerCancel}
              onTickerKeyPress={handleTickerKeyPress}
            />
          ) : (
            // Fallback ticker display
            isEditingTicker || !normalizedStock.ticker ? (
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
                {normalizedStock.ticker || 'Ticker'}
              </span>
            )
          )}
        </div>
        
        <div className="header-box points-box" onPointerDown={(e) => e.stopPropagation()}>
          <span className="main-score">
            {score}
          </span>
        </div>
      </div>

      {/* Criteria Grid - Main 4 criteria inputs */}
      <div className="criteria-grid">
        {PriceComponent && (
          <PriceComponent
            stock={normalizedStock}
            onUpdate={handleUpdate}
          />
        )}
        
        {PercentRiseComponent && (
          <PercentRiseComponent
            stock={normalizedStock}
            onUpdate={handleUpdate}
          />
        )}
        
        {RelativeVolumeComponent && (
          <RelativeVolumeComponent
            stock={normalizedStock}
            onUpdate={handleUpdate}
          />
        )}
        
        {FloatComponent && (
          <FloatComponent
            stock={normalizedStock}
            onUpdate={handleUpdate}
          />
        )}
      </div>

      {/* News Section */}
      {NewsComponent && (
        <NewsComponent
          stock={normalizedStock}
          onUpdate={handleUpdate}
        />
      )}

      {/* Bonus Criteria Section */}
      {BonusChecksComponent && (
        <BonusChecksComponent
          stock={normalizedStock}
          onUpdate={handleUpdate}
        />
      )}

      {/* Notes Section */}
      {NotesComponent && (
        <NotesComponent
          stock={normalizedStock}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

export default ModularStockPaper;