import React, { useEffect, useRef, useState } from 'react';
import { SORT_OPTIONS } from '../data/sorting';

// The strategy + sort + at-a-glance stats bar that sits under the header.
export default function Toolbar({
  presets,
  activePresetId,
  onSelectPreset,
  onDeselectPreset,
  onDeletePreset,
  onRenamePreset,
  sort,
  onSortChange,
  summary,
  onSavePreset,
}) {
  // The id of the custom preset currently being renamed inline (or null).
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const beginEdit = (preset) => {
    setEditingId(preset.id);
    setDraft(preset.name);
  };

  const commitEdit = () => {
    if (editingId) onRenamePreset(editingId, draft);
    setEditingId(null);
    setDraft('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft('');
  };

  const handleEditKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  // Save the current view as a new "Untitled" preset, then drop straight into
  // inline-rename mode on the freshly created chip.
  const handleSave = () => {
    const newId = onSavePreset();
    if (newId) {
      setEditingId(newId);
      setDraft('Untitled');
    }
  };

  const toggleDir = () =>
    onSortChange({ ...sort, dir: sort.dir === 'asc' ? 'desc' : 'asc' });

  return (
    <div className="toolbar">
      <div className="toolbar__presets" role="tablist" aria-label="Strategy presets">
        {presets.map((p) => {
          const active = p.id === activePresetId;
          if (p.custom && p.id === editingId) {
            return (
              <div key={p.id} className="chip chip--editing">
                <input
                  ref={inputRef}
                  className="chip__rename"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleEditKey}
                  onBlur={commitEdit}
                  maxLength={24}
                  aria-label="Preset name"
                />
              </div>
            );
          }
          return (
            <div key={p.id} className={`chip ${active ? 'chip--active' : ''}`}>
              <button
                className="chip__main"
                onClick={() => (active ? onDeselectPreset() : onSelectPreset(p))}
                title={active ? 'Deselect — clears all criteria' : p.description || p.name}
                role="tab"
                aria-selected={active}
              >
                {p.name}
              </button>
              {p.custom && (
                <>
                  <button
                    className="chip__edit"
                    onClick={() => beginEdit(p)}
                    title="Rename preset"
                    aria-label={`Rename ${p.name} preset`}
                  >
                    ✎
                  </button>
                  <button
                    className="chip__delete"
                    onClick={() => onDeletePreset(p.id)}
                    title="Delete preset"
                    aria-label={`Delete ${p.name} preset`}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          );
        })}

        <button
          className="chip chip--add"
          onClick={handleSave}
          title="Save current criteria + sort as a preset"
        >
          + Save view
        </button>
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
