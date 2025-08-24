# 🚀 Hiring Assistant

A comprehensive AI-powered hiring platform designed to streamline the entire recruitment process from resume screening to live interviews. Built with Next.js 15 and TypeScript, this application combines automated resume processing, intelligent candidate management, and real-time interview assistance to help hiring teams work more efficiently.

## 💡 Why I Built This

As someone involved in hiring interns, I found myself repeatedly going through the same manual process: downloading dozens of resumes, extracting candidate information, and sending personalized emails to each applicant. This became incredibly time-consuming, especially during peak hiring seasons.

**The problems I was solving:**

- 📄 Manually opening and reviewing 50+ resumes to extract basic contact information
- ✉️ Copy-pasting the same email template and personalizing each one individually
- 📋 Managing candidate pipelines across spreadsheets and email threads
- 🎯 Preparing interview questions and tracking candidate progress
- 🔄 Repeating these processes for every hiring cycle
- ⏰ Spending hours on administrative tasks instead of actual candidate evaluation

**My solution:**
Build a comprehensive platform that could automate the tedious parts while keeping the human touch where it matters. This project started as a personal productivity hack and evolved into a full-featured hiring assistant that might help other small to medium teams facing the same challenges.

**Current state:** This is very much an **early-stage, personal project**. It's functional and I use it for my own hiring needs, but it's still rough around the edges. I'm sharing it because it might be useful to others, but please set expectations accordingly - this isn't a polished commercial product (yet!).

The codebase reflects its origins as a personal tool: it works well for my specific use case but may need adjustments for different hiring workflows or company requirements.

## ✨ Current Features

### 📋 Resume Processing & Candidate Management

- **Bulk Resume Upload**: Upload multiple PDF/Word resumes at once with drag-and-drop interface
- **AI-Powered Data Extraction**: Automatically extract comprehensive candidate information using Mistral AI
  - Personal details (name, email, phone, LinkedIn, GitHub, portfolio)
  - Work experience and education history
  - Skills and technical competencies
  - File metadata and content parsing
- **Intelligent Duplicate Detection**: SHA-256 file hashing prevents duplicate resume uploads
- **Candidate Database**: Persistent storage with full candidate profiles and application history
- **Status Tracking**: Track candidates through application pipeline (Applied → Screening → Interview → Offer/Rejected)
- **Advanced Search & Filtering**: Find candidates by skills, experience, status, or job posts
- **Bulk Operations**: Mass update candidate statuses and perform batch actions

### 🎯 Job Posts Management

- **Job Post Creation**: Create detailed job postings with requirements, responsibilities, and benefits
- **Template System**: Reusable job post templates for common positions
- **Multi-Position Support**: Manage multiple open positions simultaneously
- **Candidate-Job Mapping**: Associate candidates with specific job posts for targeted screening
- **Application Tracking**: View all candidates per job post with filtering and sorting

### 📧 Advanced Email Communication

- **Template-Based Emails**: Multiple professionally designed email templates
  - **Acknowledgment**: Thank you email confirming receipt of application
  - **Screening**: Detailed follow-up with technical and availability questions
  - **Interview**: Interview scheduling and preparation emails
  - **Rejection/Offer**: Status update communications
- **AI-Powered Template Generation**: Create professional email templates using natural language prompts
  - **Smart Content Creation**: Describe what you want and AI generates the complete template
  - **Multiple Tones**: Choose from professional, friendly, formal, or casual writing styles
  - **Variable Integration**: Automatically includes dynamic variables like `{{firstName}}`, `{{jobPosition}}`
  - **Category-Aware**: AI understands context for different email types (acknowledgment, screening, etc.)
  - **User-Friendly**: No HTML knowledge required - perfect for non-technical users
- **Template Management System**: Create, edit, and organize custom email templates
  - **Template Editor**: Rich editor with live preview and variable insertion
  - **Template Library**: Save and reuse templates across different hiring campaigns
  - **Default Templates**: Mark frequently used templates as defaults for quick access
