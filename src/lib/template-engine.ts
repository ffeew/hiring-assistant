import { TemplateVariable } from '@/app/api/email-templates/email-templates.validator';

// Available template variables for email templates
export const DEFAULT_TEMPLATE_VARIABLES: TemplateVariable[] = [
  // Basic candidate information
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
    name: "phone",
    description: "Applicant's phone number",
    required: false,
    type: "string"
  },

  // Job and company information
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

  // Professional links
  {
    name: "linkedinUrl",
    description: "Applicant's LinkedIn profile URL",
    required: false,
    type: "string"
  },
  {
    name: "githubUrl",
    description: "Applicant's GitHub profile URL",
    required: false,
    type: "string"
  },
  {
    name: "portfolioUrl",
    description: "Applicant's portfolio website URL",
    required: false,
    type: "string"
  },
  {
    name: "linkedinProfile",
    description: "Applicant's LinkedIn profile URL (alias for linkedinUrl)",
    required: false,
    type: "string"
  },
  {
    name: "portfolioLink",
    description: "Applicant's portfolio or GitHub URL",
    required: false,
    type: "string"
  },

  // Skills and experience
  {
    name: "skills",
    description: "Comma-separated list of all applicant skills",
    required: false,
    type: "string"
  },
  {
    name: "topSkills",
    description: "Top 5 most relevant skills",
    required: false,
    type: "string"
  },
  {
    name: "experienceYears",
    description: "Estimated years of professional experience",
    required: false,
    type: "string"
  },
  {
    name: "latestCompany",
    description: "Most recent employer company name",
    required: false,
    type: "string"
  },
  {
    name: "latestPosition",
    description: "Most recent job title/position",
    required: false,
    type: "string"
  },
  {
    name: "education",
    description: "Highest education (degree, field, institution)",
    required: false,
    type: "string"
  },

  // Dates
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
  // Basic candidate information
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;

  // Job and company information
  jobPosition?: string;
  companyName?: string;
  senderName?: string;
  senderTitle?: string;

  // Professional links
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  linkedinProfile?: string;
  portfolioLink?: string;

  // Skills and experience
  skills?: string;
  topSkills?: string;
  experienceYears?: string;
  latestCompany?: string;
  latestPosition?: string;
  education?: string;

  // Dates
  currentDate?: Date;
  interviewDate?: Date;
  
  [key: string]: string | Date | number | boolean | undefined;
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
    rendered = rendered.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, condition, content) => {
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
  static createPreview(template: string): string {
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