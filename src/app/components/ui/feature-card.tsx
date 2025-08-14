import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardVariants, iconSizes, spacing, typography } from "./design-tokens";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  buttonText: string;
  variant?: "default" | "primary";
  badge?: string;
  additionalIcon?: LucideIcon;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
  buttonText,
  variant = "default",
  badge,
  additionalIcon: AdditionalIcon,
  className
}: FeatureCardProps) {
  const isPrimary = variant === "primary";
  
  return (
    <Card 
      className={cn(
        cardVariants.feature,
        isPrimary && cardVariants.primary,
        className
      )}
    >
      <CardHeader className={spacing.cardHeader}>
        <div className="flex items-center gap-2">
          <Icon className={cn(iconSizes.lg, "text-primary")} />
          <CardTitle className={typography.cardTitle}>{title}</CardTitle>
          {badge && (
            <Badge variant="secondary" className={typography.smallText}>
              {badge}
            </Badge>
          )}
          {AdditionalIcon && (
            <AdditionalIcon className={cn(iconSizes.md, "text-amber-500")} />
          )}
        </div>
        <CardDescription className={typography.smallText}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className={spacing.cardContent}>
        <Link href={href}>
          <Button 
            variant={isPrimary ? "default" : "outline"} 
            className="w-full flex items-center gap-2"
          >
            {buttonText}
            <ArrowRight className={iconSizes.sm} />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}