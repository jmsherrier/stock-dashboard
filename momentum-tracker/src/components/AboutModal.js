import React from 'react';

function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const appVersion = "2.0.0";
  const buildDate = new Date().toLocaleDateString();

  return (
    <div className="preset-menu-overlay" onClick={onClose}>
      <div className="preset-menu" onClick={(e) => e.stopPropagation()}>
        <div className="preset-header">
          <h3>About Volitiliraptor</h3>
          <button 
            onClick={onClose}
            className="close-btn"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#888', 
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        <div className="preset-content">
          <div className="about-section">
            <div className="app-info">
              <div className="app-logo">
                <h2 style={{ margin: 0, color: '#8b5cf6', fontSize: '2rem' }}>🦖</h2>
              </div>
              <div className="app-details">
                <h4>Volitiliraptor</h4>
                <p>Version {appVersion}</p>
                <p>Built on {buildDate}</p>
              </div>
            </div>

            <div className="description">
              <h4>About This Application</h4>
              <p>
                Volitiliraptor is a comprehensive stock momentum tracking application designed to help traders 
                and investors identify high-momentum stocks using customizable criteria and scoring systems.
              </p>
              
              <h4>Key Features</h4>
              <ul>
                <li>✅ Real-time stock data integration with Alpha Vantage API</li>
                <li>✅ Customizable momentum scoring criteria</li>
                <li>✅ Multiple strategy presets (Momentum, Value, Growth, Income)</li>
                <li>✅ Modular component system for flexible stock analysis</li>
                <li>✅ User authentication and data persistence</li>
                <li>✅ Drag-and-drop stock reordering</li>
                <li>✅ News integration and sentiment analysis</li>
                <li>✅ Bonus points system for additional criteria</li>
              </ul>

              <h4>Data Sources</h4>
              <p>
                Stock data is provided by Alpha Vantage API. Please ensure you have a valid API key 
                configured for real-time data updates.
              </p>

              <h4>Technical Stack</h4>
              <ul>
                <li>Frontend: React 19.1.1 with modern hooks and context</li>
                <li>Backend: Node.js with Express and SQLite</li>
                <li>Styling: Custom CSS with responsive design</li>
                <li>APIs: Alpha Vantage for stock data</li>
              </ul>
            </div>

            <div className="links-section">
              <h4>Links & Resources</h4>
              <div className="link-buttons">
                <button 
                  onClick={() => window.open('https://github.com/jmsherrier/whiteboard', '_blank')}
                  className="link-btn"
                >
                  📂 View Source Code
                </button>
                <button 
                  onClick={() => window.open('https://www.alphavantage.co/', '_blank')}
                  className="link-btn"
                >
                  📊 Alpha Vantage API
                </button>
                <button 
                  onClick={() => window.open('https://github.com/jmsherrier/whiteboard/issues', '_blank')}
                  className="link-btn"
                >
                  🐛 Report Issues
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutModal;