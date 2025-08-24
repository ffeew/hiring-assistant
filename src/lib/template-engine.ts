import { TemplateVariable } from '@/app/api/email-templates/email-templates.validator';

// Available template variables for email templates
export const DEFAULT_TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    name: "firstName",
    description: "Applicant's first name",
    required: true,
    type: "string"
  },
  {
    name: "lastName", 
    description: "Applicant's last name",
    required: true,
    type: "string"
  },
  {
    name: "fullName",
    description: "Applicant's full name (firstName lastName)",
    required: false,
    type: "string"
  },
  {
    name: "email",
    description: "Applicant's email address",
    required: true,
    type: "string"
  },
  {
    name: "jobPosition",
    description: "Job position title",
    required: false,
    type: "string"
  },
  {
    name: "companyName",
    description: "Company name from user profile",
    required: false,
    type: "string"
  },
  {
    name: "senderName",
    description: "Name of the email sender",
    required: false,
    type: "string"
  },
  {
    name: "senderTitle",
    description: "Job title of the email sender",
    required: false,
    type: "string"
  },
  {
    name: "currentDate",
    description: "Current date in readable format",
    required: false,
    type: "date"
  },
  {
    name: "interviewDate",
    description: "Scheduled interview date",
    required: false,
    type: "date"
  }
];

export interface TemplateContext {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  jobPosition?: string;
  companyName?: string;
  senderName?: string;
  senderTitle?: string;
  currentDate?: Date;
  interviewDate?: Date;
  [key: string]: any;
}

export class TemplateEngine {
  /**
   * Renders a template with provided context variables
   * Supports {{variable}} syntax for basic substitution
   * Supports {{#if condition}} conditional blocks {{/if}}
   */
  static render(template: string, context: TemplateContext): string {
    let rendered = template;

    // Auto-generate fullName if not provided
    if (!context.fullName && context.firstName && context.lastName) {
      context.fullName = `${context.firstName} ${context.lastName}`;
    }

    // Set current date if not provided
    if (!context.currentDate) {
      context.currentDate = new Date();
    }

    // Replace simple variables {{variable}}
    rendered = rendered.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const key = variable.trim();
      const value = context[key];
      
      if (value === undefined || value === null) {
        return match; // Keep original if no value found
      }
      
      // Format dates
      if (value instanceof Date) {
        return value.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      return String(value);
    });

    // Handle simple conditional blocks {{#if variable}} content {{/if}}
    rendered = rendered.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      const key = condition.trim();
      const value = context[key];
      
      // Show content if value exists and is truthy
      if (value && value !== '') {
        return content;
      }
      
      return ''; // Hide content if condition is falsy
    });

    return rendered;
  }

  /**
   * Validates that all required variables are present in context
   */
  static validateContext(variables: TemplateVariable[], context: TemplateContext): { isValid: boolean; missingVariables: string[] } {
    const missingVariables: string[] = [];
    
    variables.forEach(variable => {
      if (variable.required && (!context[variable.name] || context[variable.name] === '')) {
        missingVariables.push(variable.name);
      }
    });

    return {
      isValid: missingVariables.length === 0,
      missingVariables
    };
  }

  /**
   * Extracts all variable placeholders from a template string
   */
  static extractVariables(template: string): string[] {
    const variables = new Set<string>();
    const matches = template.match(/\{\{([^}#/]+)\}\}/g);
    
    if (matches) {
      matches.forEach(match => {
        const variable = match.replace(/[{}]/g, '').trim();
        if (!variable.startsWith('#') && !variable.startsWith('/')) {
          variables.add(variable);
        }
      });
    }

    return Array.from(variables);
  }

  /**
   * Creates template preview with sample data
   */
  static createPreview(template: string, variables: TemplateVariable[]): string {
    const sampleContext: TemplateContext = {
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      email: "john.doe@example.com",
      jobPosition: "Software Engineer",
      companyName: "Your Company",
      senderName: "Jane Smith",
      senderTitle: "Hiring Manager",
      currentDate: new Date(),
      interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    };

    return this.render(template, sampleContext);
  }
}