import type { Metadata } from 'next';
import { emiCalculatorManifest } from '@toolbox/finance';
import { toolMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return toolMetadata(emiCalculatorManifest);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
