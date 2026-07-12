import type { Metadata } from 'next';
import { gstCalculatorManifest } from '@toolbox/finance';
import { toolMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return toolMetadata(gstCalculatorManifest);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
