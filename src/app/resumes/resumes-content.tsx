'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, User, Mail, Calendar, Download, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useResumes } from './queries/use-resumes';

interface ResumeFile {
  id: string;
  applicantId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  resumeContent: string | null;
  extractionStatus: 'pending' | 'success' | 'failed';
  extractionError: string | null;
  createdAt: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantEmail: string;
  url: string;
}

const StatusIcon = ({ status }: { status: 'pending' | 'success' | 'failed' }) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
};

const StatusBadge = ({ status }: { status: 'pending' | 'success' | 'failed' }) => {
  const variants = {
    pending: 'secondary',
    success: 'default',
    failed: 'destructive',
  } as const;

  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  );
};

export function ResumesContent() {
  const [selectedResume, setSelectedResume] = useState<ResumeFile | null>(null);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);

  // Use React Query for data fetching
  const { data: resumeFiles = [], isLoading: loading, error, refetch } = useResumes();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewContent = (resume: ResumeFile) => {
    setSelectedResume(resume);
    setIsContentDialogOpen(true);
  };

  const handleDownload = (resume: ResumeFile) => {
    window.open(resume.url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Resumes</h3>
            <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'An error occurred'}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applicants & Resumes</h1>
        <p className="text-muted-foreground">
          View and manage uploaded resumes and extracted candidate information
        </p>
      </div>

      {resumeFiles.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Resumes Found</h3>
              <p className="text-muted-foreground mb-4">
                Upload some resumes from the Resume Processing page to get started.
              </p>
              <Button asChild>
                <Link href="/">Upload Resumes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resumeFiles.map((resume) => (
            <Card key={resume.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <StatusIcon status={resume.extractionStatus} />
                  <StatusBadge status={resume.extractionStatus} />
                </div>
                <CardTitle className="text-lg">{resume.fileName}</CardTitle>
                <CardDescription className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      {resume.applicantFirstName} {resume.applicantLastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{resume.applicantEmail}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatFileSize(resume.fileSize)}</span>
                    <span>{resume.mimeType.split('/')[1].toUpperCase()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(resume.createdAt)}</span>
                  </div>

                  {resume.extractionStatus === 'failed' && resume.extractionError && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Extraction Error:</strong> {resume.extractionError}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(resume)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    
                    {resume.extractionStatus === 'success' && resume.resumeContent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewContent(resume)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Content
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content Viewer Dialog */}
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedResume?.fileName}</DialogTitle>
            <DialogDescription>
              Extracted content for {selectedResume?.applicantFirstName} {selectedResume?.applicantLastName}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] w-full">
            <div className="pr-4">
              <Textarea
                value={selectedResume?.resumeContent || ''}
                readOnly
                className="min-h-[400px] resize-none border-0 focus:ring-0 bg-transparent"
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}