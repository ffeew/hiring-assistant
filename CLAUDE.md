# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking without emitting files

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

- `src/app/api/extract/` - Follows 3-layer architecture with `extract.validator.ts`, `extract.service.ts`, and `route.ts`
- Mistral AI OCR integration for PDF/DOCX resume parsing with structured data extraction
- Supports bulk resume upload with concurrent file processing using Promise.allSettled
- Type-safe JSON handling for metadata parsing with `@/lib/json-utils.ts`
- Duplicate detection via file hashing with R2 storage integration

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

**API Route Architecture (MANDATORY PATTERN)**
This application follows a strict 3-layer architecture for all API routes. **ALL new API routes MUST follow this pattern:**

1. **Validator Layer** (`*.validator.ts`)

   - Contains Zod schemas for request validation (query, body, params)
   - Reuses existing schemas from `src/app/types/index.ts` when possible
   - Example: `getApplicantsQuerySchema`, `createApplicantBodySchema`, `applicantParamsSchema`

2. **Service Layer** (`*.service.ts`)

   - Contains ALL business logic and database operations
   - Static class methods for consistency
   - Handles transactions, error throwing, data transformation
   - Example: `ApplicantsService.getApplicants()`, `JobPostsService.createJobPost()`

3. **Controller Layer** (`route.ts`)
   - ONLY handles HTTP concerns: validation → service → response
   - Uses validators to validate input
   - Calls appropriate service methods
   - Handles HTTP status codes and error responses
   - NO business logic in controllers

**Example Structure:**

```
src/app/api/example/
├── example.validator.ts    # Zod schemas
├── example.service.ts      # Business logic
└── route.ts               # HTTP controller
```

**Controller Pattern (ENFORCED STANDARD):**

```typescript
async function createExample(request: AuthenticatedRequest) {
	try {
		const body = await request.json();
		const validatedData = createExampleBodySchema.parse(body);
		const result = await ExampleService.create(request.user.id, validatedData);
		return NextResponse.json({ success: true, data: result });
	} catch (error) {
		// Standardized error handling - ALL controllers must follow this pattern
		if (error instanceof ZodError) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: error.errors.map((e) => ({
						field: e.path.join("."),
						message: e.message,
					})),
				},
				{ status: 400 }
			);
		}

		// Business logic errors
		if (error instanceof Error && error.message.includes('specific-condition')) {
			return NextResponse.json(
				{ 
					error: 'Business logic error',
					details: [{ field: 'fieldName', message: error.message }]
				},
				{ status: 400 }
			);
		}

		// Generic server errors
		console.error('Error in createExample:', error);
		return NextResponse.json(
			{ 
				error: 'Internal server error',
				details: [{ field: 'server', message: 'Failed to create example' }]
			},
			{ status: 500 }
		);
	}
}
```

**Environment Configuration**

- `src/lib/env.ts` provides Zod-based environment validation for core services
- Validates essential configuration: Mistral AI, Better Auth, and Turso database
- User-specific configuration (email, company details) stored in database per user
- Environment status debugging via `getEnvironmentStatus()`

**Data Fetching Architecture**

- TanStack Query (`@tanstack/react-query`) for server state management
- Centralized query provider in `src/app/providers/query-provider.tsx` with global configuration
- Query caching with 1-minute stale time and smart invalidation strategies
- Optimistic updates and automatic error handling with rollback
- Background refetching and request deduplication

**Query Hook Organization**

- **Global Hooks**: `src/app/hooks/` for app-wide data fetching (job posts, hiring workflow)
- **Feature-Specific Queries**: Organize in `query/` subdirectories within feature folders
- **Example Structure**: `src/app/interview-assistant/query/` contains:
  - `use-applicants.ts` - Applicant data fetching
  - `use-job-posts.ts` - Job post data fetching  
  - `use-resume-files.ts` - Resume file data with invalidation utilities
- **Pattern**: Each hook exports a single `useQuery` hook with typed interfaces
- **Invalidation**: Separate utility functions for query invalidation (e.g., `invalidateResumeFiles()`)

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

**Error Handling Strategy (ENFORCED STANDARD)**