- **Optional Setup**: Sign up without Gmail configuration, set up email later when needed
- **Configuration Validation**: Smart validation with helpful error messages and setup guidance
- **Email Preview System**: Preview all emails with actual recipient data before sending
- **Bulk Email Operations**: Send personalized emails to filtered candidate groups
- **Gmail Integration**: Secure SMTP support with encrypted app password storage
- **Email History**: Complete communication log per candidate
- **Template Customization**: Dynamic template variables based on user profile and company branding
- **Delivery Tracking**: Email status monitoring with error handling and retry logic

### 🤖 AI-Powered Interview Assistant

- **Smart Question Generation**: AI generates relevant interview questions based on:
  - Candidate's resume and experience
  - Job post requirements and responsibilities  
  - Interview type (screening, technical, behavioral)
- **Dynamic Follow-up Questions**: Context-aware questions based on candidate responses
- **Interview Preparation**: Get suggested questions and talking points before interviews
- **Multi-Stage Support**: Different question sets for various interview rounds

### 🎙️ Live Interview Features

- **Real-Time Speech Recognition**: Browser-based speech-to-text for interview transcription
- **Live Transcript**: Real-time conversation recording with speaker identification
- **Dynamic Question Suggestions**: AI analyzes conversation and suggests follow-up questions
- **Interview Session Management**: Start, pause, and end interviews with session tracking
- **Conversation Analysis**: AI-powered analysis of candidate responses and interview flow
- **Session Summary**: Automated interview summaries with key highlights and recommendations

### 🗄️ Data Management & Storage

- **Persistent Database**: Drizzle ORM with LibSQL/Turso for reliable data storage
- **File Storage**: Cloudflare R2 integration for secure resume file storage
- **Data Relationships**: Properly normalized database with foreign keys and constraints
- **Soft Delete**: Recoverable deletion system for candidates, job posts, and resumes
- **Audit Trail**: Complete activity logging for compliance and tracking
- **Data Export**: Export candidate data and reports in various formats

### 👤 Profile & Account Management

- **Comprehensive Profile Page**: Complete user account management interface
- **Optional Email Configuration**: Sign up without Gmail setup, configure later in profile settings
- **Visual Status Indicators**: Clear badges showing email configuration and account status
- **Account Security Overview**: View encryption status and data security measures
- **Profile Settings Modal**: Easy-to-use interface for updating account details
- **Progressive Setup**: Guided setup process for email functionality when needed

### 🔐 Security & Authentication

- **User Authentication**: Secure login/signup system using Better Auth with email verification
- **Session Management**: Protected routes with proper session validation
- **Data Encryption**: AES-256-GCM encryption for sensitive data (email passwords, tokens)
- **Environment Security**: Secure handling of API keys and sensitive configuration
- **Role-Based Access**: User-specific data isolation and permissions
- **CSRF Protection**: Built-in security measures against common web attacks

### 🎨 Modern User Experience

- **Responsive Design**: Mobile-first design that works across all devices
- **Dark/Light Theme**: System-aware theme switching with user preference storage
- **Component Library**: shadcn/ui components for consistent, accessible design
- **Real-time Updates**: TanStack Query for optimistic updates and cache management
- **Loading States**: Comprehensive loading indicators and progress feedback
- **Error Handling**: User-friendly error messages with actionable recovery options
- **Keyboard Navigation**: Full keyboard accessibility support
- **Performance Optimized**: Code splitting, lazy loading, and optimized bundle sizes

## 🛠️ Technology Stack

### Core Framework & Language
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Theme System**: next-themes for dark/light mode with system preference detection

### Authentication & Security
- **Authentication**: Better Auth with Drizzle adapter for session management
- **Security**: AES-256-GCM encryption, PBKDF2 key derivation, CSRF protection
- **Session Storage**: Database-backed sessions with automatic cleanup

### Database & Storage
- **Database**: Drizzle ORM with LibSQL/Turso for serverless SQLite
- **Migrations**: Drizzle Kit for database schema management
- **File Storage**: Cloudflare R2 for resume file storage with CDN
- **Caching**: TanStack Query for client-side state management

### AI & Machine Learning
- **Resume Parsing**: Mistral AI for structured data extraction from PDFs/DOCX
- **Interview Assistant**: Groq AI SDK for real-time question generation
- **Email Template Generation**: Groq AI (GPT OSS 120B) for creating professional email templates from natural language prompts
- **Speech Recognition**: Browser Web Speech API for live transcription
- **Content Analysis**: AI-powered conversation analysis and summarization

