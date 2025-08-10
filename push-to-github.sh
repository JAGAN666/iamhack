#!/bin/bash

echo "🚀 Push to GitHub - iamhack Repository"
echo "======================================"
echo ""

# Check if remote origin exists
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ Remote origin already exists:"
    git remote get-url origin
    echo ""
    echo "📤 Pushing code to GitHub..."
    git push -u origin main
else
    echo "❌ No remote origin found."
    echo ""
    echo "🔧 Please create the repository first:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: iamhack"
    echo "3. Make it Public or Private"
    echo "4. Don't initialize with README, .gitignore, or license"
    echo "5. Click 'Create repository'"
    echo ""
    echo "📋 Then run this script again or manually add the remote:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/iamhack.git"
    echo "git push -u origin main"
fi

echo ""
echo "🎯 Current git status:"
git status --short
echo ""
echo "📊 Recent commits:"
git log --oneline -5
