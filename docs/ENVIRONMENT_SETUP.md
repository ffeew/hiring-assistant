# Environment Variables Setup Guide

This comprehensive guide explains how to properly configure your environment variables for the hiring assistant application, including all required services and setup steps.

## 🔧 Quick Setup

The application uses a **hybrid configuration** approach:
- **Infrastructure variables** (APIs, database, storage) are set via environment variables
- **User-specific settings** (email, company details) are stored per-user in the database for multi-user support

## 📋 Required Environment Variables

### 1. **AI Service Configuration**

#### Mistral AI (Resume Processing)
```bash
MISTRAL_API_KEY=your-mistral-api-key-here
```

- **Purpose**: AI-powered resume extraction and data parsing
- **How to get**: 
  1. Sign up at [Mistral AI](https://mistral.ai/)
  2. Navigate to API Keys section
  3. Create a new API key
- **Required**: ✅ Yes - Essential for resume processing
- **Cost**: Pay-per-use model, typically $0.50-$2.00 per 100 resumes

#### Groq AI (Interview Assistant)
```bash
GROQ_API_KEY=your-groq-api-key-here
```

- **Purpose**: Fast AI inference for interview question generation and conversation analysis
- **How to get**:
  1. Sign up at [Groq Console](https://console.groq.com/)
  2. Create an API key in your dashboard
- **Required**: ✅ Yes - Needed for interview features
- **Cost**: Free tier available, very cost-effective for interview use

### 2. **Authentication & Security Configuration**

```bash
BETTER_AUTH_SECRET=your-32-character-secret-key-here
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

- **Purpose**: 
  - User authentication and session management
  - Encryption key for sensitive data (Gmail passwords, tokens)
  - CSRF protection and security features
- **Secret Requirements**: 
  - Must be at least 32 characters long
  - Use a cryptographically secure random string
  - **Generate with**: `openssl rand -base64 32`
- **URL Configuration**:
  - Development: `http://localhost:3000`
  - Production: Your deployed application URL
  - Must be `NEXT_PUBLIC_` prefixed for client-side access
- **Required**: ✅ Yes - Critical for security and user management

### 3. **Database Configuration (Turso/LibSQL)**

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```

- **Purpose**: Serverless SQLite database for all application data
- **How to setup**:
  1. Sign up at [Turso](https://turso.tech/) (free tier available)
  2. Create a new database: `turso db create hiring-assistant`
  3. Get connection URL: `turso db show hiring-assistant --url`
  4. Create auth token: `turso db tokens create hiring-assistant`
- **Required**: ✅ Yes - Essential for data persistence
- **Features**: Automatic backups, global replication, serverless scaling
- **Cost**: Free tier includes 1GB storage + 1 billion row reads

### 4. **File Storage Configuration (Cloudflare R2)**

```bash
S3_API_URL=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-bucket-name
```

- **Purpose**: Secure storage for resume files with CDN delivery
- **How to setup**:
  1. Sign up for [Cloudflare](https://dash.cloudflare.com/)
  2. Navigate to R2 Object Storage
  3. Create a new bucket (e.g., `hiring-assistant-resumes`)
  4. Go to Manage R2 API tokens
  5. Create R2 token with Object Read & Write permissions
  6. Note your Account ID from the R2 overview page
- **Required**: ✅ Yes - Needed for resume file storage
- **Benefits**: 
  - Zero egress fees (unlike AWS S3)
  - Global CDN for fast file access
  - Compatible with S3 APIs
- **Cost**: $0.015/GB stored + $4.50/million requests

## 👤 User-Specific Configuration

**Email and company settings are now configured per-user through the application interface**, not environment variables. This enables multi-user support with different email configurations.

### 📧 Email Configuration (Optional Setup)

**New Feature**: Users can now sign up and use the application **without configuring email initially**. Email setup is completely optional during signup and can be configured later when needed.

#### Setup Options:
1. **During Signup (Optional)**:
   - Gmail Address: Your Gmail email address
   - Gmail App Password: 16-character app password
   - Company Name: Your company name
   - Job Title: Your job title

2. **After Signup (Profile Settings)**:
   - Complete profile page with email configuration status
   - Visual indicators showing whether email is configured
   - One-click access to configure email when needed
   - Account security overview with encryption status

#### Smart Configuration Validation:
- **Progressive Setup**: Use the app immediately, configure email when you need it
- **Clear Error Messages**: Detailed guidance when email features are accessed without configuration
- **Setup Prompts**: Helpful suggestions to configure email when trying to use email features
- **Optional Fields**: Both Gmail address and app password can be left empty during signup

### 🏢 Job Posts Management

Users can create and manage job advertisements through the application:

- **Job Posts**: Create multiple job advertisements with different requirements
- **Position Selection**: Choose which job post to use when sending emails to candidates
- **Custom Positions**: Enter custom job titles for one-off communications

### 🔒 Security Features

- **Encrypted Storage**: Gmail passwords are encrypted using AES-256-GCM before storage
- **Per-User Isolation**: Each user's email configuration is separate and secure
- **Automatic Encryption**: Passwords are automatically encrypted/decrypted as needed

### Profile Management Features:

The application includes a comprehensive profile page (`/profile`) with:

- **Account Overview**: View creation date, last update, and account status
- **Email Configuration Status**: Visual badges showing whether email is configured
- **Security Information**: View encryption status and data security measures  
- **Quick Actions**: Easy access to configure email or update profile settings
- **Progressive Setup Guidance**: Clear instructions for completing email setup when needed

### How to get Gmail App Password:

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to **Google Account Settings** → **Security**
3. Under "2-Step Verification", click **App passwords**
4. Select **Mail** and your device
5. Copy the 16-character password (format: `abcd efgh ijkl mnop`)
6. Enter this password in your Profile Settings (it will be encrypted automatically)

## 🚀 Setup Instructions

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd hiring-assistant

# Install dependencies
npm install
```

### Step 2: Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your actual values
nano .env  # or use your preferred editor
```

### Step 3: Database Setup

```bash
# Generate database migrations
npx drizzle-kit generate

# Run database migrations
npx drizzle-kit migrate
```

### Step 4: Verify Configuration

```bash
# Validate environment variables and build
npm run build

# Start development server
npm run dev
```

### Step 5: Complete User Setup

1. Navigate to `http://localhost:3000`
2. Create an account via `/signup`
   - **Option A**: Configure Gmail settings during signup for immediate email functionality
   - **Option B**: Skip email configuration and set up later via profile settings
3. Explore the profile page to see account status and configuration options
4. Create your first job post
5. Test the resume upload workflow
6. Configure email later if needed (go to Profile → Settings)

## 🧪 Testing Your Configuration

### 1. Environment Validation Test

```bash
# Check if all environment variables are correctly set
npm run build
```

If successful, you'll see a clean build. If not, you'll get specific error messages about missing variables.

### 2. Database Connection Test

```bash
# Open Drizzle Studio to inspect your database
npx drizzle-kit studio
```

This will open a web interface at `http://localhost:4983` to view your database tables.

### 3. File Storage Test

Upload a test resume through the application. Check your R2 bucket to confirm files are being stored correctly.

### 4. AI Services Test

1. **Mistral AI Test**: Upload a resume and verify data extraction works
2. **Groq AI Test**: Use the interview assistant to generate questions

### 5. Email System Test

1. **Test without email configuration**: Try accessing email features to see helpful error messages and setup prompts
2. **Configure Gmail settings**: Go to Profile → Settings to configure your Gmail address and app password
3. **Upload resumes and preview**: Use email preview to see template customization
4. **Send test emails**: Verify SMTP configuration and email delivery

## 🔒 Security Best Practices

### Environment Security
1. **Never commit `.env` files** to version control
2. **Use `.env.local`** for local development (automatically ignored by Git)
3. **Rotate API keys regularly** (quarterly recommended)
4. **Use strong secrets** - generate with `openssl rand -base64 32`

### Production Security
1. **Use environment-specific URLs** for `NEXT_PUBLIC_BETTER_AUTH_URL`
2. **Enable HTTPS** in production (required for Better Auth)
3. **Secure your R2 bucket** with proper CORS settings
4. **Monitor API usage** to detect unusual activity

### Database Security
1. **Use Turso's built-in encryption** (automatic)
2. **Regularly backup** your database
3. **Monitor database size** and performance
4. **Use read-only tokens** where appropriate

## 🔧 Environment Validation

The application uses comprehensive Zod validation for all environment variables:

```typescript
// Automatically validates on startup:
✅ AI API keys (Mistral, Groq)
✅ Database connection (Turso URL + token)
✅ Authentication secrets (32+ character minimum)
✅ File storage configuration (R2 credentials)
✅ URL formats and required fields
```

## 🆘 Troubleshooting

### Environment Validation Errors

#### Missing Required Variables
```bash
❌ Environment validation failed:
GROQ_API_KEY: GROQ_API_KEY is required
R2_ACCESS_KEY_ID: R2_ACCESS_KEY_ID is required
```

**Solution**: Ensure all 9 required environment variables are set in your `.env` file. Check against `.env.example`.

#### Invalid URL Format
```bash
❌ TURSO_DATABASE_URL must be a valid URL
```

**Solution**: Ensure URLs start with proper protocol (`https://` for R2, `libsql://` for Turso).

#### Secret Too Short
```bash
❌ BETTER_AUTH_SECRET must be at least 32 characters long
```

**Solution**: Generate a proper secret with `openssl rand -base64 32`.

### Build Errors

#### TypeScript Errors
```bash
❌ Type error: Cannot find module '@/lib/env'
```

**Solution**: Run `npm run typecheck` to identify and fix TypeScript issues before building.

#### Missing Dependencies
```bash
❌ Module not found: Can't resolve 'better-auth'
```

**Solution**: Ensure all dependencies are installed with `npm install`.

### Database Issues

#### Connection Failed
```bash
❌ LibsqlError: AUTHENTICATION_FAILED
```

**Solution**: 
1. Verify your `TURSO_AUTH_TOKEN` is correct
2. Check that the database exists: `turso db list`
3. Regenerate auth token if needed: `turso db tokens create <db-name>`

#### Migration Errors
```bash
❌ No migration files found
```

**Solution**: 
1. Generate migrations: `npx drizzle-kit generate`
2. Ensure schema changes are saved before generating
3. Check `drizzle.config.ts` configuration

### File Storage Issues

#### R2 Connection Failed
```bash
❌ S3ServiceException: The AWS Access Key Id you provided does not exist
```

**Solution**:
1. Verify your R2 credentials in Cloudflare dashboard
2. Ensure bucket name matches exactly (case-sensitive)
3. Check API token permissions include Object Read & Write

### Email Configuration Issues

#### Gmail Authentication Failed
```bash
❌ Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solution**:
1. Verify you're using a Gmail App Password (not regular password)
2. Enable 2-Factor Authentication on your Google account
3. Generate new App Password if needed
4. Check that Gmail address is correct

#### Email Not Sending
**Common causes**:
1. Gmail App Password expired or revoked
2. 2-Factor Authentication disabled
3. "Less secure app access" still enabled (should be off)
4. Incorrect SMTP settings (handled automatically)

### AI Service Issues

#### Mistral API Errors
```bash
❌ 401 Unauthorized: Invalid API key
```

**Solution**:
1. Verify API key is correct and active
2. Check billing and usage limits
3. Regenerate API key if needed

#### Groq API Errors
```bash
❌ 429 Too Many Requests: Rate limit exceeded
```

**Solution**:
1. Wait for rate limit reset (usually 1 minute)
2. Implement request queuing for high-volume usage
3. Upgrade to higher tier if needed

## 📊 Cost Estimation

Here's a rough cost breakdown for running the application:

### Free Tier Usage (Development/Testing)
- **Turso Database**: Free (up to 1GB)
- **Cloudflare R2**: Free (up to 10GB)
- **Groq AI**: Free tier with generous limits
- **Mistral AI**: Pay-per-use (~$2 for 100 resumes)

### Small Team Usage (10-50 candidates/month)
- **Turso Database**: Free to $5/month
- **Cloudflare R2**: $1-5/month
- **Groq AI**: Free to $10/month
- **Mistral AI**: $10-20/month
- **Total**: ~$15-40/month

### Medium Team Usage (100-500 candidates/month)
- **Turso Database**: $5-25/month
- **Cloudflare R2**: $5-15/month
- **Groq AI**: $10-50/month
- **Mistral AI**: $50-100/month
- **Total**: ~$70-190/month

## 📁 Configuration Files

```
.env                    # Your environment variables (9 required)
.env.example           # Template with all variables
.env.local             # Local override (Git ignored)
src/lib/env.ts         # Zod validation schema
drizzle.config.ts      # Database configuration
components.json        # shadcn/ui configuration
```

## 🔄 Environment Updates

When updating environment variables:

1. **Development**: Update `.env` file and restart dev server
2. **Production**: Update deployment platform environment variables
3. **Database Changes**: Run migrations if schema changed
4. **API Keys**: Update and test all affected services
5. **Security**: Rotate secrets when rotating API keys
