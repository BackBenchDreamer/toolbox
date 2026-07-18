import type { Metadata } from 'next';
import Link from 'next/link';
import { getActiveCategories } from '@toolbox/registry';
import { Analytics } from '@vercel/analytics/next';
import { ThemeToggle } from '@/components/ThemeToggle';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Toolbox — Utilities & Calculators',
  description: 'A collection of reusable utilities, calculators, converters, and productivity tools.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

/**
 * Inline theme-init script injected into <head>.
 *
 * Runs synchronously before the first paint — eliminates the Flash of
 * Incorrect Theme (FOIT) that would otherwise occur if we waited for the
 * ThemeToggle useEffect to fire after hydration.
 *
 * Logic mirrors ThemeToggle.applyTheme():
 *   'dark'   → set data-theme="dark"
 *   'light'  → set data-theme="light"
 *   'system' → remove data-theme (CSS @media prefers-color-scheme handles it)
 *   missing  → same as 'system'
 *
 * suppressHydrationWarning on <html> silences the React mismatch warning
 * that occurs because the server renders <html> without data-theme but the
 * script may add it before React hydrates.
 */
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (t === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    // 'system' and missing: no attribute — CSS media query handles it
  } catch (_) {}
})();
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Derive nav items from the registry so adding a new category never requires
  // editing this file. getActiveCategories() returns only categories that have
  // at least one public/beta tool.
  const categories = getActiveCategories();

  return (
    // suppressHydrationWarning: the inline script may set data-theme before
    // React hydrates, causing a server/client mismatch. This attribute tells
    // React to silently accept the difference for this element only.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme init: runs synchronously before first paint to prevent FOIT */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 0', marginBottom: '2rem' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.02em', textDecoration: 'none' }}>
              ◈ Toolbox
            </Link>
            <nav style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/${cat}`}
                  style={{ color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'capitalize', textDecoration: 'none' }}
                >
                  {cat}
                </Link>
              ))}
              <ThemeToggle />
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
