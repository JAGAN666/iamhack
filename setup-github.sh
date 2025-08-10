#!/bin/bash

echo "🚀 Setting up GitHub repository for iamhack"
echo "=============================================="
echo ""
echo "1. Go to https://github.com/new"
echo "2. Repository name: iamhack"
echo "3. Make it Public or Private (your choice)"
echo "4. Don't initialize with README, .gitignore, or license"
echo "5. Click 'Create repository'"
echo ""
echo "6. Copy the repository URL (it will look like: https://github.com/YOUR_USERNAME/iamhack.git)"
echo ""
read -p "Enter the repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

echo ""
echo "🔗 Adding remote origin..."
git remote add origin "$REPO_URL"

echo "📤 Pushing code to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Success! Your code has been pushed to GitHub."
echo "🌐 Repository: $REPO_URL"
echo ""
echo "🎉 You can now view your Academic NFT Marketplace project on GitHub!"
