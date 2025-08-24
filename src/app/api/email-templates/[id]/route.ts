import { NextResponse } from 'next/server';
import { withAuthParams, AuthenticatedRequest } from '@/lib/auth-middleware';
import { EmailTemplatesService } from '../email-templates.service';
import { 
  emailTemplateParamsSchema,
  updateEmailTemplateBodySchema
} from '../email-templates.validator';
import { ZodError } from 'zod';

async function getEmailTemplate(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = emailTemplateParamsSchema.parse({ id });
    const template = await EmailTemplatesService.getTemplate(request.user.id, validatedParams.id);

    return NextResponse.json({
      success: true,
      data: template
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

    console.error('Error fetching email template:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to fetch email template' }]
      },
      { status: 500 }
    );
  }
}

async function updateEmailTemplate(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = emailTemplateParamsSchema.parse({ id });
    const body = await request.json();
    const validatedData = updateEmailTemplateBodySchema.parse(body);

    const template = await EmailTemplatesService.updateTemplate(
      request.user.id, 
      validatedParams.id, 
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: template
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

    if (error instanceof Error && error.message.includes('undefined variables')) {
      return NextResponse.json(
        {
          error: 'Template validation failed',
          details: [{ field: 'content', message: error.message }]
        },
        { status: 400 }
      );
    }

    console.error('Error updating email template:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to update email template' }]
      },
      { status: 500 }
    );
  }
}

async function deleteEmailTemplate(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = emailTemplateParamsSchema.parse({ id });
    await EmailTemplatesService.deleteTemplate(request.user.id, validatedParams.id);

    return NextResponse.json({
      success: true,
      message: 'Email template deleted successfully'
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

    console.error('Error deleting email template:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to delete email template' }]
      },
      { status: 500 }
    );
  }
}

// Export authenticated route handlers
export const GET = withAuthParams(getEmailTemplate);
export const PUT = withAuthParams(updateEmailTemplate);
export const DELETE = withAuthParams(deleteEmailTemplate);