import React from 'react';

type Props = {
  status: 'open' | 'closed' | 'all';
  onStatus: (v: 'open' | 'closed' | 'all') => void;
  days: number;
  onDays: (n: number) => void;
  limit: number;
  onLimit: (n: number) => void;
  isLoading?: boolean;
  errorMessage?: string;
};

/** Top-right controls for status/days/limit. */
export default function Controls({
  status, onStatus, days, onDays, limit, onLimit, isLoading, errorMessage,
}: Props) {
  return (
    <div className="actions wrap" style={{ gap: 8 }}>
      <label className="field">
        Status
        <select
          className="select"
          value={status}
          onChange={(e) => onStatus(e.target.value as 'open' | 'closed' | 'all')}
        >
          <option value="open">open</option>
          <option value="closed">closed</option>
          <option value="all">all</option>
        </select>
      </label>

      <label className="field">
        Days
        <input
          className="input"
          type="number"
          min={1}
          value={days}
          onChange={(e) => onDays(Math.max(1, Number(e.target.value || 1)))}
        />
      </label>

      <label className="field">
        Limit
        <select
          className="select"
          value={limit}
          onChange={(e) => onLimit(Number(e.target.value))}
        >
          {[50, 100, 200, 400, 800].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>

      {isLoading && <span className="muted small">Loading…</span>}
      {!!errorMessage && (
        <span className="small" style={{ color: '#fca5a5' }}>
          Error: {errorMessage}
        </span>
      )}
    </div>
  );
}
