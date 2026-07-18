import type { Metadata } from 'next';
import { passwordGeneratorManifest } from '@toolbox/developer';
import { toolMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return toolMetadata(passwordGeneratorManifest);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
