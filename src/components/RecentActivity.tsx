import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { SecurityEvent } from "@/hooks/useIDSEngine";

interface RecentActivityProps {
  events: SecurityEvent[];
}

const typeIcons = {
  threat_blocked: XCircle,
  threat_detected: AlertTriangle,
  prevention_success: CheckCircle,
  system_update: Shield,
  system_info: Info,
};

const severityColors = {
  critical: "text-destructive",
  warning: "text-warning",
  success: "text-success",
  info: "text-primary",
};

export const RecentActivity = ({ events = [] }: RecentActivityProps) => {
  if (!events || events.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <Info className="h-12 w-12 mx-auto opacity-50" />
          <p>No recent activity</p>
          <p className="text-xs">Events will appear here as they occur</p>
        </div>
      </div>
    );
  }
  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        {events.map((event) => {
          const Icon = typeIcons[event.type as keyof typeof typeIcons] || Info;
          return (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className={`mt-0.5 ${severityColors[event.severity as keyof typeof severityColors]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-relaxed">{event.message}</p>
                <p className="text-xs text-muted-foreground font-mono">{event.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
