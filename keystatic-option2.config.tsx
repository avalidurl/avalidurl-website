import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: {
      owner: 'avalidurl',
      name: 'avalidurl-website',
    },
  },
  
  ui: {
    brand: {
      name: 'avalidurl',
    },
  },
  
  collections: {
    // Art Portfolio Collection
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
        dimensions: fields.text({ 
          label: 'Dimensions (optional)',
          description: 'e.g., 24" x 36"'
        }),
        tools: fields.array(
          fields.text({ label: 'Tool' }),
          { 
            label: 'Tools Used',
            itemLabel: props => props.value || 'Tool'
          }
        ),
        colorTheme: fields.select({
          label: 'Color Theme',
          options: [
            { label: 'Red', value: 'red' },
            { label: 'Green', value: 'green' },
            { label: 'Blue', value: 'blue' },
          ],
          defaultValue: 'blue'
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
        thumbnailUrl: fields.image({
          label: 'Thumbnail (optional)',
          directory: 'public/images/art/thumbnails',
          publicPath: '/images/art/thumbnails/',
        }),
        galleryImages: fields.array(
          fields.image({
            label: 'Gallery Image',
            directory: 'public/images/art/gallery',
            publicPath: '/images/art/gallery/',
          }),
          { 
            label: 'Gallery Images',
            itemLabel: props => props.value || 'Image'
          }
        ),
        available: fields.checkbox({ 
          label: 'Available for Purchase',
          defaultValue: true 
        }),
        price: fields.text({ 
          label: 'Price (optional)',
          description: 'e.g., $500, €300, Contact for pricing'
        }),
        edition: fields.text({ 
          label: 'Edition Info (optional)',
          description: 'e.g., Limited edition of 50, Original, Print'
        }),
        inspiration: fields.text({ 
          label: 'Inspiration (optional)',
          multiline: true,
          description: 'What inspired this piece?'
        }),
        process: fields.text({ 
          label: 'Process Notes (optional)',
          multiline: true,
          description: 'Notes about your creative process'
        }),
        content: fields.markdoc({
          label: 'Content',
          description: 'Detailed description, story, or commentary about the artwork'
        }),
      },
    }),

    // Blog Collection
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
        updatedDate: fields.date({ 
          label: 'Updated Date (optional)' 
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
        excerpt: fields.text({ 
          label: 'Excerpt (optional)',
          multiline: true 
        }),
        content: fields.markdoc({
          label: 'Content',
        }),
      },
    }),

    // Projects Collection
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ 
          label: 'Description',
          multiline: true 
        }),
        year: fields.text({ 
          label: 'Year' 
        }),
        tech: fields.array(
          fields.text({ label: 'Technology' }),
          { 
            label: 'Technologies',
            itemLabel: props => props.value || 'Technology'
          }
        ),
        link: fields.url({ 
          label: 'Project Link (optional)' 
        }),
        featured: fields.checkbox({ 
          label: 'Featured Project',
          defaultValue: false 
        }),
        content: fields.markdoc({
          label: 'Content',
        }),
      },
    }),

    // Essays Collection
    essays: collection({
      label: 'Essays',
      slugField: 'title',
      path: 'src/content/essays/*',
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
        draft: fields.checkbox({ 
          label: 'Draft',
          defaultValue: false 
        }),
        content: fields.markdoc({
          label: 'Content',
        }),
      },
    }),
  },
});
