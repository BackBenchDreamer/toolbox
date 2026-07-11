'use client';

import { useState } from 'react';
import { calculateCompoundInterest } from '@toolbox/finance';
import { formatCurrency, formatPercent } from '@toolbox/shared';
import type { CompoundInterestOutput } from '@toolbox/finance';
import { ToolLayout } from '@/components/ToolLayout';
import ciManifest from '@toolbox/finance/compound-interest';

export default function CompoundInterestPage() {
  const [result, setResult] = useState<CompoundInterestOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const r = calculateCompoundInterest({
      principal: Number(fd.get('principal')),
      annualRatePercent: Number(fd.get('annualRatePercent')),
      years: Number(fd.get('years')),
      compoundingsPerYear: Number(fd.get('compoundingsPerYear')),
    });
    if (r.success) setResult(r.data);
    else setError(r.error.message);
  }

  return (
    <ToolLayout manifest={ciManifest}>
      <form onSubmit={handleSubmit} aria-label="Compound interest calculator">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          <div>
            <label htmlFor="principal" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Principal (₹)</label>
            <input id="principal" name="principal" type="number" placeholder="e.g. 100000" min={1} required />
          </div>
          <div>
            <label htmlFor="annualRatePercent" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Annual Rate (%)</label>
            <input id="annualRatePercent" name="annualRatePercent" type="number" placeholder="e.g. 8" min={0} max={100} step="0.1" required />
          </div>
          <div>
            <label htmlFor="years" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Years</label>
            <input id="years" name="years" type="number" placeholder="e.g. 5" min={1} required />
          </div>
          <div>
            <label htmlFor="compoundingsPerYear" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Compounding</label>
            <select id="compoundingsPerYear" name="compoundingsPerYear">
              <option value={1}>Annually</option>
              <option value={2}>Semi-annually</option>
              <option value={4}>Quarterly</option>
              <option value={12}>Monthly</option>
              <option value={365}>Daily</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Calculate</button>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>

      {result && (
        <div className="result-box" role="region" aria-label="Compound interest results">
          {([
            ['Future Value', formatCurrency(result.futureValue)],
            ['Total Interest', formatCurrency(result.totalInterest)],
            ['Effective Annual Rate', formatPercent(result.effectiveAnnualRate)],
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
