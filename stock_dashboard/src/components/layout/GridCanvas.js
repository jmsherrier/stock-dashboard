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
  onClickStock,
  clickedStockId
}, ref) => {
  const containerRef = useRef(null);
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);
  const [mouseDownOnEmpty, setMouseDownOnEmpty] = useState(false);
  console.log('mouseDownOnEmpty state:', mouseDownOnEmpty); // Used to prevent eslint warning
  const [hoveredCell, setHoveredCell] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [cellDimensions, setCellDimensions] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);
  const [zoom, setZoom] = useState(() => {
    const savedZoom = localStorage.getItem('grid-zoom');
    return savedZoom ? parseFloat(savedZoom) : 1;
  });

  // Save zoom to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('grid-zoom', zoom.toString());
  }, [zoom]);

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

  // Calculate cell dimensions based on dummy stock (unconstrained measurement)
  useEffect(() => {
    const measureStock = () => {
      // Always measure from the hidden dummy stock (it's not constrained by grid cells)
      const dummyContainer = document.querySelector('.dimension-measurement-container .stock-paper');
      if (dummyContainer) {
        const rect = dummyContainer.getBoundingClientRect();
        const newDimensions = {
          width: rect.width,
          height: rect.height
        };
        console.log('Measured stock dimensions from dummy:', newDimensions);
        setCellDimensions(newDimensions);
      } else {
        console.log('No dummy stock element found to measure, retrying...');
        setTimeout(measureStock, 50);
      }
    };

    // Initial measurement
    const timeoutId = setTimeout(measureStock, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [stocks.length]); // Remeasure when stock count changes

  // Remeasure when configuration changes
  useEffect(() => {
    const remeasure = () => {
      // Always measure from dummy (unconstrained)
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
    setTimeout(() => {
      // Always measure from dummy (unconstrained)
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
  }, [stocks]);

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
  // const getGridBounds = useCallback(() => {
  //   if (stocks.length === 0) {
  //     return { minX: -25, maxX: 25, minY: -25, maxY: 25 };
  //   }

  //   const positions = stocks.map(s => s.gridPosition || { x: 0, y: 0 });
  //   const minX = Math.min(...positions.map(p => p.x));
  //   const maxX = Math.max(...positions.map(p => p.x));
  //   const minY = Math.min(...positions.map(p => p.y));
  //   const maxY = Math.max(...positions.map(p => p.y));

  //   // Maintain buffer of 25 cells around all stocks for infinite grid feel
  //   return {
  //     minX: minX - 25,
  //     maxX: maxX + 25,
  //     minY: minY - 25,
  //     maxY: maxY + 25
  //   };
  // }, [stocks]); // Currently unused

  // Convert mouse coordinates to grid cell position
  // Returns null if cursor is in the gap between cells
  const getCellFromMouse = useCallback((clientX, clientY) => {
    if (!containerRef.current || !cellDimensions) return null;
    
    // Get the container bounding rect
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Step 1: Get mouse position relative to container viewport
    const viewportX = clientX - containerRect.left;
    const viewportY = clientY - containerRect.top;
    
    // Step 2: Reverse the transform to get to grid space
    // The grid-canvas has: transform: translate(gridOffset.x, gridOffset.y) scale(zoom)
    // To reverse: subtract translation, then divide by scale
    const gridSpaceX = (viewportX - gridOffset.x) / zoom;
    const gridSpaceY = (viewportY - gridOffset.y) / zoom;
    
    // Step 3: Account for grid padding (in unscaled grid space)
    const contentX = gridSpaceX - gridPadding;
    const contentY = gridSpaceY - gridPadding;
    
    // Step 4: Calculate which cell we're in
    // Each cell occupies (cellDimensions.width + cellGap) x (cellDimensions.height + cellGap)
    const cellWidth = cellDimensions.width + cellGap;
    const cellHeight = cellDimensions.height + cellGap;
    
    const cellX = Math.floor(contentX / cellWidth);
    const cellY = Math.floor(contentY / cellHeight);
    
    // Step 5: Check if we're within the actual cell bounds (not in the gap)
    const localX = contentX - (cellX * cellWidth);
    const localY = contentY - (cellY * cellHeight);
    
    // If we're outside the cell dimensions (in the gap), return null
    if (localX < 0 || localY < 0 || 
        localX >= cellDimensions.width || 
        localY >= cellDimensions.height) {
      return null;
    }
    
    return { x: cellX, y: cellY };
  }, [containerRef, cellDimensions, gridOffset, zoom, gridPadding, cellGap]);

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
    // const mouseX = e.clientX - rect.left; // Currently unused
    // const mouseY = e.clientY - rect.top; // Currently unused
    
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
    // Update mouse position for hover detection
    setMousePosition({ x: e.clientX, y: e.clientY });
    
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

  // Update hovered cell based on mouse position
  useEffect(() => {
    // Don't show hover during drag operations or when a stock is clicked
    if (!mousePosition || !cellDimensions || activeId || clickedStockId) {
      setHoveredCell(null);
      return;
    }

    const cell = getCellFromMouse(mousePosition.x, mousePosition.y);
    
    // Only show hover if we detected a valid cell
    if (!cell) {
      setHoveredCell(null);
      return;
    }
    
    // Check if this cell position is already occupied by a stock
    const isOccupied = stocks.some(s => {
      const pos = s.gridPosition || { x: 0, y: 0 };
      return pos.x === cell.x && pos.y === cell.y;
    });
    
    // Only set hovered cell if it's empty
    if (!isOccupied) {
      setHoveredCell(cell);
    } else {
      setHoveredCell(null);
    }
  }, [mousePosition, cellDimensions, stocks, activeId, clickedStockId, getCellFromMouse]);

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    // Don't clear mouseDownOnEmpty here - wait for click handler
  };

  const handleCanvasMouseLeave = () => {
    setIsDraggingCanvas(false);
    setMousePosition(null);
    setHoveredCell(null);
  };

  const handleCanvasClick = (e) => {
    // Don't create stock if user was dragging (.1px threshold for precise click detection)
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

    // Don't add stock if this click was marked as a deselect click by App.js
    if (e._wasDeselectClick) {
      return;
    }

    const cell = getCellFromMouse(e.clientX, e.clientY);
    if (!cell) return;

    const isOccupied = stocks.some(s => {
      const pos = s.gridPosition || { x: 0, y: 0 };
      return pos.x === cell.x && pos.y === cell.y;
    });

    if (isOccupied) return;
    
    // Add stock when clicking empty cell
    onStockAdd(cell);
    setIsAddingMode(false);
    setHoveredCell(null);
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

    // Divide delta by zoom to compensate for scaled movement
    const deltaX = Math.round((delta.x / zoom) / cellWidth);
    const deltaY = Math.round((delta.y / zoom) / cellHeight);

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

    // Divide delta by zoom to compensate for scaled movement
    const deltaX = Math.round((delta.x / zoom) / cellWidth);
    const deltaY = Math.round((delta.y / zoom) / cellHeight);

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
      // Set clicked state after drag to maintain highlight
      if (onClickStock) {
        onClickStock(active.id);
      }
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
            isDragging={activeId !== null}
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
            onClickStock={onClickStock}
            clickedStockId={clickedStockId}
          />
        );
      }
    });

    // Render only the hovered empty cell
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
            isDragging={activeId !== null}
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
            onClickStock={onClickStock}
            clickedStockId={clickedStockId}
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
      onMouseLeave={handleCanvasMouseLeave}
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
              ticker: 'SMPL',
              components: {
                ticker: { value: 'SMPL' },
                price: { value: 100 },
                percentRise: { value: 5 },
                relativeVolume: { value: 2 },
                float: { value: 50 },
                marketCap: { value: 1000 },
                volume: { value: 1000000 },
                news: { items: [{ text: 'Sample news', points: 1 }] },
                notes: { value: 'Sample note' }
              },
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

        <DragOverlay key={cellDimensions ? `${cellDimensions.width}-${cellDimensions.height}` : 'default'}>
          {activeStock ? (
            <div 
              className="stock-drag-overlay"
              style={{
                width: `${cellDimensions?.width}px`,
                transform: `scale(${zoom})`,
                transformOrigin: '0 0'
              }}
            >
              <ModularStockPaper
                key={`overlay-${activeStock.id}-${JSON.stringify(activeStock.paperConfig)}`}
                stock={activeStock}
                score={calculateScore(activeStock)}
                rank={0}
                onUpdate={onStockUpdate}
                onRemove={null}
                perStockUpdating={perStockUpdating}
                onUpdateSingle={onUpdateSingle}
                canMakeRequest={canMakeRequest}
                dragListeners={null}
                onToggleLock={onToggleLock}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
});

export default GridCanvas;
