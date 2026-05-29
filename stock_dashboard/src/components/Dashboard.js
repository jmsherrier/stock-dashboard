import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings, REFRESH_INTERVALS } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { useStocksV2 } from '../hooks/useStocksV2';
import { DEFAULT_VISIBLE, CRITERIA } from '../data/criteria';
import { scoreStock } from '../data/scoring';
import { sortStocks } from '../data/sorting';
import {
  BUILTIN_PRESETS,
  loadCustomPresets,
  upsertCustomPreset,
  deleteCustomPreset,
} from '../data/presets';
import Header from './Header';
import Toolbar from './Toolbar';
import StockGrid from './StockGrid';
import CriteriaPanel from './CriteriaPanel';
import SettingsModal from './SettingsModal';

const VISIBLE_KEY = 'dashboard_visible_criteria_v2';
const PANEL_KEY = 'dashboard_panel_open_v2';
const SORT_KEY = 'dashboard_sort_v2';

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

function loadSort() {
  try {
    const raw = localStorage.getItem(SORT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.key) return parsed;
    }
  } catch {}
  return { key: 'score', dir: 'desc' };
}

// Two criteria sets are equivalent as a "view" if they contain the same keys
// (order-independent). Used to highlight the active preset chip.
function sameCriteriaSet(a, b) {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((k) => set.has(k));
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const { toast } = useToast();
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
  const [sort, setSort] = useState(loadSort);
  const [panelOpen, setPanelOpen] = useState(
    () => localStorage.getItem(PANEL_KEY) === 'true'
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customPresets, setCustomPresets] = useState(() => loadCustomPresets());

  useEffect(() => {
    localStorage.setItem(VISIBLE_KEY, JSON.stringify(visibleCriteria));
  }, [visibleCriteria]);

  useEffect(() => {
    localStorage.setItem(PANEL_KEY, String(panelOpen));
  }, [panelOpen]);

  useEffect(() => {
    localStorage.setItem(SORT_KEY, JSON.stringify(sort));
  }, [sort]);

  const presets = useMemo(
    () => [...BUILTIN_PRESETS, ...customPresets],
    [customPresets]
  );

  // Score every stock against the visible criteria, then sort. The score is
  // attached as `_score` so cards and the sorter can read it.
  const scoredStocks = useMemo(
    () =>
      stocks.map((s) => ({ ...s, _score: scoreStock(s, visibleCriteria) })),
    [stocks, visibleCriteria]
  );

  const sortedStocks = useMemo(
    () => sortStocks(scoredStocks, sort),
    [scoredStocks, sort]
  );

  // A preset is "active" when the current view matches its criteria set + sort.
  const activePresetId = useMemo(() => {
    const match = presets.find(
      (p) =>
        sameCriteriaSet(p.criteria, visibleCriteria) &&
        p.sort?.key === sort.key &&
        p.sort?.dir === sort.dir
    );
    return match?.id || null;
  }, [presets, visibleCriteria, sort]);

  // Summary stats for the toolbar.
  const summary = useMemo(() => {
    let gainers = 0;
    let losers = 0;
    let scoreSum = 0;
    let scoredCount = 0;
    for (const s of scoredStocks) {
      const ch = parseFloat(s.data?.percentChange);
      if (isFinite(ch)) {
        if (ch >= 0) gainers += 1;
        else losers += 1;
      }
      if (s._score?.scoredCount > 0) {
        scoreSum += s._score.total;
        scoredCount += 1;
      }
    }
    return {
      count: scoredStocks.length,
      gainers,
      losers,
      avgScore: scoredCount > 0 ? (scoreSum / scoredCount).toFixed(1) : null,
    };
  }, [scoredStocks]);

  const selectPreset = useCallback((preset) => {
    // Preserve canonical criteria order for consistent card rendering.
    const desired = new Set(preset.criteria);
    setVisibleCriteria(CRITERIA.filter((c) => desired.has(c.key)).map((c) => c.key));
    if (preset.sort) setSort(preset.sort);
  }, []);

  const handleSavePreset = useCallback(
    (name) => {
      upsertCustomPreset({ name, criteria: visibleCriteria, sort });
      setCustomPresets(loadCustomPresets());
      toast.success(`Saved "${name}" preset`);
    },
    [visibleCriteria, sort, toast]
  );

  const handleDeletePreset = useCallback(
    (id) => {
      deleteCustomPreset(id);
      setCustomPresets(loadCustomPresets());
      toast.info('Preset deleted');
    },
    [toast]
  );

  const handleAddStock = useCallback(
    async (ticker) => {
      const t = ticker.trim().toUpperCase();
      if (stocks.some((s) => s.ticker === t)) {
        toast.info(`${t} is already on the board`);
        return;
      }
      await addStock(t);
    },
    [stocks, addStock, toast]
  );

  const handleRefreshAll = useCallback(async () => {
    await refreshAll();
    toast.success('Quotes updated');
  }, [refreshAll, toast]);

  // Auto-refresh on the configured interval.
  useEffect(() => {
    const interval = REFRESH_INTERVALS.find((r) => r.id === settings.refreshInterval);
    const ms = interval?.ms || 0;
    if (!ms || stocks.length === 0) return;
    const id = setInterval(() => {
      refreshAll();
    }, ms);
    return () => clearInterval(id);
  }, [settings.refreshInterval, stocks.length, refreshAll]);

  return (
    <div className="app">
      <Header
        onAddStock={handleAddStock}
        onRefreshAll={handleRefreshAll}
        onToggleCriteria={() => setPanelOpen((v) => !v)}
        onOpenSettings={() => setSettingsOpen(true)}
        criteriaCount={visibleCriteria.length}
        bulkLoading={bulkLoading}
        stockCount={stocks.length}
      />

      <Toolbar
        presets={presets}
        activePresetId={activePresetId}
        onSelectPreset={selectPreset}
        onDeletePreset={handleDeletePreset}
        sort={sort}
        onSortChange={setSort}
        summary={summary}
        onSavePreset={handleSavePreset}
      />

      <div className="dashboard-body">
        <main className="dashboard-main">
          <StockGrid
            stocks={sortedStocks}
            visibleCriteria={visibleCriteria}
            loadingIds={loadingIds}
            showScores={settings.showScores}
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

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
