import { useState, useEffect } from "react";
import type { ExtractedData, SuccessfulExtractionData, JobPost } from "../types";
import { EmailTemplate } from "../types";
import { useJobPosts } from "./use-job-posts";
import { useExtractResumesMutation, useSendEmailsMutation, useEmailPreviewMutation } from "./use-api-mutations";
import type { EmailPreviewResponse } from "@/lib/api-client";

// Type guard to check if extraction was successful
function isSuccessfulExtraction(data: ExtractedData): data is SuccessfulExtractionData {
  return !data.error && 
         !!data.resumeId && 
         !!data.applicantId && 
         !!data.firstName && 
         !!data.lastName && 
         !!data.email && 
         !!data.template;
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
      
      // Initialize template field to SCREENING as default for all extracted data
      // Only add template for successful extractions (those without errors)
      const dataWithDefaultTemplate: ExtractedData[] = result.map((item) => ({
        fileName: item.fileName || '',
        firstName: item.firstName || '',
        lastName: item.lastName || '',
        email: item.email || '',
        template: (item.template as EmailTemplate) || EmailTemplate.SCREENING,
        jobPosition: item.jobPosition,
        resumeId: item.resumeId,
        applicantId: item.applicantId,
        error: item.error
      }));
      setExtractedData(dataWithDefaultTemplate);
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

    try {
      const payload = {
        recipients: successfulExtractions.map(data => ({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          template: data.template,
          jobPosition: selectedJobPost?.title || customJobPosition,
          resumeId: data.resumeId,
          applicantId: data.applicantId,
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

    try {
      const payload = {
        recipients: successfulExtractions.map(data => ({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          template: data.template,
          jobPosition: selectedJobPost?.title || customJobPosition,
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

  return {
    files,
    extractedData,
    jobPosts,
    selectedJobPost,
    setSelectedJobPost,
    customJobPosition,
    setCustomJobPosition,
    isExtracting: extractResumesMutation.isPending,
    isPreviewingEmails: emailPreviewMutation.isPending,
    isSendingEmails: sendEmailsMutation.isPending,
    isLoadingJobPosts,
    emailPreviews,
    showEmailPreview,
    handleFileChange,
    handleUpload,
    handleSendEmails,
    handlePreviewEmails,
    updateExtractedData,
    setShowEmailPreview,
  };
}
