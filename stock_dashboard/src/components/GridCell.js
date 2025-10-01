import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import ModularStockPaper from './ModularStockPaper';

function GridCell({
  x,
  y,
  stock,
  isHovered,
  cellDimensions,
  cellGap,
  zoom,
  selectedStock,
  onStockSelect,
  onStockUpdate,
  onStockRemove,
  perStockUpdating,
  onUpdateSingle,
  canMakeRequest,
  onToggleLock,
  calculateScore,
  onHoverStock
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: stock ? stock.id : `empty-${x}-${y}`,
    disabled: !stock || stock.locked
  });

  const cellStyle = {
    position: 'absolute',
    left: `${x * (cellDimensions.width + cellGap)}px`,
    top: `${y * (cellDimensions.height + cellGap)}px`,
    width: `${cellDimensions.width}px`,
    height: `${cellDimensions.height}px`,
    opacity: isDragging ? 0.3 : 1,
    transition: isDragging ? 'none' : 'opacity 0.2s'
  };

  const isDragOver = isHovered && !stock;

  return (
    <div
      ref={setNodeRef}
      className={`grid-cell ${stock ? 'occupied' : 'empty'} ${isHovered ? 'hovered' : ''} ${isDragOver ? 'drag-over' : ''}`}
      style={cellStyle}
      {...attributes}
      {...listeners}
    >
      {stock ? (
        <div
          className={`stock-wrapper ${selectedStock === stock.id ? 'selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onStockSelect(stock.id);
          }}
          onMouseEnter={() => onHoverStock && onHoverStock(stock.id)}
          onMouseLeave={() => onHoverStock && onHoverStock(null)}
        >
          <ModularStockPaper
            stock={stock}
            score={calculateScore(stock)}
            rank={0}
            onUpdate={onStockUpdate}
            onRemove={onStockRemove}
            perStockUpdating={perStockUpdating}
            onUpdateSingle={onUpdateSingle}
            canMakeRequest={canMakeRequest}
            dragListeners={listeners}
            onToggleLock={onToggleLock}
          />
        </div>
      ) : (
        <div className="cell-outline">
          <div className="outline-border" />
        </div>
      )}
    </div>
  );
}

export default GridCell;
