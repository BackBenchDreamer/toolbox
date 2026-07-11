import type { Metadata } from 'next';
import { uuidGeneratorManifest } from '@toolbox/developer';
import { toolMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return toolMetadata(uuidGeneratorManifest);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
