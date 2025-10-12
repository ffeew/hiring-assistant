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

**Email Communication & Template System**

This application features a comprehensive email system with AI-powered template generation and intelligent template selection:

**Core Email Infrastructure**:

- `src/app/api/email/email.service.ts` - Nodemailer integration with Gmail SMTP
- **Optional Configuration**: Users can sign up without Gmail setup, configure later in profile
- **Validation Methods**: `EmailService.hasCompleteConfiguration()` and `EmailService.validateConfiguration()`
- **Rate Limiting**: 1-second delay between emails to avoid Gmail throttling
- Company branding support via user profile settings
- Email preview functionality before sending

**AI-Powered Template Management**:

- `src/app/api/email-templates/` - Complete CRUD operations following 3-layer architecture
- `src/app/api/email-templates/generate/` - AI template generation using Groq AI (GPT OSS 120B)
- `src/lib/db/schema.ts` - EmailTemplate table with comprehensive fields
- **AI Generation**: Natural language to professional email template conversion
- **Category-Aware**: Templates for acknowledgment, screening, interview, offer, rejection, follow_up
- **Multiple Tones**: Professional, friendly, formal, and casual writing styles
- **Template Editor**: Rich editing interface with live preview and click-to-insert variables
- **Usage Tracking**: Template usage statistics and last updated timestamps

**Dynamic Template Variables** (15+ variables from Mistral OCR extraction):

- `src/lib/template-engine.ts` - Template rendering engine
- **Candidate Data**: firstName, lastName, email, phone, jobPosition, companyName
- **Professional Links**: linkedinUrl, githubUrl, portfolioUrl
- **Resume Data**: skills (arrays), experience (formatted), education (formatted)
- **Automatic Variable Integration**: All variables available in template editor

**Intelligent Template Selection**:

- `src/app/api/extract/template-selection.service.ts` - Auto-assigns templates during resume processing
- **Default Priority**: Uses template marked with `isDefault: true` for category
- **First Template Fallback**: Automatically uses first available template when no default exists
- **Template Validation**: Frontend validates all extractions have templates before sending emails
- **User Guidance**: Clear warnings and actionable guidance when templates are missing

**Job Posts Management System**

- `src/lib/db/schema.ts` - Job post table with comprehensive fields (title, description, requirements, etc.)
- `src/app/api/job-posts/` - Complete CRUD API routes for job advertisements
- `src/app/job-posts/components/` - Job post management UI with React Hook Form validation
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

**Controller Pattern with Standardized Error Handling (ENFORCED STANDARD):**

