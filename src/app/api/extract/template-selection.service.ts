import { EmailTemplatesService } from '../email-templates/email-templates.service';

export class TemplateSelectionService {
  /**
   * Select email template for candidate: use default template or first available template
   */
  static async selectTemplateForCandidate(
    userId: string
  ): Promise<string | null> {
    try {
      // Get user's active templates
      const templatesResponse = await EmailTemplatesService.getTemplates(userId, {
        isActive: true,
        limit: 100,
        offset: 0
      });
      
      const templates = templatesResponse.data;
      if (templates.length === 0) {
        console.warn('No active templates found for user');
        return null;
      }

      // Use default template if available, otherwise use first template
      const defaultTemplate = templates.find(template => template.isDefault);
      const selectedTemplate = defaultTemplate || templates[0];
      
      return selectedTemplate.id;
    } catch (error) {
      console.error('Error selecting template for candidate:', error);
      return null;
    }
  }

  /**
   * Get default template for a specific category
   */
  static async getDefaultTemplate(
    userId: string,
    category: 'acknowledgment' | 'screening' | 'interview' | 'offer' | 'rejection' | 'follow_up'
  ): Promise<string | null> {
    try {
      const defaultTemplate = await EmailTemplatesService.getDefaultTemplate(userId, category);
      return defaultTemplate?.id || null;
    } catch (error) {
      console.error(`Error getting default ${category} template:`, error);
      return null;
    }
  }

}