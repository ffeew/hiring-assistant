"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/app/utils/auth-client";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  gmailAddress: z.string().email("Please enter a valid Gmail address"),
  gmailAppPassword: z.string().min(16, "Gmail app password must be 16 characters").max(16, "Gmail app password must be 16 characters"),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const { data: result, error: authError } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        gmailAddress: data.gmailAddress,
        gmailAppPassword: data.gmailAppPassword,
        companyName: data.companyName || undefined,
        jobTitle: data.jobTitle || undefined,
      });

      if (authError) {
        setError(authError.message || "Failed to create account");
      } else if (result) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-background border border-border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
        Create Your Hiring Assistant Account
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Set up your account with email credentials to start using the hiring assistant
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
            Basic Information
          </h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Full Name *
            </label>
            <input
              {...register("name")}
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Account Email *
            </label>
            <input
              {...register("email")}
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter your account email"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Account Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
            Account Security
          </h3>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password *
            </label>
            <input
              {...register("password")}
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter your password (min 6 characters)"
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
              Confirm Password *
            </label>
            <input
              {...register("confirmPassword")}
              id="confirmPassword"
              type="password"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Email Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
            Email Configuration
          </h3>
          <p className="text-xs text-muted-foreground">
            Required to send automated emails to candidates
          </p>
          
          <div>
            <label htmlFor="gmailAddress" className="block text-sm font-medium text-foreground mb-1">
              Gmail Address *
            </label>
            <input
              {...register("gmailAddress")}
              id="gmailAddress"
              type="email"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="your.email@gmail.com"
            />
            {errors.gmailAddress && (
              <p className="text-sm text-destructive mt-1">{errors.gmailAddress.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="gmailAppPassword" className="block text-sm font-medium text-foreground mb-1">
              Gmail App Password *
            </label>
            <input
              {...register("gmailAppPassword")}
              id="gmailAppPassword"
              type="password"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="16-character app password"
            />
            {errors.gmailAppPassword && (
              <p className="text-sm text-destructive mt-1">{errors.gmailAppPassword.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              <a 
                href="https://support.google.com/accounts/answer/185833" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline"
              >
                Generate an app password in your Google Account settings
              </a>
            </p>
          </div>
        </div>

        {/* Company Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
            Company Details
          </h3>
          <p className="text-xs text-muted-foreground">
            Optional: Used in email templates to candidates
          </p>
          
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-1">
              Company Name
            </label>
            <input
              {...register("companyName")}
              id="companyName"
              type="text"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Your Company Name"
            />
            {errors.companyName && (
              <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-foreground mb-1">
              Your Job Title
            </label>
            <input
              {...register("jobTitle")}
              id="jobTitle"
              type="text"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Hiring Manager, HR Director, etc."
            />
            {errors.jobTitle && (
              <p className="text-sm text-destructive mt-1">{errors.jobTitle.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <span className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>
        </span>
      </div>
    </div>
  );
}