All controllers must follow this error handling pattern with consistent response format:

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
		if (
			error instanceof Error &&
			error.message.includes("specific-condition")
		) {
			return NextResponse.json(
				{
					error: "Business logic error",
					details: [{ field: "fieldName", message: error.message }],
				},
				{ status: 400 }
			);
		}

		// Generic server errors
		console.error("Error in createExample:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details: [{ field: "server", message: "Failed to create example" }],
			},
			{ status: 500 }
		);
	}
}
```

**Error Handling Principles**:

- **Consistent Format**: All errors return `{ error: string, details: Array<{ field: string, message: string }> }`
- **Type-Safe Handling**: ZodError, SDKError, and business logic errors handled uniformly
- **Graceful Failures**: Use Promise.allSettled for concurrent operations
- **Field-Specific Errors**: Detailed information for better debugging and UX

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

**Component & Hook Organization (LCA Pattern)**

This application follows the **"Lowest Common Ancestor" (LCA)** principle for organizing both components and hooks:

- **Feature-Specific Components**: Create `components/`, `queries/`, and `mutations/` subdirectories within feature folders
- **Shared Resources**: Place in the feature folder that owns the resource (e.g., `job-posts/queries/`)
- **Co-location**: Components and hooks live closest to where they are used, moving up the tree only when shared across multiple features

**Directory Structure:**

```
src/app/
├── components/              # App-wide shared components only
│   ├── layout/             # Dashboard layout, header, sidebar
│   ├── shared/             # Truly shared utilities (3+ features)
│   │   ├── loading-spinner.tsx
│   │   ├── theme-toggle.tsx
│   │   └── background-pattern.tsx
│   ├── auth/               # Authentication components
│   ├── landing/            # Landing page sections
│   └── interview-assistant/  # Shared interview component
├── home/                   # Resume processing feature
│   ├── components/         # Feature-specific UI components
│   │   ├── home-content.tsx
│   │   ├── email-preview-modal.tsx
│   │   ├── job-post-selector.tsx
│   │   ├── results-table.tsx
│   │   ├── file-upload-section.tsx
│   │   └── feature-card.tsx
│   ├── queries/
│   │   └── use-resume-mutations.ts
│   └── hooks/
│       └── use-hiring-assistant.ts
├── job-posts/
│   ├── components/         # Job post UI components
│   │   ├── job-posts-content.tsx
│   │   ├── job-post-card.tsx
│   │   └── job-post-form.tsx
│   ├── queries/
│   │   ├── use-job-posts.ts
│   │   └── use-job-post.ts
│   └── mutations/
│       ├── use-create-job-post.ts
│       ├── use-update-job-post.ts
│       ├── use-delete-job-post.ts
│       └── use-toggle-status.ts
├── profile/
│   ├── components/
│   │   └── profile-settings-modal.tsx
│   ├── queries/
│   │   └── use-profile.ts
│   └── mutations/
│       └── use-update-profile.ts
├── email-templates/
│   ├── components/
│   │   ├── email-template-editor.tsx
│   │   └── email-template-preview.tsx
│   ├── queries/
│   │   ├── use-email-templates-query.ts
│   │   ├── use-email-template.ts
│   │   └── use-template-preview.ts
│   └── mutations/
│       ├── use-create-template.ts
│       ├── use-update-template.ts
│       ├── use-delete-template.ts
│       ├── use-duplicate-template.ts
│       └── use-generate-template.ts
├── resumes/
│   ├── components/
│   │   └── resumes-content.tsx
│   └── queries/
│       └── use-resumes.ts
├── interview-assistant/
│   ├── queries/
│   │   ├── use-applicants.ts
│   │   └── use-resume-files.ts
│   └── mutations/
│       └── use-generate-interview-questions.ts
└── live-interview/
    ├── components/
    │   ├── live-interview-dashboard.tsx
    │   ├── live-transcript.tsx
    │   ├── question-suggestions.tsx
    │   └── session-setup-modal.tsx
    ├── queries/
    │   ├── use-interview-session-query.ts
    │   └── use-conversation-turns-query.ts
    ├── mutations/
    │   └── use-session-mutations.ts
    └── hooks/
        └── use-speech-recognition.ts
