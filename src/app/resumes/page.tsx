'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, User, Mail, Calendar, Download, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';

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

interface ApiResponse {
  success: boolean;
  resumeFiles: ResumeFile[];
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<ResumeFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/resumes');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        const errorDetails = errorData.details ? ` - ${JSON.stringify(errorData.details)}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      const data: ApiResponse = await response.json();
      setResumes(data.resumeFiles || []);
    } catch (err) {
      console.error('Resume fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const openModal = (resume: ResumeFile) => {
    setSelectedResume(resume);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading resumes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive/50">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive">Error Loading Resumes</h3>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button onClick={fetchResumes} className="mt-4" variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resume Records</h1>
        <p className="text-muted-foreground mt-2">
          View all uploaded resumes and their extracted content ({resumes.length} total)
        </p>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No resumes found</h3>
              <p className="text-muted-foreground">Upload some resumes to see them here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {resumes.map((resume) => (
            <Card key={resume.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {resume.fileName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {resume.applicantFirstName} {resume.applicantLastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {resume.applicantEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(resume.createdAt)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(resume.extractionStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-foreground">File Size</div>
                    <div className="text-muted-foreground">{formatFileSize(resume.fileSize)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Type</div>
                    <div className="text-muted-foreground">
                      {resume.mimeType === 'application/pdf' ? 'PDF' : 
                       resume.mimeType.includes('word') ? 'Word' : 'Document'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Hash</div>
                    <div className="text-muted-foreground font-mono text-xs">
                      {resume.fileHash ? resume.fileHash.substring(0, 12) + '...' : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Status</div>
                    <div className="text-muted-foreground">
                      {resume.extractionStatus === 'failed' && resume.extractionError ? (
                        <span className="text-destructive text-xs">{resume.extractionError}</span>
                      ) : (
                        <span className="capitalize">{resume.extractionStatus}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(resume.url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  {resume.resumeContent && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openModal(resume)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Extracted Text
                    </Button>
                  )}
                </div>

                {resume.resumeContent && (
                  <div className="space-y-2">
                    <div className="font-medium text-foreground">Preview (first 200 characters):</div>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md font-mono whitespace-pre-wrap">
                      {resume.resumeContent.substring(0, 200)}
                      {resume.resumeContent.length > 200 && '...'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog for Full Text View */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Extracted Text - {selectedResume?.fileName}
            </DialogTitle>
            <DialogDescription>
              Content extracted from the resume file. Check if newlines are preserved properly.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded border">
            <div className="p-4">
              <Textarea
                value={selectedResume?.resumeContent || ''}
                readOnly
                className="min-h-[400px] font-mono text-sm resize-none border-0 focus:ring-0"
                placeholder="No extracted content available"
              />
            </div>
          </ScrollArea>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Character count: {selectedResume?.resumeContent?.length || 0}</span>
            <span>
              Newlines detected: {selectedResume?.resumeContent ? 
                (selectedResume.resumeContent.match(/\n/g) || []).length : 0}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}