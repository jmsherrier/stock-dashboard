import React from 'react';

function BonusChecksComponent({ stock, onUpdate, config }) {
  const bonusChecks = stock.bonusChecks || {};
  
  const totalBonus = (bonusChecks.recentIPO ? 1 : 0) + 
                    (bonusChecks.recentReverseSplit ? 1 : 0) + 
                    (bonusChecks.blueSkyBreakout ? 1 : 0);

  // Check if we should use original format (default behavior)
  const useOriginalFormat = !config || config.originalFormat !== false;

  if (useOriginalFormat) {
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
          <label>
            <input
              type="checkbox"
              checked={bonusChecks.recentIPO || false}
              onChange={(e) => {
                const updatedChecks = { ...bonusChecks, recentIPO: e.target.checked };
                if (stock.components) {
                  onUpdate(stock.id, 'bonusChecks', { checks: updatedChecks });
                } else {
                  onUpdate(stock.id, 'bonusChecks', updatedChecks);
                }
              }}
            />
            Recent IPO
          </label>
          <label>
            <input
              type="checkbox"
              checked={bonusChecks.recentReverseSplit || false}
              onChange={(e) => {
                const updatedChecks = { ...bonusChecks, recentReverseSplit: e.target.checked };
                if (stock.components) {
                  onUpdate(stock.id, 'bonusChecks', { checks: updatedChecks });
                } else {
                  onUpdate(stock.id, 'bonusChecks', updatedChecks);
                }
              }}
            />
            Recent Reverse Split
          </label>
          <label>
            <input
              type="checkbox"
              checked={bonusChecks.blueSkyBreakout || false}
              onChange={(e) => {
                const updatedChecks = { ...bonusChecks, blueSkyBreakout: e.target.checked };
                if (stock.components) {
                  onUpdate(stock.id, 'bonusChecks', { checks: updatedChecks });
                } else {
                  onUpdate(stock.id, 'bonusChecks', updatedChecks);
                }
              }}
            />
            Blue Sky Breakout
          </label>
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

  const checkboxes = [
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
      </div>
    </div>
  );
}

export default BonusChecksComponent;