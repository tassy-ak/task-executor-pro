import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowLeft, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ThreatAnalysis from '@/components/ThreatAnalysis';

interface Threat {
  id: string;
  threat_type: string;
  severity: string;
  source_ip: string;
  destination_ip: string | null;
  description: string;
  detected_at: string;
  status: string;
  blocked: boolean;
  ai_analysis: string | null;
  ai_analyzed_at: string | null;
}

const Threats = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchThreats();
  }, [user, navigate]);

  const fetchThreats = async () => {
    const { data, error } = await supabase
      .from('threats')
      .select('*')
      .order('detected_at', { ascending: false });

    if (!error && data) {
      setThreats(data);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Threat Detection Log
            </h1>
            <p className="text-muted-foreground mt-1">
              All detected security threats and incidents
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading threats...</p>
            </CardContent>
          </Card>
        ) : threats.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No threats detected yet</p>
            </CardContent>
          </Card>
        ) : (
          threats.map((threat) => (
            <Card key={threat.id} className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{threat.threat_type}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {threat.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getSeverityColor(threat.severity)}>
                      {threat.severity}
                    </Badge>
                    {threat.blocked && (
                      <Badge variant="outline" className="border-success/30 bg-success/5 text-success">
                        Blocked
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Source IP</p>
                      <p className="text-muted-foreground">{threat.source_ip}</p>
                    </div>
                  </div>
                  {threat.destination_ip && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Destination IP</p>
                        <p className="text-muted-foreground">{threat.destination_ip}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Detected At</p>
                      <p className="text-muted-foreground">
                        {new Date(threat.detected_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {threat.ai_analysis && (
                  <div className="mt-4">
                    <ThreatAnalysis analysis={threat.ai_analysis} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Threats;