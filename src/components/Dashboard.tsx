import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Activity, Lock, Eye, Database, LogOut, Settings } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ThreatAlert } from "./ThreatAlert";
import { NetworkChart } from "./NetworkChart";
import { RecentActivity } from "./RecentActivity";
import { SecurityChatbot } from "./SecurityChatbot";
import { DemoThreatGenerator } from "./DemoThreatGenerator";
import { useIDSEngine } from "@/hooks/useIDSEngine";
import { useRealtimeThreats } from "@/hooks/useRealtimeThreats";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isActive, events, trafficData } = useIDSEngine();
  const { realtimeThreats } = useRealtimeThreats();
  const { user, signOut } = useAuth();
  const [blockedIPsCount, setBlockedIPsCount] = useState(0);

  // Fetch blocked IPs count
  useEffect(() => {
    const fetchBlockedIPs = async () => {
      const { count } = await supabase
        .from('blocked_ips')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      setBlockedIPsCount(count || 0);
    };
    fetchBlockedIPs();

    // Subscribe to blocked_ips changes
    const channel = supabase
      .channel('blocked-ips-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_ips' }, () => {
        fetchBlockedIPs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

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
        <div className="flex gap-3 items-center">
          <DemoThreatGenerator />
          <Button onClick={() => navigate('/settings')} variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
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
            value={realtimeThreats.length.toString()}
            change={`${realtimeThreats.filter(t => t.blocked).length} blocked`}
            icon={AlertTriangle}
            trend="up"
            variant="danger"
          />
        </div>
        <div onClick={() => navigate('/blocked-ips')} className="cursor-pointer">
          <StatsCard
            title="Blocked IPs"
            value={blockedIPsCount.toString()}
            change="Active threat prevention"
            icon={Lock}
            trend="up"
            variant="warning"
          />
        </div>
        <StatsCard
          title="Active Threats"
          value={realtimeThreats.filter(t => t.status === 'active').length.toString()}
          change="Requiring attention"
          icon={Eye}
          trend="neutral"
          variant="success"
        />
        <StatsCard
          title="Critical Threats"
          value={realtimeThreats.filter(t => t.severity === 'critical').length.toString()}
          change="High priority alerts"
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
            <ThreatAlert threats={realtimeThreats} />
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
