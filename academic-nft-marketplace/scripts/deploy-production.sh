#!/bin/bash

# Academic NFT Marketplace - Production Deployment Script
# This script deploys the application to free hosting services

set -e

echo "🚀 Starting Academic NFT Marketplace Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Install project dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    cd backend
    npm install
    cd ..
    
    # Install frontend dependencies
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

# Build the project
build_project() {
    print_status "Building the project..."
    
    # Build backend
    cd backend
    npm run build
    cd ..
    
    # Build frontend
    cd frontend
    npm run build
    cd ..
    
    print_success "Project built successfully"
}

# Deploy to Vercel (Frontend)
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    cd frontend
    
    # Deploy to Vercel
    vercel --prod --confirm
    
    cd ..
    
    print_success "Frontend deployed to Vercel"
}

# Deploy to Railway (Backend)
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    cd backend
    
    # Login to Railway (if not already logged in)
    railway login
    
    # Initialize Railway project (if not already initialized)
    if [ ! -f "railway.json" ]; then
        railway init
    fi
    
    # Deploy to Railway
    railway up
    
    cd ..
    
    print_success "Backend deployed to Railway"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd backend
    
    # Generate Prisma client
    npx prisma generate
    
    # Push database schema
    npx prisma db push
    
    cd ..
    
    print_success "Database setup completed"
}

# Main deployment function
main() {
    echo "🎓 Academic NFT Marketplace - Production Deployment"
    echo "=================================================="
    
    check_dependencies
    install_dependencies
    build_project
    setup_database
    
    # Ask user which services to deploy
    echo ""
    read -p "Deploy frontend to Vercel? (y/n): " deploy_fe
    read -p "Deploy backend to Railway? (y/n): " deploy_be
    
    if [[ $deploy_fe =~ ^[Yy]$ ]]; then
        deploy_frontend
    fi
    
    if [[ $deploy_be =~ ^[Yy]$ ]]; then
        deploy_backend
    fi
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Configure environment variables in your hosting dashboards"
    echo "2. Set up your database connection string"
    echo "3. Configure Cloudinary for file uploads"
    echo "4. Test your deployed application"
    echo ""
    echo "For detailed setup instructions, see: deploy-free.md"
}

# Run main function
main "$@"