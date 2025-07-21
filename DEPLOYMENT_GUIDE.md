# 🚀 Deployment Guide

This guide covers various deployment options for your Astro-based blog website.

## 📋 Pre-deployment Checklist

Before deploying, ensure you have:

- [ ] Set up your environment variables
- [ ] Updated site configuration in `astro.config.mjs`
- [ ] Tested the build process locally
- [ ] Imported and verified your content
- [ ] Configured any necessary analytics or tracking

## 🔧 Build Configuration

### Environment Variables

Create a `.env` file (copied from `.env.example`) and configure:

```bash
# Required
SITE_URL=https://yourdomain.com
SITE_NAME=Your Site Name
SITE_DESCRIPTION=Your site description

# Optional
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
CLOUDFLARE_API_TOKEN=your_token_here
```

### Build Process

```bash
# Clean previous builds
npm run clean

# Install dependencies
npm install

# Build for production
npm run build

# Preview the build locally
npm run preview
```

## ☁️ Cloudflare Pages (Recommended)

Cloudflare Pages offers excellent performance and is free for most use cases.

### Automatic Deployment

1. **Connect Repository**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```
   Framework preset: Astro
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

3. **Environment Variables**
   Add your environment variables in the Cloudflare Pages dashboard:
   - `SITE_URL`: Your domain (e.g., `https://yourdomain.com`)
   - `NODE_VERSION`: `18` (or your preferred version)

4. **Custom Domain** (Optional)
   - Add your custom domain in the Pages dashboard
   - Update DNS records as instructed

### Manual Deployment

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run build
wrangler pages publish dist
```

## 🔷 Netlify

Netlify provides easy deployment with great developer experience.

### Automatic Deployment

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com/)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**
   Add in Site settings → Environment variables:
   - `SITE_URL`: Your domain
   - Any other required variables

### Netlify Configuration

Create `netlify.toml` in your project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200
```

## ▲ Vercel

Vercel offers excellent performance and seamless GitHub integration.

### Automatic Deployment

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com/)
   - Import your GitHub repository

2. **Configure Project**
   ```
   Framework Preset: Astro
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Environment Variables**
   Add in Project Settings → Environment Variables

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run build
vercel --prod
```

## 🐙 GitHub Pages

Free hosting directly from your GitHub repository.

### Setup

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: GitHub Actions

2. **Create Workflow**
   Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          SITE_URL: ${{ vars.SITE_URL }}
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. **Configure Base URL**
   Update `astro.config.mjs` for GitHub Pages:

```javascript
export default defineConfig({
  site: 'https://username.github.io',
  base: '/repository-name', // Only if not using custom domain
  // ... other config
});
```

## 🐳 Docker Deployment

For custom server deployments or containerized environments.

### Dockerfile

Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Build and Run

```bash
# Build image
docker build -t avalidurl-website .

# Run container
docker run -p 8080:80 avalidurl-website
```

## 🔍 Monitoring and Analytics

### Google Analytics

Add to your environment variables:
```bash
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### Plausible Analytics

```bash
PLAUSIBLE_DOMAIN=yourdomain.com
```

### Performance Monitoring

- Use Lighthouse CI for performance monitoring
- Set up Core Web Vitals tracking
- Monitor build times and deployment success

## 🛡️ Security Considerations

### Content Security Policy

Configure CSP headers in your deployment platform:

```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://www.google-analytics.com; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  connect-src 'self' https://www.google-analytics.com;
```

### HTTPS

- Always use HTTPS in production
- Configure HSTS headers
- Use secure cookie settings

### Environment Variables

- Never commit `.env` files
- Use secure secret management
- Rotate API keys regularly

## 🔧 Troubleshooting

### Common Build Issues

**Node.js Version Mismatch**
```bash
# Check required version in package.json
"engines": {
  "node": ">=18.0.0"
}
```

**Memory Issues**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

**Path Issues**
- Ensure `SITE_URL` is correctly set
- Check base URL configuration
- Verify asset paths are relative

### Deployment Failures

1. **Check build logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test build locally** before deploying
4. **Check file permissions** and directory structure

### Performance Issues

- Optimize images before deployment
- Use build analyzers to check bundle size
- Enable compression on your hosting platform
- Configure proper caching headers

## 📊 Performance Optimization

### Image Optimization

```bash
# Use Astro's image optimization
npm install @astrojs/image
```

### Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev rollup-plugin-analyzer
```

### Caching Strategy

- Static assets: Cache for 1 year
- HTML: Cache for 1 hour with revalidation
- API responses: Cache appropriately

## 🔄 Continuous Deployment

### Automated Testing

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

### Deployment Environments

- **Development**: Auto-deploy from feature branches
- **Staging**: Auto-deploy from main branch
- **Production**: Manual deployment or tags

---

## 📞 Need Help?

- Check the [main README](README.md) for general setup
- Review [troubleshooting section](#troubleshooting)
- Open an issue for deployment-specific problems
- Join discussions for community support