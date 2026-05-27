// Lean state hook for the rebuilt dashboard.
// Stock shape: { id, ticker, data: {...quoteFields}, updatedAt }
import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '../api/client';

const LOCAL_KEY = 'dashboard_stocks_v2';

function uid() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Migrate stocks saved in the legacy "components" shape into the new shape,
// and drop placeholder rows that have no ticker. Idempotent — stocks already
// in the new shape pass through unchanged.
function normalizeStocks(raw) {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((s) => {
      if (!s || typeof s !== 'object') return null;

      // Already new shape
      if (typeof s.ticker === 'string') {
        const t = s.ticker.trim().toUpperCase();
        if (!t) return null;
        return {
          id: s.id || uid(),
          ticker: t,
          data: s.data && typeof s.data === 'object' ? s.data : {},
          updatedAt: s.updatedAt || null,
        };
      }

      // Legacy shape: { components: { ticker: {value}, price: {value}, ... } }
      const components = s.components;
      if (!components || typeof components !== 'object') return null;
      const ticker = components.ticker?.value?.toString().trim().toUpperCase();
      if (!ticker) return null;

      const data = {};
      for (const [k, v] of Object.entries(components)) {
        if (k === 'ticker') continue;
        if (v && typeof v === 'object' && 'value' in v && v.value !== '' && v.value != null) {
          data[k] = v.value;
        }
      }

      return {
        id: s.id || uid(),
        ticker,
        data,
        updatedAt: null,
      };
    })
    .filter(Boolean);
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeStocks(parsed?.stocks);
  } catch {
    return [];
  }
}

function saveLocal(stocks) {
  try {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ stocks, meta: { updated: Date.now() } })
    );
  } catch {
    /* ignore quota */
  }
}

export function useStocksV2({ authenticated }) {
  const [stocks, setStocks] = useState(() => loadLocal());
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  // Reconciled = "we've finished the initial sync with the backend". Until
  // this flips true we don't write anywhere, so we can't clobber server
  // state with the stale local snapshot.
  const [reconciled, setReconciled] = useState(false);
  const loadAttemptedRef = useRef(false);

  // Load from backend once when authenticated
  useEffect(() => {
    if (!authenticated) {
      // For anonymous mode just use local; mark reconciled immediately.
      setReconciled(true);
      return;
    }
    if (loadAttemptedRef.current) return;
    loadAttemptedRef.current = true;

    (async () => {
      try {
        const resp = await apiClient.getUserStocks();
        const normalized = normalizeStocks(resp?.stocks);
        // Always replace with normalized backend state on first load — this
        // also flushes any legacy placeholders that had no ticker.
        setStocks(normalized);
      } catch (err) {
        console.warn('Could not load stocks from backend, using local:', err);
      } finally {
        setReconciled(true);
      }
    })();
  }, [authenticated]);

  // Persist whenever stocks change, but only after initial reconciliation
  useEffect(() => {
    if (!reconciled) return;
    saveLocal(stocks);
    if (authenticated) {
      apiClient
        .saveUserStock({ stocks, meta: { updated: Date.now() } })
        .catch((err) => console.warn('Backend save failed:', err));
    }
  }, [stocks, authenticated, reconciled]);

  const setLoading = (id, isLoading) => {
    setLoadingIds((prev) => {
      const next = new Set(prev);
      if (isLoading) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const fetchQuote = useCallback(async (id, ticker) => {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    setLoading(id, true);
    try {
      const data = await apiClient.getStockQuote(t);
      setStocks((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, ticker: t, data: { ...s.data, ...data }, updatedAt: Date.now() }
            : s
        )
      );
    } catch (err) {
      console.warn(`Quote fetch failed for ${t}:`, err);
    } finally {
      setLoading(id, false);
    }
  }, []);

  const addStock = useCallback(
    async (ticker) => {
      const t = ticker.trim().toUpperCase();
      if (!t) return null;
      const id = uid();
      // Insert at the start so the user sees the new card immediately
      setStocks((prev) => [{ id, ticker: t, data: {}, updatedAt: null }, ...prev]);
      await fetchQuote(id, t);
      return id;
    },
    [fetchQuote]
  );

  const removeStock = useCallback((id) => {
    setStocks((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const refreshStock = useCallback(
    (id) => {
      const stock = stocks.find((s) => s.id === id);
      if (stock && stock.ticker) {
        return fetchQuote(id, stock.ticker);
      }
      return Promise.resolve();
    },
    [stocks, fetchQuote]
  );

  const refreshAll = useCallback(async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        stocks
          .filter((s) => s.ticker)
          .map((s) => fetchQuote(s.id, s.ticker))
      );
    } finally {
      setBulkLoading(false);
    }
  }, [stocks, fetchQuote]);

  return {
    stocks,
    loadingIds,
    bulkLoading,
    addStock,
    removeStock,
    refreshStock,
    refreshAll,
  };
}
