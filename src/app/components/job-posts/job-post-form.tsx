"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { JobPost, CreateJobPostData } from "@/app/types";

const jobPostSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior']).optional(),
  description: z.string().min(1, "Job description is required"),
  requirements: z.array(z.object({ value: z.string().min(1) })).optional(),
  responsibilities: z.array(z.object({ value: z.string().min(1) })).optional(),
  benefits: z.array(z.object({ value: z.string().min(1) })).optional(),
  salaryRange: z.string().optional(),
});

type JobPostFormData = z.infer<typeof jobPostSchema>;

interface JobPostFormProps {
  jobPost?: JobPost | null;
  onSave: (data: CreateJobPostData) => void;
  onCancel: () => void;
}

export function JobPostForm({ jobPost, onSave, onCancel }: JobPostFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<JobPostFormData>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      title: jobPost?.title || '',
      department: jobPost?.department || '',
      location: jobPost?.location || '',
      employmentType: jobPost?.employmentType || undefined,
      experienceLevel: jobPost?.experienceLevel || undefined,
      description: jobPost?.description || '',
      requirements: jobPost?.requirements.map(req => ({ value: req })) || [{ value: '' }],
      responsibilities: jobPost?.responsibilities.map(resp => ({ value: resp })) || [{ value: '' }],
      benefits: jobPost?.benefits.map(benefit => ({ value: benefit })) || [{ value: '' }],
      salaryRange: jobPost?.salaryRange || '',
    },
  });

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control,
    name: "requirements",
  });

  const {
    fields: responsibilityFields,
    append: appendResponsibility,
    remove: removeResponsibility,
  } = useFieldArray({
    control,
    name: "responsibilities",
  });

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control,
    name: "benefits",
  });

  const onSubmit = async (data: JobPostFormData) => {
    setIsLoading(true);
    
    const formattedData: CreateJobPostData = {
      title: data.title,
      department: data.department || undefined,
      location: data.location || undefined,
      employmentType: data.employmentType,
      experienceLevel: data.experienceLevel,
      description: data.description,
      requirements: data.requirements?.map(req => req.value).filter(Boolean) || [],
      responsibilities: data.responsibilities?.map(resp => resp.value).filter(Boolean) || [],
      benefits: data.benefits?.map(benefit => benefit.value).filter(Boolean) || [],
      salaryRange: data.salaryRange || undefined,
    };

    try {
      onSave(formattedData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {jobPost ? 'Edit Job Post' : 'Create New Job Post'}
            </h2>
            <button
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                  Job Title *
                </label>
                <input
                  {...register("title")}
                  id="title"
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  placeholder="e.g., Software Engineer Intern"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-foreground mb-1">
                  Department
                </label>
                <input
                  {...register("department")}
                  id="department"
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  placeholder="e.g., Engineering"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
                  Location
                </label>
                <input
                  {...register("location")}
                  id="location"
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  placeholder="e.g., San Francisco, CA / Remote"
                />
              </div>

              <div>
                <label htmlFor="employmentType" className="block text-sm font-medium text-foreground mb-1">
                  Employment Type
                </label>
                <select
                  {...register("employmentType")}
                  id="employmentType"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="">Select type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-medium text-foreground mb-1">
                  Experience Level
                </label>
                <select
                  {...register("experienceLevel")}
                  id="experienceLevel"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="">Select level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
              </div>

              <div>
                <label htmlFor="salaryRange" className="block text-sm font-medium text-foreground mb-1">
                  Salary Range
                </label>
                <input
                  {...register("salaryRange")}
                  id="salaryRange"
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                Job Description *
              </label>
              <textarea
                {...register("description")}
                id="description"
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Describe the role, company culture, and what makes this position exciting..."
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Requirements
                </label>
                <button
                  type="button"
                  onClick={() => appendRequirement({ value: '' })}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  + Add Requirement
                </button>
              </div>
              <div className="space-y-2">
                {requirementFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`requirements.${index}.value`)}
                      type="text"
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      placeholder="e.g., Bachelor's degree in Computer Science"
                    />
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsibilities */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Responsibilities
                </label>
                <button
                  type="button"
                  onClick={() => appendResponsibility({ value: '' })}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  + Add Responsibility
                </button>
              </div>
              <div className="space-y-2">
                {responsibilityFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`responsibilities.${index}.value`)}
                      type="text"
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      placeholder="e.g., Develop and maintain web applications"
                    />
                    <button
                      type="button"
                      onClick={() => removeResponsibility(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Benefits
                </label>
                <button
                  type="button"
                  onClick={() => appendBenefit({ value: '' })}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  + Add Benefit
                </button>
              </div>
              <div className="space-y-2">
                {benefitFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`benefits.${index}.value`)}
                      type="text"
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      placeholder="e.g., Health insurance, 401(k) matching"
                    />
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : jobPost ? 'Update Job Post' : 'Create Job Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}