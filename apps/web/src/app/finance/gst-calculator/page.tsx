'use client';

import { useState } from 'react';
import { calculateGST } from '@toolbox/finance';
import { formatCurrency } from '@toolbox/shared';
import type { GSTOutput } from '@toolbox/finance';
import { ToolLayout } from '@/components/ToolLayout';
import gstManifest from '@toolbox/finance/gst-calculator';

export default function GSTCalculatorPage() {
  const [result, setResult] = useState<GSTOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const r = calculateGST({
      amount: Number(fd.get('amount')),
      gstPercent: Number(fd.get('gstPercent')),
      mode: fd.get('mode') as 'exclusive' | 'inclusive',
    });
    if (r.success) setResult(r.data);
    else setError(r.error.message);
  }

  return (
    <ToolLayout manifest={gstManifest}>
      <form onSubmit={handleSubmit} aria-label="GST calculator">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div>
            <label htmlFor="amount" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Amount (₹)</label>
            <input id="amount" name="amount" type="number" placeholder="e.g. 10000" min={0.01} step="0.01" required />
          </div>
          <div>
            <label htmlFor="gstPercent" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>GST Rate (%)</label>
            <select id="gstPercent" name="gstPercent" required>
              {[5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="mode" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Mode</label>
            <select id="mode" name="mode">
              <option value="exclusive">Add GST (exclusive)</option>
              <option value="inclusive">Extract GST (inclusive)</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Calculate GST</button>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>

      {result && (
        <div className="result-box" role="region" aria-label="GST results">
          {([
            ['Base Amount', formatCurrency(result.baseAmount)],
            ['GST Amount', formatCurrency(result.gstAmount)],
            ['Total Amount', formatCurrency(result.totalAmount)],
            ['CGST (50%)', formatCurrency(result.cgst)],
            ['SGST (50%)', formatCurrency(result.sgst)],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="result-row">
              <span className="result-label">{label}</span>
              <span className="result-value">{value}</span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
