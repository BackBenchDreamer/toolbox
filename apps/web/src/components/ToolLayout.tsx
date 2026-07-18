import Link from 'next/link';
import type { ToolManifest } from '@toolbox/shared';
import { getRelatedTools } from '@toolbox/registry';

interface ToolLayoutProps {
  manifest: ToolManifest;
  children: React.ReactNode;
}

/**
 * Reusable layout for every tool page.
 * Accepts the manifest to render shared metadata (name, description, API endpoint, tags).
 * Business logic lives in the children — never in this layout.
 *
 * Server component — can import from registry safely.
 */
export function ToolLayout({ manifest, children }: ToolLayoutProps) {
  const related = getRelatedTools(manifest.id);

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
        <Link href="/" style={{ color: 'var(--muted)' }}>Home</Link>
        {' / '}
        <Link href={`/${manifest.category}`} style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{manifest.category}</Link>
        {' / '}
        <span aria-current="page">{manifest.name}</span>
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

      {/* Related tools */}
      {related.length > 0 && (
        <nav
          aria-label="Related tools"
          style={{
            marginTop: '2.5rem',
            padding: '1rem',
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
          }}
        >
          <p style={{ margin: '0 0 0.6rem', fontWeight: 600, color: 'var(--text)' }}>Related Tools</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {related.map((t) => (
              <Link
                key={t.id}
                href={t.route}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '3px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '99px',
                  color: 'var(--accent)',
                  fontSize: '0.8rem',
                  background: 'var(--bg)',
                }}
              >
                <span aria-hidden="true">{t.icon}</span> {t.name}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* API reference footer */}
      <aside
        style={{
          marginTop: '1rem',
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

      {/* Manifest examples */}
      {manifest.examples && manifest.examples.length > 0 && (
        <details
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--text)',
              listStyle: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>Examples</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400 }}>
              ({manifest.examples.length})
            </span>
          </summary>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {manifest.examples.map((ex, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: 'var(--border)',
                    color: 'var(--text)',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                  }}
                >
                  {ex.label}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                  <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--border)' }}>
                    <p style={{ margin: '0 0 0.3rem', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Input</p>
                    <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'var(--mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--text)' }}>
                      {JSON.stringify(ex.input, null, 2)}
                    </pre>
                  </div>
                  <div style={{ padding: '0.6rem 0.75rem' }}>
                    <p style={{ margin: '0 0 0.3rem', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Output</p>
                    <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'var(--mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--text)' }}>
                      {JSON.stringify(ex.output, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
