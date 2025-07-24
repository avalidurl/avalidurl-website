import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: {
      owner: 'avalidurl',
      name: 'avalidurl-website',
    }
  },
  
  ui: {
    brand: {
      name: 'avalidurl'
    }
  },
  
  singletons: {
    home: singleton({
      label: 'Home Page',
      path: 'src/content/home.md',
      schema: {
        heroTitle: fields.text({ label: 'Hero title' }),
        heroSubtitle: fields.text({ label: 'Hero subtitle', multiline: true }),
        body: fields.markdoc({ label: 'Body content', description: 'Optional rich-text body under hero.' })
      },
      format: { contentField: 'body' }
    }),
    about: singleton({
      label: 'About Page',
      path: 'src/content/about.md',
      schema: {
        title: fields.text({ label: 'Title', defaultValue: 'About' }),
        body: fields.markdoc({ label: 'Body', description: 'Main content of about page' })
      },
      format: { contentField: 'body' }
    })
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
        colorTheme: fields.select({
          label: 'Colour theme',
          options: [
            { label: 'Neutral', value: 'neutral' },
            { label: 'Red', value: 'red' },
            { label: 'Green', value: 'green' },
            { label: 'Blue', value: 'blue' },
          ],
          defaultValue: 'neutral'
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
