import { useState, useEffect } from "react";
import type { ExtractedData, SuccessfulExtractionData, JobPost } from "../types";
import { useJobPosts } from "./use-job-posts";
import { useExtractResumesMutation, useSendEmailsMutation, useEmailPreviewMutation } from "./use-api-mutations";
import { useEmailTemplates } from "./use-email-templates";
import type { EmailPreviewResponse } from "@/lib/api-client";

// Type guard to check if extraction was successful
function isSuccessfulExtraction(data: ExtractedData): data is SuccessfulExtractionData {
  return !data.error && 
         !!data.resumeId && 
         !!data.applicantId && 
         !!data.firstName && 
         !!data.lastName && 
         !!data.email;
         // Note: templateId can be null if no templates exist, we'll handle this in the UI
}

// Type guard to check if data has a valid template assigned
function hasValidTemplate(data: ExtractedData): boolean {
  return !!data.templateId;
}

export function useHiringAssistant() {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [selectedJobPost, setSelectedJobPost] = useState<JobPost | null>(null);
  const [customJobPosition, setCustomJobPosition] = useState("Software Engineer Intern");
  const [emailPreviews, setEmailPreviews] = useState<EmailPreviewResponse['previews']>([]);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Fetch user's active job posts using TanStack Query
  const { data: jobPosts = [], isLoading: isLoadingJobPosts } = useJobPosts(true);

  // Fetch active email templates
  const { data: emailTemplatesResponse, isLoading: isLoadingEmailTemplates } = useEmailTemplates({
    isActive: true,
    limit: 100
  });
  const emailTemplates = emailTemplatesResponse?.data || [];

  // React Query mutations
  const extractResumesMutation = useExtractResumesMutation();
  const sendEmailsMutation = useSendEmailsMutation();
  const emailPreviewMutation = useEmailPreviewMutation();

  // Auto-select the first active job post when data loads
  useEffect(() => {
    if (jobPosts.length > 0 && !selectedJobPost) {
      setSelectedJobPost(jobPosts[0]);
    }
  }, [jobPosts, selectedJobPost]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    if (!selectedJobPost && !customJobPosition.trim()) {
      alert("Please select a job post or enter a custom position before uploading resumes.");
      return;
    }

    if (!selectedJobPost) {
      alert("Please select an existing job post. Custom positions are not supported for resume uploads. Create a job post first.");
      return;
    }

    try {
      const result = await extractResumesMutation.mutateAsync({
        files,
        jobPostId: selectedJobPost.id
      });
      
      // The data now comes with intelligent template selection already done
      setExtractedData(result);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error extracting data from resumes.");
    }
  };

  const handleSendEmails = async () => {
    const successfulExtractions = extractedData.filter(isSuccessfulExtraction);
    if (successfulExtractions.length === 0) {
      alert("No successful extractions to send emails to.");
      return;
    }

    // Check if all successful extractions have valid templates
    const extractionsWithoutTemplates = successfulExtractions.filter(data => !hasValidTemplate(data));

    if (extractionsWithoutTemplates.length > 0) {
      alert(
        `Cannot send emails: ${extractionsWithoutTemplates.length} candidate(s) don't have email templates assigned.\n\n` +
        `Please:\n` +
        `1. Create email templates at /email-templates\n` +
        `2. Re-process the resumes to auto-assign templates\n` +
        `OR manually select templates for each candidate below.`
      );
      return;
    }

    try {
      const payload = {
        recipients: successfulExtractions.map(data => ({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          templateId: data.templateId, // Required dynamic template ID
          jobPosition: selectedJobPost?.title || customJobPosition,
          resumeId: data.resumeId,
          applicantId: data.applicantId,
          // Enhanced candidate data
          phone: data.phone,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          portfolioUrl: data.portfolioUrl,
          skills: data.skills,
          experience: data.experience,
          education: data.education,
        })),
        jobPostId: selectedJobPost?.id,
      };

      const result = await sendEmailsMutation.mutateAsync(payload);

      if (result.results.totalFailed > 0) {
        alert(
          `Emails sent with some issues:\n` +
          `✅ Successfully sent: ${result.results.totalSent}\n` +
          `❌ Failed: ${result.results.totalFailed}\n\n` +
          `Errors:\n${result.results.errors.join("\n")}`
        );
      } else {
        alert(
          `🎉 All emails sent successfully!\n` +
          `✅ Total sent: ${result.results.totalSent} emails`
        );
      }
      setShowEmailPreview(false);
    } catch (error) {
      console.error("Error sending emails:", error);
      alert(
        `Error sending emails: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handlePreviewEmails = async () => {
    const successfulExtractions = extractedData.filter(isSuccessfulExtraction);
    if (successfulExtractions.length === 0) {
      alert("No successful extractions to preview emails for.");
      return;
    }

    // Check if all successful extractions have valid templates
    const extractionsWithoutTemplates = successfulExtractions.filter(data => !hasValidTemplate(data));

    if (extractionsWithoutTemplates.length > 0) {
      alert(
        `Cannot preview emails: ${extractionsWithoutTemplates.length} candidate(s) don't have email templates assigned.\n\n` +
        `Please:\n` +
        `1. Create email templates at /email-templates\n` +
        `2. Re-process the resumes to auto-assign templates\n` +
        `OR manually select templates for each candidate below.`
      );
      return;
    }

    try {
      const payload = {
        recipients: successfulExtractions.map(data => ({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          templateId: data.templateId, // Required dynamic template ID
          jobPosition: selectedJobPost?.title || customJobPosition,
          // Enhanced candidate data for previews
          phone: data.phone,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          portfolioUrl: data.portfolioUrl,
          skills: data.skills,
          experience: data.experience,
          education: data.education,
        })),
      };

      const result = await emailPreviewMutation.mutateAsync(payload);
      setEmailPreviews(result.previews);
      setShowEmailPreview(true);
    } catch (error) {
      console.error("Error generating email previews:", error);
      alert("Error generating email previews.");
    }
  };

  const updateExtractedData = (index: number, field: keyof ExtractedData, value: string) => {
    setExtractedData(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  // Calculate template status for UI feedback
  const successfulExtractions = extractedData.filter(isSuccessfulExtraction);
  const extractionsWithoutTemplates = successfulExtractions.filter(data => !hasValidTemplate(data));
  const hasTemplateIssues = extractionsWithoutTemplates.length > 0;

  return {
    files,
    extractedData,
    jobPosts,
    selectedJobPost,
    setSelectedJobPost,
    customJobPosition,
    setCustomJobPosition,
    emailTemplates,
    isExtracting: extractResumesMutation.isPending,
    isPreviewingEmails: emailPreviewMutation.isPending,
    isSendingEmails: sendEmailsMutation.isPending,
    isLoadingJobPosts,
    isLoadingEmailTemplates,
    emailPreviews,
    showEmailPreview,
    hasTemplateIssues,
    extractionsWithoutTemplates: extractionsWithoutTemplates.length,
    handleFileChange,
    handleUpload,
    handleSendEmails,
    handlePreviewEmails,
    updateExtractedData,
    setShowEmailPreview,
  };
}
