import React, { useState } from 'react';

function NewsEditor({ criteria, onSave, onClose }) {
  const [penalizeNoNews, setPenalizeNoNews] = useState(
    criteria?.penalizeNoNews !== false
  );

  const handleSave = () => {
    onSave({
      penalizeNoNews,
      penaltyPoints: penalizeNoNews ? -2 : 0
    });
  };

  return (
    <div className="news-editor-overlay" onClick={onClose}>
      <div className="news-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="news-editor-header">
          <h3>News & Catalysts Scoring</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="news-editor-content">
          <div className="news-editor-toggle">
            <label>
              <input
                type="checkbox"
                checked={penalizeNoNews}
                onChange={(e) => setPenalizeNoNews(e.target.checked)}
              />
              <span>Penalize no positive news (-2 pts)</span>
            </label>
          </div>

          <div className="news-editor-help">
            <p>When enabled, papers without any positive news items will receive -2 points.</p>
            <p>Add individual news items directly on each paper for positive points.</p>
          </div>
        </div>

        <div className="news-editor-footer">
          <button onClick={onClose} className="cancel-button">Cancel</button>
          <button onClick={handleSave} className="save-button">Save</button>
        </div>
      </div>
    </div>
  );
}

export default NewsEditor;
