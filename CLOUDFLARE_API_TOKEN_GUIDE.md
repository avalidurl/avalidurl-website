# 🔐 Secure Cloudflare API Token Setup Guide

## 📋 Complete Step-by-Step Guide for GitHub Actions Deployment

This guide provides comprehensive instructions for creating a secure Cloudflare API token with minimal permissions for deploying to Cloudflare Pages via GitHub Actions.

---

## 🎯 Prerequisites

- Cloudflare account with access to your domain
- GitHub repository with admin access
- Active Cloudflare Pages project
- Basic understanding of GitHub Actions

---

## 🔑 Step 1: Create Cloudflare API Token

### 1.1 Access Cloudflare Dashboard
1. Navigate to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Log in with your credentials
3. Click on your profile icon (top right)
4. Select **"My Profile"**

### 1.2 Navigate to API Tokens
1. In your profile, click on the **"API Tokens"** tab
2. Click **"Create Token"** button
3. Select **"Custom token"** (not "Use template")

### 1.3 Configure Token Permissions (Minimal Required)

**Screenshot Description**: *The token creation form should show sections for Permissions, Account resources, Zone resources, and Client IP address filtering.*

#### Token Name
```
GitHub-Actions-Pages-Deploy-[PROJECT-NAME]
```

#### Permissions Section
Set these exact permissions:

| Resource | Permission | Level |
|----------|------------|-------|
| **Zone** | `Zone:Read` | ✅ Required |
| **Zone** | `Zone Settings:Edit` | ✅ Required |
| **Zone** | `DNS:Edit` | ✅ Required |
| **Account** | `Cloudflare Pages:Edit` | ✅ Required |

**⚠️ SECURITY NOTE**: Do NOT add any additional permissions. These are the absolute minimum required for Pages deployment.

#### Account Resources
1. Select **"Include"**
2. Choose **"Your Account"** from dropdown
3. Select your specific account (do not use "All accounts")

#### Zone Resources
1. Select **"Include"**
2. Choose **"Specific zone"**
3. Select your domain (e.g., `yoursite.dev`)

#### Client IP Address Filtering (CRITICAL SECURITY MEASURE)
1. Select **"Is in"**
2. Add GitHub Actions IP ranges:
   ```
   # GitHub Actions IP ranges (update these regularly)
   # Current as of 2024 - verify at: https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#ip-addresses
   
   # Add these IP ranges:
   20.201.28.151/32
   20.207.73.82/32
   20.27.177.113/32
   20.87.245.0/32
   # ... (check GitHub docs for complete list)
   ```

