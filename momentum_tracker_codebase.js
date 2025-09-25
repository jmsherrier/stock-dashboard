// This file originally contained a consolidated code dump from attachments.
// It has been replaced with this placeholder so the repository uses the split
// files under the `momentum-tracker/` folder. Delete this file if not needed.
      clearInterval(minuteReset);
    };
  }, [stocks, apiStatus]);

  const debounce = useCallback((func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }, []);

  const saveData = debounce(() => {
    storage.save({ stocks, apiStatus });
  }, 500);

  useEffect(() => {
    saveData();
  }, [stocks, apiStatus, saveData]);

  const addStock = (ticker) => {
    if (!ticker || stocks.some(s => s.ticker === ticker.toUpperCase())) return;
    
    const newStock = {
      id: Date.now().toString(),
      ticker: ticker.toUpperCase(),
      price: '',
      percentRise: '',
      relativeVolume: '',
      float: '',
      positiveCatalysts: [],
      marketDrivers: [],
      recentIPO: false,
      recentReverseSplit: false,
      blueSky: false,
      notes: ''
    };
    
    setUndoStack(prev => [...prev.slice(-9), stocks]);
    setStocks(prev => [newStock, ...prev]);
    setIsManualOrder(true);
    setShowAddModal(false);
  };

  const updateStock = (id, field, value) => {
    setStocks(prev => prev.map(stock => 
      stock.id === id ? { ...stock, [field]: value } : stock
    ));
  };

  const updateAllStocks = async () => {
    if (isUpdating || apiStatus.daily >= 500) return;
    
    setIsUpdating(true);
    let requestCount = 0;
    
    for (const stock of stocks) {
      if (apiStatus.daily + requestCount >= 500 || apiStatus.minute >= 5) break;
      
      try {
        const data = await apiService.getStockData(stock.ticker);
        if (data) {
          updateStock(stock.id, 'price', data.price.toString());
          updateStock(stock.id, 'percentRise', data.percentChange.toString());
          updateStock(stock.id, 'relativeVolume', data.relativeVolume.toString());
          requestCount++;
        }
        
        if (stocks.indexOf(stock) < stocks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 12000));
        }
      } catch (error) {
        console.error(`Failed to update ${stock.ticker}:`, error);
      }
    }
    
    setApiStatus(prev => ({ 
      ...prev, 
      daily: prev.daily + requestCount,
      minute: prev.minute + requestCount 
    }));
    setIsManualOrder(false);
    setIsUpdating(false);
  };

  const removeStock = (id) => {
    setUndoStack(prev => [...prev.slice(-9), stocks]);
    setStocks(prev => prev.filter(stock => stock.id !== id));
    if (selectedStock === id) setSelectedStock(null);
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setStocks(lastState);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setStocks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        setIsManualOrder(true);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const calculateScore = (stock) => {
    let score = 0;
    
    const price = parseFloat(stock.price) || 0;
    if (price >= 2 && price < 4) score += 3;
    else if (price >= 3 && price < 5) score += 2;
    else if (price >= 5 && price < 8) score += 1;
    else if (price >= 8 && price < 10) score -= 1;
    else if (price >= 10 && price < 15) score -= 2;
    else if (price >= 15) score -= 3;
    
    const rise = parseFloat(stock.percentRise) || 0;
    if (rise >= 20) score += 3;
    else if (rise >= 12) score += 2;
    else if (rise >= 7) score += 1;
    else if (rise >= 5) score -= 1;
    else if (rise >= 3) score -= 2;
    else score -= 3;
    
    const volume = parseFloat(stock.relativeVolume) || 0;
    if (volume >= 20) score += 3;
    else if (volume >= 10) score += 2;
    else if (volume >= 5) score += 1;
    else if (volume >= 3) score -= 1;
    else if (volume >= 2) score -= 2;
    else score -= 3;
    
    const float = parseFloat(stock.float) || 0;
    if (float > 0 && float < 10) score += 3;
    else if (float < 15) score += 2;
    else if (float < 20) score += 1;
    else if (float < 30) score -= 1;
    else if (float < 50) score -= 2;
    else if (float >= 50) score -= 3;
    
    const newsScore = [...stock.positiveCatalysts, ...stock.marketDrivers]
      .reduce((sum, news) => sum + (news.points || 0), 0);
    if (stock.positiveCatalysts.length === 0 && stock.marketDrivers.length === 0) {
      score -= 3;
    } else {
      score += newsScore;
    }
    
    if (stock.recentIPO) score += 1;
    if (stock.recentReverseSplit) score += 1;
    if (stock.blueSky) score += 1;
    
    return score;
  };

  const sortedStocks = isManualOrder ? stocks : 
    [...stocks].sort((a, b) => calculateScore(b) - calculateScore(a));

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowAddModal(true);
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        updateAllStocks();
      } else if (e.key === 'Delete' && selectedStock) {
        e.preventDefault();
        const stock = stocks.find(s => s.id === selectedStock);
        if (stock && window.confirm(`Remove ${stock.ticker}?`)) {
          removeStock(selectedStock);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedStock, stocks, isUpdating]);

  const getApiStatusColor = () => {
    if (apiStatus.daily >= 450 || apiStatus.minute >= 4) return '#f97316';
    if (apiStatus.daily >= 350 || apiStatus.minute >= 3) return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Momentum Tracker</h1>
        <div className="api-status" style={{ color: getApiStatusColor() }}>
          Requests: {apiStatus.daily}/500 daily | {apiStatus.minute}/5 per minute
        </div>
        <div className="header-buttons">
          <button onClick={() => setShowAddModal(true)}>Add Ticker (A)</button>
          <button 
            onClick={updateAllStocks} 
            disabled={isUpdating || apiStatus.daily >= 500}
          >
            {isUpdating ? 'Updating...' : 'Update All (U)'}
          </button>
          <button onClick={undo} disabled={undoStack.length === 0}>Undo</button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <div className="stocks-container">
          <SortableContext items={sortedStocks.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {sortedStocks.map((stock) => (
              <SortableStockPaper
                key={stock.id}
                stock={stock}
                score={calculateScore(stock)}
                isSelected={selectedStock === stock.id}
                onSelect={() => setSelectedStock(stock.id)}
                onUpdate={updateStock}
                onRemove={removeStock}
                onUpdateSingle={async () => {
                  if (apiStatus.daily >= 500 || apiStatus.minute >= 5) {
                    alert('API rate limit reached');
                    return;
                  }
                  
                  try {
                    const data = await apiService.getStockData(stock.ticker);
                    if (data) {
                      updateStock(stock.id, 'price', data.price.toString());
                      updateStock(stock.id, 'percentRise', data.percentChange.toString());
                      updateStock(stock.id, 'relativeVolume', data.relativeVolume.toString());
                      setApiStatus(prev => ({ 
                        ...prev, 
                        daily: prev.daily + 1,
                        minute: prev.minute + 1 
                      }));
                    }
                  } catch (error) {
                    console.error(`Failed to update ${stock.ticker}:`, error);
                    alert(`Failed to update ${stock.ticker}`);
                  }
                }}
              />
            ))}
          </SortableContext>
          {stocks.length === 0 && (
            <div className="empty-state">
              <h3>No stocks added yet</h3>
              <p>Press 'A' or click 'Add Ticker' to get started</p>
            </div>
          )}
        </div>
      </DndContext>

      {showAddModal && (
        <AddStockModal
          onAdd={addStock}
          onClose={() => setShowAddModal(false)}
          existingTickers={stocks.map(s => s.ticker)}
        />
      )}
    </div>
  );
} data.percentChange.toString());
                              updateStock(stock.id, 'relativeVolume', data.relativeVolume.toString());
                              setApiStatus(prev => ({ 
                                ...prev, 
                                daily: prev.daily + 1,
                                minute: prev.minute + 1 
                              }));
                            }
                          } catch (error) {
                            console.error(`Failed to update ${stock.ticker}:`, error);
                            alert(`Failed to update ${stock.ticker}`);
                          }
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {stocks.length === 0 && (
                <div className="empty-state">
                  <h3>No stocks added yet</h3>
                  <p>Press 'A' or click 'Add Ticker' to get started</p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showAddModal && (
        <AddStockModal
          onAdd={addStock}
          onClose={() => setShowAddModal(false)}
          existingTickers={stocks.map(s => s.ticker)}
        />
      )}
    </div>
  );
}

