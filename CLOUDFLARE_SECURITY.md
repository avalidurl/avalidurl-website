# 🔐 Cloudflare API Security Best Practices

## 🚨 IMMEDIATE SECURITY RESPONSE

**Your API key `30PJbsIwVBuAouub6F8iem78R0z5CRckHu825MPi` has been exposed in your GitHub repository.**

### ⚡ CRITICAL ACTIONS (Execute NOW)

1. **Revoke the Exposed Key**
   ```bash
   # Log into Cloudflare dashboard immediately
   # Go to: https://dash.cloudflare.com/profile/api-tokens
   # Delete the exposed token: 30PJbsIwVBuAouub6F8iem78R0z5CRckHu825MPi
   ```

2. **Generate New API Token**
   - Create a new token with minimal permissions
   - Use "Custom token" template
   - Set specific permissions only for your needs

3. **Check for Unauthorized Access**
   - Review Cloudflare audit logs
   - Check for any unexpected changes to your zones
   - Monitor for unusual API activity

## 🔑 Cloudflare API Token Best Practices

### Token Permissions (Principle of Least Privilege)
```
Zone Resources:
- Include: yoursite.dev
- Permissions: Zone:Read, Zone Settings:Edit, DNS:Edit

Account Resources:
- Include: Your Account
- Permissions: Cloudflare Pages:Edit (if using Pages)

IP Address Filtering:
- Add your deployment server IPs
- Add your office/home IP for manual operations
```

### Token Rotation Schedule
- **Development**: Every 30 days
- **Production**: Every 90 days
- **After Incident**: Immediately
- **Before Team Changes**: When team members leave

## 🛡️ Secure Implementation

### 1. Environment Variables Setup

#### GitHub Repository Secrets
```
CLOUDFLARE_API_TOKEN=<your-new-secure-token>
CLOUDFLARE_ZONE_ID=<your-zone-id>
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
```

#### Cloudflare Pages Environment Variables
```
CONTACT_EMAIL=your@email.com
SITE_URL=https://yoursite.dev
GITHUB_USERNAME=your-username
```

### 2. Secure API Client Implementation

```typescript
// src/utils/cloudflare.ts
class CloudflareClient {
  private readonly apiToken: string;
  private readonly baseUrl = 'https://api.cloudflare.com/client/v4';
  
  constructor() {
    // Server-side only - never expose in client code
    if (typeof window !== 'undefined') {
      throw new Error('CloudflareClient can only be used server-side');
    }
    
    this.apiToken = import.meta.env.CLOUDFLARE_API_TOKEN;
    if (!this.apiToken) {
      throw new Error('CLOUDFLARE_API_TOKEN is required');
    }
  }
  
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async verifyToken() {
    return this.request('/user/tokens/verify');
  }
  
  async getZoneInfo(zoneId: string) {
    return this.request(`/zones/${zoneId}`);
  }
}

export default CloudflareClient;
```

### 3. Rate Limiting and Error Handling

```typescript
class RateLimitedCloudflareClient extends CloudflareClient {
  private requestCount = 0;
  private resetTime = Date.now() + 60000; // Reset every minute
  
  async request(endpoint: string, options: RequestInit = {}) {
    // Cloudflare API allows 1200 requests per 5 minutes
    if (this.requestCount >= 200 && Date.now() < this.resetTime) {
      throw new Error('Rate limit exceeded');
    }
    
    if (Date.now() >= this.resetTime) {
      this.requestCount = 0;
      this.resetTime = Date.now() + 60000;
    }
    
    this.requestCount++;
    
    try {
      return await super.request(endpoint, options);
    } catch (error) {
      if (error instanceof Error && error.message.includes('429')) {
        // Handle rate limiting
        await new Promise(resolve => setTimeout(resolve, 60000));
        return this.request(endpoint, options);
      }
      throw error;
    }
  }
}
```

## 🔒 Security Monitoring

### 1. API Usage Monitoring

```typescript
// src/utils/monitoring.ts
export function logApiUsage(endpoint: string, method: string, success: boolean) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    success,
    userAgent: 'AValidURL-Portfolio/1.0',
  };
  
  // In production, send to your logging service
  console.log('API Usage:', logEntry);
}
```

