import React, { useMemo, useState } from 'react';
import { CRITERIA, CRITERIA_GROUPS, DEFAULT_VISIBLE } from '../data/criteria';

export default function CriteriaPanel({
  visibleCriteria,
  onChange,
  onClose,
}) {
  const [query, setQuery] = useState('');
  const visibleSet = useMemo(() => new Set(visibleCriteria), [visibleCriteria]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CRITERIA;
    return CRITERIA.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const c of filtered) {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group).push(c);
    }
    // Preserve canonical group order
    return CRITERIA_GROUPS.filter((g) => map.has(g)).map((g) => ({
      name: g,
      items: map.get(g),
    }));
  }, [filtered]);

  const toggle = (key) => {
    if (visibleSet.has(key)) {
      onChange(visibleCriteria.filter((k) => k !== key));
    } else {
      // Preserve canonical CRITERIA order so cards render consistently
      const desired = new Set([...visibleCriteria, key]);
      onChange(CRITERIA.filter((c) => desired.has(c.key)).map((c) => c.key));
    }
  };

  return (
    <aside className="criteria-panel" aria-label="Criteria">
      <div className="criteria-panel__header">
        <span className="criteria-panel__title">Criteria</span>
        <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Close panel">×</button>
      </div>

      <div className="criteria-panel__search">
        <input
          placeholder="Search criteria…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search criteria"
        />
      </div>

      <div className="criteria-panel__list">
        {grouped.map((group) => (
          <div className="criteria-group" key={group.name}>
            <div className="criteria-group__heading">{group.name}</div>
            {group.items.map((c) => {
              const active = visibleSet.has(c.key);
              return (
                <button
                  key={c.key}
                  className={`criterion-toggle ${active ? 'criterion-toggle--active' : ''}`}
                  onClick={() => toggle(c.key)}
                  type="button"
                >
                  <span className="criterion-toggle__check">{active ? '✓' : ''}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="criteria-panel__footer">
        <span>{visibleCriteria.length} selected</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => onChange(DEFAULT_VISIBLE)}>Reset</button>
          <button onClick={() => onChange([])}>Clear all</button>
        </div>
      </div>
    </aside>
  );
}
