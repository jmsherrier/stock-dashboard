import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { DndContext, DragOverlay, pointerWithin, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import GridCell from './GridCell';
import ModularStockPaper from './ModularStockPaper';
import './GridCanvas.css';

const GridCanvas = forwardRef(({
  stocks,
  onStockMove,
  onStockUpdate,
  onStockRemove,
  onStockAdd,
  selectedStock,
  onStockSelect,
  perStockUpdating,
  onUpdateSingle,
  canMakeRequest,
  onToggleLock,
  calculateScore,
  isAddingMode,
  setIsAddingMode,
  settings,
  currentPreset,
  onHoverStock
}, ref) => {
  const containerRef = useRef(null);
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);
  const [mouseDownOnEmpty, setMouseDownOnEmpty] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [cellDimensions, setCellDimensions] = useState(null);
  const [zoom, setZoom] = useState(1);

  // Grid settings
  const cellGap = 20; // Match internal padding of stock papers
  const gridPadding = 32;

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Calculate cell dimensions based on dummy stock
  useEffect(() => {
    const measureStock = () => {
      // Always measure from the hidden dummy stock
      const dummyContainer = document.querySelector('.dimension-measurement-container .stock-paper');
      if (dummyContainer) {
        const rect = dummyContainer.getBoundingClientRect();
        const newDimensions = {
          width: rect.width,
          height: rect.height
        };
        console.log('Measured dummy stock dimensions:', newDimensions);
        setCellDimensions(newDimensions);
      } else {
        console.log('No dummy stock element found to measure, retrying...');
        // Retry after a short delay if dummy not found yet
        setTimeout(measureStock, 50);
      }
    };

    // Initial measurement
    const timeoutId = setTimeout(measureStock, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // Only run on mount

  // Remeasure when configuration changes
  useEffect(() => {
    const remeasure = () => {
      const dummyContainer = document.querySelector('.dimension-measurement-container .stock-paper');
      if (dummyContainer) {
        const rect = dummyContainer.getBoundingClientRect();
        const newDimensions = {
          width: rect.width,
          height: rect.height
        };
        console.log('Remeasured dimensions after config change:', newDimensions);
        setCellDimensions(newDimensions);
      }
    };

    // Remeasure when preset changes
    const handlePresetChange = () => {
      setTimeout(remeasure, 200);
    };
    
    window.addEventListener('preset-changed', handlePresetChange);
    
    return () => {
      window.removeEventListener('preset-changed', handlePresetChange);
    };
  }, []);

  // Remeasure when stocks change (paperConfig might have changed)
  useEffect(() => {
    if (stocks.length > 0) {
      setTimeout(() => {
        const dummyContainer = document.querySelector('.dimension-measurement-container .stock-paper');
        if (dummyContainer) {
          const rect = dummyContainer.getBoundingClientRect();
          const newDimensions = {
            width: rect.width,
            height: rect.height
          };
          console.log('Remeasured dimensions after stock change:', newDimensions);
          setCellDimensions(newDimensions);
        }
      }, 150);
    }
  }, [stocks.length, stocks[0]?.paperConfig]);

  // Get paperConfig for template or from first stock
  const getTemplatePaperConfig = () => {
    // If we have a stock, use its paperConfig
    if (stocks.length > 0 && stocks[0].paperConfig) {
      return stocks[0].paperConfig;
    }
    
    // Use default configuration that matches new stock creation
    return {
      enabledComponents: [
        'ticker', 'price', 'percentRise', 'relativeVolume',
        'float', 'marketCap', 'volume', 'news', 'notes'
      ]
    };
  };

  // Calculate grid bounds based on stock positions with infinite expansion capability
  const getGridBounds = useCallback(() => {
    if (stocks.length === 0) {
      return { minX: -25, maxX: 25, minY: -25, maxY: 25 };
    }

    const positions = stocks.map(s => s.gridPosition || { x: 0, y: 0 });
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));

    // Maintain buffer of 25 cells around all stocks for infinite grid feel
    return {
      minX: minX - 25,
      maxX: maxX + 25,
      minY: minY - 25,
      maxY: maxY + 25
    };
  }, [stocks]);

  // Convert mouse coordinates to grid cell position
  // Returns null if cursor is in the gap between cells
  const getCellFromMouse = useCallback((clientX, clientY) => {
    if (!containerRef.current || !cellDimensions) return null;
    
    // Get the grid-canvas element (child with transform applied)
    const gridCanvas = containerRef.current.querySelector('.grid-canvas');
    if (!gridCanvas) return null;
    
    const rect = gridCanvas.getBoundingClientRect();
    
    // Mouse position relative to the transformed grid canvas
    // The transform has already been applied to rect, so we just need position relative to it
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    
    // Subtract padding (which is part of the grid-canvas element)
    const contentX = relX - gridPadding * zoom;
    const contentY = relY - gridPadding * zoom;
    
    // Divide by zoom to get into unscaled cell coordinate space
    const unscaledX = contentX / zoom;
    const unscaledY = contentY / zoom;
    
    // Calculate cell position
    // Cells are positioned at: x * (width + gap), y * (height + gap)
    const cellWidth = cellDimensions.width + cellGap;
    const cellHeight = cellDimensions.height + cellGap;
    
    const x = Math.floor(unscaledX / cellWidth);
    const y = Math.floor(unscaledY / cellHeight);
    
    // Check if we're in the actual cell or in the gap
    const localX = unscaledX - (x * cellWidth);
    const localY = unscaledY - (y * cellHeight);
    
    // Return null if in gap (beyond cell dimensions) or negative position
    if (localX < 0 || localY < 0 || localX >= cellDimensions.width || localY >= cellDimensions.height) {
      return null;
    }
    
    return { x, y };
  }, [cellDimensions, zoom, cellGap, gridPadding]);

  // Expose getCellFromMouse to parent via ref
  useImperativeHandle(ref, () => ({
    getCellFromMouse,
    getZoom: () => zoom,
    getGridOffset: () => gridOffset,
    setGridOffset: (offset) => setGridOffset(offset),
    getCellDimensions: () => cellDimensions
  }));

  // Handle zoom with mousewheel - zoom around center of viewport
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // Get mouse position relative to container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Get center of viewport
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate zoom point (use center for consistent zoom behavior)
    const zoomPointX = centerX;
    const zoomPointY = centerY;
    
    // Calculate world position of zoom point before zoom
    const worldX = (zoomPointX - gridOffset.x) / zoom;
    const worldY = (zoomPointY - gridOffset.y) / zoom;
    
    const delta = e.deltaY * -0.0003;
    const newZoom = Math.min(Math.max(0.25, zoom + delta), 2);
    
    // Calculate new offset to keep zoom point at same screen position
    const newOffsetX = zoomPointX - worldX * newZoom;
    const newOffsetY = zoomPointY - worldY * newZoom;
    
    setZoom(newZoom);
    setGridOffset({ x: newOffsetX, y: newOffsetY });
  }, [zoom, gridOffset]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Handle canvas dragging
  const handleCanvasMouseDown = (e) => {
    // Don't start dragging if clicking on a stock
    if (e.target.closest('.stock-paper')) return;
    
    setMouseDownOnEmpty(true);
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - gridOffset.x, y: e.clientY - gridOffset.y });
    setDragDistance(0); // Reset drag distance
    e.preventDefault();
  };

  const handleCanvasMouseMove = (e) => {
    // Handle canvas drag first
    if (isDraggingCanvas) {
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      // Track total drag distance
      const distance = Math.sqrt(Math.pow(newX - gridOffset.x, 2) + Math.pow(newY - gridOffset.y, 2));
      setDragDistance(distance);

      // Apply zero-aligned constraints
      if (settings.zeroAligned) {
        newX = Math.min(0, newX);
        newY = Math.min(0, newY);
      }

      setGridOffset({ x: newX, y: newY });
      return;
    }
  };

  // Handle cell hover - cells will call this directly
  const handleCellHover = (cell) => {
    if (!activeId && (isAddingMode || settings.clickEmptyToAdd)) {
      setHoveredCell(cell);
    } else {
      setHoveredCell(null);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    // Don't clear mouseDownOnEmpty here - wait for click handler
  };

  const handleCanvasClick = (e) => {
    // Don't create stock if user was dragging (1px threshold for precise click detection)
    if (dragDistance > .1) {
      setDragDistance(0);
      setMouseDownOnEmpty(false);
      return;
    }
    
    // Reset flags
    setDragDistance(0);
    setMouseDownOnEmpty(false);
    
    // Check if click is on background (not on a stock)
    const clickedOnStock = e.target.closest('.stock-paper');
    if (clickedOnStock) return;

    const cell = getCellFromMouse(e.clientX, e.clientY);
    if (!cell) return;

    const isOccupied = stocks.some(s => {
      const pos = s.gridPosition || { x: 0, y: 0 };
      return pos.x === cell.x && pos.y === cell.y;
    });

    if (isOccupied) return;

    if (isAddingMode) {
      onStockAdd(cell);
      setIsAddingMode(false);
      setHoveredCell(null);
    } else if (settings.clickEmptyToAdd) {
      onStockAdd(cell);
      setHoveredCell(null);
    }
  };

  // DnD handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setHoveredCell(null);
  };

  const handleDragOver = (event) => {
    if (!cellDimensions) return;

    const { delta } = event;
    const activeStock = stocks.find(s => s.id === activeId);
    if (!activeStock) return;

    const currentPos = activeStock.gridPosition || { x: 0, y: 0 };
    const cellWidth = cellDimensions.width + cellGap;
    const cellHeight = cellDimensions.height + cellGap;

    const deltaX = Math.round(delta.x / cellWidth);
    const deltaY = Math.round(delta.y / cellHeight);

    const newCell = {
      x: currentPos.x + deltaX,
      y: currentPos.y + deltaY
    };

    setHoveredCell(newCell);
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;

    if (!cellDimensions || !delta) {
      setActiveId(null);
      setHoveredCell(null);
      return;
    }

    const stock = stocks.find(s => s.id === active.id);
    if (!stock || stock.locked) {
      setActiveId(null);
      setHoveredCell(null);
      return;
    }

    const currentPos = stock.gridPosition || { x: 0, y: 0 };
    const cellWidth = cellDimensions.width + cellGap;
    const cellHeight = cellDimensions.height + cellGap;

    const deltaX = Math.round(delta.x / cellWidth);
    const deltaY = Math.round(delta.y / cellHeight);

    const newPos = {
      x: currentPos.x + deltaX,
      y: currentPos.y + deltaY
    };

    // Check if position is occupied
    const isOccupied = stocks.some(s => {
      if (s.id === active.id) return false;
      const pos = s.gridPosition || { x: 0, y: 0 };
      return pos.x === newPos.x && pos.y === newPos.y;
    });

    if (!isOccupied && (deltaX !== 0 || deltaY !== 0)) {
      onStockMove(active.id, newPos);
    }

    setActiveId(null);
    setHoveredCell(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setHoveredCell(null);
  };

  // Render grid cells
  const renderGrid = () => {
    if (!cellDimensions) return null;

    const cells = [];
    const renderedPositions = new Set();

    // Render cells for all stocks
    stocks.forEach(stock => {
      const pos = stock.gridPosition || { x: 0, y: 0 };
      const key = `${pos.x}-${pos.y}`;
      
      if (!renderedPositions.has(key)) {
        renderedPositions.add(key);
        const isHovered = hoveredCell && hoveredCell.x === pos.x && hoveredCell.y === pos.y;
        
        cells.push(
          <GridCell
            key={key}
            x={pos.x}
            y={pos.y}
            stock={stock}
            isHovered={isHovered}
            cellDimensions={cellDimensions}
            cellGap={cellGap}
            zoom={zoom}
            selectedStock={selectedStock}
            onStockSelect={onStockSelect}
            onStockUpdate={onStockUpdate}
            onStockRemove={onStockRemove}
            perStockUpdating={perStockUpdating}
            onUpdateSingle={onUpdateSingle}
            canMakeRequest={canMakeRequest}
            onToggleLock={onToggleLock}
            calculateScore={calculateScore}
            onHoverStock={onHoverStock}
            onHoverCell={handleCellHover}
          />
        );
      }
    });

    // Render empty cell being hovered/dragged over
    if (hoveredCell) {
      const key = `${hoveredCell.x}-${hoveredCell.y}`;
      const isOccupied = stocks.some(s => {
        const pos = s.gridPosition || { x: 0, y: 0 };
        return pos.x === hoveredCell.x && pos.y === hoveredCell.y;
      });
      
      if (!isOccupied && !renderedPositions.has(key)) {
        renderedPositions.add(key);
        cells.push(
          <GridCell
            key={key}
            x={hoveredCell.x}
            y={hoveredCell.y}
            stock={null}
            isHovered={true}
            cellDimensions={cellDimensions}
            cellGap={cellGap}
            zoom={zoom}
            selectedStock={selectedStock}
            onStockSelect={onStockSelect}
            onStockUpdate={onStockUpdate}
            onStockRemove={onStockRemove}
            perStockUpdating={perStockUpdating}
            onUpdateSingle={onUpdateSingle}
            canMakeRequest={canMakeRequest}
            onToggleLock={onToggleLock}
            calculateScore={calculateScore}
            onHoverStock={onHoverStock}
            onHoverCell={handleCellHover}
          />
        );
      }
    }

    return cells;
  };

  const activeStock = stocks.find(s => s.id === activeId);

  return (
    <div
      ref={containerRef}
      className={`grid-canvas-container ${isDraggingCanvas ? 'dragging' : ''}`}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
      onClick={handleCanvasClick}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        collisionDetection={pointerWithin}
      >
        {/* Always render hidden dummy stock for measuring dimensions */}
        <div 
          className="dimension-measurement-container"
          style={{ 
            position: 'fixed', 
            left: '-9999px', 
            top: '-9999px',
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -9999
          }}
        >
          <ModularStockPaper
            stock={{
              id: 'dimension-dummy',
              components: {},
              paperConfig: getTemplatePaperConfig()
            }}
            score={0}
            rank={0}
            onUpdate={() => {}}
            onRemove={null}
            perStockUpdating={{}}
            onUpdateSingle={null}
            canMakeRequest={() => false}
            dragListeners={null}
            onToggleLock={() => {}} // Include lock control in measurement
          />
        </div>
        
        <div
          className="grid-canvas"
          style={{
            transform: `translate(${gridOffset.x}px, ${gridOffset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            padding: `${gridPadding}px`
          }}
        >
          {renderGrid()}
        </div>

        {/* Empty state message */}
        {stocks.length === 0 && (
          <div className="empty-state-message">
            <p>Press <kbd>A</kbd> or click empty space to add a stock</p>
          </div>
        )}

        <DragOverlay>
          {activeStock ? (
            <div 
              className="stock-drag-overlay"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: '0 0'
              }}
            >
              <ModularStockPaper
                stock={activeStock}
                score={calculateScore(activeStock)}
                rank={0}
                onUpdate={onStockUpdate}
                onRemove={null}
                perStockUpdating={perStockUpdating}
                onUpdateSingle={null}
                canMakeRequest={canMakeRequest}
                dragListeners={null}
                onToggleLock={null}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
});

export default GridCanvas;
