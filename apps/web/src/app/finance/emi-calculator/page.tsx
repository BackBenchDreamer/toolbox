'use client';

import { useState } from 'react';
import { calculateEMI } from '@toolbox/finance';
import { formatCurrency } from '@toolbox/shared';
import type { EMIOutput } from '@toolbox/finance';
import { ToolLayout } from '@/components/ToolLayout';
import { emiCalculatorManifest as emiManifest } from '@toolbox/finance';

export default function EMICalculatorPage() {
  const [result, setResult] = useState<EMIOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const r = calculateEMI({
      principal: Number(fd.get('principal')),
      annualRatePercent: Number(fd.get('annualRatePercent')),
      tenureMonths: Number(fd.get('tenureMonths')),
    });
    if (r.success) setResult(r.data);
    else setError(r.error.message);
  }

  return (
    <ToolLayout manifest={emiManifest}>
      <form onSubmit={handleSubmit} aria-label="EMI calculator">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label htmlFor="principal" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Principal (₹)</label>
            <input id="principal" name="principal" type="number" placeholder="e.g. 800000" min={1} required />
          </div>
          <div>
            <label htmlFor="annualRatePercent" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Annual Rate (%)</label>
            <input id="annualRatePercent" name="annualRatePercent" type="number" placeholder="e.g. 9" min={0} max={100} step="0.01" required />
          </div>
          <div>
            <label htmlFor="tenureMonths" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Tenure (months)</label>
            <input id="tenureMonths" name="tenureMonths" type="number" placeholder="e.g. 60" min={1} required />
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Calculate EMI</button>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>

      {result && (
        <div className="result-box" role="region" aria-live="polite" aria-label="EMI results">
          {([
            ['Monthly EMI', formatCurrency(result.emi)],
            ['Total Amount', formatCurrency(result.totalAmount)],
            ['Total Interest', formatCurrency(result.totalInterest)],
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
