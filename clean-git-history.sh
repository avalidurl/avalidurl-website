#!/bin/bash

# 🔐 Git History Cleaning Script
# This script removes the exposed API key from git history

set -e

echo "🚨 CRITICAL: Removing exposed API key from git history"
echo "=============================================="

# The exposed API key that needs to be removed
EXPOSED_KEY="30PJbsIwVBuAouub6F8iem78R0z5CRckHu825MPi"

# Backup current branch
echo "📦 Creating backup branch..."
git branch backup-before-history-clean || true

# Check if the key exists in history
echo "🔍 Checking for exposed key in git history..."
if git log --all -S"$EXPOSED_KEY" --oneline | grep -q .; then
    echo "❌ Found exposed key in git history"
    echo "📋 Commits containing the key:"
    git log --all -S"$EXPOSED_KEY" --oneline
else
    echo "✅ No exposed key found in git history"
    exit 0
fi

# Method 1: Using git filter-repo (recommended)
if command -v git-filter-repo &> /dev/null; then
    echo "🧹 Using git-filter-repo to clean history..."
    echo "$EXPOSED_KEY" > /tmp/secrets-to-remove.txt
    git filter-repo --replace-text /tmp/secrets-to-remove.txt --force
    rm /tmp/secrets-to-remove.txt
    
elif command -v bfg &> /dev/null; then
    # Method 2: Using BFG Repo-Cleaner
    echo "🧹 Using BFG Repo-Cleaner to clean history..."
    echo "$EXPOSED_KEY" > /tmp/secrets-to-remove.txt
    bfg --replace-text /tmp/secrets-to-remove.txt .
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    rm /tmp/secrets-to-remove.txt
    
else
    # Method 3: Using git filter-branch (slower but available everywhere)
    echo "🧹 Using git filter-branch to clean history..."
    echo "⚠️  This may take a while for large repositories..."
    
    # Remove the .env file completely from history
    git filter-branch --index-filter 'git rm --cached --ignore-unmatch .env' HEAD
    
    # Clean up
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
fi

echo "✅ Git history cleaned successfully"

# Verify the key is gone
echo "🔍 Verifying key removal..."
if git log --all -S"$EXPOSED_KEY" --oneline | grep -q .; then
    echo "❌ WARNING: Key still found in history!"
    echo "You may need to run this script again or use a different method."
    exit 1
else
    echo "✅ Key successfully removed from git history"
fi

# Add security files to git
echo "🔒 Adding security files to git..."
git add .gitignore .env.example src/utils/env.ts public/_headers
git add SECURITY.md CLOUDFLARE_SECURITY.md INCIDENT_RESPONSE.md
git add .github/workflows/

# Commit security improvements
git commit -m "sec: implement comprehensive security measures after API key exposure

- Add comprehensive .gitignore to prevent future credential exposure
- Create environment variable templates and type-safe configuration
- Implement Cloudflare API security best practices
- Add security headers configuration
- Create incident response plan and security protocols
- Set up automated security scanning workflows

Related to security incident INC-2025-001"

echo "🚀 Security improvements committed"

# Show next steps
echo ""
echo "🎯 NEXT STEPS:"
echo "1. IMMEDIATELY revoke the exposed API key in Cloudflare dashboard"
echo "2. Generate a new API token with minimal permissions"
echo "3. Update GitHub repository secrets:"
echo "   gh secret set CLOUDFLARE_API_TOKEN --body \"NEW_TOKEN_HERE\""
echo "4. Force push the cleaned history:"
echo "   git push --force-with-lease origin main"
echo "5. Verify the exposed key is no longer accessible on GitHub"
echo ""
echo "⚠️  WARNING: Force pushing will rewrite history. Coordinate with team members."
echo "✅ Backup branch 'backup-before-history-clean' created for safety."

# Final verification
echo ""
echo "🔍 FINAL VERIFICATION:"
echo "Repository status:"
git status --short

echo ""
echo "Recent commits:"
git log --oneline -5

echo ""
echo "🔐 Security status: History cleaned, security measures implemented"
echo "🚨 CRITICAL: You must still revoke the exposed API key manually!"