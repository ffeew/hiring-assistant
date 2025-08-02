"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/utils/auth-client";
import { Sidebar } from "./sidebar/sidebar";
import { DashboardHeader } from "./dashboard-header";
import { LoadingSpinner } from "./loading-spinner";
import type { Session } from "@/lib/auth";

type User = Session['user'];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await authClient.getSession();

        if (!data) {
          router.push("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Failed to get session:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    getSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}