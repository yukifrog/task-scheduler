# Task Scheduler

A modern, full-stack task management application designed to help you organize your daily schedule with precision and flexibility.

## ✨ Features

- **Daily Task Management:** View and manage tasks for any given day.
- **Detailed Task Attributes:** Define tasks with priority, importance, estimated time, and more.
- **Task Timer:** A built-in timer to track actual time spent on tasks.
- **User Authentication:** Secure login system powered by Next-Auth.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://reactjs.org/) & [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [Next-Auth.js](https://next-auth.js.org/)
- **Testing:** [Playwright](https://playwright.dev/) (E2E) & [Jest](https://jestjs.io/) (Unit/Integration)
- **Linting:** [ESLint](https://eslint.org/)

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env` file in the root of the project and add the following environment variables.

```env
# .env

# Prisma - Database connection
# Example for PostgreSQL: "postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
DATABASE_URL="your_database_connection_string"

# NextAuth.js - Authentication
# A secret used to sign and encrypt tokens. Generate one: https://generate-secret.vercel.app/
NEXTAUTH_SECRET="your_nextauth_secret"
# The canonical URL of your site.
NEXTAUTH_URL="http://localhost:3000"

# Email (for NextAuth passwordless login, etc.)
# Example: "smtp://user:pass@smtp.example.com:587"
EMAIL_SERVER="your_email_server_connection_string"
EMAIL_FROM="noreply@example.com"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Migration

Apply the database schema to your database using Prisma.

```bash
npx prisma migrate dev
```

This command will also generate the Prisma Client, which is necessary for database access.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 Available Scripts

- `npm run dev`: Starts the development server with Turbopack.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run test`: Runs Playwright E2E tests.
- `npm run test:ui`: Runs Playwright E2E tests with the interactive UI mode.
- `npm run test:unit`: Runs Jest unit tests.
- `npm run test:unit:coverage`: Runs Jest and generates a test coverage report.
- `npm run test:report`: Shows the last Playwright test report.
- `npm run security:test`: Tests the security audit workflow logic and validation.

## ⚡ CI/CD Optimization

This project implements comprehensive GitHub Actions caching to significantly reduce CI pipeline execution time:

### Performance Improvements
- **Playwright Browsers**: Only installs chromium (per config), cached between runs
- **Dependencies**: Aggressive npm caching with `--prefer-offline --no-audit`
- **Build Cache**: Next.js build artifacts cached for faster incremental builds  
- **Database**: Prisma client generation cached based on schema changes

### Expected Performance
- **Before**: 4-6 minutes pipeline execution
- **After**: 1.5-2.5 minutes pipeline execution (~60% faster)
- **Cache Hit Rate**: 85-95% for repeat builds with no dependency changes

See [Caching Strategy](.github/CACHING_STRATEGY.md) for detailed documentation.

### Performance Monitoring
Real-time CI performance monitoring and metrics dashboard:
- **Dashboard**: Visit `/ci-performance` to view current metrics
- **Automated Monitoring**: Runs every 6 hours with alerting
- **Performance Reports**: Comprehensive HTML reports with charts
- **Alerting**: Automatic issue creation for performance degradation

See [CI Performance Monitoring](.github/CI_PERFORMANCE_MONITORING.md) for complete documentation.

### Testing Cache Performance
```bash
# Trigger cache test workflow manually
gh workflow run test-cache.yml

# Monitor CI performance
npm run ci:monitor

# Generate performance report
npm run ci:report
```

## 🔒 Security

### Daily Security Audit
Automated vulnerability scanning runs daily to ensure dependency security:
- **Schedule**: Daily at 2 AM UTC via GitHub Actions
- **Tool**: npm audit with moderate+ severity threshold  
- **Alerting**: Automatic GitHub issue creation for critical/high vulnerabilities
- **Reports**: JSON and human-readable outputs with 30-day retention

```bash
# Test security audit workflow
npm run security:test

# Manual security audit  
npm audit --audit-level moderate
```

See [Security Audit Documentation](.github/SECURITY_AUDIT.md) for complete details.