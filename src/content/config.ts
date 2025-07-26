import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Gokhan Turhan'),
    tags: z.array(z.string()).default([]),
    category: z.string().default('general'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    readingTime: z.number().optional(),
    excerpt: z.string().optional(),
    originalUrl: z.string().optional(),
  }),
});

export const collections = {
  blog,
};