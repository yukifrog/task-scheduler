# Task Scheduler - GitHub Copilot Development Instructions

**ALWAYS follow these instructions first and only fallback to additional search and context gathering if the information here is incomplete or found to be in error.**

Task Scheduler is a modern, full-stack task management application built with Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL. This is a Japanese-language application with comprehensive CI/CD optimization features.

## Working Effectively

### Bootstrap, Build, and Test the Repository

**CRITICAL TIMEOUT WARNINGS**: 
- **NEVER CANCEL build commands** - they may take 30+ seconds
- **NEVER CANCEL dependency installation** - it takes 60+ seconds  
- **NEVER CANCEL Docker operations** - database setup takes 15+ seconds

```bash
# 1. Install dependencies (38 seconds actual, NEVER CANCEL - set 60+ second timeout)
npm install

# 2. Start PostgreSQL database with Docker (6 seconds, NEVER CANCEL - set 15+ second timeout) 
docker compose up -d postgres

# 3. Wait for database to be ready and run migrations (2 seconds)
sleep 5
npx prisma migrate deploy

# 4. Build application (19 seconds actual, NEVER CANCEL - set 30+ second timeout)
npm run build

# 5. Run unit tests (3.5 seconds actual, NEVER CANCEL - set 10+ second timeout)
npm run test:unit

# 6. Run linting (2.5 seconds)
npm run lint
```

### Environment Setup Requirements

**MANDATORY**: Create `.env.local` file with these exact values before running any commands:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskscheduler"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3001"
```

**Note**: Use port 3001 for development server to avoid conflicts. The Playwright configuration is pre-configured for this port.

### Run the Application

```bash
# Start development server (1 second startup)
PORT=3001 npm run dev

# Server will be available at: http://localhost:3001
# The application displays Japanese text: "タスクスケジューラー"
```

### Database Operations

```bash
# View database with Prisma Studio
npx prisma studio

# Reset database and apply all migrations
npx prisma migrate reset --force

# Generate Prisma client (automatic via postinstall, but manual if needed)
npx prisma generate --no-engine
```

## Testing

### Unit Testing
```bash
# Run all Jest unit tests (3.5 seconds, NEVER CANCEL - set 10+ second timeout)
npm run test:unit

# Run tests with coverage
npm run test:unit:coverage

# Run tests in watch mode
npm run test:unit:watch
```

### E2E Testing
```bash
# Install Playwright browsers (may fail due to network - known issue)
npx playwright install chromium

# Run E2E tests (requires dev server running on port 3001)
npm test

# Run E2E tests with UI
npm run test:ui

# Debug E2E tests
npm run test:debug

# View test reports
npm run test:report
```

### Validation and Health Checks
```bash
# Test application health (requires dev server running)
npm run test:health

# Validate test structure
npm run test:validate
```

## Validation Scenarios

**ALWAYS run these complete scenarios after making changes:**

### 1. Complete Development Setup Test
```bash
# Full setup from scratch (total time: ~70 seconds)
npm install                          # 60s timeout
docker compose up -d postgres        # 15s timeout  
sleep 5
npx prisma migrate deploy
PORT=3001 npm run dev &              # Background
sleep 3
npm run test:health                  # Verify app is working
```

### 2. Authentication and Core Functionality Test
**Manual validation required**: 
1. Navigate to http://localhost:3001
2. Verify Japanese text "タスクスケジューラー" appears
3. Click "サインイン" or navigate to /auth/signin
4. Test demo login functionality
5. Verify task management features are accessible

### 3. Build and Production Test
```bash
npm run build                        # 30s timeout
npm run start &                      # Start production server
sleep 3
# Test production build at http://localhost:3000
```

## Common Development Tasks

### Code Quality
```bash
# Run linting (2.5 seconds) 
npm run lint

# Run linting with auto-fix
npm run lint -- --fix

# Check TypeScript compilation
npx tsc --noEmit
```

### Performance and CI Tools
```bash
# Monitor CI performance
npm run ci:monitor

# Generate performance reports
npm run ci:report

# Analyze pull request changes
npm run pr:analyze

# Test security audit workflow
npm run security:test
```

### Database Development
```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# View database data
npx prisma studio

# Seed database (if seed file exists)
npx prisma db seed
```

## Repository Structure

### Key Directories
- **`src/app/`** - Next.js App Router pages and API routes
- **`src/components/`** - React components (TaskForm, TaskTimer, etc.)
- **`src/lib/`** - Utility functions and configurations
- **`tests/e2e/`** - Playwright E2E tests
- **`scripts/`** - Custom automation and CI scripts
- **`prisma/`** - Database schema, migrations, and configuration
- **`.github/workflows/`** - CI/CD GitHub Actions

### Important Files
- **`prisma/schema.prisma`** - Database schema (PostgreSQL only)
- **`playwright.config.ts`** - E2E test configuration (port 3001)
- **`package.json`** - All npm scripts and dependencies
- **`next.config.ts`** - Next.js configuration with Turbopack

## Build Times and Performance

### Expected Execution Times
- **Dependencies**: 38 seconds (set 60+ second timeout)
- **Build**: 19 seconds (set 30+ second timeout)  
- **Unit tests**: 3.5 seconds (set 10+ second timeout)
- **Linting**: 2.5 seconds
- **Dev server startup**: 1 second
- **Database setup**: 8 seconds total (6s Docker + 2s migrations)

### Performance Features
- **Turbopack**: Enabled for faster builds and dev server
- **Docker caching**: PostgreSQL data persists between restarts
- **Build cache**: Next.js build artifacts cached
- **CI optimization**: Comprehensive GitHub Actions caching strategy

## Troubleshooting

### Common Issues and Solutions

**Database connection errors:**
```bash
# Restart PostgreSQL
docker compose restart postgres
sleep 5
npx prisma migrate deploy
```

**Port conflicts:**
- Development server uses port 3001 (configured in Playwright)
- Production server uses port 3000
- Database uses port 5432
- Adminer (database UI) uses port 8080

**Playwright browser installation fails:**
- This is a known network issue in some environments
- E2E tests may not work, but unit tests and application will function normally
- Use npm run test:health for basic application validation

**Environment variable errors:**
- Ensure `.env.local` exists with correct DATABASE_URL
- Use PostgreSQL URL format, not SQLite
- NextAuth requires NEXTAUTH_SECRET and NEXTAUTH_URL

### Japanese Text Validation
The application uses Japanese text throughout. Key validation strings:
- Main page: "タスクスケジューラー" (Task Scheduler)
- Authentication: Check for login-related Japanese text
- Always verify Japanese text displays correctly after UI changes

## CI/CD and Automation

### Available Scripts Summary
- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build (NEVER CANCEL, 30s timeout)
- `npm run test` - E2E tests with Playwright  
- `npm run test:unit` - Jest unit tests (NEVER CANCEL, 10s timeout)
- `npm run lint` - ESLint code quality checks
- `npm run ci:monitor` - CI performance monitoring
- `npm run pr:analyze` - Pull request complexity analysis
- `npm run security:test` - Security audit testing

### Always Run Before Committing
```bash
npm run lint                         # Code quality
npm run test:unit                    # Unit tests (10s timeout)
npm run build                        # Production build (30s timeout)
npm run test:health                  # Application health check
```

This comprehensive setup ensures the Task Scheduler application runs correctly with all features functional for development, testing, and production deployment.