- **Consistent Error Format**: All API routes return `{ error: string, details: Array<{ field: string, message: string }> }`
- **Type-Safe Error Handling**: ZodError, SDKError, and business logic errors handled uniformly
- **Graceful Failure Handling**: Promise.allSettled for concurrent operations
- **Field-Specific Errors**: Detailed error information for better debugging and user experience

**AI Integration Architecture**

- **Mistral AI**: OCR for resume parsing with structured output via Zod schemas
- **Groq AI**: Interview assistant for generating screening questions (`@ai-sdk/groq`)
- **Type-Safe AI Responses**: All AI outputs validated with Zod schemas before processing
- **File Processing**: Supports PDF (base64) and DOCX (file upload) with type validation

### API Routes Structure

All API routes follow the validator/service/controller pattern:

- `/api/applicants` - Applicant management (GET, POST) with `applicants.validator.ts` & `applicants.service.ts`
- `/api/applicants/[id]` - Individual applicant operations (GET, PUT, DELETE)
- `/api/job-posts` - Job posts CRUD operations (GET, POST) with `job-posts.validator.ts` & `job-posts.service.ts`
- `/api/job-posts/[id]` - Individual job post operations (GET, PUT, DELETE)
- `/api/resumes` - Resume file management (GET, POST) with `resumes.validator.ts` & `resumes.service.ts`
- `/api/resumes/[id]` - Individual resume file operations (GET, PUT, DELETE)
- `/api/profile` - User profile management (GET, PATCH) with `profile.validator.ts` & `profile.service.ts`
- `/api/email` - Bulk email sending with `email.validator.ts` & existing `email.service.ts`
- `/api/email/preview` - Email template preview generation
- `/api/extract` - Resume data extraction with authentication and existing service layer
- `/api/auth/[...all]` - Better Auth endpoints for login/signup

## Development Guidelines

### API Development Rules (ENFORCED STANDARDS)

When creating or modifying API routes, you MUST:

1. **Follow the 3-layer pattern** - Always create validator, service, and controller layers
2. **Reuse existing Zod schemas** - Check `src/app/types/index.ts` first before creating new schemas
3. **Use standardized error handling** - Return `{ error, details }` format for all errors
4. **Implement proper authentication** - Use `withAuth` or `withAuthParams` middleware
5. **Include soft delete support** - Use `withNotDeleted` and `softDeleteData` from `@/lib/soft-delete`
6. **Use transactions** - Wrap database operations in `withTransaction` when needed
7. **Use type-safe JSON parsing** - Always use `@/lib/json-utils.ts` functions for JSON fields
8. **Validate all inputs** - Use Zod schemas for comprehensive request validation
9. **Handle concurrent operations** - Use Promise.allSettled for bulk operations
10. **Maintain type safety** - Import types from validators, not from global types file
11. **Verify type correctness** - Run `npm run typecheck` before committing changes

### File Naming Conventions

- `*.validator.ts` - Zod schemas and validation logic
- `*.service.ts` - Business logic and database operations
- `route.ts` - HTTP controllers only
- Use kebab-case for directory names (`job-posts`, not `jobPosts`)

### Service Class Pattern

```typescript
export class ExampleService {
	static async getItems(userId: string, query: GetItemsQuery) {
		// Implementation with database operations
	}

	static async createItem(userId: string, data: CreateItemBody) {
		// Implementation with validation and creation
	}

	static async updateItem(
		userId: string,
		itemId: string,
		data: UpdateItemBody
	) {
		// Implementation with existence check and update
	}

	static async deleteItem(userId: string, itemId: string) {
		// Implementation with soft delete
	}
}
```

### JSON Field Handling (ENFORCED STANDARD)

All JSON fields stored in the database MUST use type-safe parsing utilities from `@/lib/json-utils.ts`:

**Available Functions:**
- `safeParseJSON<T>()` - Parse with schema validation and fallback
- `safeParseJSONArray<T>()` - Parse JSON arrays with item validation
- `safeParseJSONObject<T>()` - Parse JSON objects with schema validation

