'use client';

import { useState, useCallback } from 'react';
import { generateUUID } from '@toolbox/developer';
import type { UUIDOutput } from '@toolbox/developer';
import { ToolLayout } from '@/components/ToolLayout';
import { uuidGeneratorManifest as uuidManifest } from '@toolbox/developer';

export default function UUIDGeneratorPage() {
  const [options, setOptions] = useState({ count: 5, version: 'v4' as 'v4' | 'v7', uppercase: false });
  const [result, setResult] = useState<UUIDOutput | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(() => {
    setError(null);
    const r = generateUUID(options);
    if (r.success) setResult(r.data);
    else setError(r.error.message);
  }, [options]);

  const copyAll = useCallback(() => {
    if (!result) return;
    void navigator.clipboard.writeText(result.uuids.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [result]);

  return (
    <ToolLayout manifest={uuidManifest}>
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label htmlFor="count" style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.25rem' }}>Count</label>
            <input id="count" type="number" min={1} max={100} value={options.count}
              onChange={(e) => setOptions((p) => ({ ...p, count: Number(e.target.value) }))}
              style={{ width: '70px' }} />
          </div>
          <div>
            <label htmlFor="version" style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.25rem' }}>Version</label>
            <select id="version" value={options.version}
              onChange={(e) => setOptions((p) => ({ ...p, version: e.target.value as 'v4' | 'v7' }))}>
              <option value="v4">v4 (random)</option>
              <option value="v7">v7 (time-ordered)</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', cursor: 'pointer', marginTop: '1.25rem' }}>
            <input type="checkbox" checked={options.uppercase}
              onChange={() => setOptions((p) => ({ ...p, uppercase: !p.uppercase }))} />
            Uppercase
          </label>
          <button className="btn-primary" onClick={generate} style={{ marginTop: '1.25rem' }}>Generate</button>
        </div>

        {error && <p className="error-message" role="alert">{error}</p>}

        {result && (
          <div className="result-box" role="region" aria-live="polite" aria-label="Generated UUIDs">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--muted)' }}>{result.uuids.length} UUID{result.uuids.length > 1 ? 's' : ''} · {result.version}</span>
              <button className="btn-secondary" onClick={copyAll}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                {copied ? '✓ Copied all' : 'Copy all'}
              </button>
            </div>
            {result.uuids.map((id, i) => (
              <div key={i} style={{ padding: '0.3rem 0', borderBottom: i < result.uuids.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <code style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>{id}</code>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
