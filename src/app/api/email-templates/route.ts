import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { EmailTemplatesService } from './email-templates.service';
import { 
  getEmailTemplatesQuerySchema,
  createEmailTemplateBodySchema
} from './email-templates.validator';
import { ZodError } from 'zod';

async function getEmailTemplates(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const query = getEmailTemplatesQuerySchema.parse(queryParams);
    const result = await EmailTemplatesService.getTemplates(request.user.id, query);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: query.limit,
        offset: query.offset,
        hasMore: result.hasMore
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

    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to fetch email templates' }]
      },
      { status: 500 }
    );
  }
}

async function createEmailTemplate(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = createEmailTemplateBodySchema.parse(body);
    
    const template = await EmailTemplatesService.createTemplate(request.user.id, validatedData);

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

    if (error instanceof Error && error.message.includes('undefined variables')) {
      return NextResponse.json(
        {
          error: 'Template validation failed',
          details: [{ field: 'content', message: error.message }]
        },
        { status: 400 }
      );
    }

    console.error('Error creating email template:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to create email template' }]
      },
      { status: 500 }
    );
  }
}

// Export authenticated route handlers
export const GET = withAuth(getEmailTemplates);
export const POST = withAuth(createEmailTemplate);