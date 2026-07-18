'use client';

import { useState, useEffect } from 'react';
import { simulatePrepayment } from '@toolbox/finance';
import { formatCurrency } from '@toolbox/shared';
import type { PrepaymentOutput, PrepaymentEvent } from '@toolbox/finance';
import { ToolLayout } from '@/components/ToolLayout';
import { prepaymentSimulationManifest } from '@toolbox/finance';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrepaymentFormState {
  principal: string;
  annualRatePercent: string;
  tenureMonths: string;
}

interface PrepaymentRow {
  month: string;
  amount: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrepaymentSimulationPage() {
  const [inputs, setInputs] = useState<PrepaymentFormState>({
    principal: '',
    annualRatePercent: '',
    tenureMonths: '',
  });
  const [prepayments, setPrepayments] = useState<PrepaymentRow[]>([{ month: '', amount: '' }]);
  const [result, setResult] = useState<PrepaymentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [copied, setCopied] = useState(false);

  // Prefill from URL ?s= on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = new URLSearchParams(window.location.search).get('s');
    if (!raw) return;
    try {
      const decoded = JSON.parse(atob(raw)) as {
        inputs: PrepaymentFormState;
        prepayments: PrepaymentRow[];
      };
      if (decoded.inputs) setInputs(decoded.inputs);
      if (decoded.prepayments?.length) setPrepayments(decoded.prepayments);
    } catch { /* ignore malformed */ }
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const events: PrepaymentEvent[] = prepayments
      .filter((p) => p.month && p.amount)
      .map((p) => ({ month: Number(p.month), amount: Number(p.amount) }));

    if (!events.length) {
      setError('Add at least one prepayment event (month + amount).');
      return;
    }

    const r = simulatePrepayment({
      principal: Number(inputs.principal),
      annualRatePercent: Number(inputs.annualRatePercent),
      tenureMonths: Number(inputs.tenureMonths),
      prepayments: events,
    });
    if (r.success) setResult(r.data);
    else setError(r.error.message);
  }

  function handleShare() {
    const payload = btoa(JSON.stringify({ inputs, prepayments }));
    const url = `${window.location.origin}${window.location.pathname}?s=${payload}`;
    void navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
  }

