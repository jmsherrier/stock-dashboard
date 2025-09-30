import React from 'react';
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
  } = useSortable({ 
    id: stock.id, 
    disabled: stock.locked === true 
  });

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
        dragListeners={stock.locked === true ? null : listeners}
        onToggleLock={onToggleLock}
        {...props} 
      />
    </div>
  );
}

export default SortableStockPaper;
