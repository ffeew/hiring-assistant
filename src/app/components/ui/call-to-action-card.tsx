import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cardVariants, iconSizes, spacing, typography } from "./design-tokens";

interface CallToActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  buttonText: string;
  features: string[];
}

export function CallToActionCard({
  title,
  description,
  href,
  icon: Icon,
  buttonText,
  features
}: CallToActionCardProps) {
  return (
    <Card className={cardVariants.callToAction}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={spacing.iconContainer}>
            <Icon className={`${iconSizes.lg} text-primary`} />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className={spacing.cardContent}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-2">
            <p className={`${typography.smallText} ${typography.description}`}>
              Use the <strong>{title}</strong> feature to:
            </p>
            <ul className={typography.featureList}>
              {features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
          <Link href={href}>
            <Button className="flex items-center gap-2 whitespace-nowrap">
              {buttonText}
              <ArrowRight className={iconSizes.md} />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}