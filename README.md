# gokhanturhan.com

Personal website and digital journal of Gökhan Turhan, exploring the intersection of finance, art, and technology. Built with modern web technologies for optimal performance and user experience.

🌐 **Live Site**: [gokhanturhan.com](https://gokhanturhan.com)

## ✨ Features

- **Modern Blog Platform**: Built with Astro for optimal performance and SEO
- **Content Management**: Support for blog posts and essays
- **Rich Media Support**: Embedded YouTube, Twitter, Spotify, and other media platforms
- **Responsive Design**: Mobile-first, minimalist aesthetic optimized for all devices
- **RSS Feed**: Auto-generated RSS feed for subscribers
- **Theme Support**: Dark/light theme toggle
- **Archive System**: Organized content browsing by date and topics
- **SEO Optimized**: Meta tags, structured data, and sitemap generation

## 🛠 Tech Stack

- **Framework**: [Astro](https://astro.build/) - Static site generator with server-side rendering
- **Styling**: CSS with CSS Custom Properties for theming
- **Content**: Markdown with MDX support for rich content
- **Icons**: Custom SVG icons and web fonts
- **Deployment**: Cloudflare Pages with automatic builds
- **Environment**: Node.js runtime with TypeScript support

## 🚀 Quick Start

### Prerequisites

- Node.js (18.0.0 or higher)
- npm (8.0.0 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/avalidurl/avalidurl-website.git
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
│   │   ├── Navigation.astro
│   │   ├── ArchiveDropdown.astro
│   │   ├── SocialShare.astro
│   │   └── ...
│   ├── content/         # Content collections
│   │   ├── blog/        # Blog posts in Markdown/MDX
│   │   ├── art/         # Art project pages
│   │   └── essays/      # Long-form essays
│   ├── layouts/         # Page layouts
│   │   └── Layout.astro # Main layout with theme support
│   ├── pages/           # File-based routing
│   │   ├── blog/        # Blog listing and individual posts
│   │   ├── topics/      # Topic-based content filtering
│   │   ├── archive/     # Date-based content browsing
│   │   └── ...
│   └── utils/           # Utility functions
│       └── env.ts       # Environment variable handling
├── public/              # Static assets
│   ├── images/         # Optimized images
│   ├── favicon.ico     # Site icons
│   └── ...
└── dist/               # Built site (generated)
```

## 📝 Content Management

### Adding New Posts

Create a new Markdown or MDX file in `src/content/blog/` with frontmatter:

```markdown
---
title: "Your Post Title"
description: "A brief description"
publishDate: 2024-01-01
author: "Gökhan Turhan"
tags: ["finance", "art", "technology"]
category: "general"
featured: false
readingTime: 5
excerpt: "Post excerpt..."
---

Your content here...
```

### Content Types

- **Blog Posts**: Regular journal entries in `src/content/blog/`
- **Essays**: Long-form analytical content in `src/content/essays/`

### Media Embeds

Rich media components for enhanced content:

```astro
<YouTubeEmbed id="VIDEO_ID" />
<TwitterEmbed id="TWEET_ID" />
<SpotifyEmbed type="track" id="TRACK_ID" />
<AppleMusicEmbed type="album" id="ALBUM_ID" />
<VimeoEmbed id="VIDEO_ID" />
<SoundCloudEmbed user="USER" track="TRACK" />
<BandcampEmbed album="ALBUM_ID" />
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Site Configuration
SITE_URL=https://gokhanturhan.com
CONTACT_EMAIL=avalidurl@pm.me

# Optional: Analytics and Services
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### Astro Configuration

The site is configured in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://gokhanturhan.com',
  integrations: [mdx(), react(), markdoc()],
  adapter: cloudflare(),
  output: 'server'
});
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Cloudflare Pages

The site automatically deploys to Cloudflare Pages on every push to the main branch:

1. Connected via GitHub integration
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables configured in Cloudflare dashboard

## 📚 Available Scripts

```bash
npm run dev           # Start development server (localhost:4321)
npm run build         # Build for production
npm run preview       # Preview production build locally
npm run astro         # Run Astro CLI commands
```

## 🎨 Design Philosophy

- **Minimalist**: Clean, distraction-free reading experience
- **Typography-focused**: Optimized for long-form content consumption
- **Performance-first**: Fast loading times and smooth interactions
- **Accessible**: WCAG AA compliant with proper semantic markup
- **Mobile-optimized**: Responsive design that works across all devices

## 📊 Content Strategy

The site focuses on three main topics:

1. **Finance**: Analysis of markets, crypto, and financial technology
2. **Art**: Digital art projects, conceptual works, and creative coding
3. **Technology**: Technical insights, development practices, and innovation

Content is organized through:
- **Tags**: Granular topic classification
- **Categories**: Broad content groupings
- **Archive**: Chronological content browsing
- **Topics**: Tag-based content discovery

## 🤝 Contributing

This is a personal website, but suggestions and bug reports are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly with `npm run build`
5. Submit a pull request

### Code Style

- Use TypeScript for type safety where applicable
- Follow Astro component best practices
- Maintain accessibility standards
- Write semantic, clean markup

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Astro](https://astro.build/)** - The web framework powering this site
- **[Cloudflare Pages](https://pages.cloudflare.com/)** - Fast, reliable hosting
- **[MDX](https://mdxjs.com/)** - Enhanced Markdown with component support
- **Open source community** - For the tools and inspiration

## 📞 Connect

- **Website**: [gokhanturhan.com](https://gokhanturhan.com)
- **Twitter**: [@0xgokhan](https://x.com/0xgokhan)
- **GitHub**: [@avalidurl](https://github.com/avalidurl)
- **Email**: [avalidurl@pm.me](mailto:avalidurl@pm.me)

---

**Built with ❤️ using Astro** • **[MIT License](https://opensource.org/licenses/MIT)**

*Exploring the intersection of finance, art, and code — where data meets creativity and markets become canvases.*# Trigger redeploy with environment variables
