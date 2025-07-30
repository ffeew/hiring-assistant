"use client";

import { useState, useEffect } from "react";
import type { Session } from "@/lib/auth";

type User = Session['user'];

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export function ProfileSettingsModal({ isOpen, onClose, user, onUpdate }: ProfileSettingsModalProps) {
  const [formData, setFormData] = useState({
    gmailAddress: user.gmailAddress || '',
    gmailAppPassword: user.gmailAppPassword || '',
    companyName: user.companyName || '',
    jobTitle: user.jobTitle || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        gmailAddress: user.gmailAddress || '',
        gmailAppPassword: user.gmailAppPassword === '****' ? '' : (user.gmailAppPassword || ''), // Clear masked password
        companyName: user.companyName || '',
        jobTitle: user.jobTitle || '',
      });
      setError('');
      setSuccess('');
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const { user: updatedUser } = await response.json();
      onUpdate(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Profile Settings</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Email Configuration
              </h3>
              
              <div>
                <label htmlFor="gmailAddress" className="block text-sm font-medium text-foreground mb-1">
                  Gmail Address *
                </label>
                <input
                  type="email"
                  id="gmailAddress"
                  value={formData.gmailAddress}
                  onChange={(e) => setFormData({ ...formData, gmailAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your.email@gmail.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="gmailAppPassword" className="block text-sm font-medium text-foreground mb-1">
                  Gmail App Password *
                </label>
                <input
                  type="password"
                  id="gmailAppPassword"
                  value={formData.gmailAppPassword}
                  onChange={(e) => setFormData({ ...formData, gmailAppPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="16-character app password"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Generate an app password in your Google Account settings. Your password is encrypted and stored securely.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Company Details
              </h3>
              
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-foreground mb-1">
                  Your Job Title
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Hiring Manager, HR Director, etc."
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}