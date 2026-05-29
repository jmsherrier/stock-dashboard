import React, { useState } from 'react';
import { SORT_OPTIONS } from '../data/sorting';

// The strategy + sort + at-a-glance stats bar that sits under the header.
export default function Toolbar({
  presets,
  activePresetId,
  onSelectPreset,
  onDeletePreset,
  sort,
  onSortChange,
  summary,
  onSavePreset,
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');

  const submitSave = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSavePreset(trimmed);
    setName('');
    setSaving(false);
  };

  const toggleDir = () =>
    onSortChange({ ...sort, dir: sort.dir === 'asc' ? 'desc' : 'asc' });

  return (
    <div className="toolbar">
      <div className="toolbar__presets" role="tablist" aria-label="Strategy presets">
        {presets.map((p) => {
          const active = p.id === activePresetId;
          return (
            <div key={p.id} className={`chip ${active ? 'chip--active' : ''}`}>
              <button
                className="chip__main"
                onClick={() => onSelectPreset(p)}
                title={p.description || p.name}
                role="tab"
                aria-selected={active}
              >
                {p.name}
              </button>
              {p.custom && (
                <button
                  className="chip__delete"
                  onClick={() => onDeletePreset(p.id)}
                  title="Delete preset"
                  aria-label={`Delete ${p.name} preset`}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        {saving ? (
          <form className="chip-save" onSubmit={submitSave}>
            <input
              autoFocus
              className="chip-save__input"
              placeholder="Preset name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => !name.trim() && setSaving(false)}
              maxLength={24}
            />
            <button type="submit" className="btn btn--primary btn--small" disabled={!name.trim()}>
              Save
            </button>
          </form>
        ) : (
          <button
            className="chip chip--add"
            onClick={() => setSaving(true)}
            title="Save current criteria + sort as a preset"
          >
            + Save view
          </button>
        )}
      </div>

      <div className="toolbar__spacer" />

      {summary && summary.count > 0 && (
        <div className="toolbar__stats">
          <span className="stat">
            <span className="stat__value stat__value--up">{summary.gainers}</span>
            <span className="stat__label">up</span>
          </span>
          <span className="stat">
            <span className="stat__value stat__value--down">{summary.losers}</span>
            <span className="stat__label">down</span>
          </span>
          {summary.avgScore != null && (
            <span className="stat">
              <span className="stat__value">{summary.avgScore > 0 ? '+' : ''}{summary.avgScore}</span>
              <span className="stat__label">avg score</span>
            </span>
          )}
        </div>
      )}

      <div className="toolbar__sort">
        <label className="toolbar__sort-label" htmlFor="sort-select">
          Sort
        </label>
        <select
          id="sort-select"
          className="select"
          value={sort.key}
          onChange={(e) => onSortChange({ ...sort, key: e.target.value })}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          className="btn btn--icon"
          onClick={toggleDir}
          title={sort.dir === 'asc' ? 'Ascending' : 'Descending'}
          aria-label="Toggle sort direction"
        >
          {sort.dir === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );
}
