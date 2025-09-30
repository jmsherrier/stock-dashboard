import React, { useState } from 'react';

function NewsComponent({ stock, onUpdate, config }) {
  // Get news items from modular format
  const newsItems = stock.components?.news?.items || [];
  const [showAddInterface, setShowAddInterface] = useState(false);
  const [newNewsText, setNewNewsText] = useState('');
  const [newNewsPoints, setNewNewsPoints] = useState(1);

  const totalPoints = newsItems.reduce((sum, item) => sum + (item.points || 0), 0);
  
  // Check if penalize mode is enabled in config
  const penalizeNoNews = config?.scoring?.penalizeNoNews !== false;
  const penaltyPoints = config?.scoring?.penaltyPoints || -2;

  const handleAddNews = () => {
    if (newNewsText.trim()) {
      const newItem = { text: newNewsText.trim(), points: newNewsPoints };
      const updatedItems = [...newsItems, newItem];
      onUpdate(stock.id, 'news', { items: updatedItems });
      setNewNewsText('');
      setNewNewsPoints(1);
      setShowAddInterface(false);
    }
  };

  const handleRemoveNews = (index) => {
    const updatedItems = newsItems.filter((_, i) => i !== index);
    onUpdate(stock.id, 'news', { items: updatedItems });
  };

  return (
    <div className="news-criteria">
      <div className="news-header">
        <h4>News & Catalysts</h4>
        <div className="news-score">
          {newsItems.length === 0 ? (
            penalizeNoNews ? (
              <span className="news-points-penalty" title={`Penalty for no news: ${penaltyPoints} pts`}>{penaltyPoints} pts</span>
            ) : (
              <span className="hazard-symbol" title="No news items">⚠️</span>
            )
          ) : (
            <span className="news-points-positive">+{totalPoints} pts</span>
          )}
        </div>
      </div>
      
      <div className="news-criteria-items">
        {showAddInterface && (
          <div className="add-news-interface">
            <input
              type="text"
              placeholder="Enter news item..."
              value={newNewsText}
              onChange={(e) => setNewNewsText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddNews()}
              autoFocus
            />
            <div className="add-news-controls">
              <input
                type="number"
                min="0"
                max="5"
                value={newNewsPoints}
                onChange={(e) => setNewNewsPoints(parseInt(e.target.value) || 1)}
              />
              <span>pts</span>
              <button onClick={handleAddNews} disabled={!newNewsText.trim()}>Add</button>
              <button onClick={() => setShowAddInterface(false)}>Cancel</button>
            </div>
          </div>
        )}
        
        {newsItems.map((item, index) => (
          <div key={index} className="news-item">
            <span className="news-text">{item.text}</span>
            <span className="news-points">+{item.points}</span>
            <button 
              className="remove-news-btn"
              onClick={() => handleRemoveNews(index)}
              title="Remove news item"
            >
              ×
            </button>
          </div>
        ))}
        
        <button 
          className="add-news-plus-btn"
          onClick={() => setShowAddInterface(!showAddInterface)}
          title="Add news item"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default NewsComponent;