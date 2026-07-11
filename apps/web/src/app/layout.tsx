import type { Metadata } from 'next';
import { getActiveCategories } from '@toolbox/registry';
import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Toolbox — Utilities & Calculators',
  description: 'A collection of reusable utilities, calculators, converters, and productivity tools.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Derive nav items from the registry so adding a new category never requires
  // editing this file. getActiveCategories() returns only categories that have
  // at least one public/beta tool.
  const categories = getActiveCategories();

  return (
    <html lang="en">
      <body>
        <header style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 0', marginBottom: '2rem' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
              ◈ Toolbox
            </a>
            <nav style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={`/${cat}`}
                  style={{ color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'capitalize' }}
                >
                  {cat}
                </a>
              ))}
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
        <footer style={{ borderTop: '1px solid var(--border)', marginTop: '4rem', padding: '1.5rem 0', textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem' }}>
          Toolbox · Open source utility platform
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
