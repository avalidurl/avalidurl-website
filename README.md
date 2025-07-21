# avalidurl-website

A modern, minimalist blog website built with Astro, featuring a comprehensive Substack content import system. This project demonstrates how to build a fast, SEO-optimized blog with automated content migration tools.

## ✨ Features

- **Modern Blog Platform**: Built with Astro for optimal performance and SEO
- **Substack Import System**: Comprehensive tools to migrate content from Substack
- **Content Management**: Support for blog posts, art projects, and essays
- **Rich Media Support**: Embedded YouTube, Twitter, Spotify, and other media
- **Responsive Design**: Mobile-first, minimalist aesthetic
- **RSS Feed**: Auto-generated RSS feed for subscribers
- **Image Optimization**: Automatic image downloading and optimization
- **SEO Optimized**: Meta tags, structured data, and sitemap generation

## 🚀 Quick Start

### Prerequisites

- Node.js (18.0.0 or higher)
- npm (8.0.0 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/avalidurl-website.git
cd avalidurl-website
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:4321`

## 📁 Project Structure

```
avalidurl-website/
├── src/
│   ├── components/       # Reusable Astro components
│   ├── content/         # Content collections (blog posts, art, essays)
│   ├── layouts/         # Page layouts
│   ├── pages/           # Page routes
│   └── utils/           # Utility functions
├── scripts/             # Import and utility scripts
│   ├── comprehensive-substack-importer.cjs  # Main Substack importer
│   └── ...              # Other utility scripts
├── public/              # Static assets
└── dist/                # Built site (generated)
```

## 🛠 Substack Import System

This project includes a powerful Substack content migration system that can import your entire Substack publication with full formatting preservation.

### Features

- **Complete Content Import**: Exports posts, images, and metadata
- **Image Processing**: Downloads and optimizes all images locally
- **Embed Conversion**: Converts Substack embeds to proper Astro components
- **SEO Preservation**: Maintains original URLs and meta information
- **Smart Formatting**: Converts HTML to clean Markdown with proper frontmatter

### How to Use

1. **Export from Substack**:
   - Go to your Substack settings
   - Navigate to "Export" and download your content
   - Extract the zip file to `scripts/` directory

2. **Run the Importer**:
```bash
npm run import-all-substack
```

3. **Review Imported Content**:
   - Check `src/content/blog/` for imported posts
   - Verify images in `public/blog/images/`

### Import Script Features

- **Rate Limiting**: Prevents overwhelming external services
- **Error Handling**: Graceful failure recovery and retry logic
- **Content Processing**: 
  - HTML to Markdown conversion
  - Embed URL conversion to Astro components
  - Image downloading and local storage
  - Metadata extraction and frontmatter generation

## 📝 Content Management

### Adding New Posts

Create a new Markdown file in `src/content/blog/` with the following frontmatter:

```markdown
---
title: "Your Post Title"
description: "A brief description"
publishDate: 2024-01-01
author: "Your Name"
tags: ["tag1", "tag2"]
category: "category"
featured: false
readingTime: 5
excerpt: "Post excerpt..."
---

Your content here...
```

### Content Types

- **Blog Posts**: Regular blog content in `src/content/blog/`
- **Art Projects**: Visual projects in `src/content/art/`
- **Essays**: Long-form content in `src/content/essays/`

### Media Embeds

Use these Astro components for rich media:

```astro
<YouTubeEmbed id="VIDEO_ID" />
<TwitterEmbed id="TWEET_ID" />
<SpotifyEmbed type="track" id="TRACK_ID" />
<AppleMusicEmbed type="album" id="ALBUM_ID" />
<VimeoEmbed id="VIDEO_ID" />
<SoundCloudEmbed user="USER" track="TRACK" />
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Site Configuration
SITE_URL=https://yourdomain.com
SITE_TITLE=Your Site Title
SITE_DESCRIPTION=Your site description

# Optional: Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### Astro Configuration

Edit `astro.config.mjs` to customize:

```javascript
export default defineConfig({
  site: 'https://yourdomain.com',
  // ... other configuration options
});
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically on git push

### Deploy to Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on git push

### Deploy to Vercel

```bash
npx vercel
```

## 📚 Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run astro         # Run Astro CLI commands

# Substack Import Scripts
npm run import-substack      # Import single Substack post
npm run import-all-substack  # Import all Substack content
npm run import-from-export   # Import from Substack export
npm run fix-frontmatter     # Fix frontmatter issues
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use TypeScript for type safety
- Follow Astro best practices
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Astro](https://astro.build/) - The web framework for content-driven websites
- [Substack](https://substack.com/) - Platform for independent writing
- Contributors and the open source community

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/avalidurl-website/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/avalidurl-website/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/avalidurl-website/wiki)

## 🗺 Roadmap

- [ ] Enhanced theme customization
- [ ] Newsletter integration
- [ ] Comment system integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Plugin system for extensions

---

**Made with ❤️ and Astro**

If this project helped you, please consider giving it a ⭐ on GitHub!