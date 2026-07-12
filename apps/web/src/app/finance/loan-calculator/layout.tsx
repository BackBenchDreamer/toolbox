import type { Metadata } from 'next';
import { loanCalculatorManifest } from '@toolbox/finance';
import { toolMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return toolMetadata(loanCalculatorManifest);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
