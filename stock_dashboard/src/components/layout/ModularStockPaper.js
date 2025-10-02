/* eslint-disable react/jsx-pascal-case */
import React, { useState } from 'react';
import { COMPONENT_REGISTRY } from '../modular/ComponentRegistry';

function ModularStockPaper({
  stock,
  score,
  rank,
  onUpdate,
  onRemove,
  onUpdateSingle,
  perStockUpdating,
  canMakeRequest,
  dragListeners,
  onToggleLock,
  onClickStock
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
    <div className={`stock-paper ${stock.locked ? 'locked' : ''}`}>
      {dragListeners && (
        <div 
          className="drag-bg-handle" 
          {...dragListeners}
          onClick={(e) => {
            e.stopPropagation();
            if (onClickStock) {
              onClickStock(stock.id);
            }
          }}
          title="Click to select, drag to reorder"
        />
      )}
      
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
              disabled={perStockUpdating && perStockUpdating[stock.id]}
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
        {/* Dynamically render all components enabled in paperConfig */}
        {stock.paperConfig && Object.keys(stock.paperConfig).map(componentId => {
          // Skip special components that have their own sections or are in header
          if (['ticker', 'news', 'notes', 'bonusChecks'].includes(componentId)) {
            return null;
          }
          
          // Only render if enabled and exists in registry
          if (stock.paperConfig[componentId] === true && COMPONENT_REGISTRY[componentId]) {
            return (
              <React.Fragment key={componentId}>
                {React.createElement(COMPONENT_REGISTRY[componentId].component, { 
                  stock, 
                  onUpdate,
                  config: { criteriaMode: true } // Enable criteria mode for all components
                })}
              </React.Fragment>
            );
          }
          return null;
        })}
      </div>

      {/* News Section */}
      {stock.paperConfig?.news === true && COMPONENT_REGISTRY.news && 
        React.createElement(COMPONENT_REGISTRY.news.component, { stock, onUpdate })
      }

      {/* Bonus Criteria Section */}
      {stock.paperConfig?.bonusChecks === true && COMPONENT_REGISTRY.bonusChecks && 
        React.createElement(COMPONENT_REGISTRY.bonusChecks.component, { stock, onUpdate })
      }

      {/* Notes Section */}
      {stock.paperConfig?.notes === true && COMPONENT_REGISTRY.notes && 
        React.createElement(COMPONENT_REGISTRY.notes.component, { stock, onUpdate })
      }

      {/* Lock Position Checkbox */}
      {onToggleLock && (
        <div className="lock-position-control">
          <input
            type="checkbox"
            checked={stock.locked === true}
            onChange={(e) => {
              e.stopPropagation();
              onToggleLock(stock.id);
            }}
            onClick={(e) => e.stopPropagation()}
            className="lock-checkbox"
            id={`lock-${stock.id}`}
          />
          <span className="lock-checkbox-text">Lock position</span>
        </div>
      )}
    </div>
  );
}

export default ModularStockPaper;