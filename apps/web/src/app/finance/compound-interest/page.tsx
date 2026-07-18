'use client';

import { useState, useEffect } from 'react';
import { calculateCompoundInterest } from '@toolbox/finance';
import { formatCurrency, formatPercent } from '@toolbox/shared';
import type { CompoundInterestOutput } from '@toolbox/finance';
import { ToolLayout } from '@/components/ToolLayout';
import { compoundInterestManifest as ciManifest } from '@toolbox/finance';

interface CIState {
  principal: string;
  annualRatePercent: string;
  years: string;
  compoundingsPerYear: string;
}

function encodeState(s: CIState): string {
  return btoa(JSON.stringify(s));
}

function decodeState(raw: string): CIState | null {
  try {
    return JSON.parse(atob(raw)) as CIState;
  } catch {
    return null;
  }
}

const COMPOUNDING_OPTIONS: { label: string; value: number }[] = [
  { label: 'Annually', value: 1 },
  { label: 'Semi-annually', value: 2 },
  { label: 'Quarterly', value: 4 },
  { label: 'Monthly', value: 12 },
  { label: 'Daily', value: 365 },
];

export default function CompoundInterestPage() {
  const [inputs, setInputs] = useState<CIState>({
    principal: '',
    annualRatePercent: '',
    years: '',
    compoundingsPerYear: '12',
  });
  const [result, setResult] = useState<CompoundInterestOutput | null>(null);
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
    const r = calculateCompoundInterest({
      principal: Number(inputs.principal),
      annualRatePercent: Number(inputs.annualRatePercent),
      years: Number(inputs.years),
      compoundingsPerYear: Number(inputs.compoundingsPerYear),
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
    <ToolLayout manifest={ciManifest}>
      <form onSubmit={handleSubmit} aria-label="Compound interest calculator">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          <Field label="Principal (₹)" name="principal" value={inputs.principal}
            onChange={(v) => setInputs((p) => ({ ...p, principal: v }))} placeholder="e.g. 100000" />
          <Field label="Annual Rate (%)" name="annualRatePercent" value={inputs.annualRatePercent}
            onChange={(v) => setInputs((p) => ({ ...p, annualRatePercent: v }))} placeholder="e.g. 8" step="0.1" />
          <Field label="Years" name="years" value={inputs.years}
            onChange={(v) => setInputs((p) => ({ ...p, years: v }))} placeholder="e.g. 5" />
          <div>
            <label htmlFor="compoundingsPerYear" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>
              Compounding
            </label>
            <select
              id="compoundingsPerYear"
              name="compoundingsPerYear"
              value={inputs.compoundingsPerYear}
              onChange={(e) => setInputs((p) => ({ ...p, compoundingsPerYear: e.target.value }))}
            >
              {COMPOUNDING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn-primary">Calculate</button>
          <button type="button" className="btn-secondary" onClick={handleShare}>
            {shareMsg || 'Share'}
          </button>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>

      {result && (
        <div role="region" aria-live="polite" aria-label="Compound interest results" style={{ marginTop: '1.5rem' }}>
          <div className="result-box">
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

function Field({ label, name, value, onChange, placeholder, step }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; step?: string;
}) {
  return (
    <div>
      <label htmlFor={name} style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>{label}</label>
      <input id={name} name={name} type="number" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} min={0} step={step ?? '1'} required />
    </div>
  );
}
