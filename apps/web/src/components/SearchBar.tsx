'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef, Suspense } from 'react';

function SearchBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Debounce: wait 250 ms after the user stops typing before navigating.
      // Prevents a server-component re-render on every keystroke.
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (value.trim()) {
          router.push(`/search?q=${encodeURIComponent(value)}`);
        } else {
          router.push('/');
        }
      }, 250);
    },
    [router],
  );

  return (
    <div style={{ maxWidth: '400px' }}>
      <label className="sr-only" htmlFor="tool-search">Search tools</label>
      <input
        id="tool-search"
        type="text"
        defaultValue={query}
        onChange={handleChange}
        placeholder="Search tools…"
        aria-label="Search tools"
        style={{ fontSize: '0.95rem' }}
      />
    </div>
  );
}

export function SearchBar() {
  return (
    <Suspense>
      <SearchBarInner />
    </Suspense>
  );
}
