# copilot-instructions.md

This file provides guidance to Github Copilot when working with code in this repository.

## Commands

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database

- `npx drizzle-kit generate` - Generate database migrations
- `npx drizzle-kit migrate` - Run database migrations
- `npx drizzle-kit studio` - Open Drizzle Studio for database inspection

## Architecture

This is a **Next.js 15 hiring assistant application** that automates resume processing and candidate email communication using AI.

### Core Components

**Authentication System**

- Uses Better Auth with Drizzle adapter for session management
- Database schema in `src/lib/db/schema.ts` defines user, session, account, and verification tables
- All API routes require authentication via session validation

**AI-Powered Resume Processing Pipeline**

- `src/app/api/extract/extract.service.ts` - Mistral AI OCR integration for PDF/DOCX resume parsing
- `src/app/api/extract/route.ts` - API endpoint with authentication and error handling
- Supports bulk resume upload with structured data extraction (firstName, lastName, email)
- Uses Promise.allSettled for concurrent file processing with individual error handling
- Structured output via Zod schemas with Mistral's responseFormatFromZodObject

**Email Communication System**

- `src/app/api/email/email.service.ts` - Nodemailer integration with Gmail SMTP
- Two template types: acknowledgment and screening emails in `src/app/api/email/templates/`
- Company branding support via environment variables
- Bulk email sending with 1-second rate limiting to avoid Gmail throttling
- Email preview functionality before sending

**Job Posts Management System**

- `src/lib/db/schema.ts` - Job post table with comprehensive fields (title, description, requirements, etc.)
- `src/app/api/job-posts/` - Complete CRUD API routes for job advertisements
- `src/app/components/job-posts/` - Job post management UI with React Hook Form validation
- Integration with email workflow for position selection
- Support for job post status management (active/inactive)

**Database Layer**

- Drizzle ORM with LibSQL/Turso as the database provider
- Configuration in `drizzle.config.ts` with Turso credentials
- Connection management in `src/lib/db/db.ts`

### Key Architectural Patterns

**Environment Configuration**

- `src/lib/env.ts` provides Zod-based environment validation for core services
- Validates essential configuration: Mistral AI, Better Auth, and Turso database
- User-specific configuration (email, company details) stored in database per user
- Environment status debugging via `getEnvironmentStatus()`

**Data Fetching Architecture**

- TanStack Query (`@tanstack/react-query`) for server state management
- Custom hooks in `src/app/hooks/use-job-posts.ts` for job posts CRUD operations
- Query caching with 1-minute stale time and smart invalidation strategies
- Optimistic updates and automatic error handling with rollback
- Background refetching and request deduplication

**State Management & UI Flow**

- Custom hook `src/app/hooks/use-hiring-assistant.ts` orchestrates the entire hiring workflow
- Manages file upload → data extraction → email preview → bulk sending pipeline
- TanStack Query integration for job posts fetching with loading states
- Template selection per candidate with default to SCREENING template

**Security Architecture**

- AES-256-GCM encryption for sensitive data (Gmail app passwords)
- PBKDF2 key derivation with 100,000 iterations using BETTER_AUTH_SECRET
- Salt-based encryption with unique salt per encrypted value
- Automatic encryption/decryption in API layer with password masking in responses
- `src/lib/crypto.ts` provides secure encryption utilities with authentication

**Error Handling Strategy**

- API routes use Promise.allSettled for graceful failure handling
- Individual file processing errors don't block other files
- Mistral SDK errors are parsed and returned with meaningful messages
- Email sending tracks success/failure counts with detailed error reporting

**AI Integration Architecture**

- Recent addition of `@ai-sdk/groq` and `ai` packages (v4.3.19) suggests planned Groq AI integration
- Current implementation uses Mistral AI OCR with structured output
- File type validation ensures only supported formats (PDF/DOCX) are processed
- Base64 encoding for PDFs, file upload for DOCX documents to Mistral

### API Routes Structure

- `/api/extract` - Resume data extraction with authentication
- `/api/email` - Bulk email sending
- `/api/email/preview` - Email template preview generation
- `/api/job-posts` - Job posts CRUD operations (GET, POST)
- `/api/job-posts/[id]` - Individual job post operations (GET, PUT, DELETE)
- `/api/auth/[...all]` - Better Auth endpoints for login/signup

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, next-themes
- **Backend**: Next.js API routes, Nodemailer for email
- **Database**: Drizzle ORM with LibSQL/Turso
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **AI**: Mistral AI OCR, planned Groq integration via AI SDK
- **Auth**: Better Auth with email/password authentication
- **Email**: Gmail SMTP with template system
