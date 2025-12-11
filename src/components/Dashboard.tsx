import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Activity, Lock, Eye, Database, Download, LogOut, Settings } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ThreatAlert } from "./ThreatAlert";
import { NetworkChart } from "./NetworkChart";
import { RecentActivity } from "./RecentActivity";
import { SecurityChatbot } from "./SecurityChatbot";
import { useIDSEngine } from "@/hooks/useIDSEngine";
import { useRealtimeThreats } from "@/hooks/useRealtimeThreats";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isActive, threats, events, stats, trafficData } = useIDSEngine();
  const { realtimeThreats } = useRealtimeThreats();
  const { user, signOut } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      navigate('/install');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) return null;

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
        <div className="flex gap-3">
          <Button onClick={handleInstall} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Install App
          </Button>
          <Button onClick={() => navigate('/settings')} variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button onClick={handleSignOut} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            System Active
          </Badge>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => navigate('/threats')} className="cursor-pointer">
          <StatsCard
            title="Threats Detected"
            value={stats.threatsDetected.toString()}
            change={`${stats.threatsBlocked} blocked automatically`}
            icon={AlertTriangle}
            trend="up"
            variant="danger"
          />
        </div>
        <div onClick={() => navigate('/blocked-ips')} className="cursor-pointer">
          <StatsCard
            title="Blocked IPs"
            value={stats.blockedIPs.toString()}
            change="Active threat prevention"
            icon={Lock}
            trend="up"
            variant="warning"
          />
        </div>
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

      {/* Security Chatbot */}
      <SecurityChatbot />
    </div>
  );
};

export default Dashboard;
