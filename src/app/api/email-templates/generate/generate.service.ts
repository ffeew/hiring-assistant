import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import type { GenerateTemplateBody } from "./generate.validator";

const generatedTemplateSchema = z.object({
  name: z.string().describe("A clear, descriptive name for the template"),
  subject: z.string().describe("The email subject line with variables like {{firstName}}, {{jobPosition}}"),
  content: z.string().describe("The HTML email content with proper formatting and variables"),
});

const VARIABLE_GUIDE = `
Available template variables (use double curly braces):
- {{firstName}} - Applicant's first name
- {{lastName}} - Applicant's last name  
- {{fullName}} - Applicant's full name
- {{email}} - Applicant's email address
- {{jobPosition}} - Job position title
- {{companyName}} - Company name
- {{senderName}} - Name of the email sender
- {{senderTitle}} - Job title of the sender
- {{currentDate}} - Current date
`;

const CATEGORY_CONTEXTS = {
  acknowledgment: "This template should thank the candidate for applying and confirm receipt of their application.",
  screening: "This template should request additional information or ask screening questions before proceeding.",
  interview: "This template should invite the candidate for an interview and provide scheduling details.",
  offer: "This template should make a job offer and include key details about the position.",
  rejection: "This template should politely decline the candidate while maintaining a positive relationship.",
  follow_up: "This template should follow up on previous communication or check application status.",
};

const TONE_DESCRIPTIONS = {
  professional: "Professional and business-like tone",
  friendly: "Warm and approachable tone while maintaining professionalism",
  formal: "Very formal and traditional business communication",
  casual: "Relaxed and conversational tone",
};

export class TemplateGenerationService {
  static async generateTemplate(data: GenerateTemplateBody) {
    const categoryContext = CATEGORY_CONTEXTS[data.category];
    const toneDescription = TONE_DESCRIPTIONS[data.tone];

    const systemPrompt = `You are an expert email template designer for HR and recruitment. Generate professional email templates for hiring workflows with modern, clean styling.

${data.includeVariables ? VARIABLE_GUIDE : "Do not use template variables - generate static content."}

Category: ${data.category} - ${categoryContext}
Tone: ${data.tone} - ${toneDescription}

Requirements:
1. Generate clean, professional HTML email content with inline CSS styling
2. Use proper HTML structure with semantic elements and professional formatting
3. ${data.includeVariables ? "Include relevant template variables where appropriate" : "Use placeholder text instead of variables"}
4. Keep content concise but complete
5. Include a professional signature area
6. Ensure the template is suitable for ${data.category} emails
7. Match the ${data.tone} tone throughout

STYLING REQUIREMENTS:
- Use a clean, modern design with plenty of white space
- Apply inline CSS styles for maximum email client compatibility
- Use a professional color scheme (blues, grays, with accent colors sparingly)
- Set font-family to system fonts: font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Use appropriate font sizes: 16px for body text, 18-20px for headings
- Add proper line height (1.5-1.6) for readability  
- Include subtle borders, padding, and margins for visual separation
- Use a maximum width of 600px for the main container
- Apply consistent spacing between sections (20-30px)
- Style links with clear hover states and professional colors (#0066cc or similar)
- Add subtle background colors for sections if appropriate (#f8f9fa for light backgrounds)
- Ensure responsive design that works on mobile devices
- Style buttons with proper padding, border-radius, and colors if needed
- Use professional typography hierarchy (h1, h2, p tags with appropriate styling)

EXAMPLE STYLING PATTERNS:
- Main container: max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;
- Headers: font-size: 20px; font-weight: 600; color: #333333; margin: 20px 0 15px 0;
- Body text: font-size: 16px; line-height: 1.6; color: #555555; margin: 15px 0;
- Signature: border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;

The email should be ready to send with minimal editing and look professional in all major email clients.`;

    const userPrompt = `Generate an email template based on this request: "${data.prompt}"

Make sure the template fits the ${data.category} category and uses a ${data.tone} tone.`;

    try {
      const result = await generateObject({
        model: groq("openai/gpt-oss-120b"),
        schema: generatedTemplateSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
      });

      return {
        success: true,
        data: result.object,
      };
    } catch (error) {
      console.error("Error generating template:", error);
      throw new Error("Failed to generate template. Please try again with a more specific prompt.");
    }
  }
}