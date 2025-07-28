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

const products = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    url: z.string(),
    tech: z.array(z.string()).default([]),
    status: z.string().default('Live'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const art = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    createdDate: z.coerce.date(),
    category: z.string(),
    medium: z.string(),
    dimensions: z.string(),
    tools: z.array(z.string()),
    colorTheme: z.string(),
    featured: z.boolean().default(false),
    imageUrl: z.string(),
    thumbnailUrl: z.string(),
    available: z.boolean().default(true),
    price: z.string().optional(),
    edition: z.string().optional(),
    inspiration: z.string(),
    process: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog,
  products,
  art,
};