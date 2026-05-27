import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStocksV2 } from '../hooks/useStocksV2';
import { DEFAULT_VISIBLE } from '../data/criteria';
import Header from './Header';
import StockGrid from './StockGrid';
import CriteriaPanel from './CriteriaPanel';

const VISIBLE_KEY = 'dashboard_visible_criteria_v2';
const PANEL_KEY = 'dashboard_panel_open_v2';

function loadVisible() {
  try {
    const raw = localStorage.getItem(VISIBLE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  return DEFAULT_VISIBLE;
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const {
    stocks,
    loadingIds,
    bulkLoading,
    addStock,
    removeStock,
    refreshStock,
    refreshAll,
  } = useStocksV2({ authenticated: isAuthenticated });

  const [visibleCriteria, setVisibleCriteria] = useState(loadVisible);
  const [panelOpen, setPanelOpen] = useState(
    () => localStorage.getItem(PANEL_KEY) !== 'false'
  );

  useEffect(() => {
    localStorage.setItem(VISIBLE_KEY, JSON.stringify(visibleCriteria));
  }, [visibleCriteria]);

  useEffect(() => {
    localStorage.setItem(PANEL_KEY, String(panelOpen));
  }, [panelOpen]);

  return (
    <div className="app">
      <Header
        onAddStock={addStock}
        onRefreshAll={refreshAll}
        onToggleCriteria={() => setPanelOpen((v) => !v)}
        criteriaCount={visibleCriteria.length}
        bulkLoading={bulkLoading}
        stockCount={stocks.length}
      />

      <div className="dashboard-body">
        <main className="dashboard-main">
          <StockGrid
            stocks={stocks}
            visibleCriteria={visibleCriteria}
            loadingIds={loadingIds}
            onRefresh={refreshStock}
            onRemove={removeStock}
          />
        </main>

        {panelOpen && (
          <CriteriaPanel
            visibleCriteria={visibleCriteria}
            onChange={setVisibleCriteria}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