export default App;

// src/components/StockPaper.js
import React from 'react';
import CriteriaInput from './CriteriaInput';
import NewsList from './NewsList';

function StockPaper({ stock, score, onUpdate, onRemove, onUpdateSingle }) {
  const getScoreColor = (score) => {
    if (score >= 10) return '#22c55e';
    if (score >= 6) return '#84cc16';
    if (score >= 2) return '#eab308';
    if (score >= -2) return '#f97316';
    return '#ef4444';
  };

  const getScorePoints = (value, type) => {
    const val = parseFloat(value) || 0;
    
    switch (type) {
      case 'price':
        if (val >= 2 && val < 4) return 3;
        if (val >= 3 && val < 5) return 2;
        if (val >= 5 && val < 8) return 1;
        if (val >= 8 && val < 10) return -1;
        if (val >= 10 && val < 15) return -2;
        if (val >= 15) return -3;
        return 0;
        
      case 'rise':
        if (val >= 20) return 3;
        if (val >= 12) return 2;
        if (val >= 7) return 1;
        if (val >= 5) return -1;
        if (val >= 3) return -2;
        return -3;
        
      case 'volume':
        if (val >= 20) return 3;
        if (val >= 10) return 2;
        if (val >= 5) return 1;
        if (val >= 3) return -1;
        if (val >= 2) return -2;
        return -3;
        
      case 'float':
        if (val > 0 && val < 10) return 3;
        if (val < 15) return 2;
        if (val < 20) return 1;
        if (val < 30) return -1;
        if (val < 50) return -2;
        if (val >= 50) return -3;
        return 0;
        
      default:
        return 0;
    }
  };

  return (
    <div className="stock-paper">
      <div className="paper-header">
        <h2>{stock.ticker}</h2>
        <div className="score" style={{ color: getScoreColor(score) }}>
          {score > 0 ? '+' : ''}{score}
        </div>
        <div className="header-buttons">
          <button onClick={onUpdateSingle} className="update-btn">Update</button>
          <button onClick={() => onRemove(stock.id)} className="remove-btn">Remove</button>
        </div>
      </div>

      <div className="criteria-grid">
        <CriteriaInput
          label="Price ($2-20)"
          value={stock.price}
          onChange={(value) => onUpdate(stock.id, 'price', value)}
          type="number"
          step="0.01"
          warning={stock.price && (parseFloat(stock.price) < 2 || parseFloat(stock.price) > 20)}
          scale={[
            { range: '$15-20', points: -3 },
            { range: '$10-15', points: -2 },
            { range: '$8-10', points: -1 },
            { range: '$5-8', points: 1 },
            { range: '$3-5', points: 2 },
            { range: '$2-4', points: 3 }
          ]}
          currentPoints={getScorePoints(stock.price, 'price')}
        />

        <CriteriaInput
          label="% Rise (7%+ min)"
          value={stock.percentRise}
          onChange={(value) => onUpdate(stock.id, 'percentRise', value)}
          type="number"
          step="0.1"
          warning={stock.percentRise && parseFloat(stock.percentRise) < 7}
          scale={[
            { range: '<3%', points: -3 },
            { range: '3-5%', points: -2 },
            { range: '5-7%', points: -1 },
            { range: '7-12%', points: 1 },
            { range: '12-20%', points: 2 },
            { range: '20%+', points: 3 }
          ]}
          currentPoints={getScorePoints(stock.percentRise, 'rise')}
        />

        <CriteriaInput
          label="Relative Volume (5x+ min)"
          value={stock.relativeVolume}
          onChange={(value) => onUpdate(stock.id, 'relativeVolume', value)}
          type="number"
          step="0.1"
          warning={stock.relativeVolume && parseFloat(stock.relativeVolume) < 5}
          scale={[
            { range: '<2x', points: -3 },
            { range: '2-3x', points: -2 },
            { range: '3-5x', points: -1 },
            { range: '5-10x', points: 1 },
            { range: '10-20x', points: 2 },
            { range: '20x+', points: 3 }
          ]}
          currentPoints={getScorePoints(stock.relativeVolume, 'volume')}
        />

        <CriteriaInput
          label="Float (<20M shares)"
          value={stock.float}
          onChange={(value) => onUpdate(stock.id, 'float', value)}
          type="number"
          step="0.1"
          warning={stock.float && parseFloat(stock.float) > 20}
          scale={[
            { range: '>50M', points: -3 },
            { range: '30-50M', points: -2 },
            { range: '20-30M', points: -1 },
            { range: '15-20M', points: 1 },
            { range: '10-15M', points: 2 },
            { range: '<10M', points: 3 }
          ]}
          currentPoints={getScorePoints(stock.float, 'float')}
        />
      </div>

      <NewsList
        title="Positive Catalysts"
        items={stock.positiveCatalysts}
        onUpdate={(items) => onUpdate(stock.id, 'positiveCatalysts', items)}
      />

      <NewsList
        title="Market Drivers"
        items={stock.marketDrivers}
        onUpdate={(items) => onUpdate(stock.id, 'marketDrivers', items)}
      />

      <div className="bonus-criteria">
        <h4>Bonus Criteria</h4>
        <label>
          <input
            type="checkbox"
            checked={stock.recentIPO}
            onChange={(e) => onUpdate(stock.id, 'recentIPO', e.target.checked)}
          />
          Recent IPO {stock.recentIPO && '[+1]'}
        </label>
        <label>
          <input
            type="checkbox"
            checked={stock.recentReverseSplit}
            onChange={(e) => onUpdate(stock.id, 'recentReverseSplit', e.target.checked)}
          />
          Recent Reverse Split {stock.recentReverseSplit && '[+1]'}
        </label>
        <label>
          <input
            type="checkbox"
            checked={stock.blueSky}
            onChange={(e) => onUpdate(stock.id, 'blueSky', e.target.checked)}
          />
          Blue Sky Breakout {stock.blueSky && '[+1]'}
        </label>
      </div>

      <div className="notes-section">
        <h4>Notes</h4>
        <textarea
          value={stock.notes}
          onChange={(e) => onUpdate(stock.id, 'notes', e.target.value)}
          placeholder="Add notes..."
        />
      </div>
    </div>
  );
}

