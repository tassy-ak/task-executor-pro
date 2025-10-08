import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
  variant: "danger" | "warning" | "success" | "info";
}

const variantStyles = {
  danger: "border-destructive/30 bg-destructive/5",
  warning: "border-warning/30 bg-warning/5",
  success: "border-success/30 bg-success/5",
  info: "border-primary/30 bg-primary/5",
};

const iconVariantStyles = {
  danger: "text-destructive bg-destructive/10",
  warning: "text-warning bg-warning/10",
  success: "text-success bg-success/10",
  info: "text-primary bg-primary/10",
};

export const StatsCard = ({ title, value, change, icon: Icon, trend, variant }: StatsCardProps) => {
  return (
    <Card className={cn("border-border/50 transition-all hover:border-opacity-100", variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
              <p className="text-xs text-muted-foreground">{change}</p>
            </div>
          </div>
          <div className={cn("p-3 rounded-lg", iconVariantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
