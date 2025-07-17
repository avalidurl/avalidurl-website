import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.string(),
    tech: z.array(z.string()).optional(),
    link: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

const essays = defineCollection({
  type: 'content', 
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  projects,
  essays,
};