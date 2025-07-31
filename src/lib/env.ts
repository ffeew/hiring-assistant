import { z } from 'zod';

const envSchema = z.object({
  // AI Configuration
  MISTRAL_API_KEY: z.string().min(1, 'MISTRAL_API_KEY is required'),

  // Better Auth Configuration
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters long'),
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url('NEXT_PUBLIC_BETTER_AUTH_URL must be a valid URL'),

  // Database Configuration (Turso/LibSQL)
  TURSO_DATABASE_URL: z.string().url('TURSO_DATABASE_URL must be a valid URL'),
  TURSO_AUTH_TOKEN: z.string().min(1, 'TURSO_AUTH_TOKEN is required'),

  // Cloudflare R2 Configuration
  S3_API_URL: z.string().url('S3_API_URL must be a valid URL'),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
  R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
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

// Helper function to get environment status for debugging
export const getEnvironmentStatus = () => {
  return {
    mistralApi: !!env.MISTRAL_API_KEY,
    database: !!(env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN),
    auth: !!(env.BETTER_AUTH_SECRET && env.NEXT_PUBLIC_BETTER_AUTH_URL),
    r2Storage: !!(env.S3_API_URL && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET_NAME),
    nodeEnv: env.NODE_ENV,
  };
};