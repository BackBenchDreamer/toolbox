'use client';

import { useState } from 'react';
import { convertUnit, UNITS } from '@toolbox/utilities';
import type { UnitCategory } from '@toolbox/utilities';
import { ToolLayout } from '@/components/ToolLayout';
import { unitConverterManifest } from '@toolbox/utilities';

const CATEGORIES = [...new Set(UNITS.map((u) => u.category))] as UnitCategory[];

export default function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('km');
  const [value, setValue] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const catUnits = UNITS.filter((u) => u.category === category);

  function handleConvert() {
    setError(null);
    setResult(null);
    if (!value) return;
    const r = convertUnit({ value: Number(value), from, to });
    if (r.success) setResult(r.data.formula);
    else setError(r.error.message);
  }

  return (
    <ToolLayout manifest={unitConverterManifest}>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label htmlFor="category" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => {
              const cat = e.target.value as UnitCategory;
              setCategory(cat);
              const first = UNITS.find((u) => u.category === cat);
              const second = UNITS.filter((u) => u.category === cat)[1];
              setFrom(first?.key ?? '');
              setTo(second?.key ?? first?.key ?? '');
              setResult(null);
            }}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label htmlFor="value" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Value</label>
            <input
              id="value"
              type="number"
              value={value}
              onChange={(e) => { setValue(e.target.value); setResult(null); }}
              placeholder="Enter value"
              aria-label="Value to convert"
            />
          </div>
          <div>
            <label htmlFor="from-unit" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>From</label>
            <select id="from-unit" value={from} onChange={(e) => { setFrom(e.target.value); setResult(null); }}>
              {catUnits.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="to-unit" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>To</label>
            <select id="to-unit" value={to} onChange={(e) => { setTo(e.target.value); setResult(null); }}>
              {catUnits.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={handleConvert} style={{ width: 'fit-content' }}>Convert</button>

        {error && <p className="error-message" role="alert">{error}</p>}
        {result && (
          <div className="result-box">
            <p style={{ margin: 0, fontFamily: 'var(--mono)', fontSize: '1rem' }}>{result}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
