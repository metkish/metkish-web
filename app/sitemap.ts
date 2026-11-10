import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.metkish.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
    { path: '', changeFrequency: 'monthly', priority: 1 },
    { path: '/about', changeFrequency: 'yearly', priority: 0.6 },
    { path: '/tenerife', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/italy', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/rome', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/barcelona', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/behind-the-trip/hotels', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/behind-the-trip/flights', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/behind-the-trip/el-clasico-tickets', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/behind-the-trip/how-we-find-restaurants', changeFrequency: 'yearly', priority: 0.5 },
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
