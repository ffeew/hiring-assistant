import { z } from 'zod';

/**
 * Safely parse JSON string with type validation
 * @param jsonString - The JSON string to parse
 * @param schema - Zod schema for validation
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed and validated data or fallback
 */
export function safeParseJSON<T>(
  jsonString: string | null | undefined,
  schema: z.ZodSchema<T>,
  fallback: T
): T {
  if (!jsonString) return fallback;
  
  try {
    const parsed = JSON.parse(jsonString);
    return schema.parse(parsed);
  } catch (error) {
    console.warn('Failed to parse JSON:', { jsonString, error });
    return fallback;
  }
}

/**
 * Safely parse JSON string as array
 * @param jsonString - The JSON string to parse
 * @param itemSchema - Zod schema for array items
 * @returns Parsed array or empty array
 */
export function safeParseJSONArray<T>(
  jsonString: string | null | undefined,
  itemSchema: z.ZodSchema<T>
): T[] {
  return safeParseJSON(jsonString, z.array(itemSchema), []);
}

/**
 * Safely parse JSON string as object
 * @param jsonString - The JSON string to parse
 * @param schema - Zod schema for the object
 * @returns Parsed object or null
 */
export function safeParseJSONObject<T>(
  jsonString: string | null | undefined,
  schema: z.ZodSchema<T>
): T | null {
  return safeParseJSON(jsonString, schema, null);
}

// Common schemas for database JSON fields
export const stringArraySchema = z.array(z.string());
export const metadataSchema = z.record(z.unknown());
export const skillsSchema = stringArraySchema;
export const requirementsSchema = stringArraySchema;
export const responsibilitiesSchema = stringArraySchema;
export const benefitsSchema = stringArraySchema;

// Experience and education schemas for applicant metadata
export const experienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  duration: z.string().optional(),
  description: z.string().optional()
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  graduationYear: z.string().optional()
});

export const applicantMetadataSchema = z.object({
  skills: z.array(z.string()).optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional()
}).nullable();