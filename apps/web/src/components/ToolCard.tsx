import type { ToolManifest } from '@toolbox/shared';
import Link from 'next/link';

interface ToolCardProps {
  tool: ToolManifest;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={tool.route}
      style={{
        display: 'block',
        padding: '1rem 1.25rem',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        background: 'var(--bg)',
        transition: 'border-color 0.15s, background 0.15s',
        textDecoration: 'none',
        color: 'var(--text)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
        <span aria-hidden="true" style={{ fontSize: '1rem', color: 'var(--accent)' }}>◈</span>
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tool.name}</span>
        {tool.visibility === 'beta' && (
          <span style={{ fontSize: '0.65rem', background: 'var(--accent)', color: '#fff', borderRadius: '4px', padding: '1px 5px', marginLeft: '0.25rem' }}>
            beta
          </span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>
        {tool.description}
      </p>
    </Link>
  );
}
