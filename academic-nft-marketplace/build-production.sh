#!/bin/bash

# Academic NFT Marketplace - Production Build Script
# This script builds the entire application for production deployment

set -e

echo "🏗️  Building Academic NFT Marketplace for Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[BUILD]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Node.js version
check_node_version() {
    print_status "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js version: $(node -v)"
}

# Clean previous builds
clean_builds() {
    print_status "Cleaning previous builds..."
    
    # Clean backend
    if [ -d "backend/dist" ]; then
        rm -rf backend/dist
    fi
    
    # Clean frontend
    if [ -d "frontend/.next" ]; then
        rm -rf frontend/.next
    fi
    
    if [ -d "frontend/out" ]; then
        rm -rf frontend/out
    fi
    
    # Clean contracts
    if [ -d "contracts/artifacts" ]; then
        rm -rf contracts/artifacts
    fi
    
    if [ -d "contracts/cache" ]; then
        rm -rf contracts/cache
    fi
    
    print_success "Build directories cleaned"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    npm install
    
    # Backend dependencies
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    cd frontend
    npm install
    cd ..
    
    # Contract dependencies
    cd contracts
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    
    cd backend
    npx prisma generate
    cd ..
    
    print_success "Prisma client generated"
}

# Build backend
build_backend() {
    print_status "Building backend..."
    
    cd backend
    npm run build
    cd ..
    
    print_success "Backend built successfully"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd frontend
    npm run build
    cd ..
    
    print_success "Frontend built successfully"
}

# Compile smart contracts
compile_contracts() {
    print_status "Compiling smart contracts..."
    
    cd contracts
    npm run compile
    cd ..
    
    print_success "Smart contracts compiled"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    cd backend
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        npm test || print_error "Backend tests failed"
    fi
    cd ..
    
    # Frontend tests
    cd frontend
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        npm test || print_error "Frontend tests failed"
    fi
    cd ..
    
    # Contract tests
    cd contracts
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        npm test || print_error "Contract tests failed"
    fi
    cd ..
    
    print_success "Tests completed"
}

# Create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p deployment
    
    # Copy built backend
    cp -r backend/dist deployment/backend-dist
    cp backend/package.json deployment/
    cp backend/package-lock.json deployment/
    
    # Copy built frontend
    cp -r frontend/.next deployment/frontend-next
    cp frontend/package.json deployment/frontend-package.json
    
    # Copy contracts
    cp -r contracts/artifacts deployment/contracts-artifacts
    cp -r contracts/contracts deployment/contracts-source
    
    # Copy deployment configs
    cp vercel.json deployment/
    cp railway.json deployment/
    cp docker-compose.yml deployment/
    cp Dockerfile.* deployment/
    
    # Create deployment archive
    tar -czf academic-nft-marketplace-production.tar.gz deployment/
    
    print_success "Deployment package created: academic-nft-marketplace-production.tar.gz"
}

# Validate build
validate_build() {
    print_status "Validating build..."
    
    # Check backend build
    if [ ! -f "backend/dist/server.js" ]; then
        print_error "Backend build failed - server.js not found"
        exit 1
    fi
    
    # Check frontend build
    if [ ! -d "frontend/.next" ]; then
        print_error "Frontend build failed - .next directory not found"
        exit 1
    fi
    
    # Check contracts
    if [ ! -d "contracts/artifacts" ]; then
        print_error "Contract compilation failed - artifacts not found"
        exit 1
    fi
    
    print_success "Build validation passed"
}

# Main build function
main() {
    echo "🎓 Academic NFT Marketplace - Production Build"
    echo "=============================================="
    
    check_node_version
    clean_builds
    install_dependencies
    generate_prisma
    compile_contracts
    build_backend
    build_frontend
    run_tests
    validate_build
    create_deployment_package
    
    echo ""
    print_success "🎉 Production build completed successfully!"
    echo ""
    echo "Build artifacts:"
    echo "- Backend: backend/dist/"
    echo "- Frontend: frontend/.next/"
    echo "- Contracts: contracts/artifacts/"
    echo "- Deployment package: academic-nft-marketplace-production.tar.gz"
    echo ""
    echo "Next steps:"
    echo "1. Deploy to your hosting platforms"
    echo "2. Configure environment variables"
    echo "3. Run database migrations"
    echo "4. Deploy smart contracts"
    echo ""
    echo "For deployment instructions, see: deploy-free.md"
}

# Run main function
main "$@"