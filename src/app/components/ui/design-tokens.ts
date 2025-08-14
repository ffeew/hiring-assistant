// Design tokens for consistent styling across components

export const cardVariants = {
  feature: "border-2 border-dashed hover:border-primary/50 transition-colors",
  callToAction: "border-2 border-dashed border-primary/20 bg-primary/5",
  primary: "bg-primary/5",
} as const;

export const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4", 
  lg: "h-5 w-5",
  xl: "h-6 w-6",
} as const;

export const spacing = {
  cardHeader: "pb-3",
  cardContent: "pt-0",
  iconContainer: "p-2 bg-primary/10 rounded-lg",
} as const;

export const typography = {
  pageTitle: "text-3xl font-bold tracking-tight",
  cardTitle: "text-base",
  description: "text-muted-foreground",
  smallText: "text-sm",
  featureList: "text-sm text-muted-foreground space-y-1 ml-4",
} as const;