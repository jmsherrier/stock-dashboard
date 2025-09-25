import React, { useState } from 'react';

function NewsSection({ title, items, onUpdate, emptyPenalty = -3 }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({ title: '', url: '', description: '', points: 1 });
  const [editItem, setEditItem] = useState({ title: '', url: '', description: '', points: 1 });

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

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditItem({ ...item });
  };

  const saveEdit = () => {
    if (!editItem.title.trim()) return;
    const updated = items.map(item => 
      item.id === editingId ? editItem : item
    );
    onUpdate(updated);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditItem({ title: '', url: '', description: '', points: 1 });
  };

  const totalPoints = items.reduce((sum, item) => sum + (parseInt(item.points) || 0), 0);
  const isEmpty = !items || items.length === 0;

  return (
    <div className={`news-section ${isEmpty ? 'news-section-empty' : ''}`}>
      <div className="news-header">
        <h4>{title}</h4>
        <div className="news-score">
          {isEmpty ? (
            <span className="news-score-content">
              <span className="warning-symbol">⚠</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="news-items-container">
        {items.map((item) => (
        <div key={item.id} className="news-item">
          {editingId === item.id ? (
            <div className="news-edit-form">
              <input
                placeholder="News title"
                value={editItem.title}
                onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
              />
              <input
                placeholder="URL (optional)"
                value={editItem.url}
                onChange={(e) => setEditItem({ ...editItem, url: e.target.value })}
              />
              <textarea
                placeholder="Brief description (optional)"
                value={editItem.description}
                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
              />
              <div className="points-input">
                <label>Points:</label>
                <select 
                  value={editItem.points} 
                  onChange={(e) => setEditItem({ ...editItem, points: parseInt(e.target.value) })}
                >
                  {[-3, -2, -1, 0, 1, 2, 3].map(p => (
                    <option key={p} value={p}>{p > 0 ? '+' : ''}{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-buttons">
                <button onClick={saveEdit}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
                <button onClick={() => { removeItem(item.id); setEditingId(null); }} className="remove-button">Remove</button>
              </div>
            </div>
          ) : (
            <div className="news-content">
              <div className="news-title">
                <div className="news-title-container">
                  <span className="news-title-text" onClick={() => startEditing(item)}>
                    {item.title}&nbsp;&nbsp;
                  </span>
                  {(item.description || item.url) && (
                    <div className="news-tooltip">
                      {item.description && (
                        <div className="tooltip-section">
                          <div className="tooltip-label">Description:</div>
                          <div className="tooltip-description">{item.description}</div>
                        </div>
                      )}
                      {item.url && (
                        <div className="tooltip-section">
                          <div className="tooltip-label">URL:</div>
                          <div className="tooltip-url">
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              {item.url}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="news-points">
                <span className={`points-value ${item.points > 0 ? 'points-positive' : item.points < 0 ? 'points-negative' : 'points-neutral'}`}>
                  {item.points > 0 ? '+' : ''}{item.points} pts
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
      </div>

      <button onClick={() => setIsAdding(true)} className="add-news-btn">+</button>

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