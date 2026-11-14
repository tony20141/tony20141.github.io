import { defineCollection, z } from 'astro:content';

// Classic Astro 4 collection: auto-globs src/content/blog/**/*.md
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    author: z.string().optional(),
    // nullish(): YAML "migrated:" (empty) parses to null — must not fail the whole build
    migrated: z.string().nullish(),
  }),
});

export const collections = { blog };