**Pre-defined Schemas:**
- `requirementsSchema` - For job post requirements arrays
- `responsibilitiesSchema` - For job post responsibilities arrays
- `benefitsSchema` - For job post benefits arrays
- `applicantMetadataSchema` - For applicant metadata objects
- `experienceSchema` / `educationSchema` - For nested resume data

**Usage Example:**
```typescript
import { safeParseJSONArray, requirementsSchema } from '@/lib/json-utils';

// Instead of: JSON.parse(jobPost.requirements) || []
const requirements = safeParseJSONArray(jobPost.requirements, requirementsSchema);

// Instead of: JSON.parse(applicant.metadata) || null  
const metadata = safeParseJSONObject(applicant.metadata, applicantMetadataSchema);
```

**Benefits:**
- ✅ Type safety with Zod validation
- ✅ Graceful error handling with fallbacks
- ✅ Consistent parsing across the application
- ✅ Automatic logging of parsing failures

### Type Management (ENFORCED STANDARD)

**Type Import Strategy:**
- Import types from their source validators: `import type { CreateJobPostBody } from './job-posts.validator'`
- Global types in `@/app/types/index.ts` re-export validator types for frontend use
- Never duplicate type definitions - always use single source of truth

**Type Consolidation:**
- `ExtractedData` is now an alias for `ExtractionResponseData` from extract validator
- All API response types follow consistent patterns with optional fields
- JSON field types validated with Zod schemas on parse operations

### Query Development Rules (ENFORCED STANDARDS)

**File Organization:**
1. **Global Queries**: Place in `src/app/hooks/` for app-wide data (job posts, hiring workflow)
2. **Feature Queries**: Create `query/` subdirectories within feature folders (e.g., `src/app/interview-assistant/query/`)
3. **Naming Convention**: Use descriptive names like `use-applicants.ts`, `use-resume-files.ts`

**Hook Structure (MANDATORY PATTERN):**
```typescript
// Each query file must follow this pattern
"use client";

import { useQuery } from "@tanstack/react-query";

interface DataType {
  id: string;
  // ... other fields
}

async function fetchData(): Promise<DataType[]> {
  const response = await fetch("/api/endpoint");
  if (!response.ok) throw new Error("Failed to fetch data");
  const result = await response.json();
  return result.data;
}

export function useDataName() {
  return useQuery({
    queryKey: ["data-name"],
    queryFn: fetchData,
    staleTime: 0, // Customize as needed
  });
}
```

**Query Invalidation (MANDATORY PATTERN):**
```typescript
// Separate invalidation utilities
import { queryClient } from "@/app/providers/query-provider";

export function invalidateDataName() {
  return queryClient.invalidateQueries({ queryKey: ["data-name"] });
}
```

**Usage in Components:**
```typescript
// Import individual hooks
import { useApplicants } from "./query/use-applicants";
import { invalidateResumeFiles } from "./query/use-resume-files";

// Use in event handlers, not useEffect
<Select 
  onValueChange={(value) => {
    field.onChange(value);
    invalidateResumeFiles(); // Trigger refetch
  }}
/>
```

**Query Configuration Rules:**
- Use `staleTime: 0` for frequently changing data (resumes, real-time updates)
- Use `staleTime: 60 * 1000` (1 minute) for relatively stable data (job posts, applicants)
- Always handle loading and error states in components
- Use typed interfaces for all API responses

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, next-themes
- **UI Components**: shadcn/ui with Radix UI primitives and Lucide React icons
- **Backend**: Next.js API routes with 3-layer architecture (validator/service/controller)
- **Database**: Drizzle ORM with LibSQL/Turso, soft delete support
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation (mandatory pattern)
- **AI**: Mistral AI OCR for resume parsing, Groq AI for interview questions
- **Auth**: Better Auth with email/password authentication
- **Email**: Gmail SMTP with Nodemailer and template system
- **File Storage**: Cloudflare R2 for resume file storage
- **Validation**: Zod schemas for all data validation and type safety

## UI Component System (shadcn/ui)

This application uses **shadcn/ui** as the primary component library for consistent, accessible, and modern UI design.

### Component Architecture

**Component Location**: All shadcn/ui components are installed in `src/components/ui/` and imported from `@/components/ui/*`