```

**Component Organization Principles:**

1. **Single-Use Components**: Live in the feature's `components/` directory
2. **Feature-Shared Components**: Stay within the feature folder
3. **Multi-Feature Components**: Move to `/app/components/shared/` only when used by 3+ features
4. **Layout Components**: Dashboard, header, sidebar in `/app/components/layout/`

**Pattern**: Each query/mutation file exports a single hook with typed interfaces and an invalidation utility function

**State Management & UI Flow**

- Custom hook `src/app/home/hooks/use-hiring-assistant.ts` orchestrates the entire hiring workflow
- Manages file upload → data extraction → template validation → email preview → bulk sending pipeline
- TanStack Query integration for job posts fetching with loading states
- **Template Validation System**: Comprehensive validation with `hasTemplateIssues` and `extractionsWithoutTemplates` tracking
- **User Guidance Integration**: Visual warnings and actionable guidance when templates are missing
- **Template Selection Per Candidate**: Intelligent template assignment with manual override capability

**Security Architecture**

- AES-256-GCM encryption for sensitive data (Gmail app passwords)
- PBKDF2 key derivation with 100,000 iterations using BETTER_AUTH_SECRET
- Salt-based encryption with unique salt per encrypted value
- Automatic encryption/decryption in API layer with password masking in responses
- `src/lib/crypto.ts` provides secure encryption utilities with authentication

**AI Integration Architecture**

- **Mistral AI**: OCR for resume parsing with structured output via Zod schemas
- **Groq AI**: Interview assistant for generating screening questions (`@ai-sdk/groq`)
- **Groq AI (Template Generation)**: GPT OSS 120B model for professional email template creation from natural language prompts
- **Type-Safe AI Responses**: All AI outputs validated with Zod schemas before processing
- **File Processing**: Supports PDF (base64) and DOCX (file upload) with type validation
- **Structured Template Generation**: AI generates name, subject, and HTML content with proper variable integration

### API Routes Structure

All API routes follow the 3-layer validator/service/controller pattern:

**Core Resources**:

- `/api/applicants` - Applicant management (CRUD)
- `/api/job-posts` - Job post management (CRUD)
- `/api/resumes` - Resume file management (CRUD)
- `/api/profile` - User profile (GET, PATCH) with optional Gmail config and AES-256-GCM encryption
- `/api/email` - Bulk email sending with template system integration
- `/api/email/preview` - Email preview generation
- `/api/email-templates` - Template CRUD operations
- `/api/email-templates/[id]/duplicate` - Template duplication
- `/api/email-templates/generate` - AI template generation
- `/api/extract` - Resume OCR extraction with auto-template assignment
- `/api/interview-sessions` - Interview session management (CRUD)
- `/api/auth/[...all]` - Better Auth endpoints

### Profile Management System

The profile management system provides comprehensive user account settings with a focus on optional email configuration:

**Key Components:**

- **Profile Page** (`/app/profile/page.tsx`) - Main profile management interface with dashboard layout
- **Profile Content** (`/app/profile/profile-page-content.tsx`) - Comprehensive profile display and management
- **Profile Settings Modal** (`/app/profile/components/profile-settings-modal.tsx`) - Modal for editing profile details
- **API Integration** - Uses `useProfileQuery()` and `useUpdateProfileMutation()` for data management

**Features:**

- **Optional Email Configuration**: Users can sign up without Gmail setup and configure later
- **Visual Status Indicators**: Clear badges showing email configuration status (Configured/Not Configured)
- **Account Security Display**: Shows encryption status and secure password storage indicators
- **Responsive Design**: Mobile-friendly layout with progressive disclosure
- **Integration**: Seamless integration with existing ProfileSettingsModal for editing

**Architecture Patterns:**

- **Data Fetching**: TanStack Query with `useProfileQuery()` for server state management
- **Form Handling**: React Hook Form with Zod validation for profile updates
- **Error Handling**: Graceful handling of missing data with proper fallbacks
- **Type Safety**: Proper type conversion between API responses and UI components

## Development Guidelines

### API Development Rules (ENFORCED STANDARDS)

When creating or modifying API routes, you MUST:

1. **Follow the 3-layer pattern** - Always create validator, service, and controller layers
2. **Reuse existing Zod schemas** - Check `src/app/types/index.ts` first before creating new schemas
3. **Use standardized error handling** - Follow the controller pattern with consistent error format (see above)
4. **Implement proper authentication** - Use `withAuth` or `withAuthParams` middleware
5. **Include soft delete support** - Use `withNotDeleted` and `softDeleteData` from `@/lib/soft-delete`
6. **Use transactions** - Wrap database operations in `withTransaction` when needed
7. **Use type-safe JSON parsing** - Always use `@/lib/json-utils.ts` functions for JSON fields
8. **Validate all inputs** - Use Zod schemas for comprehensive request validation
9. **Handle concurrent operations** - Use Promise.allSettled for bulk operations
10. **Verify type correctness** - Run `npm run typecheck` before committing changes

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
import { safeParseJSONArray, requirementsSchema } from "@/lib/json-utils";

// Instead of: JSON.parse(jobPost.requirements) || []
const requirements = safeParseJSONArray(
	jobPost.requirements,
	requirementsSchema
);

// Instead of: JSON.parse(applicant.metadata) || null
const metadata = safeParseJSONObject(
	applicant.metadata,
	applicantMetadataSchema
);
```

**Benefits:**

- ✅ Type safety with Zod validation
- ✅ Graceful error handling with fallbacks
- ✅ Consistent parsing across the application
- ✅ Automatic logging of parsing failures

### Type Management

**Single Source of Truth**:

- Import types from source validators: `import type { CreateJobPostBody } from './job-posts.validator'`
- Global types in `@/app/types/index.ts` re-export validator types for frontend use
- Never duplicate type definitions
- JSON field types validated with Zod schemas on parse operations

### Component Organization Rules (ENFORCED STANDARDS)

**File Organization Following LCA Principle:**

1. **Feature Components**: All feature-specific UI components live in `[feature]/components/`
   - Example: `home/components/home-content.tsx`, `job-posts/components/job-post-card.tsx`
2. **Shared Components**: Only move to `/app/components/shared/` when used by 3+ features
   - Examples: `loading-spinner.tsx`, `theme-toggle.tsx`, `background-pattern.tsx`
3. **Layout Components**: Dashboard-wide components in `/app/components/layout/`
   - Examples: `dashboard-layout.tsx`, `dashboard-header.tsx`, `sidebar/`
4. **Naming Convention**:
   - Main page components: `[feature]-content.tsx` (e.g., `home-content.tsx`, `job-posts-content.tsx`)
   - Feature components: Descriptive names (e.g., `email-preview-modal.tsx`, `job-post-card.tsx`)
5. **Import Paths**: Always use absolute imports with `@/app/` prefix for components

**Component Naming Examples:**

