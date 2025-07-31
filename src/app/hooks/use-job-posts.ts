"use client";

// Re-export hooks from the centralized API mutations file
export {
  useJobPostsQuery as useJobPosts,
  useJobPostQuery as useJobPost,
  useCreateJobPostMutation as useCreateJobPost,
  useUpdateJobPostMutation as useUpdateJobPost,
  useDeleteJobPostMutation as useDeleteJobPost,
  useToggleJobPostStatusMutation as useToggleJobPostStatus,
} from './use-api-mutations';