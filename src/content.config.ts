import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Every page of the site is one Markdown file in src/content/pages/.
// `path` is the page's web address (kept identical to the old WordPress address).
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    subject: z.string().optional(),
    description: z.string().optional(),
    updated: z.string().optional(),
  }),
});

export const collections = { pages };
