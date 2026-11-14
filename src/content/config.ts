import { defineCollection, z } from 'astro:content';

// Classic Astro 4 collection: auto-globs src/content/blog/**/*.md
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    author: z.string().optional(),
    migrated: z.string().optional(),
  }),
});

export const collections = { blog };
