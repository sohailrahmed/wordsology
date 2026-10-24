// Turns a paragraph that holds only an image (optionally wrapped in a link) into
//   <figure><a href=full-size><img loading=lazy></a><figcaption>title</figcaption></figure>
// so every chart can be tapped to open full size and pinch-zoomed on a phone.
import { visit } from 'unist-util-visit';
import fs from 'node:fs';
import path from 'node:path';
import sizeOf from 'image-size';

// "/charts/microbiology/gram-pos-cocci2.png" -> "gram-pos-cocci" (used as the chart's link anchor)
const anchorFor = (src) => path.basename(String(src)).replace(/\.[a-z0-9]+$/i, '').replace(/\d+$/, '').toLowerCase();

export function rehypeFigures() {
  return (tree) => {
    const used = new Map(); // keep every chart anchor unique on the page
    const uniqueId = (base) => {
      base = base || 'image';
      const n = (used.get(base) || 0) + 1;
      used.set(base, n);
      return n === 1 ? base : `${base}-${n}`;
    };
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'p' || !parent) return;
      const kids = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
      if (kids.length !== 1) return;
      let link = null;
      let img = kids[0];
      if (img.tagName === 'a' && img.children.length === 1 && img.children[0].tagName === 'img') {
        link = img;
        img = img.children[0];
      }
      if (img.tagName !== 'img') return;
      const caption = img.properties.title;
      delete img.properties.title;
      let wide = false;
      img.properties.loading = 'lazy';
      // Real width/height stop the page from jumping as charts load (so #links land in the right place).
      try {
        const file = path.join(process.cwd(), 'public', String(img.properties.src));
        if (fs.existsSync(file)) {
          const { width, height } = sizeOf(file);
          if (width && height) { img.properties.width = width; img.properties.height = height; }
          if (width >= 1800) wide = true;
        }
      } catch {}
      img.properties.decoding = 'async';
      const href = link ? link.properties.href : img.properties.src;
      const opensFile = String(href).endsWith('.pdf');
      const children = [{
        type: 'element', tagName: 'a',
        properties: { href, className: ['figure-link'], ...(opensFile ? {} : { 'data-zoom': '' }) },
        children: [img],
      }];
      if (caption) {
        children.push({ type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: caption }] });
      }
      parent.children[index] = { type: 'element', tagName: 'figure', properties: { id: 'chart-' + uniqueId(anchorFor(img.properties.src)), className: wide ? ['wide'] : undefined }, children };
    });
  };
}
