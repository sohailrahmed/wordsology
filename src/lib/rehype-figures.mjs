// Turns a paragraph that holds only an image (optionally wrapped in a link) into
//   <figure><a href=full-size><img loading=lazy></a><figcaption>title</figcaption></figure>
// so every chart can be tapped to open full size and pinch-zoomed on a phone.
import { visit } from 'unist-util-visit';

export function rehypeFigures() {
  return (tree) => {
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
      img.properties.loading = 'lazy';
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
      parent.children[index] = { type: 'element', tagName: 'figure', properties: {}, children };
    });
  };
}
