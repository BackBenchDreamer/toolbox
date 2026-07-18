'use client';

import { useState, useEffect } from 'react';
import { calculateSIP } from '@toolbox/finance';
import { formatCurrency, formatNumber } from '@toolbox/shared';
import type { SIPOutput } from '@toolbox/finance';
import { ToolLayout } from '@/components/ToolLayout';
import { sipCalculatorManifest as sipManifest } from '@toolbox/finance';

interface SIPState {
  monthlyInvestment: string;
  annualRatePercent: string;
  tenureMonths: string;
}

function encodeState(s: SIPState): string { return btoa(JSON.stringify(s)); }
function decodeState(raw: string): SIPState | null {
  try { return JSON.parse(atob(raw)) as SIPState; } catch { return null; }
}

export default function SIPCalculatorPage() {
  const [inputs, setInputs] = useState<SIPState>({ monthlyInvestment: '', annualRatePercent: '', tenureMonths: '' });
  const [result, setResult] = useState<SIPOutput | null>(null);
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
    const r = calculateSIP({
      monthlyInvestment: Number(inputs.monthlyInvestment),
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
    <ToolLayout manifest={sipManifest}>
      <form onSubmit={handleSubmit} aria-label="SIP calculator">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Field label="Monthly Investment (₹)" name="monthlyInvestment" value={inputs.monthlyInvestment}
            onChange={(v) => setInputs((p) => ({ ...p, monthlyInvestment: v }))} placeholder="e.g. 10000" />
          <Field label="Expected Return (% p.a.)" name="annualRatePercent" value={inputs.annualRatePercent}
            onChange={(v) => setInputs((p) => ({ ...p, annualRatePercent: v }))} placeholder="e.g. 12" step="0.1" />
          <Field label="Period (months)" name="tenureMonths" value={inputs.tenureMonths}
            onChange={(v) => setInputs((p) => ({ ...p, tenureMonths: v }))} placeholder="e.g. 120" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn-primary">Calculate SIP</button>
          <button type="button" className="btn-secondary" onClick={handleShare}>
            {shareMsg || 'Share'}
          </button>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>

      {result && (
        <div role="region" aria-live="polite" aria-label="SIP results" style={{ marginTop: '1.5rem' }}>
          <div className="result-box">
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
