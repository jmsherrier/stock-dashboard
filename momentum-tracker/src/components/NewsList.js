import React from 'react';

function NewsList({ title, items, onUpdate }) {
  return (
    <div className="news-list">
      <div className="news-header">
        <h4>{title}</h4>
      </div>
      {items && items.length > 0 ? items.map((n, i) => (
        <div className="news-item" key={i}>
          <div className="news-content">
            <div className="news-title"><a href={n.url} target="_blank" rel="noreferrer">{n.title}</a></div>
            <div className="news-description">{n.summary}</div>
            <div className="news-date">{n.date}</div>
          </div>
          <button className="remove-news" onClick={() => onUpdate(items.filter((_, idx) => idx !== i))}>×</button>
        </div>
      )) : (
        <div className="empty-warning">No news</div>
      )}
    </div>
  );
}

export default NewsList;
