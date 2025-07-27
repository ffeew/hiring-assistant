# 🚀 Hiring Assistant

A streamlined tool designed to make candidate screening more efficient by automating resume data extraction and email communication. Built with Next.js and TypeScript, this application helps hiring teams process multiple candidates quickly without manually sending individual emails.

## 💡 Why I Built This

As someone involved in hiring interns, I found myself repeatedly going through the same manual process: downloading dozens of resumes, extracting candidate information, and sending personalized emails to each applicant. This became incredibly time-consuming, especially during peak hiring seasons.

**The problem I was solving:**

- 📄 Manually opening and reviewing 50+ resumes to extract basic contact information
- ✉️ Copy-pasting the same email template and personalizing each one individually
- 🔄 Repeating this process for every hiring cycle
- ⏰ Spending hours on administrative tasks instead of actual candidate evaluation

**My solution:**
Build a simple tool that could automate the tedious parts while keeping the human touch where it matters. This project started as a personal productivity hack and evolved into something that might help other small teams facing the same challenges.

**Current state:** This is very much an **early-stage, personal project**. It's functional and I use it for my own hiring needs, but it's still rough around the edges. I'm sharing it because it might be useful to others, but please set expectations accordingly - this isn't a polished commercial product (yet!).

The codebase reflects its origins as a personal tool: it works well for my specific use case but may need adjustments for different hiring workflows or company requirements.

## ✨ Current Features

### 📋 Resume Processing

- **Bulk Resume Upload**: Upload multiple PDF/Word resumes at once
- **AI-Powered Data Extraction**: Automatically extract key candidate information using Mistral AI
  - First & Last Name
  - Email Address
  - File Name for reference
- **Editable Results**: Review and modify extracted data before sending emails

### 📧 Automated Email Communication

- **Template-Based Emails**: Two professionally designed email templates
  - **Acknowledgment**: Thank you email confirming receipt of application with next steps
  - **Screening**: Detailed follow-up email with technical and availability questions
- **Email Preview**: Preview all emails with actual recipient data before sending
- **Bulk Email Sending**: Send personalized emails to all candidates with one click
- **Gmail Integration**: SMTP support for sending emails through Gmail
- **Template Customization**: Environment-based company branding (name, position, sender details)
- **Error Handling**: Comprehensive email delivery status tracking and error reporting

### 🔐 Authentication & Security

- **User Authentication**: Secure login/signup system using Better Auth
- **Session Management**: Protected routes and user-specific access
- **Environment Configuration**: Secure handling of sensitive credentials

### 🎨 User Experience

- **Modern UI**: Clean, responsive interface with dark/light theme support
- **Real-time Feedback**: Loading states and progress indicators
- **Error Handling**: Comprehensive error reporting and user feedback

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, next-themes for theme switching
- **Authentication**: Better Auth
- **Database**: Drizzle ORM with LibSQL
- **AI Integration**: Mistral AI for resume parsing
- **Email**: Nodemailer with Gmail SMTP
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Gmail account for email sending (optional)
- Mistral AI API key for resume processing

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

   See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for detailed configuration instructions.

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

1. **Sign up/Login** to access the application
2. **Upload Resumes** - Select multiple resume files (PDF/Word)
3. **Review Extracted Data** - Verify and edit candidate information
4. **Preview Emails** - Review email content before sending
5. **Send Emails** - Bulk send personalized emails to all candidates

## 📈 Current Progress

### ✅ Completed Features

- **Core Resume Processing Pipeline**: Full end-to-end resume upload and data extraction
- **AI Integration**: Mistral AI successfully extracts candidate information with high accuracy
- **Email System**: Complete email service with template rendering and SMTP delivery
- **Authentication Flow**: Secure user registration, login, and session management
- **UI/UX Foundation**: Responsive design with theme support and loading states
- **Environment Management**: Comprehensive configuration system with validation
- **Error Handling**: User-friendly error messages and recovery flows

### 🚧 In Development

- **Database Schema**: Setting up Drizzle ORM with LibSQL for data persistence
- **Template Storage**: Moving email templates from code to database
- **User Profiles**: Enhanced user management with company settings
- **Improved Resume Parsing**: Better handling of various resume formats and layouts

### 🎯 Current Stage

This project is currently in the **MVP (Minimum Viable Product)** stage, successfully handling the core workflow of:

1. Resume upload and data extraction
2. Email template generation and preview
3. Bulk email sending to candidates

The system is functional for immediate use in screening candidates, with all essential features working reliably.

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
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── email/          # Email service and templates
│   │   └── extract/        # Resume data extraction
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── lib/                    # Core library functions
│   ├── auth.ts            # Authentication configuration
│   ├── env.ts             # Environment validation
│   └── db/                # Database schema and connection
└── docs/                  # Documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📝 License

This project is for personal/internal use. Please ensure compliance with any third-party service terms when using AI and email services.

## 🆘 Support

For setup issues or questions, refer to:

- [Environment Setup Guide](docs/ENVIRONMENT_SETUP.md)
- [Theme System Documentation](src/app/docs/THEME_SYSTEM.md)

---

_Built with ❤️ to make hiring processes more efficient and candidate-friendly._
