import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, XCircle, Brain } from "lucide-react";
import { DetectedThreat } from "@/hooks/useIDSEngine";

interface ThreatAlertProps {
  threats: DetectedThreat[];
}

const severityColors = {
  critical: "destructive",
  high: "warning",
  medium: "default",
} as const;

const statusIcons = {
  blocked: XCircle,
  mitigated: Shield,
  monitoring: AlertTriangle,
};

const detectionMethodIcons = {
  signature: Shield,
  anomaly: Brain,
  hybrid: AlertTriangle,
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
          const StatusIcon = statusIcons[threat.status];
          const DetectionIcon = detectionMethodIcons[threat.detectionMethod];
          return (
            <div
              key={threat.id}
              className="p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4 text-destructive" />
                  <span className="font-semibold text-sm">{threat.type}</span>
                </div>
                <Badge variant={severityColors[threat.severity as keyof typeof severityColors]} className="text-xs">
                  {threat.severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">{threat.ip}</span>
                <span>{threat.time}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="outline" className="text-xs capitalize border-primary/30">
                  {threat.status}
                </Badge>
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <DetectionIcon className="h-3 w-3" />
                  {threat.detectionMethod}
                </Badge>
                {threat.confidence && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round(threat.confidence * 100)}% confident
                  </Badge>
                )}
              </div>
              {threat.details && (
                <p className="text-xs text-muted-foreground pt-1 border-t border-border/30">
                  {threat.details}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
