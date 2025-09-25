import React, { useState } from 'react';

function NewsSection({ title, items, onUpdate, emptyPenalty = -3 }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', url: '', description: '', points: 1 });

  const addItem = () => {
    if (!newItem.title.trim()) return;
    const updated = [...items, { ...newItem, id: Date.now() }];
    onUpdate(updated);
    setNewItem({ title: '', url: '', description: '', points: 1 });
    setIsAdding(false);
  };

  const removeItem = (id) => {
    const updated = items.filter(item => item.id !== id);
    onUpdate(updated);
  };

  const updateItem = (id, field, value) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onUpdate(updated);
  };

  const totalPoints = items.reduce((sum, item) => sum + (parseInt(item.points) || 0), 0);
  const isEmpty = items.length === 0;

  return (
    <div className="news-section">
      <div className="news-header">
        <h4>{title}</h4>
        <div className="news-score">
          {isEmpty ? (
            <span className="warning-symbol">⚠</span>
          ) : (
            <span className={`total-score ${totalPoints > 0 ? 'points-positive' : totalPoints < 0 ? 'points-negative' : 'points-neutral'}`}>
              {totalPoints > 0 ? '+' : ''}{totalPoints}
            </span>
          )}
        </div>
      </div>
      
      <button onClick={() => setIsAdding(true)} className="add-news-btn">+</button>

      {items.map((item) => (
        <div key={item.id} className="news-item">
          <div className="news-content">
            <div className="news-title">
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
              ) : (
                <span>{item.title}</span>
              )}
              <select 
                value={item.points} 
                onChange={(e) => updateItem(item.id, 'points', parseInt(e.target.value))}
                className="points-select"
              >
                {[-3, -2, -1, 0, 1, 2, 3].map(p => (
                  <option key={p} value={p}>{p > 0 ? '+' : ''}{p}</option>
                ))}
              </select>
            </div>
            {item.description && <div className="news-description">{item.description}</div>}
          </div>
          <button className="remove-news" onClick={() => removeItem(item.id)}>×</button>
        </div>
      ))}

      {isAdding && (
        <div className="news-form">
          <input
            placeholder="News title"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          />
          <input
            placeholder="URL (optional)"
            value={newItem.url}
            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
          />
          <textarea
            placeholder="Brief description (optional)"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
          <div className="points-input">
            <label>Points:</label>
            <select 
              value={newItem.points} 
              onChange={(e) => setNewItem({ ...newItem, points: parseInt(e.target.value) })}
            >
              {[-3, -2, -1, 0, 1, 2, 3].map(p => (
                <option key={p} value={p}>{p > 0 ? '+' : ''}{p}</option>
              ))}
            </select>
          </div>
          <div className="form-buttons">
            <button onClick={addItem}>Add</button>
            <button onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsSection;