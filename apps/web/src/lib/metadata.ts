import type { Metadata } from 'next';
import type { ToolManifest } from '@toolbox/shared';

const SITE_URL = 'https://toolbox.jeyv.in';

/**
 * Generate Next.js Metadata from a ToolManifest.
 * Used in every tool page's generateMetadata() export.
 * The web app does NOT compute this — it reads from the manifest (capability layer).
 */
export function toolMetadata(manifest: ToolManifest): Metadata {
  const title = `${manifest.name} — Toolbox`;
  const description = manifest.longDescription ?? manifest.description;
  const url = `${SITE_URL}${manifest.route}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Toolbox',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: { canonical: url },
  };
}
