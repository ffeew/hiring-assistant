# Environment Variables Setup Guide

This guide explains how to properly configure your environment variables for the hiring assistant application.

## 🔧 Quick Setup

The application now uses a **database-first configuration** approach where user-specific settings (email, company details) are stored per-user in the database rather than environment variables.

## 📋 Required Environment Variables

### 1. **Mistral AI API Key**

```bash
MISTRAL_API_KEY=your-mistral-api-key-here
```

- **Purpose**: Used for AI-powered resume extraction
- **How to get**: Sign up at [Mistral AI](https://mistral.ai/) and get your API key
- **Required**: ✅ Yes - needed for resume processing

### 2. **Better Auth Configuration**

```bash
BETTER_AUTH_SECRET=your-32-character-secret-key-here
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

- **Purpose**: Authentication system and encryption key for sensitive data
- **Secret**: Must be at least 32 characters long (used for auth + encrypting Gmail passwords)
- **URL**: Your application's base URL (must be `NEXT_PUBLIC_` prefixed for client access)
- **Required**: ✅ Yes - needed for authentication and security

### 3. **Database Configuration (Turso)**

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```

- **Purpose**: Database connection for storing application data and user configurations
- **How to get**: Create a database at [Turso](https://turso.tech/)
- **Required**: ✅ Yes - needed for data storage

## 👤 User-Specific Configuration

**Email and company settings are now configured per-user through the application interface**, not environment variables. This enables multi-user support with different email configurations.

### 📧 Email Configuration (Per User)

Each user can configure their own email settings through the **Profile Settings** in the application:

1. **Gmail Address**: Your Gmail email address
2. **Gmail App Password**: 16-character app password (encrypted and stored securely)
3. **Company Name**: Your company name (used in email templates)
4. **Job Title**: Your job title (used in email signatures)

### 🏢 Job Posts Management

Users can create and manage job advertisements through the application:

- **Job Posts**: Create multiple job advertisements with different requirements
- **Position Selection**: Choose which job post to use when sending emails to candidates
- **Custom Positions**: Enter custom job titles for one-off communications

### 🔒 Security Features

- **Encrypted Storage**: Gmail passwords are encrypted using AES-256-GCM before storage
- **Per-User Isolation**: Each user's email configuration is separate and secure
- **Automatic Encryption**: Passwords are automatically encrypted/decrypted as needed

### How to get Gmail App Password:

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to **Google Account Settings** → **Security**
3. Under "2-Step Verification", click **App passwords**
4. Select **Mail** and your device
5. Copy the 16-character password (format: `abcd efgh ijkl mnop`)
6. Enter this password in your Profile Settings (it will be encrypted automatically)

## 🧪 Testing Your Configuration

### 1. Test Environment Setup

```bash
# Build the application to validate environment variables
npm run build

# Start the development server
npm run dev
```

### 2. Test User Registration

1. Navigate to `/signup` and create an account
2. Fill in all profile information including Gmail settings
3. Your Gmail password will be automatically encrypted

### 3. Test Email Configuration

1. Upload resume files to test the extraction pipeline
2. Use the email preview feature to test your templates
3. Send test emails to verify your Gmail configuration

### 4. Test Job Posts Management

1. Navigate to `/job-posts` to create job advertisements
2. Test the job position selection in the main workflow
3. Verify email templates use the correct job information

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for `BETTER_AUTH_SECRET` (32+ characters)
3. **Rotate API keys regularly** (Mistral, Turso tokens)
4. **Use App Passwords**, not regular passwords for Gmail
5. **Trust the encryption** - Gmail passwords are automatically encrypted with AES-256-GCM

## 🔧 Environment Validation Features

The streamlined Zod validation ensures:

- ✅ All required infrastructure variables are present
- ✅ URLs are properly formatted
- ✅ Secrets meet minimum length requirements
- ✅ API keys are provided
- ✅ Database configuration is complete

## 🆘 Troubleshooting

### Environment Validation Failed

```bash
❌ Environment validation failed:
MISTRAL_API_KEY: Required
BETTER_AUTH_SECRET: Required
NEXT_PUBLIC_BETTER_AUTH_URL: Required
```

**Solution**: The application now only requires 5 core environment variables. Make sure all are set in your `.env` file.

### Build Errors

If you get errors during `npm run build`:

1. Check that all required environment variables are set
2. Ensure `NEXT_PUBLIC_BETTER_AUTH_URL` is correctly prefixed
3. Verify your database connection details

### Email Not Working

1. **Check Profile Settings**: Ensure your Gmail configuration is complete in your user profile
2. **Verify App Password**: Make sure you're using a Gmail App Password, not your regular password
3. **Test SMTP**: Use the email preview feature to test your configuration
4. **Check Encryption**: The system automatically handles password encryption/decryption

### User Registration Issues

1. **Profile Completion**: Fill out all profile fields during signup
2. **Gmail Configuration**: Add your Gmail settings through Profile Settings after signup
3. **Job Posts**: Create job advertisements for better email organization

## 📁 File Structure

```
.env                    # Your actual environment variables (5 required)
.env.example           # Template with required variables
src/lib/env.ts         # Streamlined Zod validation schema
src/lib/crypto.ts      # Encryption utilities for sensitive data
```
