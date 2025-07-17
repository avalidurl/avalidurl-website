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

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    author: z.string().default('Your Name'),
    tags: z.array(z.string()).default([]),
    category: z.enum(['finance', 'art', 'coding', 'intersection']).default('intersection'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    readingTime: z.number().optional(),
    excerpt: z.string().optional(),
  }),
});

export const collections = {
  projects,
  essays,
  blog,
};