import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Docs are authored as MDX under src/content/docs. fumadocs-core consumes the
// same files (see src/lib/docs/source.ts) to build the page tree and search.
const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Lower numbers sort first within a folder; ties fall back to title.
    order: z.number().optional(),
    // Hide from the sidebar/search while keeping the page reachable.
    hidden: z.boolean().optional(),
  }),
});

export const collections = { docs };