**Design System Features**:

- Built on Radix UI primitives for accessibility
- Fully customizable with CSS variables
- Dark mode support with next-themes integration
- TypeScript support with proper type definitions
- Consistent design tokens and spacing

### Installed Components

The following shadcn/ui components are available and actively used:

#### Core Components

- **Button** (`@/components/ui/button`) - Primary actions, variants: default, destructive, outline, secondary, ghost, link
- **Card** (`@/components/ui/card`) - Content containers with CardHeader, CardContent, CardDescription, CardTitle
- **Badge** (`@/components/ui/badge`) - Status indicators, variants: default, secondary, destructive, outline
- **Input** (`@/components/ui/input`) - Text inputs with proper validation states
- **Textarea** (`@/components/ui/textarea`) - Multi-line text inputs

#### Form Components

- **Form** (`@/components/ui/form`) - Form wrapper with FormField, FormItem, FormLabel, FormControl, FormMessage
- **Select** (`@/components/ui/select`) - Dropdown selections with SelectTrigger, SelectContent, SelectItem, SelectValue
- **Alert** (`@/components/ui/alert`) - Status messages with AlertDescription, variants: default, destructive

#### Layout Components

- **Dialog** (`@/components/ui/dialog`) - Modal dialogs with DialogContent, DialogHeader, DialogTitle, DialogDescription
- **Table** (`@/components/ui/table`) - Data tables with TableHeader, TableBody, TableRow, TableHead, TableCell
- **Separator** (`@/components/ui/separator`) - Visual dividers
- **ScrollArea** (`@/components/ui/scroll-area`) - Custom scrollable areas

### Usage Patterns

#### Form Pattern (MANDATORY)

All forms MUST use React Hook Form + Zod + shadcn/ui Form components:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
	email: z.string().email("Invalid email address"),
	name: z.string().min(1, "Name is required"),
});

function ExampleForm() {
	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: { email: "", name: "" },
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="Enter email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Submit</Button>
			</form>
		</Form>
	);
}
```

#### Modal Pattern

Use Dialog components for all modals with proper state management:

```typescript
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

function ExampleModal({ isOpen, onClose, children }) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Modal Title</DialogTitle>
					<DialogDescription>Modal description</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}
