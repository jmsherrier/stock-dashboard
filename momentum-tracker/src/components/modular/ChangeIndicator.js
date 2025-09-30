import React from 'react';

/**
 * ChangeIndicator - Shows an up/down arrow based on value change
 * @param {string|number} currentValue - Current value
 * @param {string|number} previousValue - Previous value
 * @param {boolean} reverseColors - If true, down is green, up is red (for P/E, etc.)
 */
function ChangeIndicator({ currentValue, previousValue, reverseColors = false }) {
  // Don't show if no previous value exists
  if (!previousValue || previousValue === null || previousValue === undefined || previousValue === '') {
    return null;
  }

  const current = parseFloat(currentValue);
  const previous = parseFloat(previousValue);

  // Don't show if either value is invalid
  if (isNaN(current) || isNaN(previous)) {
    return null;
  }

  // Don't show if values are the same
  if (current === previous) {
    return null;
  }

  const isUp = current > previous;
  const direction = isUp ? '↑' : '↓';
  
  // Determine color based on direction and reverseColors setting
  let colorClass = '';
  if (reverseColors) {
    colorClass = isUp ? 'change-down' : 'change-up'; // Reversed: up=red, down=green
  } else {
    colorClass = isUp ? 'change-up' : 'change-down'; // Normal: up=green, down=red
  }

  return (
    <span className={`change-indicator ${colorClass}`} title={`Previous: ${previous}`}>
      {direction}
    </span>
  );
}

export default ChangeIndicator;
