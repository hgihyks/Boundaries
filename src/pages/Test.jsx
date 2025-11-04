import React, { useState } from 'react';

export default function Test() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [source, setSource] = useState('');

  async function fetchQuotable() {
    setLoading(true);
    setError('');
    setSource('quotable');
    try {
      const primaryUrl = `https://api.quotable.io/quotes?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`;
      const fallbackUrl = `https://quotable.io/quotes?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`;

      let data;
      let primaryFailed = false;

      try {
        const res = await fetch(primaryUrl, {
          method: 'GET',
          mode: 'cors',
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) {
          let details = '';
          try {
            const errJson = await res.json();
            details = errJson?.message || errJson?.error || '';
          } catch (_) {}
          throw new Error(`Quotable request failed (${res.status})${details ? `: ${details}` : ''}`);
        }
        data = await res.json();
      } catch (err) {
        primaryFailed = true;
      }

      if (primaryFailed) {
        const res2 = await fetch(fallbackUrl, {
          method: 'GET',
          mode: 'cors',
          headers: { Accept: 'application/json' }
        });
        if (!res2.ok) {
          let details = '';
          try {
            const errJson = await res2.json();
            details = errJson?.message || errJson?.error || '';
          } catch (_) {}
          throw new Error(`Quotable fallback failed (${res2.status})${details ? `: ${details}` : ''}`);
        }
        data = await res2.json();
      }

      const items = Array.isArray(data.results) ? data.results : [];
      const texts = items.map((q) => q && typeof q.content === 'string' ? q.content : '').filter(Boolean);
      setQuotes(texts);
    } catch (e) {
      setError(e?.message || 'Something went wrong fetching Quotable');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPaperquotes() {
    setLoading(true);
    setError('');
    setSource('paperquotes');
    try {
      const url = `https://api.paperquotes.com/apiv1/quotes/?lang=pt&offset=${encodeURIComponent(page)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Paperquotes request failed (${res.status})`);
      }
      const data = await res.json();
      const items = Array.isArray(data.results) ? data.results : [];
      const texts = items.map((q) => q && typeof q.quote === 'string' ? q.quote : '').filter(Boolean);
      setQuotes(texts);
    } catch (e) {
      setError(e?.message || 'Something went wrong fetching Paperquotes');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h2 style={{ margin: '0 0 12px' }}>/test: API Playground</h2>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 12
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <span style={{ fontSize: 12, color: '#555' }}>page</span>
          <input
            type="number"
            min={1}
            value={page}
            onChange={(e) => {
              const val = Number(e.target.value);
              setPage(Number.isFinite(val) && val > 0 ? val : 1);
            }}
            aria-label="Quotable page"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <span style={{ fontSize: 12, color: '#555' }}>limit</span>
          <input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(e) => {
              const val = Number(e.target.value);
              const safe = Number.isFinite(val) && val > 0 ? Math.min(val, 50) : 5;
              setLimit(safe);
            }}
            aria-label="Quotable limit"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </label>

        <button
          onClick={fetchQuotable}
          disabled={loading}
          aria-label="Fetch Quotable"
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #222',
            background: '#111',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading && source === 'quotable' ? 'Loading...' : 'Fetch Quotable'}
        </button>

        <button
          onClick={fetchPaperquotes}
          disabled={loading}
          aria-label="Fetch Paperquotes"
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #444',
            background: '#fff',
            color: '#111',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading && source === 'paperquotes' ? 'Loading...' : 'Fetch Paperquotes'}
        </button>
      </div>

      {error ? (
        <div style={{ color: '#b00020', marginBottom: 12 }} role="alert">{error}</div>
      ) : null}

      <div style={{ borderTop: '1px solid #eee', paddingTop: 12 }}>
        {quotes.length === 0 && !loading ? (
          <div style={{ color: '#666' }}>No results yet</div>
        ) : null}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {quotes.map((q, idx) => (
            <li
              key={`${source}-${idx}`}
              style={{
                padding: 12,
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                background: '#fafafa'
              }}
            >
              {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


