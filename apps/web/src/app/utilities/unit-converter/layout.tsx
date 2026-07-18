import type { Metadata } from 'next';
import { unitConverterManifest } from '@toolbox/utilities';
import { toolMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return toolMetadata(unitConverterManifest);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
