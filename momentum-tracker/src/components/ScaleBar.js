import React from 'react';

function ScaleBar({ currentPoints, scale }) {
  return (
    <div className="scale-bar">
      {scale.map((item, index) => (
        <div 
          key={index} 
          className={`scale-segment ${currentPoints === item.points ? 'active' : ''} ${item.points > 0 ? 'positive' : item.points < 0 ? 'negative' : 'neutral'}`}
        >
          <div className="scale-range">{item.range}</div>
          <div className="scale-value">{item.points > 0 ? '+' : ''}{item.points}</div>
        </div>
      ))}
    </div>
  );
}

export default ScaleBar;