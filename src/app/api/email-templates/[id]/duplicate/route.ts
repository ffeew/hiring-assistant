import { NextResponse } from 'next/server';
import { withAuthParams, AuthenticatedRequest } from '@/lib/auth-middleware';
import { EmailTemplatesService } from '../../email-templates.service';
import { 
  emailTemplateParamsSchema,
  duplicateEmailTemplateBodySchema
} from '../../email-templates.validator';
import { ZodError } from 'zod';

async function duplicateEmailTemplate(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = emailTemplateParamsSchema.parse({ id });
    const body = await request.json();
    const validatedData = duplicateEmailTemplateBodySchema.parse(body);

    const template = await EmailTemplatesService.duplicateTemplate(
      request.user.id,
      validatedParams.id,
      validatedData
    );

    return NextResponse.json(
      {
        success: true,
        data: template
      },
      { status: 201 }
    );
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

    console.error('Error duplicating email template:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to duplicate email template' }]
      },
      { status: 500 }
    );
  }
}

// Export authenticated route handler
export const POST = withAuthParams(duplicateEmailTemplate);