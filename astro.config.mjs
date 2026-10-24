import { defineConfig } from 'astro/config';
import { rehypeFigures } from './src/lib/rehype-figures.mjs';

export default defineConfig({
  site: 'https://wordsology.org',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { rehypePlugins: [rehypeFigures] },
});
