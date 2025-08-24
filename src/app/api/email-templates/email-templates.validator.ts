import { z } from "zod";

// Template categories enum
export const templateCategories = [
  "acknowledgment",
  "screening", 
  "interview",
  "offer",
  "rejection",
  "follow_up"
] as const;

export const templateCategorySchema = z.enum(templateCategories);

// Template variables schema
export const templateVariableSchema = z.object({
  name: z.string(),
  description: z.string(),
  required: z.boolean().default(false),
  type: z.enum(["string", "number", "date", "boolean"]).default("string")
}).transform((val) => ({
  name: val.name,
  description: val.description,
  required: val.required ?? false,
  type: val.type ?? "string" as const
}));

// Query schemas
export const getEmailTemplatesQuerySchema = z.object({
  category: templateCategorySchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
});

export const emailTemplateParamsSchema = z.object({
  id: z.string().min(1, "Template ID is required")
});

// Body schemas
export const createEmailTemplateBodySchema = z.object({
  name: z.string().min(1, "Template name is required").max(100, "Template name too long"),
  category: templateCategorySchema,
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  content: z.string().min(1, "Content is required"),
  variables: z.array(templateVariableSchema).optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

export const updateEmailTemplateBodySchema = createEmailTemplateBodySchema.partial();

export const duplicateEmailTemplateBodySchema = z.object({
  name: z.string().min(1, "Template name is required").max(100, "Template name too long"),
  category: templateCategorySchema.optional()
});

// Response schemas
export const emailTemplateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  category: templateCategorySchema,
  subject: z.string(),
  content: z.string(),
  variables: z.array(templateVariableSchema),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  usageCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
});

// Type exports
export type GetEmailTemplatesQuery = z.infer<typeof getEmailTemplatesQuerySchema>;
export type EmailTemplateParams = z.infer<typeof emailTemplateParamsSchema>;
export type CreateEmailTemplateBody = z.infer<typeof createEmailTemplateBodySchema>;
export type UpdateEmailTemplateBody = z.infer<typeof updateEmailTemplateBodySchema>;
export type DuplicateEmailTemplateBody = z.infer<typeof duplicateEmailTemplateBodySchema>;
export type EmailTemplateResponse = z.infer<typeof emailTemplateSchema>;
export type TemplateVariable = z.infer<typeof templateVariableSchema>;
export type TemplateCategory = z.infer<typeof templateCategorySchema>;