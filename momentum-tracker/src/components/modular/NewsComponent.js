import React from 'react';
import NewsSection from '../NewsSection';

function NewsComponent({ stock, onUpdate, config }) {
  // Check if we should use original NewsSection format (default behavior)
  const useOriginalFormat = !config || config.originalFormat !== false;

  if (useOriginalFormat) {
    return (
      <NewsSection
        title="News & Catalysts"
        items={[...(stock.positiveCatalysts || []), ...(stock.marketDrivers || [])]}
        onUpdate={(items) => {
          onUpdate(stock.id, 'positiveCatalysts', items);
          onUpdate(stock.id, 'marketDrivers', []);
        }}
      />
    );
  }

  // Fallback modular format
  const items = [...(stock.positiveCatalysts || []), ...(stock.marketDrivers || [])];
  const totalPoints = items.reduce((sum, item) => sum + (item.points || 0), 0);

  const handleUpdateItems = (newItems) => {
    onUpdate(stock.id, 'positiveCatalysts', newItems);
    onUpdate(stock.id, 'marketDrivers', []);
  };

  const addItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      text: '',
      points: 1,
      type: 'catalyst'
    };
    handleUpdateItems([...items, newItem]);
  };

  const updateItem = (id, field, value) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    handleUpdateItems(updatedItems);
  };

  const removeItem = (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    handleUpdateItems(updatedItems);
  };

  return (
    <div className="modular-component news-component large-component">
      <div className="component-header">
        <label>News & Catalysts</label>
        <div className={`component-score ${totalPoints > 0 ? 'score-green' : 'score-neutral'}`}>
          {totalPoints > 0 ? '+' : ''}{totalPoints} pts
        </div>
      </div>
      <div className="component-content">
        <div className="news-items">
          {items.map(item => (
            <div key={item.id} className="news-item">
              <input
                type="text"
                value={item.text || ''}
                onChange={(e) => updateItem(item.id, 'text', e.target.value)}
                placeholder="Enter news or catalyst"
                className="news-text-input"
              />
              <div className="news-controls">
                <select
                  value={item.points || 1}
                  onChange={(e) => updateItem(item.id, 'points', parseInt(e.target.value))}
                  className="points-select"
                >
                  <option value={1}>+1</option>
                  <option value={2}>+2</option>
                  <option value={3}>+3</option>
                  <option value={-1}>-1</option>
                </select>
                <button
                  onClick={() => removeItem(item.id)}
                  className="remove-item-btn"
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="add-news-btn">
          + Add Item
        </button>
      </div>
    </div>
  );
}

export default NewsComponent;