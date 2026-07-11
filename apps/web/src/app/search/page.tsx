import { searchTools } from '@toolbox/registry';
import { ToolGrid } from '@/components/ToolGrid';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;
  const results = searchTools(q);

  return (
    <div className="container">
      <h1 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
        {q ? `Search: "${q}"` : 'All Tools'}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        {results.length} tool{results.length !== 1 ? 's' : ''} found
      </p>
      {results.length > 0 ? (
        <ToolGrid tools={results} />
      ) : (
        <p style={{ color: 'var(--muted)' }}>
          No tools found for <strong>{q}</strong>. Try a different keyword.
        </p>
      )}
    </div>
  );
}
