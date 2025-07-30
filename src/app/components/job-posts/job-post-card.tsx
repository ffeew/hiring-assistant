"use client";

import type { JobPost } from "@/app/types";

interface JobPostCardProps {
  jobPost: JobPost;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (isActive: boolean) => void;
}

export function JobPostCard({ jobPost, onEdit, onDelete, onToggleActive }: JobPostCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEmploymentTypeLabel = (type: string | null) => {
    switch (type) {
      case 'full-time': return 'Full-time';
      case 'part-time': return 'Part-time';
      case 'contract': return 'Contract';
      case 'internship': return 'Internship';
      default: return null;
    }
  };

  const getExperienceLevelLabel = (level: string | null) => {
    switch (level) {
      case 'entry': return 'Entry Level';
      case 'mid': return 'Mid Level';
      case 'senior': return 'Senior Level';
      default: return null;
    }
  };

  return (
    <div className={`bg-background border rounded-lg p-6 shadow-sm transition-all ${
      jobPost.isActive ? 'border-border' : 'border-muted-foreground/30 opacity-75'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">{jobPost.title}</h3>
          {jobPost.department && (
            <p className="text-sm text-muted-foreground">{jobPost.department}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            jobPost.isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}>
            {jobPost.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {jobPost.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>📍</span>
            <span>{jobPost.location}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {getEmploymentTypeLabel(jobPost.employmentType) && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {getEmploymentTypeLabel(jobPost.employmentType)}
            </span>
          )}
          {getExperienceLevelLabel(jobPost.experienceLevel) && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
              {getExperienceLevelLabel(jobPost.experienceLevel)}
            </span>
          )}
        </div>

        {jobPost.salaryRange && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>💰</span>
            <span>{jobPost.salaryRange}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {jobPost.description.length > 150 
            ? `${jobPost.description.substring(0, 150)}...`
            : jobPost.description
          }
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Created {formatDate(jobPost.createdAt)}
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleActive(!jobPost.isActive)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              jobPost.isActive
                ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            {jobPost.isActive ? 'Deactivate' : 'Activate'}
          </button>
          
          <button
            onClick={onEdit}
            className="text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors"
          >
            Edit
          </button>
          
          <button
            onClick={onDelete}
            className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}