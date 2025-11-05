import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Activity, Lock, Eye, Database } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ThreatAlert } from "./ThreatAlert";
import { NetworkChart } from "./NetworkChart";
import { RecentActivity } from "./RecentActivity";
import { useIDSEngine } from "@/hooks/useIDSEngine";

const Dashboard = () => {
  const { isActive, threats, events, stats, trafficData } = useIDSEngine();

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Intrusion Detection & Prevention System
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time Network Security Monitoring
            </p>
          </div>
        </div>
        <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          System Active
        </Badge>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Threats Detected"
          value={stats.threatsDetected.toString()}
          change={`${stats.threatsBlocked} blocked automatically`}
          icon={AlertTriangle}
          trend="up"
          variant="danger"
        />
        <StatsCard
          title="Blocked IPs"
          value={stats.blockedIPs.toString()}
          change="Active threat prevention"
          icon={Lock}
          trend="up"
          variant="warning"
        />
        <StatsCard
          title="Packets Analyzed"
          value={stats.totalPackets.toString()}
          change={`${stats.normalPackets} normal traffic`}
          icon={Eye}
          trend="neutral"
          variant="success"
        />
        <StatsCard
          title="Detection Rate"
          value={stats.totalPackets > 0 ? `${Math.round((stats.threatsDetected / stats.totalPackets) * 100)}%` : "0%"}
          change="Hybrid detection active"
          icon={Database}
          trend="neutral"
          variant="info"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Traffic Chart */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Network Traffic Analysis
                </CardTitle>
                <CardDescription>Real-time packet inspection</CardDescription>
              </div>
              <Badge variant="outline" className="border-primary/30">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <NetworkChart data={trafficData} />
          </CardContent>
        </Card>

        {/* Threat Alerts */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Active Threats
            </CardTitle>
            <CardDescription>Recent security incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <ThreatAlert threats={threats} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Chronological log of system activity</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity events={events} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
