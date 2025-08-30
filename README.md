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