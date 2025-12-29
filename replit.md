# MathVerse - Math Quiz Game with Rewards

## Overview

MathVerse is a gamified math learning application where users solve randomly generated math problems to earn virtual coins. The platform features user authentication via Replit Auth, a coin-based reward/penalty system, withdrawal requests for accumulated coins, and an admin dashboard for managing settings and approving withdrawals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration and CSS variables
- **Animations**: Framer Motion for smooth transitions and feedback
- **Build Tool**: Vite for development and production builds

The frontend follows a pages-based structure with protected routes. Key pages include Home (landing), Dashboard (game interface), and Admin (management panel). Components are organized into UI primitives and feature-specific components.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation
- **Authentication**: Replit Auth integration using OpenID Connect with Passport.js
- **Session Management**: Express sessions stored in PostgreSQL via connect-pg-simple

The server handles math question generation, answer validation, coin balance updates, and withdrawal management. In-memory storage is used for active math questions to prevent answer caching.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` and `shared/models/auth.ts`
- **Key Tables**:
  - `users`: Player profiles with coins, stats, and admin flags
  - `sessions`: Authentication session storage
  - `withdrawals`: Coin withdrawal requests with status tracking
  - `settings`: Configurable reward/penalty amounts and conversion rates

### Authentication Flow
- Replit Auth handles user authentication via OpenID Connect
- Sessions persist for 7 days in the database
- Protected routes check authentication status before rendering
- Admin routes additionally verify `isAdmin` flag on user record

### Game Mechanics
- Random math questions generated server-side (addition, subtraction, multiplication)
- Question IDs stored temporarily in memory to validate answers
- Correct answers add coins; incorrect answers deduct coins (configurable via settings)
- Coins cannot go below zero

## External Dependencies

### Third-Party Services
- **Replit Auth**: OAuth/OpenID Connect authentication provider
- **PostgreSQL**: Database provisioned via Replit's database integration

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `express-session` / `connect-pg-simple`: Session management
- `passport` / `openid-client`: Authentication middleware
- `@tanstack/react-query`: Data fetching and caching
- `zod`: Schema validation for API requests/responses
- `framer-motion`: Animation library
- `canvas-confetti`: Celebration effects for correct answers

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `ISSUER_URL`: Replit Auth issuer (defaults to https://replit.com/oidc)
- `REPL_ID`: Automatically provided by Replit environment