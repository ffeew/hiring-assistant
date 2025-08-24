import { db } from '@/lib/db/db';
import { emailTemplate } from '@/lib/db/schema';
import { withTransaction } from '@/lib/db/transaction';
import { notDeleted, softDeleteData } from '@/lib/soft-delete';
import { safeParseJSONArray } from '@/lib/json-utils';
import { randomUUID } from 'node:crypto';
import { eq, and, desc, asc, like, count, sql } from 'drizzle-orm';
import { z } from 'zod';
import {
  GetEmailTemplatesQuery,
  CreateEmailTemplateBody,
  UpdateEmailTemplateBody,
  DuplicateEmailTemplateBody,
  EmailTemplateResponse,
  TemplateVariable,
  templateVariableSchema
} from './email-templates.validator';
import { DEFAULT_TEMPLATE_VARIABLES, TemplateEngine } from '@/lib/template-engine';


export class EmailTemplatesService {
  /**
   * Get all email templates for a user
   */
  static async getTemplates(
    userId: string, 
    query: GetEmailTemplatesQuery
  ): Promise<{ data: EmailTemplateResponse[]; total: number; hasMore: boolean }> {
    const { category, isActive, search, limit, offset } = query;

    // Build where conditions
    const conditions = [
      eq(emailTemplate.userId, userId),
      notDeleted(emailTemplate.deletedAt)
    ];

    if (category) {
      conditions.push(eq(emailTemplate.category, category));
    }

    if (isActive !== undefined) {
      conditions.push(eq(emailTemplate.isActive, isActive));
    }

    if (search) {
      conditions.push(like(emailTemplate.name, `%${search}%`));
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(emailTemplate)
      .where(and(...conditions));

    // Get paginated results
    const templates = await db
      .select()
      .from(emailTemplate)
      .where(and(...conditions))
      .orderBy(desc(emailTemplate.updatedAt))
      .limit(limit)
      .offset(offset);

    // Parse JSON variables and format response
    const data: EmailTemplateResponse[] = templates.map(template => ({
      ...template,
      category: template.category as any, // Cast to satisfy type checker
      variables: safeParseJSONArray(template.variables, templateVariableSchema) as any, // Cast to satisfy type checker
      deletedAt: template.deletedAt || null
    }));

    return {
      data,
      total,
      hasMore: offset + templates.length < total
    };
  }

  /**
   * Get a single email template by ID
   */
  static async getTemplate(userId: string, templateId: string): Promise<EmailTemplateResponse> {
    const template = await db
      .select()
      .from(emailTemplate)
      .where(and(
        eq(emailTemplate.id, templateId),
        eq(emailTemplate.userId, userId),
        notDeleted(emailTemplate.deletedAt)
      ))
      .limit(1);

    if (!template.length) {
      throw new Error('Template not found');
    }

    return {
      ...template[0],
      category: template[0].category as any, // Cast to satisfy type checker
      variables: safeParseJSONArray(template[0].variables, templateVariableSchema) as any, // Cast to satisfy type checker
      deletedAt: template[0].deletedAt || null
    };
  }

  /**
   * Create a new email template
   */
  static async createTemplate(
    userId: string, 
    data: CreateEmailTemplateBody
  ): Promise<EmailTemplateResponse> {
    // Merge with default variables if none provided
    const variables = data.variables || DEFAULT_TEMPLATE_VARIABLES;
    
    // Validate template syntax
    const extractedVars = TemplateEngine.extractVariables(data.content);
    const undefinedVars = extractedVars.filter(varName => 
      !variables.some(v => v.name === varName)
    );
    
    if (undefinedVars.length > 0) {
      throw new Error(`Template contains undefined variables: ${undefinedVars.join(', ')}`);
    }

    // If setting as default, unset other defaults in same category
    if (data.isDefault) {
      await withTransaction(async (tx) => {
        await tx
          .update(emailTemplate)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(and(
            eq(emailTemplate.userId, userId),
            eq(emailTemplate.category, data.category),
            eq(emailTemplate.isDefault, true),
            notDeleted(emailTemplate.deletedAt)
          ));
      });
    }

    const templateId = randomUUID();
    const now = new Date();

    const [newTemplate] = await withTransaction(async (tx) => {
      return await tx
        .insert(emailTemplate)
        .values({
          id: templateId,
          userId,
          name: data.name,
          category: data.category,
          subject: data.subject,
          content: data.content,
          variables: JSON.stringify(variables),
          isDefault: data.isDefault,
          isActive: data.isActive,
          usageCount: 0,
          createdAt: now,
          updatedAt: now,
          deletedAt: null
        })
        .returning();
    });

    return {
      ...newTemplate,
      category: newTemplate.category as any, // Cast to satisfy type checker
      variables: safeParseJSONArray(newTemplate.variables, templateVariableSchema) as any, // Cast to satisfy type checker
      deletedAt: null
    };
  }

  /**
   * Update an existing email template
   */
  static async updateTemplate(
    userId: string,
    templateId: string,
    data: UpdateEmailTemplateBody
  ): Promise<EmailTemplateResponse> {
    // Check if template exists and belongs to user
    const existing = await this.getTemplate(userId, templateId);

    // Validate template syntax if content is being updated
    if (data.content) {
      const variables = data.variables || existing.variables;
      const extractedVars = TemplateEngine.extractVariables(data.content);
      const undefinedVars = extractedVars.filter(varName => 
        !variables.some(v => v.name === varName)
      );
      
      if (undefinedVars.length > 0) {
        throw new Error(`Template contains undefined variables: ${undefinedVars.join(', ')}`);
      }
    }

    // If setting as default, unset other defaults in same category
    if (data.isDefault && data.category) {
      await withTransaction(async (tx) => {
        await tx
          .update(emailTemplate)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(and(
            eq(emailTemplate.userId, userId),
            eq(emailTemplate.category, data.category as string),
            eq(emailTemplate.isDefault, true),
            notDeleted(emailTemplate.deletedAt)
          ));
      });
    }

    const updateData = {
      ...data,
      variables: data.variables ? JSON.stringify(data.variables) : undefined,
      updatedAt: new Date()
    };

    const [updatedTemplate] = await withTransaction(async (tx) => {
      return await tx
        .update(emailTemplate)
        .set(updateData)
        .where(and(
          eq(emailTemplate.id, templateId),
          eq(emailTemplate.userId, userId),
          notDeleted(emailTemplate.deletedAt)
        ))
        .returning();
    });

    if (!updatedTemplate) {
      throw new Error('Template not found or update failed');
    }

    return {
      ...updatedTemplate,
      category: updatedTemplate.category as any, // Cast to satisfy type checker
      variables: safeParseJSONArray(updatedTemplate.variables, templateVariableSchema) as any, // Cast to satisfy type checker
      deletedAt: updatedTemplate.deletedAt || null
    };
  }

  /**
   * Duplicate an existing email template
   */
  static async duplicateTemplate(
    userId: string,
    templateId: string,
    data: DuplicateEmailTemplateBody
  ): Promise<EmailTemplateResponse> {
    const originalTemplate = await this.getTemplate(userId, templateId);

    const duplicateData: CreateEmailTemplateBody = {
      name: data.name,
      category: data.category || originalTemplate.category,
      subject: originalTemplate.subject,
      content: originalTemplate.content,
      variables: originalTemplate.variables,
      isDefault: false, // Never duplicate as default
      isActive: true
    };

    return await this.createTemplate(userId, duplicateData);
  }

  /**
   * Delete an email template (soft delete)
   */
  static async deleteTemplate(userId: string, templateId: string): Promise<void> {
    const existing = await this.getTemplate(userId, templateId);

    await withTransaction(async (tx) => {
      await tx
        .update(emailTemplate)
        .set({
          ...softDeleteData(),
          updatedAt: new Date()
        })
        .where(and(
          eq(emailTemplate.id, templateId),
          eq(emailTemplate.userId, userId),
          notDeleted(emailTemplate.deletedAt)
        ));
    });
  }

  /**
   * Increment usage count for a template
   */
  static async incrementUsage(userId: string, templateId: string): Promise<void> {
    await withTransaction(async (tx) => {
      await tx
        .update(emailTemplate)
        .set({
          usageCount: sql`${emailTemplate.usageCount} + 1`,
          updatedAt: new Date()
        })
        .where(and(
          eq(emailTemplate.id, templateId),
          eq(emailTemplate.userId, userId),
          notDeleted(emailTemplate.deletedAt)
        ));
    });
  }

  /**
   * Get default template for a category
   */
  static async getDefaultTemplate(
    userId: string, 
    category: string
  ): Promise<EmailTemplateResponse | null> {
    const templates = await db
      .select()
      .from(emailTemplate)
      .where(and(
        eq(emailTemplate.userId, userId),
        eq(emailTemplate.category, category),
        eq(emailTemplate.isDefault, true),
        eq(emailTemplate.isActive, true),
        notDeleted(emailTemplate.deletedAt)
      ))
      .limit(1);

    if (!templates.length) {
      return null;
    }

    return {
      ...templates[0],
      category: templates[0].category as any, // Cast to satisfy type checker
      variables: safeParseJSONArray(templates[0].variables, templateVariableSchema) as any, // Cast to satisfy type checker
      deletedAt: templates[0].deletedAt || null
    };
  }
}