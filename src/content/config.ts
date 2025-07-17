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

const art = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    createdDate: z.date(),
    category: z.enum(['digital', 'generative', 'data-viz', 'interactive', 'mixed-media']),
    medium: z.string(),
    dimensions: z.string().optional(),
    tools: z.array(z.string()).default([]),
    colorTheme: z.enum(['red', 'green', 'blue']),
    featured: z.boolean().default(false),
    imageUrl: z.string(),
    thumbnailUrl: z.string().optional(),
    galleryImages: z.array(z.string()).optional(),
    available: z.boolean().default(true),
    price: z.string().optional(),
    edition: z.string().optional(),
    inspiration: z.string().optional(),
    process: z.string().optional(),
  }),
});

export const collections = {
  projects,
  essays,
  blog,
  art,
};