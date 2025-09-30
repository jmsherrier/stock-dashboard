import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StockPaper from './StockPaper';
import ModularStockPaper from './ModularStockPaper';

function SortableStockPaper({ 
  stock, 
  score, 
  rank, 
  isSelected, 
  onSelect, 
  perStockUpdating, 
  onUpdateSingle, 
  onToggleLock,
  useModular = false,
  ...props 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stock.id, disabled: stock.locked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const StockComponent = useModular ? ModularStockPaper : StockPaper;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`stock-wrapper ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={onSelect}
    >
      <StockComponent
        stock={stock} 
        score={score} 
        rank={rank} 
        onUpdateSingle={onUpdateSingle} 
        perStockUpdating={perStockUpdating} 
        dragListeners={stock.locked ? null : listeners}
        onToggleLock={onToggleLock}
        {...props} 
      />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when stock data hasn't changed
export default memo(SortableStockPaper, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.stock.id === nextProps.stock.id &&
    prevProps.score === nextProps.score &&
    prevProps.rank === nextProps.rank &&
    prevProps.isSelected === nextProps.isSelected &&
    (prevProps.perStockUpdating || {})[prevProps.stock.id] === (nextProps.perStockUpdating || {})[nextProps.stock.id] &&
    JSON.stringify(prevProps.stock.components || {}) === JSON.stringify(nextProps.stock.components || {})
  );
});
