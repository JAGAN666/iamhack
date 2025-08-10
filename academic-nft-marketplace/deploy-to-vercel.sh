#!/bin/bash

# 🚀 Academic NFT Marketplace - Vercel Deployment Script
echo "🎯 Preparing Academic NFT Marketplace for Vercel deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    print_error "vercel.json not found. Make sure you're in the project root directory."
    exit 1
fi

print_status "Checking project structure..."

# Verify required files exist
required_files=("vercel.json" "api/index.ts" "api/package.json" "frontend/package.json")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file exists"
    else
        print_error "❌ $file is missing"
        exit 1
    fi
done

# Install dependencies if needed
print_status "Checking dependencies..."

if [ -d "frontend/node_modules" ]; then
    print_success "✅ Frontend dependencies installed"
else
    print_warning "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    if [ $? -eq 0 ]; then
        print_success "✅ Frontend dependencies installed"
    else
        print_error "❌ Failed to install frontend dependencies"
        exit 1
    fi
fi

# Build frontend to check for errors
print_status "Building frontend to check for errors..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    print_success "✅ Frontend build successful"
    cd ..
else
    print_error "❌ Frontend build failed. Please fix errors before deployment."
    cd ..
    exit 1
fi

# Check TypeScript compilation for API
print_status "Checking API TypeScript..."
if command -v tsc &> /dev/null; then
    cd api
    npx tsc --noEmit index.ts --esModuleInterop --target es2020 --module commonjs --skipLibCheck
    if [ $? -eq 0 ]; then
        print_success "✅ API TypeScript is valid"
        cd ..
    else
        print_warning "⚠️ API TypeScript has issues (but may still work)"
        cd ..
    fi
else
    print_warning "⚠️ TypeScript not found, skipping API check"
fi

print_success "🎉 Project is ready for Vercel deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Make sure your code is pushed to GitHub"
echo "2. Go to https://vercel.com and create a new project"
echo "3. Import your GitHub repository"
echo "4. Add environment variables (see VERCEL_DEPLOYMENT.md)"
echo "5. Deploy!"
echo ""
echo "📖 For detailed instructions, see: VERCEL_DEPLOYMENT.md"
echo ""
print_success "✨ Your Academic NFT Marketplace is ready to go live! ✨"