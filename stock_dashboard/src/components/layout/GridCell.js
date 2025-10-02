import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import ModularStockPaper from './ModularStockPaper';

function GridCell({
  x,
  y,
  stock,
  isHovered,
  isDragging,
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
  onClickStock,
  clickedStockId,
  onHoverCell
}) {
  const { attributes, listeners, setNodeRef, isDragging: isDraggingThis } = useDraggable({
    id: stock ? stock.id : `empty-${x}-${y}`,
    disabled: !stock || stock.locked
  });

  const cellStyle = {
    position: 'absolute',
    left: `${x * (cellDimensions.width + cellGap)}px`,
    top: `${y * (cellDimensions.height + cellGap)}px`,
    width: `${cellDimensions.width}px`,
    height: `${cellDimensions.height}px`,
    opacity: isDraggingThis ? 0.3 : 1,
    transition: isDraggingThis ? 'none' : 'opacity 0.2s'
  };

  // Distinguish between drag-over (during drag) and hover (mouse over)
  const isDragOver = isHovered && !stock && isDragging;
  const isMouseHover = isHovered && !stock && !isDragging;

  return (
    <div
      ref={setNodeRef}
      className={`grid-cell ${stock ? 'occupied' : 'empty'} ${isMouseHover ? 'hovered' : ''} ${isDragOver ? 'drag-over' : ''}`}
      style={cellStyle}
      onMouseEnter={() => !stock && onHoverCell && onHoverCell({ x, y })}
      onMouseLeave={() => !stock && onHoverCell && onHoverCell(null)}
      {...attributes}
      {...listeners}
    >
      {stock ? (
        <div
          className={`stock-wrapper ${selectedStock === stock.id ? 'selected' : ''} ${clickedStockId === stock.id ? 'clicked' : ''}`}
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
            onClickStock={onClickStock}
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
