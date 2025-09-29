import React, { useState } from 'react';

function TickerComponent({ 
  stock, 
  onUpdate, 
  config,
  // Props for parent-controlled editing
  isEditing: parentIsEditing,
  setIsEditing: parentSetIsEditing,
  tickerValue: parentTickerValue,
  setTickerValue: parentSetTickerValue,
  onTickerSave: parentOnTickerSave,
  onTickerCancel: parentOnTickerCancel,
  onTickerKeyPress: parentOnTickerKeyPress
}) {
  // Get current ticker value from modular format
  const currentTicker = stock.components?.ticker?.value || '';
  
  // Use parent state if provided, otherwise local state
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [localTickerValue, setLocalTickerValue] = useState(currentTicker);

  const isEditing = parentIsEditing !== undefined ? parentIsEditing : localIsEditing;
  const setIsEditing = parentSetIsEditing || setLocalIsEditing;
  const tickerValue = parentTickerValue !== undefined ? parentTickerValue : localTickerValue;
  const setTickerValue = parentSetTickerValue || setLocalTickerValue;

  const handleSave = parentOnTickerSave || (() => {
    const newTicker = tickerValue.trim().toUpperCase();
    if (newTicker !== currentTicker) {
      onUpdate(stock.id, 'ticker', newTicker);
    }
    setIsEditing(false);
  });

  const handleCancel = parentOnTickerCancel || (() => {
    setTickerValue(currentTicker);
    setIsEditing(false);
  });

  const handleKeyPress = parentOnTickerKeyPress || ((e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  });

  // Check if we're being used in a header context (no config.showLabel or parent-controlled)
  const isHeaderMode = parentIsEditing !== undefined || (config && config.headerMode);

  if (isHeaderMode) {
    // Header mode - just return the ticker input/display without wrapper
    return isEditing ? (
      <input
        value={tickerValue}
        onChange={(e) => setTickerValue(e.target.value)}
        onKeyDown={handleKeyPress}
        onBlur={handleSave}
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
          setTickerValue(currentTicker);
          setIsEditing(true);
        }}
        title="Click to edit ticker"
      >
        {currentTicker || 'Ticker'}
      </span>
    );
  }

  // Full component mode with label
  return (
    <div className="modular-component ticker-component">
      <div className="component-header">
        <label>Ticker</label>
      </div>
      <div className="component-content">
        {isEditing ? (
          <input
            value={tickerValue}
            onChange={(e) => setTickerValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSave}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.target.select()}
            className="ticker-input"
            autoFocus
            maxLength="10"
            placeholder="Enter ticker"
          />
        ) : (
          <span 
            className="ticker-display" 
            onClick={(e) => {
              e.stopPropagation();
              setTickerValue(currentTicker);
              setIsEditing(true);
            }}
            title="Click to edit ticker"
          >
            {currentTicker || 'Ticker'}
          </span>
        )}
      </div>
    </div>
  );
}

export default TickerComponent;