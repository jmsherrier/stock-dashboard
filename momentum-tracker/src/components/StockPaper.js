import React from 'react';

function StockPaper({ stock, score, onUpdate, onRemove, onUpdateSingle, perStockUpdating }) {
  return (
    <div className="stock-paper">
      <div className="paper-header">
        <h2>{stock.ticker}</h2>
        <div className="score">{score}</div>
      </div>
      <div className="criteria-grid">
        <div className="criteria-input">
          <div className="criteria-header">
            <label>Percent Change</label>
            <div className="points-display">{stock.percentChange}%</div>
          </div>
          <input
            value={stock.percentChange}
            onChange={(e) => onUpdate(stock.id, 'percentChange', e.target.value)}
          />
        </div>
        <div className="criteria-input">
          <div className="criteria-header">
            <label>Relative Volume</label>
            <div className="points-display">{stock.relativeVolume}x</div>
          </div>
          <input
            value={stock.relativeVolume}
            onChange={(e) => onUpdate(stock.id, 'relativeVolume', e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="update-btn" onClick={() => onUpdateSingle && onUpdateSingle(stock.id)} disabled={perStockUpdating && perStockUpdating[stock.id]}>
          {perStockUpdating && perStockUpdating[stock.id] ? 'Updating...' : 'Update'}
        </button>
        <button className="remove-btn" onClick={() => onRemove(stock.id)}>Remove</button>
      </div>
    </div>
  );
}

export default StockPaper;