### 2. Security Alerts

```typescript
// src/utils/alerts.ts
export function alertSecurityIncident(incident: {
  type: 'token_exposure' | 'unauthorized_access' | 'rate_limit_exceeded';
  details: string;
  timestamp: Date;
}) {
  // In production, integrate with your alerting system
  console.error('Security Incident:', incident);
  
  // Example: Send to Discord, Slack, or email
  if (incident.type === 'token_exposure') {
    // Immediate notification required
    sendUrgentAlert(incident);
  }
}
```

## 🏗️ Deployment Security

### 1. GitHub Actions Security

```yaml
# .github/workflows/security-check.yml
name: Security Check
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Check for API keys
        run: |
          if grep -r "cf_[a-zA-Z0-9_-]*" . --exclude-dir=node_modules; then
            echo "❌ Cloudflare API key found!"
            exit 1
          fi
          
      - name: Validate environment
        run: |
          if [ -z "${{ secrets.CLOUDFLARE_API_TOKEN }}" ]; then
            echo "❌ CLOUDFLARE_API_TOKEN secret not set"
            exit 1
          fi
```

### 2. Cloudflare Pages Security

```javascript
// functions/_middleware.js
export async function onRequestGet(context) {
  const { env } = context;
  
  // Validate API token exists
  if (!env.CLOUDFLARE_API_TOKEN) {
    return new Response('Configuration error', { status: 500 });
  }
  
  // Add security headers
  const response = await context.next();
  
  response.headers.set('X-API-Version', '1.0');
  response.headers.set('X-Security-Policy', 'strict');
  
  return response;
}
```

## 🔄 Incident Response Procedures

### Level 1: Token Exposure (CRITICAL)
1. **Immediate (0-5 minutes)**
   - Revoke exposed token in Cloudflare dashboard
   - Generate new token with minimal permissions
   - Update GitHub secrets

2. **Short-term (5-30 minutes)**
   - Check audit logs for unauthorized access
   - Review recent API calls
   - Update all deployment environments

3. **Long-term (30+ minutes)**
   - Rotate all related credentials
   - Review security procedures
   - Update monitoring and alerting

### Level 2: Unauthorized Access (HIGH)
1. **Immediate**
   - Review Cloudflare audit logs
   - Check for configuration changes
   - Verify DNS settings

2. **Short-term**
   - Rotate API tokens
   - Review access patterns
   - Strengthen security measures

### Level 3: Rate Limit Exceeded (MEDIUM)
1. **Immediate**
   - Review API usage patterns
   - Check for runaway scripts
   - Implement client-side throttling

2. **Short-term**
   - Optimize API calls
   - Implement caching
   - Add rate limiting logic

## 📊 Security Metrics

### Monitor These Metrics
- API token age (rotate before 90 days)
- Failed authentication attempts
- Rate limit violations
- Unusual API usage patterns
- Geographic access patterns

### Alerting Thresholds
- **Critical**: Token exposure detected
- **High**: >100 failed API calls per hour
- **Medium**: >80% of rate limit used
- **Low**: Token approaching expiration

## 🔐 Token Management Commands

```bash
# Validate current token
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# List all tokens (requires Global API Key)
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens" \
  -H "X-Auth-Email: your@email.com" \
  -H "X-Auth-Key: YOUR_GLOBAL_KEY"

# Delete a token
curl -X DELETE "https://api.cloudflare.com/client/v4/user/tokens/TOKEN_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Security Checklist

### Pre-deployment
- [ ] No API keys in source code
- [ ] Environment variables properly configured
- [ ] Token permissions minimized
- [ ] IP restrictions applied
- [ ] Monitoring enabled

### Post-deployment
- [ ] Security headers verified
- [ ] SSL/TLS configuration tested
- [ ] API endpoints secured
- [ ] Rate limiting functional
- [ ] Audit logging enabled

### Monthly Review
- [ ] Token rotation completed
- [ ] Audit logs reviewed
- [ ] Security metrics analyzed
- [ ] Incident response tested
- [ ] Access permissions validated

---

**Remember**: The exposed API key `30PJbsIwVBuAouub6F8iem78R0z5CRckHu825MPi` must be revoked immediately. This is a critical security vulnerability that requires immediate action.