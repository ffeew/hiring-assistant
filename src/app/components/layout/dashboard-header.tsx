"use client";

import { ThemeToggle } from "../shared/theme-toggle";
import { UserMenu } from "../auth/user-menu";
import type { Session } from "@/lib/auth";

type User = Session['user'];

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - can be used for breadcrumbs or page title in the future */}
        <div className="flex items-center gap-4">
          {/* Breadcrumbs or page title could go here */}
        </div>

        {/* Right side - user controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}