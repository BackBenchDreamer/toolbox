import { getPublicTools } from '@toolbox/registry';
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://toolbox.jeyv.in';

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = getPublicTools();

  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${SITE_URL}${tool.route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: tool.featured ? 0.9 : 0.7,
  }));

  return [
    { url: SITE_URL, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 1.0 },
    ...toolRoutes,
  ];
}
