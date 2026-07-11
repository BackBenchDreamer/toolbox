import type { ToolManifest } from '@toolbox/shared';

interface ToolLayoutProps {
  manifest: ToolManifest;
  children: React.ReactNode;
}

/**
 * Reusable layout for every tool page.
 * Accepts the manifest to render shared metadata (name, description, API endpoint, tags).
 * Business logic lives in the children — never in this layout.
 */
export function ToolLayout({ manifest, children }: ToolLayoutProps) {
  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
        <a href="/">Home</a>
        {' / '}
        <a href={`/${manifest.category}`}>{manifest.category}</a>
        {' / '}
        <span>{manifest.name}</span>
      </nav>

      {/* Tool header */}
      <header style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{manifest.name}</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '0.75rem' }}>{manifest.description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {manifest.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '99px',
                color: 'var(--muted)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Tool content — form + result */}
      <div>{children}</div>

      {/* API reference footer */}
      <aside
        style={{
          marginTop: '3rem',
          padding: '1rem',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          color: 'var(--muted)',
        }}
      >
        <strong>API</strong>{' '}
        <code style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>
          POST {manifest.apiEndpoint}
        </code>
        {' · '}
        <span>v{manifest.version}</span>
      </aside>
    </div>
  );
}
