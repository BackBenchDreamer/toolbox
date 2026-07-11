import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getToolsByCategory, getActiveCategories } from '@toolbox/registry';
import type { ToolCategory } from '@toolbox/registry';
import { ToolGrid } from '@/components/ToolGrid';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

/**
 * Dynamic category index page — /finance, /developer, /utilities, etc.
 *
 * A single route handles all current and future categories automatically.
 * No code change needed here when a new category is added to the registry.
 *
 * Returns 404 for any slug that does not match an active registry category.
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const displayName = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${displayName} Tools — Toolbox`,
    description: `Browse all ${displayName.toLowerCase()} tools available in Toolbox.`,
  };
}

export async function generateStaticParams() {
  return getActiveCategories().map((cat) => ({ category: cat }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const activeCategories = getActiveCategories();

  if (!activeCategories.includes(category as ToolCategory)) {
    notFound();
  }

  const tools = getToolsByCategory(category as ToolCategory);
  const displayName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
          {displayName}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          {tools.length} tool{tools.length !== 1 ? 's' : ''} available
        </p>
      </div>
      {tools.length > 0 ? (
        <ToolGrid tools={tools} />
      ) : (
        <p style={{ color: 'var(--muted)' }}>No tools available in this category yet.</p>
      )}
    </div>
  );
}
