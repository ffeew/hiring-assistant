"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Briefcase, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { JobPost } from "../types";

interface JobPostSelectorProps {
  jobPosts: JobPost[];
  selectedJobPost: JobPost | null;
  onJobPostSelect: (jobPost: JobPost | null) => void;
  isLoading: boolean;
  required?: boolean;
}

export function JobPostSelector({
  jobPosts,
  selectedJobPost,
  onJobPostSelect,
  isLoading,
  required = false
}: JobPostSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Select Job Post
          {required && <span className="text-red-500">*</span>}
        </CardTitle>
        <CardDescription>
          Choose the job post that these resumes are applying for. This ensures proper data organization and enables the interview assistant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">
              Loading job posts...
            </span>
          </div>
        ) : jobPosts.length > 0 ? (
          <div className="space-y-4">
            <Select
              value={selectedJobPost?.id || ""}
              onValueChange={(value) => {
                const selected = jobPosts.find(post => post.id === value);
                onJobPostSelect(selected || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a job post" />
              </SelectTrigger>
              <SelectContent>
                {jobPosts
                  .filter(post => post.isActive)
                  .map(post => (
                    <SelectItem key={post.id} value={post.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{post.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {post.department && `${post.department} • `}
                          {post.location || "Remote"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {selectedJobPost && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-1">Selected Job Post:</h4>
                <p className="text-sm font-semibold">{selectedJobPost.title}</p>
                {selectedJobPost.department && (
                  <p className="text-xs text-muted-foreground">{selectedJobPost.department}</p>
                )}
              </div>
            )}

            {required && !selectedJobPost && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select a job post before uploading resumes.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>No job posts found. Create one first to organize your candidates properly.</span>
              </div>
              <Button asChild size="sm">
                <Link href="/job-posts">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Job Post
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}