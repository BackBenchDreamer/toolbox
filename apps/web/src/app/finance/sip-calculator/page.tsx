'use client';

import { useState } from 'react';
import { calculateSIP } from '@toolbox/finance';
import { formatCurrency, formatNumber } from '@toolbox/shared';
import type { SIPOutput } from '@toolbox/finance';
import { ToolLayout } from '@/components/ToolLayout';
import { sipCalculatorManifest as sipManifest } from '@toolbox/finance';

export default function SIPCalculatorPage() {
  const [result, setResult] = useState<SIPOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const r = calculateSIP({
      monthlyInvestment: Number(fd.get('monthlyInvestment')),
      annualRatePercent: Number(fd.get('annualRatePercent')),
      tenureMonths: Number(fd.get('tenureMonths')),
    });
    if (r.success) setResult(r.data);
    else setError(r.error.message);
  }

  return (
    <ToolLayout manifest={sipManifest}>
      <form onSubmit={handleSubmit} aria-label="SIP calculator">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label htmlFor="monthlyInvestment" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Monthly Investment (₹)</label>
            <input id="monthlyInvestment" name="monthlyInvestment" type="number" placeholder="e.g. 10000" min={1} required />
          </div>
          <div>
            <label htmlFor="annualRatePercent" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Expected Return (% p.a.)</label>
            <input id="annualRatePercent" name="annualRatePercent" type="number" placeholder="e.g. 12" min={0} max={100} step="0.1" required />
          </div>
          <div>
            <label htmlFor="tenureMonths" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Period (months)</label>
            <input id="tenureMonths" name="tenureMonths" type="number" placeholder="e.g. 120" min={1} required />
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Calculate SIP</button>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>

      {result && (
        <div className="result-box" role="region" aria-label="SIP results">
          {([
            ['Future Value', formatCurrency(result.futureValue)],
            ['Total Invested', formatCurrency(result.totalInvested)],
            ['Estimated Returns', formatCurrency(result.estimatedReturns)],
            ['Wealth Ratio', `${formatNumber(result.wealthRatio, 2)}x`],
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
