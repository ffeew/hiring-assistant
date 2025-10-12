'use client';

import { ArrowLeft, Edit, Mail, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '../../components/shared/loading-spinner';
import { DashboardLayout } from '../../components/layout/dashboard-layout';
import { useEmailTemplatePreview } from '../queries/use-template-preview';
import { EmailTemplateData, TemplateCategory } from '../../types';

interface EmailTemplatePreviewProps {
  template: EmailTemplateData;
  onClose: () => void;
  onEdit: () => void;
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  acknowledgment: 'Acknowledgment',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Job Offer',
  rejection: 'Rejection',
  follow_up: 'Follow Up',
};

export function EmailTemplatePreview({ template, onClose, onEdit }: EmailTemplatePreviewProps) {
  const { data: previewData, isLoading, error } = useEmailTemplatePreview(template.id);

  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getCategoryBadgeColor = (category: TemplateCategory) => {
    const colors = {
      acknowledgment: 'bg-blue-100 text-blue-800',
      screening: 'bg-yellow-100 text-yellow-800',
      interview: 'bg-green-100 text-green-800',
      offer: 'bg-emerald-100 text-emerald-800',
      rejection: 'bg-red-100 text-red-800',
      follow_up: 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Preview: {template.name}</h1>
          <p className="text-muted-foreground">
            Preview how this email template will look when sent
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Name</h4>
                  <p className="text-sm">{template.name}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Category</h4>
                  <Badge className={getCategoryBadgeColor(template.category)}>
                    {CATEGORY_LABELS[template.category]}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Status</h4>
                  <div className="flex gap-2">
                    {template.isActive ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Inactive
                      </Badge>
                    )}
                    {template.isDefault && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm mb-2">Usage Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Times used:</span>
                      <span className="text-sm font-medium">{template.usageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="text-sm">{new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Updated:</span>
                      <span className="text-sm">{new Date(template.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm mb-2">Variables</h4>
                  <div className="space-y-1">
                    {template.variables && template.variables.length > 0 ? (
                      template.variables.map((variable, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <code className="bg-muted px-1.5 py-0.5 rounded">
                            {'{' + variable.name + '}'}
                          </code>
                          {variable.required && (
                            <Badge variant="secondary" className="text-xs h-4">
                              Required
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No custom variables</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Preview */}
          <div className="lg:col-span-2">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load template preview. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {previewData?.data && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Header */}
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Subject:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard(previewData.data.subject)}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-medium">{previewData.data.subject}</p>
                  </div>

                  <Separator />

                  {/* Email Body */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Email Content</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard(previewData.data.content)}
                        className="gap-2"
                      >
                        <Copy className="h-3 w-3" />
                        Copy HTML
                      </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      {/* Preview container with email styling */}
                      <div className="bg-background border border-border/50 p-6 min-h-[400px]">
                        <div 
                          className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-a:text-primary dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: previewData.data.content }}
                        />
                      </div>
                    </div>

                    {/* Sample Data Notice */}
                    <Alert>
                      <AlertDescription>
                        This preview uses sample data. Actual emails will use real applicant information.
                      </AlertDescription>
                    </Alert>
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