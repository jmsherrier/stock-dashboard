import React, { useState, memo } from 'react';
import { COMPONENT_REGISTRY } from './modular/ComponentRegistry';

function ModularStockPaper({
  stock,
  score,
  rank,
  onUpdate,
  onRemove,
  onUpdateSingle,
  perStockUpdating,
  canMakeRequest,
  dragListeners
}) {
  const [isEditingTicker, setIsEditingTicker] = useState(false);
  const [tickerValue, setTickerValue] = useState(stock.ticker || '');

  // Get current ticker from either old or new format
  const getCurrentTicker = () => {
    return stock.components?.ticker?.value || stock.ticker || '';
  };

  const handleTickerSave = () => {
    const newTicker = tickerValue.trim().toUpperCase();
    if (newTicker && newTicker !== getCurrentTicker()) {
      if (stock.components) {
        // New format
        onUpdate(stock.id, 'ticker', { value: newTicker });
      } else {
        // Old format
        onUpdate(stock.id, 'ticker', newTicker);
      }
    }
    setIsEditingTicker(false);
  };

  const handleTickerCancel = () => {
    setTickerValue(getCurrentTicker());
    setIsEditingTicker(false);
  };

  const handleTickerKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTickerSave();
    } else if (e.key === 'Escape') {
      handleTickerCancel();
    }
  };

  return (
    <div className="stock-paper">
      {dragListeners && <div className="drag-bg-handle" {...dragListeners} title="Drag to reorder" />}
      
      {onRemove && (
        <button
          className="remove-x"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(stock.id);
          }}
        >
          ×
        </button>
      )}

      <div className="stock-header">
        {onUpdateSingle && (
          <div className="header-box update-btn" onPointerDown={(e) => e.stopPropagation()}>
            <button
              className="update-btn-inner"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateSingle(stock.id);
              }}
              disabled={(perStockUpdating && perStockUpdating[stock.id]) || (canMakeRequest && !canMakeRequest())}
            >
              {perStockUpdating && perStockUpdating[stock.id] ? 'Updating...' : 'Update'}
            </button>
          </div>
        )}

        <div className="header-box ticker-box" onPointerDown={(e) => e.stopPropagation()}>
          {isEditingTicker || !getCurrentTicker() ? (
            <input
              value={tickerValue}
              onChange={(e) => setTickerValue(e.target.value)}
              onKeyDown={handleTickerKeyPress}
              onBlur={handleTickerSave}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
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
              {getCurrentTicker() || 'Ticker'}
            </span>
          )}
        </div>

        {score !== undefined && (
          <div className="header-box points-box" onPointerDown={(e) => e.stopPropagation()}>
            <span className="main-score">
              {score}
            </span>
          </div>
        )}
      </div>

      <div className="criteria-grid">
        {COMPONENT_REGISTRY.price && (
          <COMPONENT_REGISTRY.price.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {COMPONENT_REGISTRY.percentRise && (
          <COMPONENT_REGISTRY.percentRise.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {COMPONENT_REGISTRY.relativeVolume && (
          <COMPONENT_REGISTRY.relativeVolume.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {COMPONENT_REGISTRY.float && (
          <COMPONENT_REGISTRY.float.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}
      </div>

      {/* News Section */}
      {COMPONENT_REGISTRY.news && (
        <COMPONENT_REGISTRY.news.component
          stock={stock}
          onUpdate={onUpdate}
        />
      )}

      {/* Bonus Criteria Section */}
      {COMPONENT_REGISTRY.bonusChecks && (
        <COMPONENT_REGISTRY.bonusChecks.component
          stock={stock}
          onUpdate={onUpdate}
        />
      )}

      {/* Notes Section */}
      {COMPONENT_REGISTRY.notes && (
        <COMPONENT_REGISTRY.notes.component
          stock={stock}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

export default memo(ModularStockPaper);