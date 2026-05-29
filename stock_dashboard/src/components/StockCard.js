import React from 'react';
import { CRITERIA_BY_KEY } from '../data/criteria';
import { scoreBand } from '../data/scoring';

function formatTime(ts) {
  if (!ts) return 'Not yet updated';
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function StockCard({
  stock,
  visibleCriteria,
  loading,
  showScores,
  onRefresh,
  onRemove,
}) {
  const { ticker, data = {} } = stock;
  const companyName = data.companyName;

  // Per-criterion qualitative level (good/neutral/bad) from the score breakdown.
  const score = stock._score;
  const levelByKey = {};
  if (score) {
    for (const b of score.breakdown) levelByKey[b.key] = b.level;
  }
  const showBadge = showScores && score && score.scoredCount > 0;
  const band = showBadge ? scoreBand(score.ratio) : null;

  const priceRaw = data.price;
  const changeRaw = data.percentChange;
  const priceCriterion = CRITERIA_BY_KEY.price;
  const changeCriterion = CRITERIA_BY_KEY.percentChange;

  const priceStr = priceRaw != null ? priceCriterion.format(priceRaw) : null;
  const changeStr = changeRaw != null ? changeCriterion.format(changeRaw) : null;
  const changeNum = parseFloat(changeRaw);
  const isPositive = isFinite(changeNum) && changeNum >= 0;

  // Render the criteria the user picked (skipping the ones already shown in
  // the header — price and percent change)
  const rows = visibleCriteria
    .map((key) => CRITERIA_BY_KEY[key])
    .filter(Boolean)
    .filter((c) => !c.header)
    .map((c) => {
      const raw = data[c.key];
      const value = raw != null && raw !== '' ? c.format(raw) : null;
      return { key: c.key, label: c.label, value, level: levelByKey[c.key] };
    });

  return (
    <div className={`card ${loading ? 'card--loading' : ''}`}>
      <div className="card__header">
        <div className="card__ticker-wrap">
          <div className="card__ticker-line">
            <span className="card__ticker">{ticker}</span>
            {showBadge && (
              <span
                className={`score-badge score-badge--${band}`}
                title={`Score ${score.total >= 0 ? '+' : ''}${score.total} across ${score.scoredCount} scored ${score.scoredCount === 1 ? 'metric' : 'metrics'}`}
              >
                {score.total >= 0 ? '+' : ''}{score.total}
              </span>
            )}
          </div>
          {companyName && <div className="card__name" title={companyName}>{companyName}</div>}
        </div>
        <div className="card__actions">
          <button
            className="card__action"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh quote"
            aria-label="Refresh quote"
          >
            ↻
          </button>
          <button
            className="card__action card__action--danger"
            onClick={onRemove}
            title="Remove"
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      </div>

      {(priceStr || changeStr) && (
        <div className="card__price-row">
          {priceStr && <span className="card__price">{priceStr}</span>}
          {changeStr && (
            <span
              className={`card__change card__change--${isPositive ? 'positive' : 'negative'}`}
            >
              {changeStr}
            </span>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <div className="card__criteria">
          {rows.map((r) => (
            <div className="criterion" key={r.key}>
              <span className="criterion__label">{r.label}</span>
              <span
                className={`criterion__value ${r.value == null ? 'criterion__value--muted' : ''} ${
                  showScores && r.level ? `criterion__value--${r.level}` : ''
                }`}
                title={r.value || 'No data'}
              >
                {r.value || '—'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="card__footer">
        <span>{formatTime(stock.updatedAt)}</span>
      </div>
    </div>
  );
}