```
✅ CORRECT:
- home/components/home-content.tsx
- home/components/email-preview-modal.tsx
- job-posts/components/job-posts-content.tsx
- job-posts/components/job-post-card.tsx

❌ INCORRECT:
- components/home/home-page.tsx  (should be in feature folder)
- components/email-preview-modal.tsx  (should be in home/ - only used there)
- job-posts/job-posts-page.tsx  (should be in job-posts/components/)
```

### Query Development Rules (ENFORCED STANDARDS)

**File Organization:**

1. **Lowest Common Ancestor (LCA)**: Place queries at the lowest point in the tree where all consumers can access them
2. **Single Source of Truth**: One query hook per resource, no duplicates
3. **Separate Files**: Create individual files for queries (`queries/`) and mutations (`mutations/`)
4. **Naming Convention**: Use descriptive names like `use-job-posts.ts`, `use-create-job-post.ts`
5. **Co-location with Components**: Queries and components for the same feature live in the same feature directory

**Query Hook Structure (MANDATORY PATTERN):**

```typescript
// Each query file must follow this pattern (.ts files, no "use client" directive needed)
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

// Invalidation utility (REQUIRED)
export function useInvalidateDataName() {
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries({ queryKey: ["data-name"] });
}
```

**Mutation Hook Structure (MANDATORY PATTERN):**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateItemData) => apiClient.createItem(data),
		mutationKey: ["create-item"],
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["items"] });
		},
	});
}
```

**Usage in Components:**

```typescript
// Import queries and their invalidation utilities
import {
	useJobPosts,
	useInvalidateJobPosts,
} from "@/app/job-posts/queries/use-job-posts";
import { useCreateJobPost } from "@/app/job-posts/mutations/use-create-job-post";

function MyComponent() {
	const { data: jobPosts, isLoading } = useJobPosts();
	const createMutation = useCreateJobPost();
	const invalidateJobs = useInvalidateJobPosts();

	const handleRefresh = () => {
		invalidateJobs(); // Manual invalidation if needed
	};

	// Mutations auto-invalidate on success
	const handleCreate = () => {
		createMutation.mutate(data);
	};
}
```

**Query Configuration Rules:**

- Use `staleTime: 0` for frequently changing data (resumes, real-time updates)
- Use `staleTime: 60 * 1000` (1 minute) for relatively stable data (job posts, applicants)
- Always handle loading and error states in components
- Use typed interfaces for all API responses
- Include invalidation utilities in every query file

**Breaking Down Large Hooks:**

- Split monolithic hooks into focused, single-purpose hooks
- Separate queries from mutations into different files
- Extract business logic into smaller, composable hooks
- Example: `useHiringAssistant` should be split into `use-file-upload`, `use-email-workflow`, etc.

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
- **Design System**: Custom design tokens in `@/lib/design-tokens.ts` for consistent styling

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

- Use the custom `LoadingSpinner` component from `@/app/components/shared/loading-spinner` for async operations
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

#### When NOT to use useEffect

- **Event Handling**: Use onChange, onClick, onSubmit handlers
- **Data Fetching**: Use TanStack Query (React Query)
- **Form State**: Use React Hook Form with defaultValues
- **Derived State**: Calculate during render with useMemo

```typescript
// ❌ WRONG - useEffect for event responses
useEffect(() => {
	if (selectedId) queryClient.invalidateQueries({ queryKey: ["data"] });
}, [selectedId]);

// ✅ CORRECT - Event handler
<Select
	onValueChange={(value) => {
		field.onChange(value);
		queryClient.invalidateQueries({ queryKey: ["data"] });
	}}
/>;

// ❌ WRONG - useEffect for data fetching
useEffect(() => {
	fetchData().then(setData);
}, []);

// ✅ CORRECT - React Query
const { data } = useQuery({ queryKey: ["data"], queryFn: fetchData });
```

#### When useEffect IS Appropriate (Rare Cases)

Only use useEffect for:

1. **Cleanup operations** (timers, subscriptions, event listeners)
2. **Direct DOM manipulation** that can't be handled declaratively
3. **Third-party library integration** requiring imperative setup
4. **Window/document event listeners** for global state

```typescript
// ✅ Valid useEffect - Cleanup
useEffect(() => {
	const timer = setInterval(() => {
		/* polling */
	}, 5000);
	return () => clearInterval(timer);
}, []);
```

**Enforcement Rules**:

- Any useEffect must be justified in PR description
- Always consider alternatives first (event handlers, React Query, useMemo)
- All useEffect with side effects must include cleanup
- Dependency arrays must be exhaustive and correct
