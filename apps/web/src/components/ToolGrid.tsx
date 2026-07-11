import type { ToolManifest } from '@toolbox/shared';
import { ToolCard } from './ToolCard';

interface ToolGridProps {
  tools: ToolManifest[];
}

export function ToolGrid({ tools }: ToolGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '0.75rem',
      }}
    >
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
