'use client';

import { useState } from 'react';
import { calculateLoan } from '@toolbox/finance';
import { formatCurrency } from '@toolbox/shared';
import type { LoanOutput } from '@toolbox/finance';
import { ToolLayout } from '@/components/ToolLayout';
import { loanCalculatorManifest as loanManifest } from '@toolbox/finance';

export default function LoanCalculatorPage() {
  const [result, setResult] = useState<LoanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const input = {
      principal: Number(fd.get('principal')),
      annualRatePercent: Number(fd.get('annualRatePercent')),
      tenureMonths: Number(fd.get('tenureMonths')),
    };
    const r = calculateLoan(input);
    if (r.success) setResult(r.data);
    else setError(r.error.message);
  }

  return (
    <ToolLayout manifest={loanManifest}>
      <form onSubmit={handleSubmit} aria-label="Loan calculator">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Field label="Loan Amount (₹)" name="principal" type="number" placeholder="e.g. 500000" min={1} />
          <Field label="Annual Interest Rate (%)" name="annualRatePercent" type="number" placeholder="e.g. 8.5" min={0} max={100} step="0.01" />
          <Field label="Tenure (months)" name="tenureMonths" type="number" placeholder="e.g. 240" min={1} />
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Calculate</button>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>

      {result && (
        <div className="result-box" role="region" aria-label="Loan calculation results">
          <ResultRow label="Monthly EMI" value={formatCurrency(result.emi)} />
          <ResultRow label="Total Payment" value={formatCurrency(result.totalPayment)} />
          <ResultRow label="Total Interest" value={formatCurrency(result.totalInterest)} />
        </div>
      )}
    </ToolLayout>
  );
}

function Field({ label, name, type, placeholder, min, max, step }: {
  label: string; name: string; type: string; placeholder?: string; min?: number; max?: number; step?: string;
}) {
  return (
    <div>
      <label htmlFor={name} style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>
        {label}
      </label>
      <input id={name} name={name} type={type} placeholder={placeholder} min={min} max={max} step={step} required />
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="result-row">
      <span className="result-label">{label}</span>
      <span className="result-value">{value}</span>
    </div>
  );
}
