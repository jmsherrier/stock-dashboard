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
  canMakeRequest,
  dragListeners,
  onToggleLock
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
        {stock.paperConfig?.price === true && COMPONENT_REGISTRY.price && (
          <COMPONENT_REGISTRY.price.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.percentRise === true && COMPONENT_REGISTRY.percentRise && (
          <COMPONENT_REGISTRY.percentRise.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.relativeVolume === true && COMPONENT_REGISTRY.relativeVolume && (
          <COMPONENT_REGISTRY.relativeVolume.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.float === true && COMPONENT_REGISTRY.float && (
          <COMPONENT_REGISTRY.float.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.marketCap === true && COMPONENT_REGISTRY.marketCap && (
          <COMPONENT_REGISTRY.marketCap.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.beta === true && COMPONENT_REGISTRY.beta && (
          <COMPONENT_REGISTRY.beta.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.week52High === true && COMPONENT_REGISTRY.week52High && (
          <COMPONENT_REGISTRY.week52High.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.movingAverage50 === true && COMPONENT_REGISTRY.movingAverage50 && (
          <COMPONENT_REGISTRY.movingAverage50.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.movingAverage200 === true && COMPONENT_REGISTRY.movingAverage200 && (
          <COMPONENT_REGISTRY.movingAverage200.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.analystTarget === true && COMPONENT_REGISTRY.analystTarget && (
          <COMPONENT_REGISTRY.analystTarget.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.sector === true && COMPONENT_REGISTRY.sector && (
          <COMPONENT_REGISTRY.sector.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.industry === true && COMPONENT_REGISTRY.industry && (
          <COMPONENT_REGISTRY.industry.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.profitMargin === true && COMPONENT_REGISTRY.profitMargin && (
          <COMPONENT_REGISTRY.profitMargin.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.revenueGrowth === true && COMPONENT_REGISTRY.revenueGrowth && (
          <COMPONENT_REGISTRY.revenueGrowth.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.peRatio === true && COMPONENT_REGISTRY.peRatio && (
          <COMPONENT_REGISTRY.peRatio.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.sharesOutstanding === true && COMPONENT_REGISTRY.sharesOutstanding && (
          <COMPONENT_REGISTRY.sharesOutstanding.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}

        {stock.paperConfig?.restrictedShares === true && COMPONENT_REGISTRY.restrictedShares && (
          <COMPONENT_REGISTRY.restrictedShares.component
            stock={stock}
            onUpdate={onUpdate}
          />
        )}
      </div>

      {/* News Section */}
      {stock.paperConfig?.news === true && COMPONENT_REGISTRY.news && (
        <COMPONENT_REGISTRY.news.component
          stock={stock}
          onUpdate={onUpdate}
        />
      )}

      {/* Bonus Criteria Section */}
      {stock.paperConfig?.bonusChecks === true && COMPONENT_REGISTRY.bonusChecks && (
        <COMPONENT_REGISTRY.bonusChecks.component
          stock={stock}
          onUpdate={onUpdate}
        />
      )}

      {/* Notes Section */}
      {stock.paperConfig?.notes === true && COMPONENT_REGISTRY.notes && (
        <COMPONENT_REGISTRY.notes.component
          stock={stock}
          onUpdate={onUpdate}
        />
      )}

      {/* Lock Position Checkbox */}
      {onToggleLock && (
        <div className="lock-position-control">
          <label className="lock-checkbox-label">
            <input
              type="checkbox"
              checked={stock.locked === true}
              onChange={(e) => {
                e.stopPropagation();
                onToggleLock(stock.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="lock-checkbox"
            />
            <span onClick={(e) => e.stopPropagation()}>Lock position</span>
          </label>
        </div>
      )}
    </div>
  );
}

export default ModularStockPaper;