'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Eye, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DashboardLayout } from '../../components/dashboard-layout';
import { LoadingSpinner } from '../../components/loading-spinner';
import { useCreateEmailTemplate } from '../mutations/use-create-template';
import { useUpdateEmailTemplate } from '../mutations/use-update-template';
import { useGenerateTemplate } from '../mutations/use-generate-template';
import { EmailTemplateData, CreateEmailTemplateData, TemplateCategory, TemplateVariable } from '../../types';

const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string; description: string }[] = [
  { value: 'acknowledgment', label: 'Acknowledgment', description: 'Thank candidates for applying' },
  { value: 'screening', label: 'Screening', description: 'Initial screening questions' },
  { value: 'interview', label: 'Interview', description: 'Interview invitations and scheduling' },
  { value: 'offer', label: 'Job Offer', description: 'Job offer communications' },
  { value: 'rejection', label: 'Rejection', description: 'Polite rejection notifications' },
  { value: 'follow_up', label: 'Follow Up', description: 'Follow-up communications' },
];

const DEFAULT_VARIABLES: TemplateVariable[] = [
  { name: 'firstName', description: "Applicant's first name", required: true, type: 'string' },
  { name: 'lastName', description: "Applicant's last name", required: true, type: 'string' },
  { name: 'fullName', description: "Applicant's full name", required: false, type: 'string' },
  { name: 'email', description: "Applicant's email address", required: true, type: 'string' },
  { name: 'jobPosition', description: 'Job position title', required: false, type: 'string' },
  { name: 'companyName', description: 'Company name', required: false, type: 'string' },
  { name: 'senderName', description: 'Name of the email sender', required: false, type: 'string' },
  { name: 'senderTitle', description: 'Job title of the sender', required: false, type: 'string' },
  { name: 'currentDate', description: 'Current date', required: false, type: 'date' },
];

const formSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Name is too long'),
  category: z.enum(['acknowledgment', 'screening', 'interview', 'offer', 'rejection', 'follow_up']),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  content: z.string().min(1, 'Content is required'),
  isDefault: z.boolean(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface EmailTemplateEditorProps {
  template?: EmailTemplateData | null;
  onClose: () => void;
  onSave: () => void;
}

export function EmailTemplateEditor({ template, onClose, onSave }: EmailTemplateEditorProps) {
  const [showPreview, setShowPreview] = useState(true); // Show preview by default
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');

  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();
  const generateTemplate = useGenerateTemplate();

  const isEditing = !!template;

  // AI Generation state
  const [showAiGenerator, setShowAiGenerator] = useState(!isEditing); // Show for new templates
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState<'professional' | 'friendly' | 'formal' | 'casual'>('professional');
  const [includeVariables, setIncludeVariables] = useState(true);
  const title = isEditing ? `Edit Template: ${template.name}` : 'Create New Template';

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || '',
      category: template?.category || 'acknowledgment',
      subject: template?.subject || '',
      content: template?.content || '',
      isDefault: template?.isDefault ?? false,
      isActive: template?.isActive ?? true,
    },
  });

  // Extract email body content from full HTML document
  const extractEmailBodyContent = (htmlContent: string): string => {
    // If it's a complete HTML document, extract only the body content
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }
    
    // If it has head/style tags but no body, remove them
    let cleanContent = htmlContent;
    cleanContent = cleanContent.replace(/<html[^>]*>|<\/html>/gi, '');
    cleanContent = cleanContent.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
    cleanContent = cleanContent.replace(/<!DOCTYPE[^>]*>/gi, '');
    cleanContent = cleanContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    return cleanContent.trim();
  };

  // Generate preview HTML
  const generatePreview = useCallback((content: string) => {
    // Simple preview with sample data
    const sampleData = {
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      jobPosition: 'Software Engineer',
      companyName: 'Your Company',
      senderName: 'Jane Smith',
      senderTitle: 'Hiring Manager',
      currentDate: new Date().toLocaleDateString(),
    };

    // Extract only the body content (remove full HTML document structure)
    let preview = extractEmailBodyContent(content);
    
    // Replace template variables
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      preview = preview.replace(regex, value);
    });

    return preview;
  }, []);

  // Update preview when content or subject changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.content) {
        setPreviewHtml(generatePreview(value.content));
      }
      if (value.subject) {
        setPreviewSubject(generatePreview(value.subject));
      }
    });
    
    // Generate initial preview
    const currentContent = form.getValues('content');
    const currentSubject = form.getValues('subject');
    if (currentContent) {
      setPreviewHtml(generatePreview(currentContent));
    }
    if (currentSubject) {
      setPreviewSubject(generatePreview(currentSubject));
    }
    
    return () => subscription.unsubscribe();
  }, [form, generatePreview]);

  const onSubmit = async (data: FormData) => {
    try {
      const templateData: CreateEmailTemplateData = {
        ...data,
        variables: DEFAULT_VARIABLES, // Use default variables for now
      };

      if (isEditing) {
        await updateTemplate.mutateAsync({
          id: template.id,
          data: templateData,
        });
      } else {
        await createTemplate.mutateAsync(templateData);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleAiGeneration = async () => {
    if (!aiPrompt.trim()) return;

    try {
      const result = await generateTemplate.mutateAsync({
        prompt: aiPrompt,
        category: form.getValues('category'),
        tone: aiTone,
        includeVariables,
      });

      // Update form with AI-generated content
      form.setValue('name', result.name);
      form.setValue('subject', result.subject);
      form.setValue('content', result.content);

      // Clear the prompt and hide the generator
      setAiPrompt('');
      setShowAiGenerator(false);
    } catch (error) {
      console.error('AI generation failed:', error);
    }
  };

  const isLoading = createTemplate.isPending || updateTemplate.isPending || generateTemplate.isPending;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modify your email template' : 'Create a new email template for candidate communication'}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Button>
          <div className="flex gap-2">
            <Button
              variant={showPreview ? "default" : "outline"}
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button
              type="submit"
              form="template-form"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              <Save className="h-4 w-4" />
              {isEditing ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </div>

        {/* AI Template Generator */}
        <Card className={`transition-all duration-200 ${showAiGenerator ? '' : 'border-dashed'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                AI Template Generator
                <Badge variant="secondary" className="text-xs">
                  Beta
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAiGenerator(!showAiGenerator)}
                className="gap-1"
              >
                {showAiGenerator ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show AI Generator
                  </>
                )}
              </Button>
            </div>
            {!showAiGenerator && (
              <p className="text-sm text-muted-foreground">
                Let AI create your template from a simple description
              </p>
            )}
          </CardHeader>
          
          {showAiGenerator && (
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Describe your email template
                  </label>
                  <Textarea
                    placeholder="e.g., A professional acknowledgment email thanking candidates for applying to a software engineering position and letting them know we'll review their application within 5 business days."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be specific about the purpose, tone, and key information to include
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tone</label>
                    <Select value={aiTone} onValueChange={(value) => setAiTone(value as typeof aiTone)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <div>
                      <label className="text-sm font-medium">Include Variables</label>
                      <p className="text-xs text-muted-foreground">Add template variables like names, positions, etc.</p>
                    </div>
                    <Switch
                      checked={includeVariables}
                      onCheckedChange={setIncludeVariables}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAiGeneration}
                    disabled={!aiPrompt.trim() || generateTemplate.isPending}
                    className="gap-2"
                  >
                    {generateTemplate.isPending && <LoadingSpinner size="sm" />}
                    <Sparkles className="h-4 w-4" />
                    Generate Template
                  </Button>
                  
                  {generateTemplate.error && (
                    <Alert variant="destructive" className="flex-1">
                      <AlertDescription>
                        {generateTemplate.error.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Form */}
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form id="template-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Welcome Email for Software Engineers" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="justify-start text-left">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TEMPLATE_CATEGORIES.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  <div>
                                    <div className="font-medium">{category.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {category.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Welcome to {{companyName}} - {{jobPosition}} Position" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Use variables like {'{firstName}'} or {'{companyName}'} for dynamic content
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Email Content */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Content (HTML)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={`Write your email content here. Example:

<p>Dear {{firstName}},</p>

<p>Thank you for your interest in the {{jobPosition}} position at {{companyName}}.</p>

<p>Best regards,<br>
{{senderName}}</p>

You can use HTML for formatting and variables for personalization.`}
                            className="min-h-[300px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use HTML for formatting. Available variables: {'{firstName}'}, {'{lastName}'}, {'{email}'}, {'{jobPosition}'}, {'{companyName}'}, {'{senderName}'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Template Settings */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Template Settings</h3>
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Active Template</FormLabel>
                            <FormDescription>
                              Active templates can be used in email workflows
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isDefault"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Default Template</FormLabel>
                            <FormDescription>
                              Set as default template for this category
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Preview & Variables */}
          <div className="space-y-6">
            {/* Available Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Available Variables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Click on any variable below to insert it into your template:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {DEFAULT_VARIABLES.map((variable) => (
                      <button
                        key={variable.name}
                        type="button"
                        onClick={() => {
                          const contentField = form.getValues('content');
                          const variableString = `{{${variable.name}}}`;
                          form.setValue('content', contentField + variableString);
                        }}
                        className="flex items-center justify-between p-2 bg-muted hover:bg-muted/80 rounded text-left transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-background px-1.5 py-0.5 rounded">
                              {'{' + variable.name + '}'}
                            </code>
                            {variable.required && (
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {variable.description}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground ml-2">
                          Click to insert
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> Variables will be replaced with actual data when emails are sent
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Live Preview */}
            {showPreview && (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Email Preview
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    This preview updates as you type and shows how the email will look with sample data
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Email Header */}
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Subject Line:</div>
                      <div className="font-medium">
                        {previewSubject || 'Enter a subject line to see preview...'}
                      </div>
                    </div>

                    {/* Email Body Preview */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 px-3 py-2 border-b">
                        <div className="text-xs text-muted-foreground">Email Content:</div>
                      </div>
                      <div className="p-4 bg-background border border-border/50 min-h-[200px] max-h-[400px] overflow-y-auto">
                        {previewHtml ? (
                          <div 
                            className="email-preview-container prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-a:text-primary dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: previewHtml }}
                            style={{
                              // CSS isolation to prevent email styles from affecting the parent app
                              contain: 'layout style',
                              isolation: 'isolate'
                            }}
                          />
                        ) : (
                          <div className="text-muted-foreground italic">
                            Start writing your template content to see the preview...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sample Data Notice */}
                    <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                      <strong>Preview uses sample data:</strong> John Doe, john.doe@example.com, Your Company, etc.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}