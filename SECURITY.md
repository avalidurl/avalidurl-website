# 🔐 Security Protocol for API Key Management

## 🚨 CRITICAL: API Key Exposure Response

**An API key has been detected in plain text. This document outlines the immediate response and long-term security protocols.**

### Immediate Actions (Execute Within 15 Minutes)

1. **Revoke Exposed Key**
   - Log into Cloudflare dashboard
   - Navigate to API Tokens
   - Delete the exposed token: `30PJbsIwVBuAouub6F8iem78R0z5CRckHu825MPi`
   - Generate a new token with minimal required permissions

2. **Audit Repository**
   - Search entire git history for exposed credentials
   - Check all commits for sensitive data
   - Remove any found credentials from git history

3. **Secure New Credentials**
   - Store new API key in GitHub repository secrets
   - Configure environment variables in Cloudflare Pages
   - Update deployment workflows

## 🛡️ Long-term Security Protocols

### 1. Environment Variable Management

#### GitHub Repository Secrets
```
CLOUDFLARE_API_TOKEN=<new-secure-token>
CLOUDFLARE_ZONE_ID=<zone-id>
CLOUDFLARE_ACCOUNT_ID=<account-id>
```

#### Cloudflare Pages Environment Variables
```
CONTACT_EMAIL=your-email@domain.com
SITE_URL=https://yoursite.dev
ANALYTICS_ID=optional-analytics-id
GITHUB_USERNAME=your-github-username
```

### 2. Security Headers Configuration

#### Cloudflare Pages Headers (`public/_headers`)
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 3. Type-Safe Environment Handling

#### src/utils/env.ts
```typescript
interface EnvConfig {
  readonly CONTACT_EMAIL: string;
  readonly SITE_URL: string;
  readonly ANALYTICS_ID?: string;
  readonly GITHUB_USERNAME?: string;
}

export const env: EnvConfig = {
  CONTACT_EMAIL: import.meta.env.CONTACT_EMAIL || 'contact@example.com',
  SITE_URL: import.meta.env.SITE_URL || 'https://yoursite.dev',
  ANALYTICS_ID: import.meta.env.ANALYTICS_ID,
  GITHUB_USERNAME: import.meta.env.GITHUB_USERNAME,
} as const;

// Build-time validation
Object.entries(env).forEach(([key, value]) => {
  if (!value && ['CONTACT_EMAIL', 'SITE_URL'].includes(key)) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
```

### 4. Cloudflare API Integration Best Practices

#### Minimal Permission Tokens
- Use scoped API tokens instead of Global API Keys
- Grant only necessary permissions:
  - `Zone:Zone Settings:Edit`
  - `Zone:Zone:Read`
  - `Zone:Page Rules:Edit`

#### Rate Limiting
```typescript
class CloudflareAPI {
  private readonly baseUrl = 'https://api.cloudflare.com/client/v4';
  private readonly token: string;
  
  constructor(token: string) {
    this.token = token;
  }
  
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status}`);
    }
    
    return response.json();
  }
}
```

### 5. Git Security Configuration

#### .gitignore Patterns
```
# Environment variables
.env
.env.local
.env.production
.env.development

# API keys and secrets
*.key
*.pem
secrets/
config/secrets.json

# Build artifacts
dist/
.astro/
node_modules/

# IDE files
.vscode/settings.json
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
```

#### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run security-check"
    }
  },
  "lint-staged": {
    "*.{js,ts,astro}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

### 6. Automated Security Scanning

#### Package.json Scripts
```json
{
  "scripts": {
    "security-check": "npm audit && git secrets --scan",
    "security-fix": "npm audit fix",
    "secrets-scan": "git secrets --scan-history"
  }
}
```

## 🚨 Security Incident Response Plan

### Phase 1: Detection and Assessment (0-15 minutes)
1. **Immediate Response**
   - Stop all deployments
   - Revoke exposed credentials
   - Assess scope of exposure

2. **Impact Assessment**
   - Determine what data was exposed
   - Identify affected systems
   - Estimate timeline of exposure

### Phase 2: Containment (15-30 minutes)
1. **Credential Rotation**
   - Generate new API keys
   - Update all affected systems
   - Test new credentials

2. **Repository Cleanup**
   - Remove secrets from git history
   - Update .gitignore
   - Force push clean history

### Phase 3: Recovery (30-60 minutes)
1. **System Restoration**
   - Redeploy with new credentials
   - Verify all systems operational
   - Monitor for unauthorized access

2. **Security Hardening**
   - Implement additional security measures
   - Update monitoring and alerting
   - Review access controls

### Phase 4: Post-Incident (1-24 hours)
1. **Documentation**
   - Document incident details
   - Record lessons learned
   - Update security procedures

2. **Communication**
   - Notify affected stakeholders
   - Provide incident report
   - Update security training

## 🔍 Monitoring and Alerting

### GitHub Actions Security Checks
```yaml
name: Security Audit
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security audit
        run: |
          npm audit --audit-level=moderate
          git secrets --scan
```

### Cloudflare Security Monitoring
- Enable audit logs
- Set up API usage alerts
- Monitor for unusual activity patterns

## 📋 Security Checklist

### Pre-Deployment
- [ ] No secrets in repository
- [ ] .gitignore properly configured
- [ ] Environment variables secured
- [ ] API tokens have minimal permissions
- [ ] Security headers configured
- [ ] HTTPS enforced

### Post-Deployment
- [ ] Security headers verified
- [ ] SSL/TLS configuration tested
- [ ] API rate limiting functional
- [ ] Monitoring alerts active
- [ ] Backup procedures tested

### Regular Maintenance
- [ ] Monthly security audit
- [ ] Quarterly credential rotation
- [ ] Annual penetration testing
- [ ] Dependency vulnerability scanning

## 🔐 Security Mantra
**"If it's sensitive, it's not in the repo. If it's in the repo, it's not sensitive."**

---

**Emergency Contact**: Immediate security issues require immediate credential revocation.
**Documentation**: This document must be updated after any security incident.
**Training**: All team members must understand these protocols.