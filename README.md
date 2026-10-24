# wordsology.org

ASCP exam prep since 2012, rebuilt in 2026 as a fast static site.

## Where things live

| What | Where |
| --- | --- |
| Page text (one file per page) | `src/content/pages/*.md` |
| Charts, by subject | `public/charts/<subject>/` |
| Other images | `public/media/<page>/` |
| PDFs | `public/files/` |
| Subject names, colors, blurbs | `src/data/subjects.ts` |
| Homepage | `src/pages/index.astro` |
| Reader Q&A archive data | `public/qa-data.json` |
| Old-address redirects | `public/_redirects` |

## Swapping a chart

Upload the new file to the same folder with the **same file name** and the live site
updates by itself in about a minute. A different name needs the page's `.md` file updated too.

## Building

`npm install`, then `npm run build` (output in `dist/`). Cloudflare Pages runs the same command.
