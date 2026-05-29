import React from 'react';
import StockCard from './StockCard';

// Card minimum width scales with how many criteria are shown so the boxes
// genuinely grow with the amount of info inside. CSS Grid then reflows
// columns to keep margins even regardless of viewport.
function cardMinWidth(criteriaCount) {
  // Base: 240px for the header alone. +14px per criterion. Capped.
  const base = 240;
  const perCriterion = 14;
  const min = Math.min(base + criteriaCount * perCriterion, 460);
  return `${min}px`;
}

export default function StockGrid({
  stocks,
  visibleCriteria,
  loadingIds,
  showScores,
  onRefresh,
  onRemove,
}) {
  if (stocks.length === 0) {
    return (
      <div className="stock-grid--empty">
        <h2 className="empty-state__title">No stocks yet</h2>
        <p className="empty-state__hint">
          Add a ticker symbol up top to get started.
        </p>
      </div>
    );
  }

  // Count of body criteria (header criteria like price/change always shown)
  const bodyCriteriaCount = visibleCriteria.filter(
    (k) => k !== 'price' && k !== 'percentChange'
  ).length;

  const style = {
    '--card-min-width': cardMinWidth(bodyCriteriaCount),
  };

  return (
    <div className="stock-grid" style={style}>
      {stocks.map((stock) => (
        <StockCard
          key={stock.id}
          stock={stock}
          visibleCriteria={visibleCriteria}
          loading={loadingIds.has(stock.id)}
          showScores={showScores}
          onRefresh={() => onRefresh(stock.id)}
          onRemove={() => onRemove(stock.id)}
        />
      ))}
    </div>
  );
}
