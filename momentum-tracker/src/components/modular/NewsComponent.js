import React from 'react';

function NewsComponent({ stock, onUpdate, config }) {
  // Get news items from modular format
  const newsItems = stock.components?.news?.items || [];

  const handleAddNews = () => {
    const text = prompt('Enter news item:');
    if (text) {
      const newItem = { text, points: 1 };
      const updatedItems = [...newsItems, newItem];
      onUpdate(stock.id, 'news', { items: updatedItems });
    }
  };

  const handleRemoveNews = (index) => {
    const updatedItems = newsItems.filter((_, i) => i !== index);
    onUpdate(stock.id, 'news', { items: updatedItems });
  };

  return (
    <div className="news-section">
      <h4>News & Catalysts</h4>
      <div className="news-items">
        {newsItems.map((item, index) => (
          <div key={index} className="news-item">
            <span className="news-text">{item.text}</span>
            <span className="news-points">+{item.points}</span>
            <button 
              className="remove-news-btn"
              onClick={() => handleRemoveNews(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button 
        className="add-news-btn"
        onClick={handleAddNews}
      >
        Add News
      </button>
    </div>
  );
}

export default NewsComponent;