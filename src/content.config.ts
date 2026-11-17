import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Test builds only: T11 runs `PUBLIC_INCLUDE_FIXTURES=true astro dev` against tests/fixtures/blog.
// Default builds read src/content/blog only. process.env (not import.meta.env) because this file runs at config time.
const fixtures = process.env.PUBLIC_INCLUDE_FIXTURES === 'true';

const blog = defineCollection({
  loader: glob({
    base: fixtures ? './tests/fixtures/blog' : './src/content/blog',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['perdida-de-peso', 'deportiva', 'clinica', 'habitos']),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(true),
    readingMinutes: z.number(),
  }),
});

export const collections = { blog };