```

#### Table Pattern

Use Table components for all data display:

```typescript
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function DataTable({ data }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Data Table</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Column 1</TableHead>
							<TableHead>Column 2</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((item) => (
							<TableRow key={item.id}>
								<TableCell>{item.field1}</TableCell>
								<TableCell>{item.field2}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
```

### Component Guidelines

#### Icon Usage

- **Primary Icons**: Use Lucide React icons exclusively (`lucide-react`)
- **Icon Sizing**: Standard sizes are h-3 w-3, h-4 w-4, h-5 w-5 for consistent scale
- **Icon Placement**: Always place icons before text with proper spacing (`gap-2`)

#### Loading States

- Use the custom `LoadingSpinner` component for async operations
- Disable interactive elements during loading states
- Provide clear loading text alongside spinners

#### Error Handling

- Use Alert components with `variant="destructive"` for errors
- Include appropriate icons (AlertCircle, XCircle) for visual clarity
- Provide actionable error messages when possible

#### Responsive Design

- Use responsive Tailwind classes (`sm:`, `md:`, `lg:`)
- Ensure components work well on mobile devices
- Use appropriate spacing and sizing for different viewports

### Styling Conventions

#### Color Usage

- **Primary Actions**: Use Button default variant or `bg-primary` classes
- **Secondary Actions**: Use Button outline or secondary variants
- **Destructive Actions**: Use `variant="destructive"` for delete/remove actions
- **Status Indicators**: Use Badge components with appropriate variants

#### Spacing

- **Form Spacing**: Use `space-y-4` or `space-y-6` for form field containers
- **Card Spacing**: Standard CardContent padding is handled automatically
- **Layout Spacing**: Use consistent gap classes (`gap-2`, `gap-3`, `gap-4`)

#### Component Customization

- Extend components using className prop with Tailwind utilities
- Use CSS variables for theme customization in `globals.css`
- Maintain design consistency across all components

### Adding New Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

**Installation Examples**:

- `npx shadcn@latest add dropdown-menu`
- `npx shadcn@latest add toast`
- `npx shadcn@latest add checkbox`

## React Hooks Usage Guidelines

### useEffect Usage Policy

**CRITICAL: Avoid useEffect unless absolutely necessary.** Most use cases can be handled with event handlers, component state, or React Query.

#### When NOT to use useEffect (Most Common Cases)

1. **Event Handling**: Use onChange, onClick, onSubmit handlers instead
   ```typescript
   // ❌ WRONG - Don't use useEffect for event responses
   useEffect(() => {
     if (selectedJobPostId) {
       queryClient.invalidateQueries({ queryKey: ["resume-files"] });
     }
   }, [selectedJobPostId, queryClient]);

   // ✅ CORRECT - Use event handlers
   <Select 
     onValueChange={(value) => {
       field.onChange(value);
       queryClient.invalidateQueries({ queryKey: ["resume-files"] });
     }}
   />
   ```

2. **Data Fetching**: Use TanStack Query (React Query) instead
   ```typescript
   // ❌ WRONG - Don't use useEffect for data fetching
   useEffect(() => {
     fetchData().then(setData);
   }, []);

   // ✅ CORRECT - Use React Query
   const { data } = useQuery({
     queryKey: ["data"],
     queryFn: fetchData,
   });
   ```

3. **Form State Updates**: Use form libraries like React Hook Form
   ```typescript
   // ❌ WRONG - Don't use useEffect for form state
   useEffect(() => {
     if (defaultValues) {
       setFormData(defaultValues);
     }
   }, [defaultValues]);

   // ✅ CORRECT - Use React Hook Form defaultValues
   const form = useForm({
     defaultValues: defaultValues,
   });
   ```

#### When useEffect IS Appropriate (Rare Cases)

1. **Cleanup operations** (timers, subscriptions, event listeners)
2. **Direct DOM manipulation** that can't be handled declaratively
3. **Integration with third-party libraries** that require imperative setup
4. **Window/document event listeners** for global state

#### Examples of Proper useEffect Usage

```typescript
// ✅ CORRECT - Cleanup timers
useEffect(() => {
  const timer = setInterval(() => {
    // polling logic
  }, 5000);
  
  return () => clearInterval(timer);
}, []);

// ✅ CORRECT - Third-party library integration
useEffect(() => {
  const chart = new Chart(canvasRef.current, config);
  return () => chart.destroy();
}, []);
```

### Alternative Patterns

#### Event-Driven Updates
Instead of useEffect, trigger actions in response to user events:

```typescript
// ✅ PREFERRED - Event handlers
const handleJobPostChange = (jobPostId: string) => {
  form.setValue('jobPostId', jobPostId);
  queryClient.invalidateQueries({ queryKey: ["resumes"] });
  resetForm();
};
```

#### React Query for Server State
Use React Query for all server state management:

```typescript
// ✅ PREFERRED - React Query with dependencies
const { data: resumes } = useQuery({
  queryKey: ["resumes", selectedJobPostId, selectedApplicantId],
  queryFn: () => fetchResumes({ jobPostId: selectedJobPostId, applicantId: selectedApplicantId }),
  enabled: !!selectedJobPostId && !!selectedApplicantId,
});
```

#### Derived State
Calculate derived state during render instead of useEffect:

```typescript
// ✅ PREFERRED - Computed during render
const availableResumes = useMemo(() => 
  resumeFiles.filter(resume => 
    resume.applicantId === selectedApplicantId &&
    resume.jobPostId === selectedJobPostId
  ), [resumeFiles, selectedApplicantId, selectedJobPostId]
);
```

### Enforcement Rules

1. **Code Review**: Any useEffect must be justified in PR description
2. **Alternatives First**: Always consider event handlers, React Query, or useMemo first
3. **Cleanup Required**: All useEffect with side effects must include cleanup
4. **Dependency Arrays**: Must be exhaustive and correct (use ESLint rules)

Following these guidelines ensures predictable, maintainable, and performant React components.
