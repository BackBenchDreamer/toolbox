import type { Metadata } from 'next';
import { compoundInterestManifest } from '@toolbox/finance';
import { toolMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return toolMetadata(compoundInterestManifest);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
