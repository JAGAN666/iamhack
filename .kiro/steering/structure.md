# Project Structure & Organization

## Root Directory Structure
```
academic-nft-marketplace/
├── backend/           # Node.js API server
├── frontend/          # Next.js React application
├── contracts/         # Ethereum smart contracts
├── scripts/           # Deployment and utility scripts
├── docs/              # Documentation
├── docker-compose.yml # Multi-service development setup
└── package.json       # Root package with workspace scripts
```

## Backend Structure (`/backend`)
```
backend/
├── src/
│   ├── config/        # Database, Redis, environment configuration
│   ├── middleware/    # Auth, security, validation middleware
│   ├── routes/        # API route handlers (auth, users, achievements, nfts, etc.)
│   ├── services/      # Business logic (AI verification, blockchain, email, etc.)
│   ├── utils/         # Utility functions and helpers
│   └── server.ts      # Main application entry point
├── prisma/
│   ├── schema.prisma  # Database schema definition
│   └── dev.db         # SQLite development database
├── uploads/           # File upload storage (achievements, profiles, resumes)
├── dist/              # Compiled TypeScript output
└── package.json       # Backend dependencies and scripts
```

## Frontend Structure (`/frontend`)
```
frontend/
├── pages/             # Next.js pages (file-based routing)
│   ├── achievements/  # Achievement management pages
│   ├── analytics/     # Analytics and insights pages
│   ├── nfts/          # NFT gallery and management
│   └── _app.tsx       # App wrapper with providers
├── src/
│   ├── components/    # Reusable React components
│   │   ├── 3D/        # Three.js 3D components
│   │   ├── Analytics/ # Charts and data visualization
│   │   ├── Dashboard/ # Dashboard-specific components
│   │   ├── Layout/    # Navigation and layout components
│   │   ├── Mobile/    # Mobile-optimized components
│   │   └── PWA/       # Progressive Web App components
│   ├── contexts/      # React Context providers (Auth, Wallet, WebSocket)
│   ├── lib/           # API clients and utilities
│   ├── styles/        # Global CSS and Tailwind styles
│   └── types/         # TypeScript type definitions
├── public/            # Static assets (icons, manifest, service worker)
└── .next/             # Next.js build output
```

## Smart Contracts Structure (`/contracts`)
```
contracts/
├── contracts/         # Solidity smart contracts
│   ├── AcademicAchievementNFT.sol  # Main NFT contract
│   └── AccessGatekeeper.sol        # Access control contract
├── scripts/           # Deployment scripts
├── hardhat.config.ts  # Hardhat configuration
└── package.json       # Contract dependencies
```

## Key Architectural Patterns

### Backend Patterns
- **Layered Architecture**: Routes → Services → Database
- **Middleware Chain**: Security → Auth → Validation → Route Handler
- **Service Layer**: Business logic separated from route handlers
- **Prisma ORM**: Type-safe database operations with schema-first approach

### Frontend Patterns
- **Component Composition**: Reusable components with clear separation of concerns
- **Context Providers**: Global state management for auth, wallet, and WebSocket
- **Custom Hooks**: Encapsulated logic for API calls and state management
- **File-based Routing**: Next.js pages directory for automatic route generation

### Database Schema
- **User-centric**: Users have achievements, NFTs, and access grants
- **Achievement Types**: GPA, research, leadership with verification workflow
- **Social Features**: Posts, likes, endorsements for gamification
- **Access Control**: Role-based permissions and opportunity gating

## File Naming Conventions
- **Components**: PascalCase (e.g., `AchievementCard.tsx`)
- **Pages**: kebab-case (e.g., `real-time.tsx`)
- **Utilities**: camelCase (e.g., `validation.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Types**: PascalCase with descriptive suffixes (e.g., `UserProfile`, `AchievementData`)

## Import Organization
1. External libraries (React, Next.js, etc.)
2. Internal utilities and types
3. Components (from most general to most specific)
4. Relative imports (./components, ../utils)

## Environment-Specific Files
- **Development**: `.env`, `.env.local`, `dev.db`
- **Production**: `.env.production`, PostgreSQL database
- **Docker**: `docker-compose.yml` for local multi-service development