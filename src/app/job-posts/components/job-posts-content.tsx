"use client";

import { useState } from "react";
import { JobPostCard } from "./job-post-card";
import { JobPostForm } from "./job-post-form";
import { LoadingSpinner } from "@/app/components/shared/loading-spinner";
import type { JobPost, CreateJobPostData } from "@/app/types";
import { useJobPosts } from "../queries/use-job-posts";
import { useCreateJobPost } from "../mutations/use-create-job-post";
import { useUpdateJobPost } from "../mutations/use-update-job-post";
import { useDeleteJobPost } from "../mutations/use-delete-job-post";
import { useToggleJobPostStatus } from "../mutations/use-toggle-status";

export function JobPostsContent() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<JobPost | null>(null);

  // TanStack Query hooks
  const { data: jobPosts = [], isLoading, error } = useJobPosts();
  const createJobPostMutation = useCreateJobPost();
  const updateJobPostMutation = useUpdateJobPost();
  const deleteJobPostMutation = useDeleteJobPost();
  const toggleStatusMutation = useToggleJobPostStatus();

  const handleCreateJobPost = async (jobPostData: CreateJobPostData) => {
    try {
      await createJobPostMutation.mutateAsync(jobPostData);
      setShowCreateForm(false);
    } catch (error) {
      alert(`Error creating job post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateJobPost = async (id: string, jobPostData: Partial<CreateJobPostData> & { isActive?: boolean }) => {
    try {
      await updateJobPostMutation.mutateAsync({ id, data: jobPostData });
      setEditingPost(null);
    } catch (error) {
      alert(`Error updating job post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteJobPost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job post?')) {
      return;
    }

    try {
      await deleteJobPostMutation.mutateAsync(id);
    } catch (error) {
      alert(`Error deleting job post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync({ id, isActive });
    } catch (error) {
      alert(`Error updating job post status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Loading job posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-medium text-foreground mb-2">Error loading job posts</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load job posts'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Job Posts</h1>
              <p className="text-muted-foreground mt-2">
                Manage your job advertisements and hiring campaigns
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              + Create Job Post
            </button>
          </div>

          {jobPosts.length === 0 ? (
            <div className="text-center py-12 bg-background border border-border rounded-lg">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-medium text-foreground mb-2">No job posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first job post to start managing your hiring campaigns
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Create Your First Job Post
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobPosts.map((post) => (
                <JobPostCard
                  key={post.id}
                  jobPost={post}
                  onEdit={() => setEditingPost(post)}
                  onDelete={() => handleDeleteJobPost(post.id)}
                  onToggleActive={(isActive) => handleToggleActive(post.id, isActive)}
                />
              ))}
            </div>
          )}
        </div>

      {(showCreateForm || editingPost) && (
        <JobPostForm
          jobPost={editingPost}
          onSave={editingPost && editingPost.id
            ? (data) => handleUpdateJobPost(editingPost.id, data)
            : handleCreateJobPost
          }
          onCancel={() => {
            setShowCreateForm(false);
            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
}