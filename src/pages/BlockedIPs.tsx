import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_at: string;
  threat_count: number;
  status: string;
}

const BlockedIPs = () => {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchBlockedIPs();
  }, [user, navigate]);

  const fetchBlockedIPs = async () => {
    const { data, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .order('blocked_at', { ascending: false });

    if (!error && data) {
      setBlockedIPs(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
            <Lock className="h-8 w-8 text-warning" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Blocked IP Addresses
            </h1>
            <p className="text-muted-foreground mt-1">
              All IPs blocked by the IPS system
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading blocked IPs...</p>
            </CardContent>
          </Card>
        ) : blockedIPs.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No IPs blocked yet</p>
            </CardContent>
          </Card>
        ) : (
          blockedIPs.map((ip) => (
            <Card key={ip.id} className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <Lock className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-mono">{ip.ip_address}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ip.reason}
                      </p>
                    </div>
                  </div>
                  <Badge variant={ip.status === 'active' ? 'destructive' : 'secondary'}>
                    {ip.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Threat Count</p>
                      <p className="text-muted-foreground">{ip.threat_count} incidents</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Blocked At</p>
                      <p className="text-muted-foreground">
                        {new Date(ip.blocked_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BlockedIPs;