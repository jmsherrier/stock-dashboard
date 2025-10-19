import React from 'react';

function BonusChecksComponent({ stock, onUpdate, config }) {
  // Handle both data formats properly
  const bonusChecks = stock.components ? (stock.components.bonusChecks?.checks || {}) : (stock.bonusChecks || {});
  
  // Get available bonus criteria from stock's configuration (set by preset)
  const availableCriteria = stock.bonusChecksConfig || {};
  
  // Calculate total bonus based on checked items and their point values
  const totalBonus = Object.entries(availableCriteria).reduce((sum, [key, criteria]) => {
    return sum + (bonusChecks[key] ? criteria.points : 0);
  }, 0);

  // Check if we should use original format (default behavior)
  const useOriginalFormat = !config || config.originalFormat !== false;

  if (useOriginalFormat) {
    // If no criteria configured, show message
    if (Object.keys(availableCriteria).length === 0) {
      return (
        <div className="bonus-criteria">
          <div className="bonus-header">
            <h4>Bonus Criteria</h4>
          </div>
          <div className="bonus-criteria-items">
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
              No bonus criteria configured for this strategy.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bonus-criteria">
        <div className="bonus-header">
          <h4>Bonus Criteria</h4>
          <div className="bonus-score">
            {totalBonus > 0 ? (
              <span className="bonus-points-positive">
                +{totalBonus} pts
              </span>
            ) : null}
          </div>
        </div>
        <div className="bonus-criteria-items">
          {Object.entries(availableCriteria).map(([key, criteria]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={bonusChecks[key] || false}
                onChange={(e) => {
                  const updatedChecks = { ...bonusChecks, [key]: e.target.checked };
                  if (stock.components) {
                    onUpdate(stock.id, 'bonusChecks', { checks: updatedChecks });
                  } else {
                    onUpdate(stock.id, 'bonusChecks', updatedChecks);
                  }
                }}
              />
              {criteria.description}
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Fallback modular format
  const handleCheckboxChange = (field, checked) => {
    const updatedChecks = {
      ...bonusChecks,
      [field]: checked
    };
    onUpdate(stock.id, 'bonusChecks', updatedChecks);
  };

  // Build checkboxes from available criteria or use defaults
  const checkboxes = Object.keys(availableCriteria).length > 0 
    ? Object.entries(availableCriteria).map(([key, criteria]) => ({
        id: key,
        label: criteria.description,
        description: ''
      }))
    : [
        {
          id: 'recentIPO',
          label: 'Recent IPO',
          description: 'Recently went public'
        },
        {
          id: 'recentReverseSplit',
          label: 'Recent Reverse Split',
          description: 'Had a recent reverse split'
        },
        {
          id: 'blueSkyBreakout',
          label: 'Blue Sky Breakout',
          description: 'Breaking out to new highs'
        }
      ];

  return (
    <div className="modular-component bonus-checks-component medium-component">
      <div className="component-header">
        <label>Bonus Criteria</label>
        <div className={`component-score ${totalBonus > 0 ? 'score-green' : 'score-neutral'}`}>
          {totalBonus > 0 ? '+' : ''}{totalBonus} pts
        </div>
      </div>
      <div className="component-content">
        {checkboxes.length > 0 ? (
          <div className="bonus-checkboxes">
            {checkboxes.map(checkbox => (
              <label key={checkbox.id} className="bonus-checkbox">
                <input
                  type="checkbox"
                  checked={bonusChecks[checkbox.id] || false}
                  onChange={(e) => handleCheckboxChange(checkbox.id, e.target.checked)}
                />
                <span className="checkbox-label">
                  {checkbox.label}
                  <small className="checkbox-description">{checkbox.description}</small>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
            No bonus criteria configured.
          </p>
        )}
      </div>
    </div>
  );
}

export default BonusChecksComponent;