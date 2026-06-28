import { visit } from 'unist-util-visit';

// Map authoring keywords to the four visual styles defined in global.css
// (.admonition-type-info / -warn / -error / -note).
const TYPES = {
  note: 'note',
  info: 'info',
  tip: 'info',
  important: 'info',
  warn: 'warn',
  warning: 'warn',
  caution: 'warn',
  danger: 'error',
  error: 'error',
};

/**
 * Headless callout/admonition support. Pairs with `remark-directive`:
 *
 *   :::warning[Heads up]
 *   Set a strong key before going public.
 *   :::
 *
 * Renders directly to styled HTML — no React/JSX component required, so it
 * works in our fumadocs-core-on-Astro setup.
 */
export default function remarkCallout() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      const type = TYPES[node.name];
      if (!type) return;

      const children = [];

      // `:::warning[Title]` -> a heading div; fall back to the capitalized type.
      const labelNode = node.children.find((c) => c.data?.directiveLabel);
      const body = node.children.filter((c) => !c.data?.directiveLabel);
      const titleChildren = labelNode
        ? labelNode.children
        : [{ type: 'text', value: node.name.charAt(0).toUpperCase() + node.name.slice(1) }];

      children.push({
        type: 'paragraph',
        data: { hName: 'div', hProperties: { className: ['admonition-heading'] } },
        children: titleChildren,
      });
      children.push(...body);

      node.data = {
        hName: 'div',
        hProperties: { className: ['admonition', `admonition-type-${type}`] },
      };
      node.children = children;
    });
  };
}
