# 🔐 Environment Variables Guide

This document describes all environment variables used in the avalidurl-website project.

## 📋 Overview

Environment variables are used to configure the application for different environments (development, staging, production) without hardcoding sensitive information.

## 🔧 Setup

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your actual values

3. **Never commit `.env`** - it's already in `.gitignore`

## ⚙️ Configuration Variables

### Required Variables

#### `SITE_URL`
- **Description**: The full URL where your site will be hosted
- **Example**: `https://yourdomain.com`
- **Used for**: 
  - RSS feed generation
  - Sitemap creation
  - Open Graph meta tags
  - Canonical URLs

#### `SITE_NAME`
- **Description**: The name of your website/blog
- **Example**: `My Awesome Blog`
- **Used for**: 
  - Page titles
  - Meta tags
  - RSS feed title
  - Navigation

#### `SITE_DESCRIPTION`
- **Description**: A brief description of your site
- **Example**: `A blog about technology, design, and creativity`
- **Used for**: 
  - Meta description tags
  - RSS feed description
  - Open Graph descriptions

### Optional Variables

#### `NODE_ENV`
- **Description**: Application environment
- **Options**: `development`, `production`, `test`
- **Default**: `development`
- **Used for**: 
  - Enabling/disabling debug features
  - Conditional build optimizations

#### `ASTRO_TELEMETRY_DISABLED`
- **Description**: Disable Astro telemetry data collection
- **Options**: `1` (disabled), `0` (enabled)
- **Default**: `0`
- **Recommendation**: Set to `1` for privacy

### Analytics Variables

#### `GOOGLE_ANALYTICS_ID`
- **Description**: Google Analytics measurement ID
- **Example**: `GA_MEASUREMENT_ID`
- **Format**: `G-XXXXXXXXXX`
- **Used for**: Google Analytics tracking

#### `PLAUSIBLE_DOMAIN`
- **Description**: Domain for Plausible Analytics
- **Example**: `yourdomain.com`
- **Used for**: Privacy-focused analytics

#### `FATHOM_SITE_ID`
- **Description**: Fathom Analytics site ID
- **Example**: `ABCDEFGH`
- **Used for**: Fathom analytics tracking

### Build Configuration

#### `BUILD_PATH`
- **Description**: Output directory for built files
- **Default**: `./dist`
- **Example**: `./build`

#### `PUBLIC_PATH`
- **Description**: Base path for serving static assets
- **Default**: `/`
- **Example**: `/blog/` (for subdirectory deployment)

### Security Variables

#### `CSP_REPORT_URI`
- **Description**: URI for Content Security Policy violation reports
- **Example**: `https://yoursite.dev/csp-report`
- **Used for**: Security monitoring

#### `HSTS_MAX_AGE`
- **Description**: HTTP Strict Transport Security max age
- **Default**: `31536000` (1 year)
- **Used for**: HTTPS enforcement

### Deployment Variables

#### `CLOUDFLARE_API_TOKEN`
- **Description**: Cloudflare API token for deployments
- **Example**: `your_cloudflare_api_token_here`
- **Security**: Never commit this value
- **Used for**: Automated Cloudflare deployments

#### `NETLIFY_AUTH_TOKEN`
- **Description**: Netlify authentication token
- **Used for**: Netlify CLI deployments

#### `VERCEL_TOKEN`
- **Description**: Vercel authentication token
- **Used for**: Vercel CLI deployments


### Social Media Integration

#### `TWITTER_HANDLE`
- **Description**: Your Twitter handle (without @)
- **Example**: `yourusername`
- **Used for**: Twitter meta tags

#### `GITHUB_USERNAME`
- **Description**: Your GitHub username
- **Example**: `yourusername`
- **Used for**: Social links and attribution

#### `LINKEDIN_URL`
- **Description**: Your LinkedIn profile URL
- **Example**: `https://linkedin.com/in/yourprofile`

### Email Configuration

#### `CONTACT_EMAIL`
- **Description**: Contact email address
- **Example**: `hello@yourdomain.com`
- **Used for**: Contact forms and meta tags

#### `SMTP_HOST`
- **Description**: SMTP server for sending emails
- **Example**: `smtp.mailgun.org`

#### `SMTP_PORT`
- **Description**: SMTP server port
- **Example**: `587`

#### `SMTP_USER`
- **Description**: SMTP username
- **Security**: Keep secure

