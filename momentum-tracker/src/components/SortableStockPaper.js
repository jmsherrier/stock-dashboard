import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StockPaper from './StockPaper';

function SortableStockPaper({ stock, score, rank, isSelected, onSelect, perStockUpdating, onUpdateSingle, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stock.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`stock-wrapper ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={onSelect}
    >
      <StockPaper 
        stock={stock} 
        score={score} 
        rank={rank} 
        onUpdateSingle={onUpdateSingle} 
        perStockUpdating={perStockUpdating} 
        dragListeners={listeners}
        {...props} 
      />
    </div>
  );
}

export default SortableStockPaper;
