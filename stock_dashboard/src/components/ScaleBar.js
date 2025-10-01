import React, { memo } from 'react';

function ScaleBar({ currentPoints, scale }) {
  // Create a gradient from dark red (-3) to light green (+3)
  const getSegmentClass = (points, index, totalSegments) => {
    const baseClass = 'scale-segment';
    const activeClass = currentPoints === points ? 'active' : '';
    const gradientClass = `gradient-${index}`;
    return `${baseClass} ${gradientClass} ${activeClass}`.trim();
  };

  return (
    <div className="scale-bar">
      {scale.map((item, index) => (
        <div 
          key={index} 
          className={getSegmentClass(item.points, index, scale.length)}
        >
          <div className="scale-range">{item.range}</div>
          <div className="scale-value">{item.points > 0 ? '+' : ''}{item.points}</div>
        </div>
      ))}
    </div>
  );
}

export default memo(ScaleBar);