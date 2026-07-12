'use client';

import { useState, useEffect, useCallback } from 'react';
import { calculateLoan, scheduleToCSV, outputToJSON } from '@toolbox/finance';
import { formatCurrency } from '@toolbox/shared';
import type { LoanOutput } from '@toolbox/finance';
import { ToolLayout } from '@/components/ToolLayout';
import { loanCalculatorManifest as loanManifest } from '@toolbox/finance';

// ─── URL state helpers ────────────────────────────────────────────────────────

interface LoanInputState {
  principal: string;
  annualRatePercent: string;
  tenureMonths: string;
  startDate: string;
}

function encodeState(s: LoanInputState): string {
  return btoa(JSON.stringify(s));
}

function decodeState(raw: string): LoanInputState | null {
  try {
    return JSON.parse(atob(raw)) as LoanInputState;
  } catch {
    return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoanCalculatorPage() {
  const [inputs, setInputs] = useState<LoanInputState>({
    principal: '',
    annualRatePercent: '',
    tenureMonths: '',
    startDate: '',
  });
  const [result, setResult] = useState<LoanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showYearly, setShowYearly] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  // Prefill from URL ?s= on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const s = new URLSearchParams(window.location.search).get('s');
    if (!s) return;
    const decoded = decodeState(s);
    if (decoded) setInputs(decoded);
  }, []);

  const calculate = useCallback((state: LoanInputState) => {
    setError(null);
    const r = calculateLoan({
      principal: Number(state.principal),
      annualRatePercent: Number(state.annualRatePercent),
      tenureMonths: Number(state.tenureMonths),
      includeSchedule: true,
      includeYearlySummary: true,
      startDate: state.startDate || undefined,
    });
    if (r.success) setResult(r.data);
    else setError(r.error.message);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    calculate(inputs);
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
    void navigator.clipboard.writeText(outputToJSON(result)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleDownloadCSV() {
    if (!result?.schedule?.length) return;
    const csv = scheduleToCSV(result.schedule);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'loan-schedule.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <ToolLayout manifest={loanManifest}>
      <form onSubmit={handleSubmit} aria-label="Loan calculator">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <Field label="Loan Amount (₹)" name="principal" value={inputs.principal}
            onChange={(v) => setInputs((p) => ({ ...p, principal: v }))} type="number" placeholder="e.g. 500000" min={1} />
          <Field label="Annual Rate (%)" name="annualRatePercent" value={inputs.annualRatePercent}
            onChange={(v) => setInputs((p) => ({ ...p, annualRatePercent: v }))} type="number" placeholder="e.g. 8.5" min={0} max={100} step="0.01" />
          <Field label="Tenure (months)" name="tenureMonths" value={inputs.tenureMonths}
            onChange={(v) => setInputs((p) => ({ ...p, tenureMonths: v }))} type="number" placeholder="e.g. 240" min={1} />
          <Field label="Start Date (optional)" name="startDate" value={inputs.startDate}
            onChange={(v) => setInputs((p) => ({ ...p, startDate: v }))} type="date" required={false} />
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
        <div role="region" aria-live="polite" aria-label="Loan calculation results" style={{ marginTop: '1.5rem' }}>

          {/* ── Core result ── */}
          <div className="result-box">
            <ResultRow label="Monthly EMI" value={formatCurrency(result.emi)} />
            <ResultRow label="Total Payment" value={formatCurrency(result.totalPayment)} />
            <ResultRow label="Total Interest" value={formatCurrency(result.totalInterest)} />
            <ResultRow label="Interest %" value={`${result.interestPercent.toFixed(2)}%`} />
            {result.payoffDate && (
              <ResultRow label="Payoff Date" value={result.payoffDate} />
            )}
          </div>

          {/* ── Warnings ── */}
          {result.warnings.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              {result.warnings.map((w) => (
                <div key={w.code} style={{
                  padding: '0.6rem 1rem',
                  marginBottom: '0.5rem',
                  borderRadius: 'var(--radius)',
                  background: w.severity === 'warning' ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,212,0.08)',
                  borderLeft: `3px solid ${w.severity === 'warning' ? 'var(--error)' : 'var(--accent)'}`,
                  fontSize: '0.875rem',
                }}>
                  <strong>{w.severity === 'warning' ? '⚠ Warning' : 'ℹ Info'}</strong>{' — '}{w.message}
                </div>
              ))}
            </div>
          )}

          {/* ── Recommendations ── */}
          {result.recommendations.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              {result.recommendations.map((rec) => (
                <div key={rec.code} style={{
                  padding: '0.6rem 1rem',
                  marginBottom: '0.5rem',
                  borderRadius: 'var(--radius)',
                  background: 'rgba(22,163,74,0.08)',
                  borderLeft: '3px solid var(--success)',
                  fontSize: '0.875rem',
                }}>
                  <strong>💡 Tip</strong>{' — '}{rec.message}
                </div>
              ))}
            </div>
          )}

          {/* ── Export actions ── */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={handleCopyJSON} style={{ fontSize: '0.85rem' }}>
              {copied ? '✓ Copied' : 'Copy as JSON'}
            </button>
            {result.schedule?.length && (
              <button className="btn-secondary" onClick={handleDownloadCSV} style={{ fontSize: '0.85rem' }}>
                Download CSV
              </button>
            )}
          </div>

          {/* ── Yearly summary ── */}
          {result.yearlySummary && result.yearlySummary.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowYearly((v) => !v)}
                style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}
                aria-expanded={showYearly}
              >
                {showYearly ? '▲ Hide' : '▼ Show'} Yearly Summary
              </button>
              {showYearly && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)' }}>
                        {['Year', 'Principal Paid', 'Interest Paid', 'Total Paid', 'Balance'].map((h) => (
                          <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlySummary!.map((row) => (
                        <tr key={row.year} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={tdStyle}>{row.year}</td>
                          <td style={tdStyle}>{formatCurrency(row.principalPaid)}</td>
                          <td style={tdStyle}>{formatCurrency(row.interestPaid)}</td>
                          <td style={tdStyle}>{formatCurrency(row.totalPaid)}</td>
                          <td style={tdStyle}>{formatCurrency(row.closingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Amortisation schedule ── */}
          {result.schedule && result.schedule.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowSchedule((v) => !v)}
                style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}
                aria-expanded={showSchedule}
              >
                {showSchedule ? '▲ Hide' : '▼ Show'} Full Schedule ({result.schedule.length} months)
              </button>
              {showSchedule && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)' }}>
                        {['Month', 'EMI', 'Principal', 'Interest', 'Balance', 'Cum. Principal', 'Cum. Interest'].map((h) => (
                          <th key={h} style={{ padding: '0.4rem 0.6rem', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule!.map((row) => (
                        <tr key={row.month} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={tdStyle}>{row.month}</td>
                          <td style={tdStyle}>{formatCurrency(row.emi)}</td>
                          <td style={tdStyle}>{formatCurrency(row.principal)}</td>
                          <td style={tdStyle}>{formatCurrency(row.interest)}</td>
                          <td style={tdStyle}>{formatCurrency(row.balance)}</td>
                          <td style={tdStyle}>{formatCurrency(row.cumPrincipal)}</td>
                          <td style={tdStyle}>{formatCurrency(row.cumInterest)}</td>
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
  label, name, value, onChange, type, placeholder, min, max, step, required = true,
}: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  type: string; placeholder?: string; min?: number; max?: number; step?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>
        {label}
      </label>
      <input
        id={name} name={name} type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} min={min} max={max} step={step}
        required={required}
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
