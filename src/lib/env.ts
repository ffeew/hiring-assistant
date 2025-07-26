import { z } from 'zod';

const envSchema = z.object({
  // Mistral AI Configuration
  MISTRAL_API_KEY: z.string().min(1, 'MISTRAL_API_KEY is required'),

  // Gmail SMTP Configuration
  GMAIL_USER: z.string().email('GMAIL_USER must be a valid email address').optional(),
  GMAIL_APP_PASSWORD: z.string().min(1, 'GMAIL_APP_PASSWORD is required').optional(),
  SENDER_NAME: z.string().min(1, 'SENDER_NAME is required').optional(),

  // Company and Email Template Configuration
  COMPANY_NAME: z.string().min(1, 'COMPANY_NAME is required').optional(),
  COMPANY_POSITION: z.string().min(1, 'COMPANY_POSITION is required').optional(),
  SENDER_TITLE: z.string().min(1, 'SENDER_TITLE is required').optional(),
  SENDER_DEPARTMENT: z.string().min(1, 'SENDER_DEPARTMENT is required').optional(),

  // Database Configuration
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL').optional(),
  DATABASE_AUTH_TOKEN: z.string().min(1, 'DATABASE_AUTH_TOKEN is required').optional(),

  // Better Auth Configuration
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters long'),
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url('NEXT_PUBLIC_BETTER_AUTH_URL must be a valid URL'),

  // Optional: Turso specific URLs (if you're using Turso as your database)
  TURSO_DATABASE_URL: z.string().url('TURSO_DATABASE_URL must be a valid URL').optional(),
  TURSO_AUTH_TOKEN: z.string().min(1, 'TURSO_AUTH_TOKEN is required when using Turso').optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
}).refine((data) => {
  // If any Gmail config is provided, all must be provided
  const hasGmailConfig = data.GMAIL_USER || data.GMAIL_APP_PASSWORD || data.SENDER_NAME;
  if (hasGmailConfig) {
    return data.GMAIL_USER && data.GMAIL_APP_PASSWORD && data.SENDER_NAME;
  }
  return true;
}, {
  message: "If using Gmail SMTP, all of GMAIL_USER, GMAIL_APP_PASSWORD, and SENDER_NAME are required",
}).refine((data) => {
  // If any company template config is provided, all must be provided
  const hasCompanyConfig = data.COMPANY_NAME || data.COMPANY_POSITION || data.SENDER_TITLE;
  if (hasCompanyConfig) {
    return data.COMPANY_NAME && data.COMPANY_POSITION && data.SENDER_TITLE;
  }
  return true;
}, {
  message: "If using company template config, all of COMPANY_NAME, COMPANY_POSITION, and SENDER_TITLE are required",
}).refine((data) => {
  // If any database config is provided, all must be provided
  const hasDatabaseConfig = data.DATABASE_URL || data.DATABASE_AUTH_TOKEN;
  if (hasDatabaseConfig) {
    return data.DATABASE_URL && data.DATABASE_AUTH_TOKEN;
  }
  return true;
}, {
  message: "If using database, both DATABASE_URL and DATABASE_AUTH_TOKEN are required",
}).refine((data) => {
  // If any Turso config is provided, all must be provided
  const hasTursoConfig = data.TURSO_DATABASE_URL || data.TURSO_AUTH_TOKEN;
  if (hasTursoConfig) {
    return data.TURSO_DATABASE_URL && data.TURSO_AUTH_TOKEN;
  }
  return true;
}, {
  message: "If using Turso, both TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required",
});

// Validate environment variables
function validateEnv() {
  try {
    const validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(issue =>
        `${issue.path.join('.')}: ${issue.message}`
      ).join('\n');

      throw new Error(
        `❌ Environment validation failed:\n${missingVars}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.`
      );
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;

// Utility functions to check feature availability
export const isEmailConfigured = () => {
  return !!(env.GMAIL_USER && env.GMAIL_APP_PASSWORD && env.SENDER_NAME);
};

export const isCompanyTemplateConfigured = () => {
  return !!(env.COMPANY_NAME && env.COMPANY_POSITION && env.SENDER_TITLE);
};

export const isDatabaseConfigured = () => {
  return !!(env.DATABASE_URL && env.DATABASE_AUTH_TOKEN) ||
    !!(env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN);
};

// Helper function to get environment status for debugging
export const getEnvironmentStatus = () => {
  return {
    mistralApi: !!env.MISTRAL_API_KEY,
    email: isEmailConfigured(),
    companyTemplate: isCompanyTemplateConfigured(),
    database: isDatabaseConfigured(),
    auth: !!(env.BETTER_AUTH_SECRET && env.NEXT_PUBLIC_BETTER_AUTH_URL),
    nodeEnv: env.NODE_ENV,
  };
};