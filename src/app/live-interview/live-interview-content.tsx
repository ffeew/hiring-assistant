"use client";

import { Suspense } from 'react';
import { LiveInterviewDashboard } from './components/live-interview-dashboard';
import { LoadingSpinner } from '@/app/components/shared/loading-spinner';

export function LiveInterviewContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Live Interview Assistant
        </h1>
        <p className="text-muted-foreground">
          Conduct real-time interviews with AI-powered question suggestions and conversation analysis
        </p>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <LiveInterviewDashboard />
      </Suspense>
    </div>
  );
}