import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, XCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Threat = Tables<'threats'>;

interface ThreatAlertProps {
  threats: Threat[];
}

const severityColors = {
  critical: "destructive",
  high: "warning",
  medium: "default",
  low: "secondary",
} as const;

const statusIcons = {
  blocked: XCircle,
  mitigated: Shield,
  active: AlertTriangle,
  monitoring: AlertTriangle,
};

export const ThreatAlert = ({ threats = [] }: ThreatAlertProps) => {
  if (!threats || threats.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <Shield className="h-12 w-12 mx-auto opacity-50" />
          <p>No active threats detected</p>
          <p className="text-xs">System monitoring in progress</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {threats.map((threat) => {
          const StatusIcon = statusIcons[threat.status as keyof typeof statusIcons] || AlertTriangle;
          const detectedTime = new Date(threat.detected_at).toLocaleTimeString();
          
          return (
            <div
              key={threat.id}
              className="p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4 text-destructive" />
                  <span className="font-semibold text-sm">{threat.threat_type}</span>
                </div>
                <Badge variant={severityColors[threat.severity as keyof typeof severityColors] || "default"} className="text-xs">
                  {threat.severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">{threat.source_ip}</span>
                <span>{detectedTime}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="outline" className="text-xs capitalize border-primary/30">
                  {threat.status}
                </Badge>
                {threat.blocked && (
                  <Badge variant="destructive" className="text-xs">
                    Blocked
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground pt-1 border-t border-border/30">
                {threat.description}
              </p>
              {threat.ai_analysis && (
                <p className="text-xs text-primary/80 pt-1">
                  AI: {threat.ai_analysis}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