### Email & Communication
- **Email Service**: Nodemailer with Gmail SMTP integration
- **Template Engine**: Dynamic email templates with variable substitution
- **Delivery Tracking**: Email status monitoring and error handling
- **Rate Limiting**: Smart throttling to prevent Gmail API limits

### UI & User Experience
- **Component Library**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation and error handling
- **Data Fetching**: TanStack Query with optimistic updates and background refetching

### Development & Tooling
- **Build System**: Next.js with Turbopack for fast development
- **Type Safety**: Comprehensive TypeScript with strict configuration
- **Validation**: Zod schemas for all data validation and type inference
- **Linting**: ESLint with Next.js configuration
- **Package Management**: npm with lock file for reproducible builds

### Architecture Patterns
- **API Design**: 3-layer architecture (validator/service/controller)
- **Database Design**: Normalized schema with foreign keys and soft deletes
- **Error Handling**: Standardized error responses across all API endpoints
- **Code Organization**: Feature-based directory structure with shared utilities

### Deployment & Infrastructure
- **Deployment**: Vercel-ready with automatic deployments
- **Environment**: Zod-validated environment configuration
- **Monitoring**: Structured logging and error tracking
- **Performance**: Code splitting, lazy loading, and bundle optimization

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - Runtime environment for the application
- **Gmail Account** - For email sending capabilities (optional for development)
- **Mistral AI API Key** - For AI-powered resume parsing and data extraction
- **Groq API Key** - For interview assistant and question generation features
- **Turso/LibSQL Database** - For data persistence (free tier available)
- **Cloudflare R2 Account** - For resume file storage (optional, can use local storage for dev)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hiring-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file and configure your settings:

   ```bash
   cp .env.example .env.local
   ```

   See **[Environment Setup Guide](docs/ENVIRONMENT_SETUP.md)** for detailed configuration instructions.

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### Getting Started
1. **Sign up/Login** - Create an account or sign in to access the platform
2. **Profile Setup** - Configure your company details, email settings, and preferences
3. **Job Posts** - Create job postings for positions you're hiring for

### Resume Processing Workflow
1. **Upload Resumes** - Drag and drop or select multiple resume files (PDF/DOCX)
2. **Select Job Post** - Associate resumes with specific open positions
3. **AI Extraction** - Automatic extraction of candidate information using Mistral AI
4. **Review & Edit** - Verify and modify extracted data as needed
5. **Save Candidates** - Store candidates in your database for future reference

### Email Communication
1. **Select Candidates** - Choose candidates for email outreach
2. **Choose Template** - Pick from acknowledgment, screening, or custom templates
3. **Preview Emails** - Review personalized email content before sending
4. **Send Bulk Emails** - Deliver emails to multiple candidates simultaneously
5. **Track Delivery** - Monitor email status and handle any delivery issues

### Interview Management
1. **Interview Assistant** - Generate interview questions based on candidate resume and job requirements
2. **Question Preparation** - Get AI-suggested questions tailored to the role and candidate
3. **Live Interview** - Use real-time transcription and dynamic question suggestions
4. **Session Recording** - Capture interview sessions with speaker identification
5. **Interview Analysis** - Get AI-powered summaries and recommendations

### Candidate Pipeline
1. **Status Tracking** - Move candidates through application stages (Applied → Screening → Interview → Offer/Rejected)
2. **Notes & Comments** - Add internal notes and feedback for each candidate
3. **Search & Filter** - Find candidates by skills, experience, status, or job post
4. **Bulk Operations** - Update multiple candidate statuses simultaneously
5. **Export Data** - Generate reports and export candidate information

## 📈 Current Progress

### ✅ Completed Features

