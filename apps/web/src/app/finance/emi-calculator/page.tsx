'use client';

import { useState, useEffect } from 'react';
import { calculateEMI } from '@toolbox/finance';
import { formatCurrency } from '@toolbox/shared';
import type { EMIOutput } from '@toolbox/finance';
import { ToolLayout } from '@/components/ToolLayout';
import { emiCalculatorManifest as emiManifest } from '@toolbox/finance';

interface EMIState {
  principal: string;
  annualRatePercent: string;
  tenureMonths: string;
}

function encodeState(s: EMIState): string {
  return btoa(JSON.stringify(s));
}

function decodeState(raw: string): EMIState | null {
  try {
    return JSON.parse(atob(raw)) as EMIState;
  } catch {
    return null;
  }
}

export default function EMICalculatorPage() {
  const [inputs, setInputs] = useState<EMIState>({ principal: '', annualRatePercent: '', tenureMonths: '' });
  const [result, setResult] = useState<EMIOutput | null>(null);
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
    const r = calculateEMI({
      principal: Number(inputs.principal),
      annualRatePercent: Number(inputs.annualRatePercent),
      tenureMonths: Number(inputs.tenureMonths),
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
    <ToolLayout manifest={emiManifest}>
      <form onSubmit={handleSubmit} aria-label="EMI calculator">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Field label="Principal (₹)" name="principal" value={inputs.principal}
            onChange={(v) => setInputs((p) => ({ ...p, principal: v }))} placeholder="e.g. 800000" />
          <Field label="Annual Rate (%)" name="annualRatePercent" value={inputs.annualRatePercent}
            onChange={(v) => setInputs((p) => ({ ...p, annualRatePercent: v }))} placeholder="e.g. 9" step="0.01" />
          <Field label="Tenure (months)" name="tenureMonths" value={inputs.tenureMonths}
            onChange={(v) => setInputs((p) => ({ ...p, tenureMonths: v }))} placeholder="e.g. 60" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn-primary">Calculate EMI</button>
          <button type="button" className="btn-secondary" onClick={handleShare}>
            {shareMsg || 'Share'}
          </button>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>

      {result && (
        <div role="region" aria-live="polite" aria-label="EMI results" style={{ marginTop: '1.5rem' }}>
          <div className="result-box">
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
