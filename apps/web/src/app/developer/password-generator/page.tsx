'use client';

import { useState, useCallback } from 'react';
import { generatePassword } from '@toolbox/developer';
import type { PasswordOutput } from '@toolbox/developer';
import { ToolLayout } from '@/components/ToolLayout';
import passwordManifest from '@toolbox/developer/password-generator';

export default function PasswordGeneratorPage() {
  const [options, setOptions] = useState({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: false,
    excludeAmbiguous: false,
    count: 1,
  });
  const [result, setResult] = useState<PasswordOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const generate = useCallback(() => {
    setError(null);
    const r = generatePassword(options);
    if (r.success) setResult(r.data);
    else setError(r.error.message);
  }, [options]);

  const copyToClipboard = useCallback((text: string, idx: number) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const toggle = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const strengthColors: Record<string, string> = {
    weak: '#c0392b', fair: '#e67e22', strong: '#2ecc71', 'very-strong': '#16a34a',
  };

  return (
    <ToolLayout manifest={passwordManifest}>
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        <div>
          <label htmlFor="length" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>
            Length: <strong>{options.length}</strong>
          </label>
          <input
            id="length" type="range" min={4} max={128}
            value={options.length}
            onChange={(e) => setOptions((p) => ({ ...p, length: Number(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {([ ['includeLowercase', 'Lowercase (a-z)'], ['includeUppercase', 'Uppercase (A-Z)'],
             ['includeNumbers', 'Numbers (0-9)'], ['includeSymbols', 'Symbols (!@#…)'],
             ['excludeAmbiguous', 'Exclude Ambiguous'] ] as [keyof typeof options, string][]).map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={Boolean(options[key])} onChange={() => toggle(key)} />
              {label}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label htmlFor="count" style={{ fontSize: '0.85rem', color: 'var(--muted)', marginRight: '0.4rem' }}>Count:</label>
            <input id="count" type="number" min={1} max={100} value={options.count}
              onChange={(e) => setOptions((p) => ({ ...p, count: Number(e.target.value) }))}
              style={{ width: '60px' }} />
          </div>
          <button className="btn-primary" onClick={generate}>Generate</button>
        </div>

        {error && <p className="error-message" role="alert">{error}</p>}

        {result && (
          <div className="result-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
              <span>Entropy: {result.entropy} bits</span>
              <span style={{ color: strengthColors[result.strength] ?? 'inherit', fontWeight: 600 }}>
                {result.strength.replace('-', ' ')}
              </span>
            </div>
            {result.passwords.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.4rem 0', borderBottom: i < result.passwords.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <code style={{ fontFamily: 'var(--mono)', fontSize: '0.9rem', wordBreak: 'break-all' }}>{p}</code>
                <button
                  className="btn-secondary"
                  onClick={() => copyToClipboard(p, i)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem 0.6rem', fontSize: '0.75rem', flexShrink: 0 }}
                  aria-label={`Copy password ${i + 1}`}
                >
                  {copied === i ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
