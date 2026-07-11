'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, Suspense } from 'react';

function SearchBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value.trim()) {
        router.push(`/search?q=${encodeURIComponent(value)}`);
      } else {
        router.push('/');
      }
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
