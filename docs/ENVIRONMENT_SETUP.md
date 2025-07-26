# Environment Variables Setup Guide

This guide explains how to properly configure your environment variables for the hiring assistant application.

## 🔧 Quick Setup

Run the validation script to check your current configuration:

```bash
npm run validate-env
```

## 📋 Required Environment Variables

### 1. **Mistral AI API Key**

```bash
MISTRAL_API_KEY=your-mistral-api-key-here
```

- **Purpose**: Used for AI-powered resume extraction
- **How to get**: Sign up at [Mistral AI](https://mistral.ai/) and get your API key
- **Status**: ✅ Already configured

### 2. **Better Auth Configuration**

```bash
BETTER_AUTH_SECRET=your-32-character-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

- **Purpose**: Authentication system configuration
- **Secret**: Must be at least 32 characters long
- **URL**: Your application's base URL
- **Status**: ✅ Already configured

### 3. **Database Configuration (Turso)**

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```

- **Purpose**: Database connection for storing application data
- **How to get**: Create a database at [Turso](https://turso.tech/)
- **Status**: ✅ Already configured

## 📧 Optional: Email Configuration

To enable automatic email responses to candidates:

### Gmail SMTP Setup

```bash
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
SENDER_NAME=Your Company Name or Your Name
```

**⚠️ Important**: You need a Gmail App Password, not your regular password!

### Company Template Configuration

```bash
COMPANY_NAME=Your Company Name
COMPANY_POSITION=Software Engineer Intern
SENDER_TITLE=Your Job Title
SENDER_DEPARTMENT=Your Department Name
```

**Purpose**: Customizes email templates with your company information

- **COMPANY_NAME**: Used in email subjects and content
- **COMPANY_POSITION**: The position title for the job posting
- **SENDER_TITLE**: Your job title for email signatures
- **SENDER_DEPARTMENT**: Your department name for email signatures

**Note**: If these variables are not set, the templates will use sensible defaults.

#### How to get Gmail App Password:

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to **Google Account Settings** → **Security**
3. Under "2-Step Verification", click **App passwords**
4. Select **Mail** and your device
5. Copy the 16-character password (format: `abcd efgh ijkl mnop`)
6. Use this password as `GMAIL_APP_PASSWORD`

**Current Status**: ⚠️ The `GMAIL_APP_PASSWORD` appears to still have a placeholder value. Please update it with your actual Gmail App Password.

## 🧪 Testing Your Configuration

### 1. Validate Environment Variables

```bash
npm run validate-env
```

### 2. Test Email Configuration (if configured)

```bash
# Start the development server
npm run dev

# Then test the email endpoint with a POST request to:
# http://localhost:3000/api/email
```

### 3. Test Mistral AI Integration

```bash
# Test the extract endpoint with a resume file:
# http://localhost:3000/api/extract
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for `BETTER_AUTH_SECRET`
3. **Rotate API keys regularly**
4. **Use App Passwords**, not regular passwords for Gmail
5. **Keep your Turso tokens secure**

## 🔧 Environment Validation Features

The Zod validation ensures:

- ✅ Required fields are present
- ✅ Email addresses are valid
- ✅ URLs are properly formatted
- ✅ Secrets meet minimum length requirements
- ✅ Related fields are configured together (Gmail requires all 3 fields)

## 🆘 Troubleshooting

### Environment Validation Failed

```bash
❌ Environment validation failed:
GMAIL_APP_PASSWORD: GMAIL_APP_PASSWORD is required
```

**Solution**: Make sure all related environment variables are set. If you configure Gmail, you need all three: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `SENDER_NAME`.

### Build Errors

If you get errors during `npm run build`, it's likely due to missing or invalid environment variables. Run `npm run validate-env` first to identify issues.

### Email Not Working

1. Verify your Gmail App Password is correct
2. Check that 2FA is enabled on your Gmail account
3. Test the SMTP connection using the email service test method

## 📁 File Structure

```
.env                    # Your actual environment variables
.env.example           # Template with all required variables
scripts/validate-env.ts # Environment validation script
src/lib/env.ts         # Zod validation schema
```
