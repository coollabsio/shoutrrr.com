import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';

const HEADINGS = new Set(['h2', 'h3', 'h4', 'h5', 'h6']);

/** Flatten a hast node's text content (for slug generation fallback). */
function textOf(node) {
  if (node.type === 'text') return node.value;
  if (Array.isArray(node.children)) return node.children.map(textOf).join('');
  return '';
}

/**
 * Make every section heading a self-link so readers can grab a `#` URL to that
 * exact spot. Astro already assigns heading IDs with github-slugger; we reuse
 * that ID (and regenerate it the same way if it's somehow missing), then wrap
 * the heading's contents in an anchor with a hover-revealed `#` affordance.
 *
 * Runs after Astro's built-in slug step. Pairs with the `.heading-link` /
 * `.heading-anchor` styles in global.css.
 */
export default function rehypeHeadingAnchors() {
  return (tree) => {
    const slugger = new GithubSlugger();
    visit(tree, 'element', (node) => {
      if (!HEADINGS.has(node.tagName)) return;

      node.properties = node.properties || {};
      let id = node.properties.id;
      if (!id) {
        id = slugger.slug(textOf(node));
        node.properties.id = id;
      }

      node.children = [
        {
          type: 'element',
          tagName: 'a',
          properties: { className: ['heading-link'], href: `#${id}` },
          children: [
            ...node.children,
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['heading-anchor'], 'aria-hidden': 'true' },
              children: [{ type: 'text', value: '#' }],
            },
          ],
        },
      ];
    });
  };
}
