import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, XCircle } from "lucide-react";

const threats = [
  {
    id: 1,
    type: "SQL Injection",
    severity: "critical",
    ip: "192.168.1.45",
    time: "2 min ago",
    status: "blocked",
  },
  {
    id: 2,
    type: "DDoS Attempt",
    severity: "high",
    ip: "10.0.0.234",
    time: "5 min ago",
    status: "mitigated",
  },
  {
    id: 3,
    type: "Port Scanning",
    severity: "medium",
    ip: "172.16.0.88",
    time: "12 min ago",
    status: "monitoring",
  },
  {
    id: 4,
    type: "Malware Detection",
    severity: "critical",
    ip: "192.168.2.101",
    time: "18 min ago",
    status: "blocked",
  },
  {
    id: 5,
    type: "Brute Force",
    severity: "high",
    ip: "10.10.10.50",
    time: "25 min ago",
    status: "blocked",
  },
];

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

export const ThreatAlert = () => {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {threats.map((threat) => {
          const StatusIcon = statusIcons[threat.status as keyof typeof statusIcons];
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
              <div className="pt-1">
                <Badge variant="outline" className="text-xs capitalize border-primary/30">
                  {threat.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