#### `SMTP_PASS`
- **Description**: SMTP password
- **Security**: Keep secure

## 🔍 Environment-Specific Configurations

### Development Environment

```bash
NODE_ENV=development
SITE_URL=http://localhost:4321
SITE_NAME=My Blog (Dev)
ASTRO_TELEMETRY_DISABLED=1
# No analytics in development
```

### Staging Environment

```bash
NODE_ENV=production
SITE_URL=https://staging.yourdomain.com
SITE_NAME=My Blog (Staging)
GOOGLE_ANALYTICS_ID=GA_STAGING_ID
# Limited analytics in staging
```

### Production Environment

```bash
NODE_ENV=production
SITE_URL=https://yourdomain.com
SITE_NAME=My Blog
GOOGLE_ANALYTICS_ID=GA_PRODUCTION_ID
CLOUDFLARE_API_TOKEN=production_token
# Full analytics and monitoring
```

## 🛡️ Security Best Practices

### Sensitive Variables

Never commit these to version control:
- API keys and tokens
- Database passwords
- SMTP credentials
- Authentication secrets

### Using Secrets in CI/CD

#### GitHub Actions
```yaml
env:
  CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  SITE_URL: ${{ vars.SITE_URL }}
```

#### Netlify
Add variables in: Site settings → Environment variables

#### Vercel
Add variables in: Project Settings → Environment Variables

### Local Development

1. Use `.env` for local configuration
2. Use different values for development
3. Never use production secrets locally

## 🔄 Variable Validation

The application validates environment variables at build time:

```javascript
// src/utils/env.ts
export function validateEnv() {
  const required = ['SITE_URL', 'SITE_NAME'];
  
  for (const var of required) {
    if (!process.env[var]) {
      throw new Error(`Missing required environment variable: ${var}`);
    }
  }
}
```

## 📚 Platform-Specific Guides

### Cloudflare Pages

Variables are set in the Pages dashboard:
1. Go to your project
2. Settings → Environment variables
3. Add variables for different environments

### Netlify

Use the Netlify dashboard or CLI:
```bash
# Via CLI
netlify env:set SITE_URL "https://yourdomain.com"

# Via file upload
netlify env:import .env.production
```

### Vercel

Use the Vercel dashboard or CLI:
```bash
# Via CLI
vercel env add SITE_URL

# Via file
vercel env pull .env.production
```

### GitHub Actions

Store in repository secrets and variables:
- **Secrets**: For sensitive data (API keys)
- **Variables**: For non-sensitive configuration

## 🐛 Troubleshooting

### Common Issues

#### Variable Not Found
```bash
Error: Missing required environment variable: SITE_URL
```
**Solution**: Ensure the variable is set in your `.env` file

#### Build Failing
```bash
ReferenceError: process is not defined
```
**Solution**: Ensure you're only accessing `process.env` in server-side code

#### Wrong Environment
```bash
Site shows localhost URL in production
```
**Solution**: Check that `SITE_URL` is set correctly for your environment

### Debugging Variables

Add logging to check variable loading:

```javascript
// In your config file
console.log('Environment:', process.env.NODE_ENV);
console.log('Site URL:', process.env.SITE_URL);
```

## 📝 Examples

### Complete Development Setup

```bash
# Site Configuration
SITE_URL=http://localhost:4321
SITE_NAME=My Blog (Development)
SITE_DESCRIPTION=A blog about awesome things

# Development Settings
NODE_ENV=development
ASTRO_TELEMETRY_DISABLED=1

# Build Configuration
BUILD_PATH=./dist
PUBLIC_PATH=/

# Security Headers (optional in dev)
CSP_REPORT_URI=http://localhost:4321/csp-report
HSTS_MAX_AGE=0
```

### Complete Production Setup

```bash
# Site Configuration
SITE_URL=https://yourdomain.com
SITE_NAME=My Blog
SITE_DESCRIPTION=A blog about technology and creativity

# Production Settings
NODE_ENV=production

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Security
CSP_REPORT_URI=https://yourdomain.com/csp-report
HSTS_MAX_AGE=31536000

# Social
TWITTER_HANDLE=yourusername
GITHUB_USERNAME=yourusername
CONTACT_EMAIL=hello@yourdomain.com
```

---

## 📞 Need Help?

- Check the [Deployment Guide](DEPLOYMENT_GUIDE.md) for platform-specific setup
- Review the [main README](README.md) for general configuration
- Open an issue if you encounter problems with environment variables