# 🚀 Deployment Guide

## 📋 Prerequisites

- GitHub account
- Node.js 18+ installed
- Git configured locally

## 🔧 Step 1: Create GitHub Repository

1. Go to [GitHub New Repository](https://github.com/new)
2. Repository name: `iamhack`
3. Description: `Academic NFT Marketplace - Transform academic achievements into verifiable NFTs`
4. Make it Public or Private (your choice)
5. **Don't** initialize with README, .gitignore, or license
6. Click "Create repository"

## 🔗 Step 2: Connect and Push

Run the setup script:
```bash
./setup-github.sh
```

Or manually:
```bash
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/iamhack.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 3: Deploy to Production

### Frontend (Netlify/Vercel)
1. Connect your GitHub repository
2. Build command: `cd academic-nft-marketplace/frontend && npm run build`
3. Publish directory: `academic-nft-marketplace/frontend/.next`

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Root directory: `academic-nft-marketplace/backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`

## ✅ Verification

After deployment, verify:
- [ ] Repository is accessible on GitHub
- [ ] All files are visible
- [ ] README displays correctly
- [ ] Deployment platforms are connected

## 🎉 Success!

Your Academic NFT Marketplace is now:
- ✅ Version controlled on GitHub
- ✅ Ready for collaboration
- ✅ Deployable to production
- ✅ Professional and documented

---

**Next Steps:**
- Share your repository with the community
- Set up CI/CD pipelines
- Configure production environments
- Start collaborating with contributors
