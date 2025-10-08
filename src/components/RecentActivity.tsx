import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "threat_blocked",
    message: "SQL Injection attempt blocked from 192.168.1.45",
    timestamp: "2024-10-08 14:32:15",
    severity: "critical",
  },
  {
    id: 2,
    type: "system_update",
    message: "Signature database updated with 1,247 new threat patterns",
    timestamp: "2024-10-08 14:30:00",
    severity: "info",
  },
  {
    id: 3,
    type: "threat_detected",
    message: "Anomaly detection: Unusual traffic pattern from subnet 10.0.0.0/24",
    timestamp: "2024-10-08 14:28:42",
    severity: "warning",
  },
  {
    id: 4,
    type: "prevention_success",
    message: "DDoS mitigation successful - 50,000 malicious packets dropped",
    timestamp: "2024-10-08 14:25:18",
    severity: "success",
  },
  {
    id: 5,
    type: "threat_blocked",
    message: "Port scan detected and blocked from 172.16.0.88",
    timestamp: "2024-10-08 14:20:05",
    severity: "warning",
  },
  {
    id: 6,
    type: "system_info",
    message: "Machine learning model retrained with latest threat data",
    timestamp: "2024-10-08 14:15:00",
    severity: "info",
  },
  {
    id: 7,
    type: "threat_blocked",
    message: "Malware payload intercepted in network traffic",
    timestamp: "2024-10-08 14:12:33",
    severity: "critical",
  },
  {
    id: 8,
    type: "prevention_success",
    message: "Brute force attack prevented - IP 10.10.10.50 blacklisted",
    timestamp: "2024-10-08 14:08:21",
    severity: "success",
  },
];

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

export const RecentActivity = () => {
  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        {activities.map((activity) => {
          const Icon = typeIcons[activity.type as keyof typeof typeIcons];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className={`mt-0.5 ${severityColors[activity.severity as keyof typeof severityColors]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-relaxed">{activity.message}</p>
                <p className="text-xs text-muted-foreground font-mono">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
