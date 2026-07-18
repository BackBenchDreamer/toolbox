'use client';

import { useState, useEffect } from 'react';
import { calculateGST } from '@toolbox/finance';
import { formatCurrency, formatPercent } from '@toolbox/shared';
import type { GSTOutput } from '@toolbox/finance';
import { ToolLayout } from '@/components/ToolLayout';
import { gstCalculatorManifest as gstManifest } from '@toolbox/finance';

interface GSTState {
  amount: string;
  gstPercent: string;
  mode: 'exclusive' | 'inclusive';
}

function encodeState(s: GSTState): string {
  return btoa(JSON.stringify(s));
}

function decodeState(raw: string): GSTState | null {
  try {
    const parsed = JSON.parse(atob(raw)) as GSTState;
    if (!['exclusive', 'inclusive'].includes(parsed.mode)) return null;
    return parsed;
  } catch {
    return null;
  }
}

const GST_RATES = [5, 12, 18, 28] as const;

export default function GSTCalculatorPage() {
  const [inputs, setInputs] = useState<GSTState>({
    amount: '',
    gstPercent: '18',
    mode: 'exclusive',
  });
  const [result, setResult] = useState<GSTOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const s = new URLSearchParams(window.location.search).get('s');
    if (!s) return;
    const decoded = decodeState(s);
    if (decoded) setInputs(decoded);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const r = calculateGST({
      amount: Number(inputs.amount),
      gstPercent: Number(inputs.gstPercent),
      mode: inputs.mode,
    });
    if (r.success) setResult(r.data);
    else setError(r.error.message);
  }

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?s=${encodeState(inputs)}`;
    void navigator.clipboard.writeText(url).then(() => {
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 2000);
    });
  }

  function handleCopyJSON() {
    if (!result) return;
    void navigator.clipboard.writeText(JSON.stringify(result, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <ToolLayout manifest={gstManifest}>
      <form onSubmit={handleSubmit} aria-label="GST calculator">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div>
            <label htmlFor="amount" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>
              Amount (₹)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              value={inputs.amount}
              onChange={(e) => setInputs((p) => ({ ...p, amount: e.target.value }))}
              placeholder="e.g. 10000"
              min={0.01}
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="gstPercent" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>
              GST Rate (%)
            </label>
            <select
              id="gstPercent"
              name="gstPercent"
              value={inputs.gstPercent}
              onChange={(e) => setInputs((p) => ({ ...p, gstPercent: e.target.value }))}
              required
            >
              {GST_RATES.map((r) => (
                <option key={r} value={r}>{r}%</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="mode" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>
              Mode
            </label>
            <select
              id="mode"
              name="mode"
              value={inputs.mode}
              onChange={(e) => setInputs((p) => ({ ...p, mode: e.target.value as 'exclusive' | 'inclusive' }))}
            >
              <option value="exclusive">Add GST (exclusive)</option>
              <option value="inclusive">Extract GST (inclusive)</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn-primary">Calculate GST</button>
          <button type="button" className="btn-secondary" onClick={handleShare}>
            {shareMsg || 'Share'}
          </button>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>

      {result && (
        <div role="region" aria-live="polite" aria-label="GST results" style={{ marginTop: '1.5rem' }}>
          <div className="result-box">
            {([
              ['Base Amount', formatCurrency(result.baseAmount)],
              ['GST Amount', formatCurrency(result.gstAmount)],
              ['Total Amount', formatCurrency(result.totalAmount)],
              ['CGST (50%)', formatCurrency(result.cgst)],
              ['SGST (50%)', formatCurrency(result.sgst)],
              ['Effective Rate', formatPercent(result.effectiveRate)],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="result-row">
                <span className="result-label">{label}</span>
                <span className="result-value">{value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <button className="btn-secondary" onClick={handleCopyJSON} style={{ fontSize: '0.85rem' }}>
              {copied ? '✓ Copied' : 'Copy as JSON'}
            </button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
