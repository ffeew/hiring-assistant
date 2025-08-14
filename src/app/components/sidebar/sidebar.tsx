"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Upload,
  BrainCircuit,
  Briefcase,
  Users,
  User,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const navigationSections: NavigationSection[] = [
  {
    title: "Workflow",
    items: [
      {
        name: "Resume Processing",
        href: "/",
        icon: Upload,
        description: "Upload and extract resume data",
      },
      {
        name: "Interview Assistant",
        href: "/interview-assistant",
        icon: BrainCircuit,
        description: "Generate AI-powered interview questions",
      },
      {
        name: "Live Interview",
        href: "/live-interview",
        icon: Video,
        description: "Real-time interview with AI assistance",
        badge: "New",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        name: "Job Posts",
        href: "/job-posts",
        icon: Briefcase,
        description: "Create and manage job postings",
      },
      {
        name: "Applicants & Resumes",
        href: "/resumes",
        icon: Users,
        description: "View candidates and their resumes",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        name: "Profile",
        href: "/profile",
        icon: User,
        description: "Manage your account settings",
        badge: "Soon",
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Hiring Assistant</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="hidden lg:flex h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMobile}
          className="lg:hidden h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
                    {!isCollapsed && (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
            {!isCollapsed && <Separator className="mt-4" />}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            <p>AI-powered hiring assistant</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 lg:hidden h-10 w-10 p-0 bg-background border shadow-md"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col bg-background border-r transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
}

export function SidebarTrigger() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-10 w-10 p-0 lg:hidden"
      onClick={() => {
        // This will be handled by the sidebar component
      }}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}