# Technology Stack & Build System

## Architecture
Full-stack TypeScript application with microservices architecture:
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Next.js 14 + React + TypeScript
- **Database**: PostgreSQL with Prisma ORM (SQLite for development)
- **Smart Contracts**: Ethereum (Hardhat + OpenZeppelin)
- **Caching**: Redis for session management and performance

## Backend Stack
- **Framework**: Express.js with TypeScript
- **Database**: Prisma ORM with PostgreSQL/SQLite
- **Authentication**: JWT + university email verification
- **File Upload**: Multer + Cloudinary for achievement proofs
- **Email**: Nodemailer for verification
- **Real-time**: Socket.io for live features
- **Security**: Helmet, CORS, rate limiting, compression

## Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: React Context + TanStack Query
- **Blockchain**: Ethers.js + Wagmi + RainbowKit
- **3D/Animation**: Three.js + React Three Fiber + Framer Motion
- **PWA**: Next-PWA with offline support

## Smart Contracts
- **Platform**: Ethereum (Sepolia testnet for development)
- **Framework**: Hardhat with TypeScript
- **Standards**: ERC721 with custom soul-bound functionality
- **Libraries**: OpenZeppelin contracts for security

## Common Commands

### Development Setup
```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Backend only
npm run backend:dev

# Frontend only  
npm run frontend:dev
```

### Database Operations
```bash
cd backend
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema changes
npx prisma migrate dev # Create and apply migrations
```

### Smart Contract Operations
```bash
cd contracts
npm run compile        # Compile contracts
npm run node          # Start local Hardhat node
npm run deploy:local  # Deploy to local network
npm run deploy:sepolia # Deploy to Sepolia testnet
npm run test          # Run contract tests
```

### Build & Deployment
```bash
npm run build         # Build all services
npm run backend:build # Build backend only
npm run frontend:build # Build frontend only
```

### Docker Development
```bash
docker-compose up     # Start all services
docker-compose down   # Stop all services
```

## Environment Configuration
- Backend: `.env` file with database, JWT, email, and blockchain settings
- Frontend: `.env.local` with API URLs and public keys
- Contracts: `.env` with private keys and RPC URLs

## Key Dependencies
- **Backend**: Express, Prisma, Socket.io, Ethers, Multer, JWT
- **Frontend**: Next.js, React Query, Wagmi, Three.js, Tailwind
- **Contracts**: Hardhat, OpenZeppelin, Ethers