**⚠️ IMPORTANT**: GitHub Actions IP ranges change periodically. Check the [official GitHub documentation](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#ip-addresses) for the most current ranges.

#### TTL (Time to Live)
- Set to **90 days maximum**
- For production: 30-60 days recommended
- For development: 7-30 days

### 1.4 Review and Create
1. Review all settings carefully
2. Click **"Continue to summary"**
3. Verify the permission summary matches your requirements
4. Click **"Create Token"**

### 1.5 Secure Token Storage
1. **IMMEDIATELY** copy the token to a secure location
2. **NEVER** store it in plain text files
3. **NEVER** commit it to version control
4. Use a password manager or secure notes app

---

## 🔒 Step 2: Configure GitHub Repository Secrets

### 2.1 Access Repository Settings
1. Navigate to your GitHub repository
2. Click **"Settings"** tab
3. Select **"Secrets and variables"** → **"Actions"**

### 2.2 Required Secrets Configuration

Add the following secrets by clicking **"New repository secret"**:

#### Primary Secrets
```bash
# Required for Cloudflare Pages deployment
CLOUDFLARE_API_TOKEN=your_new_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Application configuration
CONTACT_EMAIL=your@email.com
SITE_URL=https://yoursite.dev
GITHUB_USERNAME=your-github-username

# Optional but recommended
ANALYTICS_ID=your_analytics_id_here
```

#### Finding Your Account ID
1. Go to Cloudflare Dashboard
2. Select your domain
3. Scroll down to **"API"** section in right sidebar
4. Copy **"Account ID"** (format: `abc123def456ghi789`)

#### Finding Your Zone ID (if needed)
1. In Cloudflare Dashboard, select your domain
2. In right sidebar, **"API"** section
3. Copy **"Zone ID"** (format: `xyz789abc123def456`)

### 2.3 Secret Naming Convention
```bash
# Use consistent naming
CLOUDFLARE_API_TOKEN     # NOT: CF_TOKEN, CLOUDFLARE_TOKEN
CLOUDFLARE_ACCOUNT_ID    # NOT: CF_ACCOUNT, ACCOUNT_ID
CLOUDFLARE_ZONE_ID       # NOT: ZONE_ID, CF_ZONE
```

---

## 🧪 Step 3: Test Your New Token

### 3.1 Local Testing (Optional)
Create a test script to verify token functionality:

```bash
# test-token.sh
#!/bin/bash

TOKEN="your_token_here"
ACCOUNT_ID="your_account_id_here"

echo "Testing Cloudflare API token..."

# Test 1: Verify token
echo "1. Verifying token..."
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" | jq .

# Test 2: List accounts
echo "2. Testing account access..."
curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" | jq .

# Test 3: List Pages projects
echo "3. Testing Pages access..."
curl -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" | jq .

echo "Token testing complete!"
```

### 3.2 GitHub Actions Test
1. Create a small test commit
2. Push to a feature branch
3. Check the Actions tab for deployment status
4. Verify the build completes successfully

### 3.3 Token Verification Workflow
Add this to your existing GitHub Actions workflow:

```yaml
# .github/workflows/verify-token.yml
name: Verify Cloudflare Token

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  workflow_dispatch:

jobs:
  verify-token:
    runs-on: ubuntu-latest
    steps:
      - name: Verify Cloudflare API Token
        run: |
          response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json")
          
          if echo "$response" | jq -e '.success == true' > /dev/null; then
            echo "✅ Token is valid"
            echo "Token ID: $(echo "$response" | jq -r '.result.id')"
            echo "Status: $(echo "$response" | jq -r '.result.status')"
          else
            echo "❌ Token verification failed"
            echo "$response"
            exit 1
          fi
```

---

## 🔄 Step 4: Token Rotation Procedures

### 4.1 Rotation Schedule
- **Development environments**: Every 30 days
- **Production environments**: Every 60-90 days
- **Security incident**: Immediately
- **Team member departure**: Within 24 hours

### 4.2 Automated Rotation Reminder
Add this to your GitHub Actions:

```yaml
# .github/workflows/token-rotation-reminder.yml
name: Token Rotation Reminder

on:
  schedule:
    - cron: '0 9 1 * *' # First day of each month at 9 AM

jobs:
  rotation-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Token Age
        run: |
          # This would typically check token creation date
          # and alert if it's approaching expiration
          echo "🔄 Monthly token rotation check"
          echo "Please review and rotate Cloudflare API tokens if needed"
          echo "Current tokens should be rotated every 60-90 days"
```

### 4.3 Rotation Process
1. **Create new token** with same permissions
2. **Test new token** using verification script
3. **Update GitHub secrets** with new token
4. **Deploy and test** a small change
5. **Revoke old token** in Cloudflare dashboard
6. **Document rotation** in security log

### 4.4 Emergency Rotation
If token is compromised:
1. **Immediately revoke** the exposed token
2. **Create new token** with same permissions
3. **Update all environments** (GitHub, CI/CD, etc.)
4. **Check audit logs** for unauthorized usage
5. **Review recent deployments** for anomalies

---

## 🚨 Step 5: Security Best Practices

### 5.1 Token Storage Security
- ✅ **DO**: Store in GitHub Secrets, Azure Key Vault, AWS Secrets Manager
- ❌ **DON'T**: Store in code, environment files, or plain text
- ✅ **DO**: Use different tokens for different environments
- ❌ **DON'T**: Share tokens between projects or teams

### 5.2 Access Control
- ✅ **DO**: Use IP address filtering when possible
- ✅ **DO**: Set shortest reasonable TTL
- ✅ **DO**: Use principle of least privilege
- ❌ **DON'T**: Use Global API Keys for automation

### 5.3 Monitoring and Alerting
- ✅ **DO**: Monitor token usage patterns
- ✅ **DO**: Set up alerts for failed authentications
- ✅ **DO**: Review Cloudflare audit logs regularly
- ✅ **DO**: Track token rotation schedules

### 5.4 Incident Response
- ✅ **DO**: Have token rotation procedures documented
- ✅ **DO**: Maintain backup access methods
- ✅ **DO**: Know how to quickly revoke compromised tokens
- ✅ **DO**: Keep emergency contact information updated

---

## 🔧 Step 6: Troubleshooting Common Issues

### 6.1 Token Verification Failures

**Error**: `HTTP 401 Unauthorized`
```bash
# Check token format
echo "Token format should be: xxxxxxxxxxxxxxxxxxxxxx"
echo "Length should be around 40 characters"

# Verify token hasn't expired
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer $TOKEN" | jq '.result.expires_on'
```

**Solution**:
1. Verify token is correctly copied (no extra spaces)
2. Check token hasn't expired
3. Confirm IP address is in allowed range
4. Ensure token has required permissions

### 6.2 Permission Errors

**Error**: `HTTP 403 Forbidden`
```json
{
  "errors": [
    {
      "code": 10000,
      "message": "Not authorized"
    }
  ]
}
```

**Solution**:
1. Check token has `Cloudflare Pages:Edit` permission
2. Verify account resource is correctly configured
3. Confirm zone resource includes your domain
4. Ensure account ID matches token's account

### 6.3 GitHub Actions Deployment Failures

**Error**: `Error: Unable to find account`
```yaml
# Check in your workflow file
- name: Debug Account Access
  run: |
    curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
         -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
         -H "Content-Type: application/json" | jq .
```

**Solution**:
1. Verify `CLOUDFLARE_ACCOUNT_ID` secret is set correctly
2. Check account ID format (no quotes, dashes, or extra characters)
3. Confirm token has access to the specified account

### 6.4 IP Address Restrictions

**Error**: `HTTP 403 - IP not allowed`

**Solution**:
1. Check current GitHub Actions IP ranges
2. Update token IP restrictions if GitHub IPs changed
3. Consider removing IP restrictions temporarily for testing
4. Use webhook IP ranges for better reliability

### 6.5 Rate Limiting

**Error**: `HTTP 429 Too Many Requests`

**Solution**:
1. Implement exponential backoff in deployment scripts
2. Add delay between API calls
3. Use conditional deployments (only on main branch)
4. Cache API responses where possible

---

## 📊 Step 7: Monitoring and Maintenance

### 7.1 Token Health Dashboard
Create a simple monitoring script:

```bash
#!/bin/bash
# cloudflare-token-health.sh

TOKEN="${CLOUDFLARE_API_TOKEN}"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}"

echo "🔍 Cloudflare Token Health Check"
echo "================================"

# Check token validity
echo "Checking token validity..."
validity=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
           -H "Authorization: Bearer $TOKEN" | jq -r '.success')

if [ "$validity" = "true" ]; then
    echo "✅ Token is valid"
else
    echo "❌ Token is invalid or expired"
    exit 1
fi

# Check account access
echo "Checking account access..."
account_access=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID" \
                 -H "Authorization: Bearer $TOKEN" | jq -r '.success')

if [ "$account_access" = "true" ]; then
    echo "✅ Account access confirmed"
else
    echo "❌ Account access denied"
fi

# Check Pages project access
echo "Checking Pages project access..."
pages_access=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects" \
               -H "Authorization: Bearer $TOKEN" | jq -r '.success')

if [ "$pages_access" = "true" ]; then
    echo "✅ Pages project access confirmed"
else
    echo "❌ Pages project access denied"
fi

echo "Health check complete!"
```

### 7.2 Audit Log Monitoring
```bash
# Check recent API activity
curl -X GET "https://api.cloudflare.com/client/v4/user/audit_logs" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" | jq '.result[] | select(.when > "2024-01-01")'
```

### 7.3 Automated Alerts
Set up alerts for:
- Token expiration (30 days before)
- Failed authentication attempts
- Unusual API usage patterns
- GitHub Actions deployment failures

---

## 📋 Step 8: Security Checklist

### Pre-Deployment Checklist
- [ ] Token created with minimal permissions
- [ ] IP address filtering configured
- [ ] TTL set to reasonable timeframe
- [ ] GitHub secrets configured correctly
- [ ] Test deployment successful
- [ ] Old tokens revoked (if replacing)

### Post-Deployment Checklist
- [ ] Deployment pipeline working
- [ ] Security headers present
- [ ] No token exposure in logs
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team members notified

### Monthly Security Review
- [ ] Token rotation schedule followed
- [ ] Audit logs reviewed
- [ ] IP restrictions updated
- [ ] Permission requirements validated
- [ ] Incident response procedures tested

---

## 🆘 Emergency Procedures

### Immediate Response (0-5 minutes)
1. **Revoke compromised token** in Cloudflare dashboard
2. **Create new token** with same permissions
3. **Update GitHub secrets** immediately
4. **Test new token** with verification script

### Short-term Response (5-30 minutes)
1. **Check audit logs** for unauthorized access
2. **Review recent deployments** for anomalies
3. **Update monitoring alerts** if needed
4. **Document incident** in security log

### Long-term Response (30+ minutes)
1. **Review security procedures** for improvements
2. **Update documentation** with lessons learned
3. **Schedule additional security training** if needed
4. **Implement additional monitoring** if required

---

## 📞 Support Resources

### Cloudflare Documentation
- [API Token Documentation](https://developers.cloudflare.com/api/tokens/)
- [Pages API Documentation](https://developers.cloudflare.com/pages/platform/api/)
- [Security Best Practices](https://developers.cloudflare.com/fundamentals/api/security/)

### GitHub Actions Documentation
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

### Community Resources
- [Cloudflare Community Forum](https://community.cloudflare.com/)
- [GitHub Community Discussions](https://github.com/community/community/discussions)

---

## 🎯 Quick Reference

### Essential Commands
```bash
# Verify token
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer $TOKEN"

# List accounts
curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
     -H "Authorization: Bearer $TOKEN"

# List Pages projects
curl -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects" \
     -H "Authorization: Bearer $TOKEN"
```

### Required GitHub Secrets
```bash
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CONTACT_EMAIL=your@email.com
SITE_URL=https://yoursite.dev
GITHUB_USERNAME=your-username
```

### Minimum Required Permissions
- Zone: Read
- Zone Settings: Edit
- DNS: Edit
- Account: Cloudflare Pages:Edit

---

**🔐 Security Reminder**: This token provides access to your Cloudflare account. Treat it with the same security as your password. When in doubt, revoke and recreate.

**📅 Next Steps**: Schedule your first token rotation in 60 days and set up monitoring alerts.