- **Core Resume Processing Pipeline**: Full end-to-end resume upload and AI-powered data extraction
- **Database Architecture**: Complete Drizzle ORM setup with normalized schema and relationships  
- **AI Integration**: Mistral AI for resume parsing and Groq AI for interview questions
- **Email System**: AI-powered template generation, multi-template service with optional setup and bulk sending capabilities
- **Profile Management**: Comprehensive user account settings with optional email configuration
- **Authentication Flow**: Secure user registration, login, and session management with flexible onboarding
- **Live Interview Features**: Real-time speech recognition and dynamic question generation
- **Modern UI Foundation**: Responsive design with shadcn/ui components and theme support
- **Security Infrastructure**: Data encryption, secure file storage, and user isolation
- **UI/UX Improvements**: Dark mode optimizations, improved contrast, and better component alignment

### 🚧 In Active Development

- **Interview Session Management**: Completing the interview workflow and session tracking
- **Advanced Candidate Pipeline**: Enhanced status management and bulk operations
- **Email Template System**: User-customizable templates and improved delivery tracking
- **Search & Filtering**: Advanced candidate search across all data fields
- **Error Handling & Validation**: Comprehensive error recovery and user feedback
- **Performance Optimization**: Database query optimization and caching improvements

### ⚠️ Current Stage: Early Development

This project is still in **early development** and **not ready for production use**:

#### What Works (With Limitations)
- ✅ Basic resume upload and AI extraction (tested with small batches)
- ✅ Simple email sending (requires manual Gmail setup)
- ✅ Interview question generation (basic functionality)
- ✅ Live interview transcription (browser-dependent, experimental)
- ✅ User authentication and basic data storage

#### Known Limitations & Missing Features
- ⚠️ **Limited Testing**: Not extensively tested with large datasets or concurrent users
- ⚠️ **Manual Configuration**: Requires technical setup for AI APIs, database, and email
- ⚠️ **Basic Error Handling**: Many edge cases and error scenarios not fully handled
- ⚠️ **No Migration Path**: Database schema may change without migration support
- ⚠️ **Performance Issues**: May struggle with large resume batches or concurrent operations
- ⚠️ **Browser Compatibility**: Speech recognition limited to modern browsers
- ⚠️ **Email Deliverability**: Basic Gmail integration without advanced deliverability features

#### Suitable For
- ✅ **Personal Use**: Individual recruiters processing small batches of candidates
- ✅ **Development/Testing**: Exploring AI-powered hiring workflows
- ✅ **Proof of Concept**: Demonstrating automated resume processing capabilities
- ✅ **Learning Project**: Understanding modern web app architecture and AI integration

#### NOT Suitable For
- ❌ **Production Hiring**: Critical hiring processes for companies
- ❌ **Large Scale**: Processing hundreds of resumes or supporting multiple users
- ❌ **Mission Critical**: Workflows that cannot tolerate bugs or downtime
- ❌ **Compliance Requirements**: GDPR, CCPA, or other data protection regulations

## 🔮 Future Roadmap

### 🗄️ Database Integration (Phase 1)

- **Template Management**: Store email templates in database for easy customization
- **User-Specific Templates**: Allow users to create and manage their own email templates
- **Template Variables**: Dynamic field population based on user profile and company settings
- **Template Versioning**: Track changes and rollback capabilities for email templates
- **Company Profiles**: Store company information, branding, and default settings

### 📊 Advanced Candidate Management (Phase 2)

- **Application Tracking**: Track candidate status through different stages (Applied → Screening → Interview → Decision)
- **Round Advancement**: Move candidates to next interview rounds with automated notifications
- **Rejection Workflow**: Streamlined rejection process with customizable messages and feedback
- **Candidate Notes**: Add internal notes, ratings, and feedback for each candidate
- **Timeline Tracking**: View complete interaction history with candidates
- **Candidate Dashboard**: Visual overview of all candidates with filtering and sorting
- **Status Pipeline**: Drag-and-drop interface for moving candidates between stages

### 🚀 Enhanced Features (Phase 3)

- **Interview Scheduling**: Integration with calendar systems (Google Calendar, Outlook)
- **Bulk Actions**: Advanced bulk operations for candidate management
- **Analytics Dashboard**: Insights into hiring pipeline, conversion rates, and metrics
- **Team Collaboration**: Multi-user access with role-based permissions (HR, Hiring Manager, Interviewer)
- **Integration APIs**: Connect with popular ATS systems (Greenhouse, Lever, BambooHR)
- **Document Management**: Store and organize additional candidate documents
- **Communication Log**: Track all interactions (emails, calls, interviews) in one place

