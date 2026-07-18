import type { Metadata } from 'next';
import { prepaymentSimulationManifest } from '@toolbox/finance';
import { toolMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return toolMetadata(prepaymentSimulationManifest);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
