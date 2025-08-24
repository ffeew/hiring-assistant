import { NextResponse } from 'next/server';
import { withAuthParams, AuthenticatedRequest } from '@/lib/auth-middleware';
import { EmailTemplatesService } from '../../email-templates.service';
import { emailTemplateParamsSchema } from '../../email-templates.validator';
import { TemplateEngine } from '@/lib/template-engine';
import { ZodError } from 'zod';

async function previewEmailTemplate(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = emailTemplateParamsSchema.parse({ id });
    const template = await EmailTemplatesService.getTemplate(request.user.id, validatedParams.id);

    // Generate preview with sample data
    const previewContent = TemplateEngine.createPreview(template.content, template.variables);
    const previewSubject = TemplateEngine.createPreview(template.subject, template.variables);

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        category: template.category,
        subject: previewSubject,
        content: previewContent,
        variables: template.variables
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Template not found') {
      return NextResponse.json(
        {
          error: 'Template not found',
          details: [{ field: 'id', message: 'Email template not found' }]
        },
        { status: 404 }
      );
    }

    console.error('Error generating template preview:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to generate template preview' }]
      },
      { status: 500 }
    );
  }
}

// Export authenticated route handler
export const GET = withAuthParams(previewEmailTemplate);