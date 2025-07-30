"use client";

import { useState, useEffect } from "react";
import type { ExtractedData, JobPost } from "../types";
import { EmailTemplate } from "../types";
import { useJobPosts } from "./use-job-posts";

export function useHiringAssistant() {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [selectedJobPost, setSelectedJobPost] = useState<JobPost | null>(null);
  const [customJobPosition, setCustomJobPosition] = useState("Software Engineer Intern");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isPreviewingEmails, setIsPreviewingEmails] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [emailPreviews, setEmailPreviews] = useState<{ html: string, subject: string, recipient: ExtractedData; }[]>([]);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Fetch user's active job posts using TanStack Query
  const { data: jobPosts = [], isLoading: isLoadingJobPosts } = useJobPosts(true);

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
    setIsExtracting(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract data");
      }

      const data = await response.json();
      // Initialize template field to SCREENING as default for all extracted data
      // Only add template for successful extractions (those without errors)
      const dataWithDefaultTemplate = data.map((item: ExtractedData) => ({
        ...item,
        template: item.template || EmailTemplate.SCREENING
      }));
      setExtractedData(dataWithDefaultTemplate);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error extracting data from resumes.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSendEmails = async () => {
    const successfulExtractions = extractedData.filter(data => !data.error);
    if (successfulExtractions.length === 0) {
      alert("No successful extractions to send emails to.");
      return;
    }

    setIsSendingEmails(true);

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: successfulExtractions.map(data => ({
            ...data,
            jobPosition: selectedJobPost?.title || customJobPosition,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      if (data.results.totalFailed > 0) {
        alert(
          `Emails sent with some issues:\n` +
          `✅ Successfully sent: ${data.results.totalSent}\n` +
          `❌ Failed: ${data.results.totalFailed}\n\n` +
          `Errors:\n${data.results.errors.join("\n")}`
        );
      } else {
        alert(
          `🎉 All emails sent successfully!\n` +
          `✅ Total sent: ${data.results.totalSent} emails`
        );
      }
      setShowEmailPreview(false);
    } catch (error) {
      console.error("Error sending emails:", error);
      alert(
        `Error sending emails: ${error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSendingEmails(false);
    }
  };

  const handlePreviewEmails = async () => {
    const successfulExtractions = extractedData.filter(data => !data.error);
    if (successfulExtractions.length === 0) {
      alert("No successful extractions to preview emails for.");
      return;
    }

    setIsPreviewingEmails(true);

    try {
      const response = await fetch("/api/email/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: successfulExtractions.map(data => ({
            ...data,
            jobPosition: selectedJobPost?.title || customJobPosition,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate email previews");
      }

      const data = await response.json();
      setEmailPreviews(data.previews);
      setShowEmailPreview(true);
    } catch (error) {
      console.error("Error generating email previews:", error);
      alert("Error generating email previews.");
    } finally {
      setIsPreviewingEmails(false);
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
    isExtracting,
    isPreviewingEmails,
    isSendingEmails,
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
