import { getToolsGroupedByCategory, getPublicTools } from '@toolbox/registry';
import { ToolGrid } from '@/components/ToolGrid';
import { SearchBar } from '@/components/SearchBar';

export default function HomePage() {
  const tools = getPublicTools();
  const grouped = getToolsGroupedByCategory();

  return (
    <div className="container">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Toolbox</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', maxWidth: '560px' }}>
          A growing collection of calculators, converters, and developer utilities. {tools.length} tools available.
        </p>
        <SearchBar />
      </div>

      {[...grouped.entries()].map(([category, categoryTools]) => (
        <section key={category} style={{ marginBottom: '2.5rem' }}>
          <h2 style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--muted)',
            marginBottom: '0.75rem',
          }}>
            {category}
          </h2>
          <ToolGrid tools={categoryTools} />
        </section>
      ))}
    </div>
  );
}