export default StockPaper;

// src/components/CriteriaInput.js
import React from 'react';

function CriteriaInput({ label, value, onChange, type, step, warning, scale, currentPoints }) {
  return (
    <div className="criteria-input">
      <div className="criteria-header">
        <label>{label}</label>
        <span className="points-display">[{currentPoints > 0 ? '+' : ''}{currentPoints}]</span>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        className={warning ? 'warning' : ''}
        placeholder="Enter value"
      />
      {warning && <div className="warning-indicator">⚠ Out of range</div>}
      <div className="scale-display">
        {scale.map((item, index) => (
          <div key={index} className={`scale-item ${item.points > 0 ? 'positive' : item.points < 0 ? 'negative' : 'neutral'}`}>
            {item.range}: {item.points > 0 ? '+' : ''}{item.points}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CriteriaInput;

// src/components/NewsList.js
import React, { useState } from 'react';
import { format } from 'date-fns';

function NewsList({ title, items, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', link: '', description: '', points: 1 });
  const [editingIndex, setEditingIndex] = useState(null);

  const addItem = () => {
    if (!formData.title.trim()) return;
    
    const newItem = {
      ...formData,
      date: new Date().toISOString(),
      id: Date.now()
    };
    const newItems = [...items, newItem].sort((a, b) => new Date(b.date) - new Date(a.date));
    onUpdate(newItems);
    resetForm();
  };

  const removeItem = (index) => {
    if (window.confirm('Delete this news item?')) {
      onUpdate(items.filter((_, i) => i !== index));
    }
  };

  const editItem = (index) => {
    setFormData(items[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const saveEdit = () => {
    if (!formData.title.trim()) return;
    
    const newItems = [...items];
    newItems[editingIndex] = { ...formData, date: new Date().toISOString() };
    onUpdate(newItems.sort((a, b) => new Date(b.date) - new Date(a.date)));
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', link: '', description: '', points: 1 });
    setEditingIndex(null);
    setShowForm(false);
  };

  return (
    <div className="news-list">
      <div className="news-header">
        <h4>{title}</h4>
        <button onClick={() => setShowForm(!showForm)} title="Add news item">
          {showForm ? '×' : '+'}
        </button>
      </div>

      {items.length === 0 && <div className="empty-warning">No news items [-3]</div>}

      {items.map((item, index) => (
        <div key={item.id} className="news-item" onContextMenu={(e) => {
          e.preventDefault();
          editItem(index);
        }}>
          <div className="news-content">
            <div className="news-title">
              {item.link ? (
                <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                  {item.title}
                </a>
              ) : (
                <span>{item.title}</span>
              )}
              <span className="points-display">[{item.points > 0 ? '+' : ''}{item.points}]</span>
            </div>
            {item.description && <div className="news-description">{item.description}</div>}
            <div className="news-date">{format(new Date(item.date), 'MM/dd HH:mm')}</div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeItem(index);
            }} 
            className="remove-news"
            title="Delete news item"
          >
            ×
          </button>
        </div>
      ))}

      {showForm && (
        <div className="news-form">
          <input
            placeholder="News title *"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            autoFocus
          />
          <input
            placeholder="Link (optional)"
            value={formData.link}
            onChange={(e) => setFormData({...formData, link: e.target.value})}
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
          />
          <div className="points-input">
            <label>Impact:</label>
            <select
              value={formData.points}
              onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
            >
              <option value={-3}>Very Negative (-3)</option>
              <option value={-2}>Negative (-2)</option>
              <option value={-1}>Slightly Negative (-1)</option>
              <option value={1}>Slightly Positive (+1)</option>
              <option value={2}>Positive (+2)</option>
              <option value={3}>Very Positive (+3)</option>
            </select>
          </div>
          <div className="form-buttons">
            <button 
              onClick={editingIndex !== null ? saveEdit : addItem}
              disabled={!formData.title.trim()}
            >
              {editingIndex !== null ? 'Save' : 'Add'}
            </button>
            <button onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsList;

// src/components/AddStockModal.js
import React, { useState, useEffect } from 'react';

function AddStockModal({ onAdd, onClose, existingTickers }) {
  const [ticker, setTicker] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [ticker]);

  const handleSubmit = () => {
    const cleanTicker = ticker.trim().toUpperCase();
    
    if (!cleanTicker) {
      setError('Please enter a ticker symbol');
      return;
    }
    
    if (existingTickers.includes(cleanTicker)) {
      setError('Stock already exists');
      return;
    }
    
    if (!/^[A-Z]{1,5}$/.test(cleanTicker)) {
      setError('Invalid ticker format');
      return;
    }
    
    onAdd(cleanTicker);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Stock Ticker</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-body">
          <input
            type="text"
            placeholder="Enter ticker symbol (e.g., AAPL)"
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value.toUpperCase());
              setError('');
            }}
            autoFocus
            maxLength={5}
          />
          {error && <div className="error-message">{error}</div>}
        </div>
        <div className="modal-footer">
          <button onClick={handleSubmit} disabled={!ticker.trim()}>
            Add Stock
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default AddStockModal;

// src/services.js
import axios from 'axios';

const ALPHA_VANTAGE_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://www.alphavantage.co/query';

export const apiService = {
  async getStockData(symbol) {
    try {
      // Get quote data
      const quoteResponse = await axios.get(BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: ALPHA_VANTAGE_KEY
        }
      });
      
      const quote = quoteResponse.data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('No data returned');
      }
      
      const price = parseFloat(quote['05. price']);
      const change = parseFloat(quote['09. change']);
      const percentChange = parseFloat(quote['10. change percent'].replace('%', ''));
      const volume = parseInt(quote['06. volume']);
      
      // Calculate relative volume (mock calculation - you might want to get historical data)
      // For demo purposes, we'll use a random multiplier
      const avgVolume = volume / (Math.random() * 10 + 1);
      const relativeVolume = volume / avgVolume;
      
      return {
        price: price,
        change: change,
        percentChange: percentChange,
        volume: volume,
        relativeVolume: Math.round(relativeVolume * 10) / 10
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Alternative demo function for testing without API
  async getStockDataDemo(symbol) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data for testing
    return {
      price: Math.random() * 18 + 2, // $2-20
      change: Math.random() * 2 - 1,
      percentChange: Math.random() * 25 - 5, // -5% to 20%
      volume: Math.floor(Math.random() * 1000000),
      relativeVolume: Math.random() * 15 + 1 // 1-16x
    };
  }
};

export const storage = {
  save(data) {
    try {
      localStorage.setItem('momentumTracker', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  },
  
  load() {
    try {
      const data = localStorage.getItem('momentumTracker');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load data:', error);
      return null;
    }
  },
  
  backup(data) {
    try {
      const backup = {
        ...data,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('momentumTrackerBackup', JSON.stringify(backup));
    } catch (error) {
      console.error('Failed to backup data:', error);
    }
  },
  
  exportData() {
    const data = this.load();
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `momentum-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  },
  
  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          this.save(data);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
};

// src/App.css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #1a1a1a;
  color: #e5e5e5;
  overflow-x: hidden;
}

.app {
  background: #1a1a1a;
  color: #e5e5e5;
  min-height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #333;
  position: sticky;
  top: 0;
  background: #1a1a1a;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.app-header h1 {
  margin: 0;
  color: #e5e5e5;
  font-size: 1.5rem;
}

.api-status {
  font-size: 0.9rem;
  font-weight: 500;
}

.header-buttons {
  display: flex;
  gap: 0.5rem;
}

.header-buttons button {
  background: #333;
  border: 1px solid #555;
  color: #e5e5e5;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.header-buttons button:hover:not(:disabled) {
  background: #444;
  border-color: #666;
}

.header-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stocks-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 2rem;
  padding: 2rem;
  min-height: calc(100vh - 80px);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: #666;
  padding: 4rem 2rem;
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

.stock-wrapper {
  cursor: pointer;
  transition: transform 0.2s;
}

.stock-wrapper.selected {
  outline: 2px solid #444;
  outline-offset: 2px;
  border-radius: 8px;
}

.stock-wrapper.dragging {
  transform: rotate(5deg);
  opacity: 0.8;
}

.stock-paper {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #333;
  transition: all 0.2s;
  height: fit-content;
}

.stock-paper:hover {
  transform: translateY(-2px);
  border-color: #444;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #333;
}

.paper-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.score {
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 0 10px currentColor;
}

.header-buttons {
  display: flex;
  gap: 0.5rem;
}

.update-btn, .remove-btn {
  background: #333;
  border: 1px solid #555;
  color: #e5e5e5;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.update-btn:hover, .remove-btn:hover {
  background: #444;
  border-color: #666;
}

.criteria-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.criteria-input {
  background: #333;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #444;
}

.criteria-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.criteria-header label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #ccc;
}

.points-display {
  font-size: 0.9rem;
  font-weight: bold;
  color: #888;
}

.criteria-input input {
  width: 100%;
  background: #222;
  border: 1px solid #555;
  color: #e5e5e5;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.criteria-input input:focus {
  outline: none;
  border-color: #666;
  box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.2);
}

.criteria-input input.warning {
  border-color: #f97316;
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
}

.criteria-input input::placeholder {
  color: #666;
}

.warning-indicator {
  color: #f97316;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.scale-display {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  margin-top: 0.75rem;
}

.scale-item {
  padding: 0.4rem;
  border-radius: 3px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 500;
  transition: all 0.2s;
}

.scale-item.positive {
  background: #22c55e;
  color: #000;
}

.scale-item.negative {
  background: #ef4444;
  color: #fff;
}

.scale-item.neutral {
  background: #666;
  color: #fff;
}

.news-list {
  margin: 1.5rem 0;
  background: #333;
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #444;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.news-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #ccc;
}

.news-header button {
  background: #555;
  border: none;
  color: #e5e5e5;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s;
}

.news-header button:hover {
  background: #666;
  transform: scale(1.1);
}

.empty-warning {
  color: #f97316;
  font-size: 0.9rem;
  font-style: italic;
  text-align: center;
  padding: 1rem;
  background: rgba(249, 115, 22, 0.1);
  border-radius: 4px;
  border: 1px dashed #f97316;
}

.news-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #222;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: context-menu;
  transition: all 0.2s;
  border: 1px solid #333;
}

.news-item:hover {
  background: #2a2a2a;
  border-color: #444;
}

.news-item:last-child {
  margin-bottom: 0;
}

.news-content {
  flex: 1;
  min-width: 0;
}

.news-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.news-title a {
  color: #60a5fa;
  text-decoration: none;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-title a:hover {
  text-decoration: underline;
}

.news-title span {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-description {
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.news-date {
  font-size: 0.7rem;
  color: #666;
}

.remove-news {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
  margin-left: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.remove-news:hover {
  color: #f97316;
  background: rgba(249, 115, 22, 0.1);
}

.news-form {
  background: #222;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 0.75rem;
  border: 1px solid #444;
}

.news-form input, .news-form textarea {
  width: 100%;
  background: #333;
  border: 1px solid #555;
  color: #e5e5e5;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s;
}

.news-form input:focus, .news-form textarea:focus {
  outline: none;
  border-color: #666;
  box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.2);
}

.news-form input::placeholder, .news-form textarea::placeholder {
  color: #666;
}

.news-form textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.points-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.points-input label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #ccc;
}

.points-input select {
  background: #333;
  border: 1px solid #555;
  color: #e5e5e5;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.form-buttons {
  display: flex;
  gap: 0.75rem;
}

.form-buttons button {
  background: #555;
  border: 1px solid #666;
  color: #e5e5e5;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.form-buttons button:hover:not(:disabled) {
  background: #666;
  border-color: #777;
}

.form-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bonus-criteria {
  margin: 1.5rem 0;
  background: #333;
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #444;
}

.bonus-criteria h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: #ccc;
}

.bonus-criteria label {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  padding: 0.5rem;
  border-radius: 4px;
}

.bonus-criteria label:hover {
  background: rgba(255, 255, 255, 0.05);
}

.bonus-criteria label:last-child {
  margin-bottom: 0;
}

.bonus-criteria input[type="checkbox"] {
  margin-right: 0.75rem;
  accent-color: #22c55e;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.notes-section {
  margin-top: 1.5rem;
}

.notes-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: #ccc;
}

.notes-section textarea {
  width: 100%;
  background: #333;
  border: 1px solid #555;
  color: #e5e5e5;
  padding: 1rem;
  border-radius: 6px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.5;
  transition: all 0.2s;
}

.notes-section textarea:focus {
  outline: none;
  border-color: #666;
  box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.2);
}

.notes-section textarea::placeholder {
  color: #666;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #444;
  min-width: 400px;
  max-width: 90vw;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #e5e5e5;
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.modal-body input {
  width: 100%;
  background: #333;
  border: 1px solid #555;
  color: #e5e5e5;
  padding: 1rem;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
}

.modal-body input:focus {
  outline: none;
  border-color: #666;
  box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.2);
}

.modal-body input::placeholder {
  color: #666;
}

.error-message {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #333;
}

.modal-footer button {
  background: #555;
  border: 1px solid #666;
  color: #e5e5e5;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.modal-footer button:hover:not(:disabled) {
  background: #666;
  border-color: #777;
}

.modal-footer button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .stocks-container {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 900px) {
  .stocks-container {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    padding: 1.5rem;
  }
  
  .app-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 1rem;
  }
  
  .criteria-grid {
    grid-template-columns: 1fr;
  }
  
  .scale-display {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stocks-container {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .modal-content {
    min-width: auto;
    margin: 1rem;
  }
  
  .paper-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .news-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* Animation for dragging */
@keyframes dragHover {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}

.stock-wrapper.dragging {
  animation: dragHover 0.5s ease-in-out infinite;
}

// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/index.css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

* {
  box-sizing: border-box;
}

#root {
  width: 100%;
  min-height: 100vh;
}

// public/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#1a1a1a" />
    <meta
      name="description"
      content="Momentum Trading Tracker - Track and score momentum trading opportunities"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Momentum Tracker</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>

// public/manifest.json
{
  "short_name": "Momentum Tracker",
  "name": "Momentum Trading Tracker",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#1a1a1a",
  "background_color": "#1a1a1a"
}

// src/components/SortableStockPaper.js
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StockPaper from './StockPaper';

function SortableStockPaper({ stock, score, isSelected, onSelect, ...props }) {
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
      {...listeners}
      className={`stock-wrapper ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={onSelect}
    >
      <StockPaper stock={stock} score={score} {...props} />
    </div>
  );
}

export default SortableStockPaper;