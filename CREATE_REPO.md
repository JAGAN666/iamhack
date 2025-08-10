# 🚀 Manual GitHub Repository Creation

## Step 1: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Note: `iamhack-repo-creation`
4. Expiration: Choose 90 days or custom
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Click "Generate token"
7. **Copy the token** (you won't see it again!)

## Step 2: Create Repository via API

Run this command (replace `YOUR_TOKEN` with your actual token):

```bash
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d '{
    "name": "iamhack",
    "description": "Academic NFT Marketplace - Transform academic achievements into verifiable NFTs",
    "private": false,
    "has_issues": true,
    "has_wiki": true,
    "has_downloads": true
  }'
```

## Step 3: Push Your Code

After creating the repository, run:

```bash
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/iamhack.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Alternative: Use the Setup Script

Or simply run:
```bash
./setup-github.sh
```

## 🎯 Quick Commands

```bash
# Check current status
git status

# View commits
git log --oneline

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/iamhack.git

# Push code
git push -u origin main
```

## ✅ Verification

After pushing, verify at:
https://github.com/YOUR_USERNAME/iamhack

---

**Need help?** The setup script will guide you through the process automatically!
