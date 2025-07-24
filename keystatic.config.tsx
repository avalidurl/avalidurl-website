import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local'
  },
  
  ui: {
    brand: {
      name: 'avalidurl'
    }
  },
  
  collections: {
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ 
          label: 'Description',
          multiline: true 
        }),
        publishDate: fields.date({ 
          label: 'Publish Date',
          defaultValue: { kind: 'today' }
        }),
        author: fields.text({ 
          label: 'Author',
          defaultValue: 'Gokhan Turhan'
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { 
            label: 'Tags',
            itemLabel: props => props.value || 'Tag'
          }
        ),
        category: fields.text({ 
          label: 'Category',
          defaultValue: 'general'
        }),
        featured: fields.checkbox({ 
          label: 'Featured Post',
          defaultValue: false 
        }),
        draft: fields.checkbox({ 
          label: 'Draft',
          defaultValue: false 
        }),
        content: fields.markdoc({
          label: 'Content',
        }),
      },
    }),

    art: collection({
      label: 'Art Portfolio',
      slugField: 'title',
      path: 'src/content/art/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ 
          label: 'Description',
          multiline: true 
        }),
        createdDate: fields.date({ 
          label: 'Created Date',
          defaultValue: { kind: 'today' }
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Digital', value: 'digital' },
            { label: 'Generative', value: 'generative' },
            { label: 'Data Visualization', value: 'data-viz' },
            { label: 'Interactive', value: 'interactive' },
            { label: 'Mixed Media', value: 'mixed-media' },
          ],
          defaultValue: 'digital'
        }),
        medium: fields.text({ 
          label: 'Medium',
          description: 'e.g., Oil on canvas, Digital print, etc.'
        }),
        featured: fields.checkbox({ 
          label: 'Featured Artwork',
          defaultValue: false 
        }),
        imageUrl: fields.image({
          label: 'Main Image',
          directory: 'public/images/art',
          publicPath: '/images/art/',
        }),
        available: fields.checkbox({ 
          label: 'Available for Purchase',
          defaultValue: true 
        }),
        price: fields.text({ 
          label: 'Price (optional)',
          description: 'e.g., $500, €300, Contact for pricing'
        }),
        content: fields.markdoc({
          label: 'Content',
          description: 'Detailed description about the artwork'
        }),
      },
    }),
  },
});