### ⚡ Workflow Improvements (Phase 4)

- **Custom Screening Questions**: Dynamic question sets based on position/department
- **Conditional Email Logic**: Smart email routing based on candidate responses or criteria
- **Auto-Follow-ups**: Scheduled reminder emails for pending applications or next steps
- **Status Notifications**: Real-time updates on candidate progress via email/Slack
- **Interview Feedback Forms**: Standardized evaluation forms for interviewers
- **Offer Management**: Template-based offer letters with approval workflows
- **Background Check Integration**: Automated background verification processes

### 🔧 Technical Enhancements (Phase 5)

- **Mobile App**: Native mobile application for on-the-go candidate management
- **Advanced AI**: Enhanced resume parsing with skill extraction and matching
- **Search & Filtering**: Powerful search across all candidate data
- **Export Capabilities**: Generate reports and export data in various formats
- **API for Integrations**: RESTful API for third-party integrations
- **Audit Logs**: Complete activity tracking for compliance and security
- **Multi-language Support**: Internationalization for global hiring teams

### 🎯 Long-term Vision

Transform the hiring assistant into a comprehensive **Applicant Tracking System (ATS)** that can compete with enterprise solutions while maintaining simplicity and ease of use. The goal is to provide small to medium-sized companies with a powerful, affordable alternative to expensive ATS platforms.

**Target Features for Full ATS:**

- Complete hiring workflow automation
- Compliance and legal requirement tracking
- Integration with job boards and career sites
- Advanced reporting and analytics
- White-label solutions for HR agencies

## 📁 Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── api/                      # API Routes (3-layer architecture)
│   │   ├── applicants/          # Candidate CRUD operations
│   │   │   ├── applicants.validator.ts
│   │   │   ├── applicants.service.ts
│   │   │   └── route.ts
│   │   ├── job-posts/           # Job posting management
│   │   ├── resumes/             # Resume file operations
│   │   ├── email/               # Email communication system
│   │   ├── email-templates/     # Email template management and AI generation
│   │   ├── extract/             # AI resume data extraction
│   │   ├── interview-assistant/ # AI question generation
│   │   ├── interview-sessions/  # Live interview management
│   │   ├── profile/             # User profile management
│   │   └── auth/                # Authentication endpoints
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── auth/                # Authentication forms
│   │   ├── job-posts/           # Job management UI
│   │   └── interview-assistant/ # Interview features
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-hiring-assistant.ts
│   │   ├── use-interview-session.ts
│   │   └── use-speech-recognition.ts
│   ├── (pages)/                 # App pages
│   │   ├── job-posts/
│   │   ├── resumes/
│   │   ├── interview-assistant/
│   │   ├── live-interview/
│   │   └── login/
│   ├── providers/               # React context providers
│   └── types/                   # TypeScript definitions
├── components/ui/               # Base UI component library
├── lib/                         # Core utilities
│   ├── db/                      # Database layer
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   ├── db.ts               # Database connection
│   │   └── transaction.ts      # Transaction utilities
│   ├── auth.ts                  # Better Auth configuration
│   ├── crypto.ts                # Encryption utilities
│   ├── env.ts                   # Environment validation
│   ├── json-utils.ts            # Type-safe JSON parsing
│   └── soft-delete.ts           # Soft delete utilities
├── drizzle/                     # Database migrations
└── docs/                        # Documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📝 License

This project is for personal/internal use. Please ensure compliance with any third-party service terms when using AI and email services.

## 🆘 Support

For setup issues or questions, refer to:

- **[Environment Setup Guide](docs/ENVIRONMENT_SETUP.md)** - Complete setup instructions with optional Gmail configuration
- **[Theme System Documentation](src/app/docs/THEME_SYSTEM.md)** - Comprehensive theme system guide and troubleshooting
- **CLAUDE.md** - Development guidelines and architecture documentation
- **GitHub Issues** - Report bugs or request features

---

_Built with ❤️ to make hiring processes more efficient and candidate-friendly._