  function handleCopyJSON() {
    if (!result) return;
    void navigator.clipboard.writeText(JSON.stringify(result, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function addPrepayment() {
    setPrepayments((prev) => [...prev, { month: '', amount: '' }]);
  }

  function removePrepayment(idx: number) {
    setPrepayments((prev) => prev.filter((_, i) => i !== idx));
  }

  function updatePrepayment(idx: number, field: keyof PrepaymentRow, value: string) {
    setPrepayments((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }

  return (
    <ToolLayout manifest={prepaymentSimulationManifest}>
      <form onSubmit={handleSubmit} aria-label="Prepayment simulation">
        {/* Loan parameters */}
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <Field label="Principal (₹)" name="principal" value={inputs.principal}
            onChange={(v) => setInputs((p) => ({ ...p, principal: v }))} placeholder="e.g. 500000" />
          <Field label="Annual Rate (%)" name="annualRatePercent" value={inputs.annualRatePercent}
            onChange={(v) => setInputs((p) => ({ ...p, annualRatePercent: v }))} placeholder="e.g. 10" step="0.01" />
          <Field label="Original Tenure (months)" name="tenureMonths" value={inputs.tenureMonths}
            onChange={(v) => setInputs((p) => ({ ...p, tenureMonths: v }))} placeholder="e.g. 60" />
        </div>

        {/* Prepayment events */}
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem', margin: '0 0 0.75rem' }}>
            Prepayment Events
          </p>
          {prepayments.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                {idx === 0 && (
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>Month</label>
                )}
                <input
                  type="number" min={1} placeholder="e.g. 12"
                  value={p.month}
                  onChange={(e) => updatePrepayment(idx, 'month', e.target.value)}
                  aria-label={`Prepayment ${idx + 1} month`}
                />
              </div>
              <div style={{ flex: 1 }}>
                {idx === 0 && (
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>Amount (₹)</label>
                )}
                <input
                  type="number" min={1} placeholder="e.g. 50000"
                  value={p.amount}
                  onChange={(e) => updatePrepayment(idx, 'amount', e.target.value)}
                  aria-label={`Prepayment ${idx + 1} amount`}
                />
              </div>
              {prepayments.length > 1 && (
                <button type="button" className="btn-secondary"
                  onClick={() => removePrepayment(idx)}
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', flexShrink: 0 }}
                  aria-label={`Remove prepayment ${idx + 1}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addPrepayment}
            style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
            + Add prepayment
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn-primary">Simulate</button>
          <button type="button" className="btn-secondary" onClick={handleShare}>Share</button>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>

      {result && (
        <div role="region" aria-live="polite" aria-label="Prepayment simulation results" style={{ marginTop: '1.5rem' }}>
          {/* Summary */}
          <div className="result-box">
            <ResultRow label="Interest Saved" value={formatCurrency(result.interestSaved)} />
            <ResultRow label="Months Saved" value={`${result.monthsSaved} months`} />
            <ResultRow label="New Tenure" value={`${result.newTenureMonths} months`} />
            <ResultRow label="New Total Interest" value={formatCurrency(result.newTotalInterest)} />
            <ResultRow label="Original Total Interest" value={formatCurrency(result.originalTotalInterest)} />
            <ResultRow label="Original EMI" value={formatCurrency(result.originalEmi)} />
          </div>

          {/* Savings highlight */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(22,163,74,0.08)',
            borderLeft: '3px solid var(--success)',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
          }}>
            <strong>💡 Savings</strong> — By making {result.schedule.filter((r) => r.prepayment > 0).length} prepayment(s),
            you save <strong>{formatCurrency(result.interestSaved)}</strong> in interest
            and pay off <strong>{result.monthsSaved} months</strong> early.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={handleCopyJSON} style={{ fontSize: '0.85rem' }}>
              {copied ? '✓ Copied' : 'Copy as JSON'}
            </button>
          </div>

          {/* Revised schedule */}
          {result.schedule.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowSchedule((v) => !v)}
                style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}
                aria-expanded={showSchedule}
              >
                {showSchedule ? '▲ Hide' : '▼ Show'} Revised Schedule ({result.schedule.length} months)
              </button>
              {showSchedule && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)' }}>
                        {['Month', 'EMI', 'Principal', 'Interest', 'Prepayment', 'Balance'].map((h) => (
                          <th key={h} style={{ padding: '0.4rem 0.6rem', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((row) => (
                        <tr key={row.month} style={{
                          borderBottom: '1px solid var(--border)',
                          background: row.prepayment > 0 ? 'rgba(22,163,74,0.04)' : 'transparent',
                        }}>
                          <td style={tdStyle}>{row.month}</td>
                          <td style={tdStyle}>{formatCurrency(row.emi)}</td>
                          <td style={tdStyle}>{formatCurrency(row.principal)}</td>
                          <td style={tdStyle}>{formatCurrency(row.interest)}</td>
                          <td style={{ ...tdStyle, color: row.prepayment > 0 ? 'var(--success)' : 'var(--muted)' }}>
                            {row.prepayment > 0 ? formatCurrency(row.prepayment) : '—'}
                          </td>
                          <td style={tdStyle}>{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const tdStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  textAlign: 'right',
  fontFamily: 'var(--mono)',
  fontSize: '0.8rem',
};

function Field({
  label, name, value, onChange, placeholder, step,
}: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; step?: string;
}) {
  return (
    <div>
      <label htmlFor={name} style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>
        {label}
      </label>
      <input
        id={name} name={name} type="number" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} min={0} step={step ?? '1'}
        required
      />
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
