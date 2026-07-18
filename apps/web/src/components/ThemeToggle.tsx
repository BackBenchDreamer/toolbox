'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) ?? 'system';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  function cycle() {
    const next: Theme = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  }

  // Label shows the CURRENT active theme so the user knows what mode they're in.
  const label = theme === 'dark' ? '☾ Dark' : theme === 'light' ? '☀ Light' : '◑ System';

  return (
    <button
      onClick={cycle}
      aria-label={`Switch theme (current: ${theme})`}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '0.3rem 0.6rem',
        cursor: 'pointer',
        fontSize: '0.8rem',
        color: 'var(--muted)',
      }}
    >
      {label}
    </button>
  );
}
