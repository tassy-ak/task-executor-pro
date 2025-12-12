import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap, AlertTriangle, Shield } from 'lucide-react';

const threatTypes = [
  { type: 'SQL Injection', severity: 'critical', description: 'Attempted SQL injection attack detected in query parameters' },
  { type: 'XSS Attack', severity: 'high', description: 'Cross-site scripting attempt blocked in form submission' },
  { type: 'Brute Force', severity: 'high', description: 'Multiple failed authentication attempts from single IP' },
  { type: 'Port Scan', severity: 'medium', description: 'Sequential port scanning activity detected' },
  { type: 'DDoS Attack', severity: 'critical', description: 'Distributed denial of service attack pattern identified' },
  { type: 'Path Traversal', severity: 'high', description: 'Directory traversal attempt in file request' },
  { type: 'Command Injection', severity: 'critical', description: 'OS command injection attempt in API endpoint' },
  { type: 'Malware Communication', severity: 'critical', description: 'Outbound connection to known C2 server detected' },
];

function generateIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

export function DemoThreatGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateThreat = async () => {
    setIsGenerating(true);
    const threat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const shouldBlock = Math.random() > 0.3;

    try {
      const { error } = await supabase.from('threats').insert({
        threat_type: threat.type,
        severity: threat.severity,
        source_ip: generateIP(),
        destination_ip: '192.168.1.100',
        description: threat.description,
        status: shouldBlock ? 'blocked' : 'active',
        blocked: shouldBlock,
      });

      if (error) throw error;
      
      toast.success(`Threat detected: ${threat.type}`, {
        description: `Severity: ${threat.severity.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error generating threat:', error);
      toast.error('Failed to generate threat');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMultipleThreats = async () => {
    setIsGenerating(true);
    const count = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < count; i++) {
      await generateThreat();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setIsGenerating(false);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={generateThreat}
        disabled={isGenerating}
        className="gap-2"
      >
        <Zap className="h-4 w-4" />
        Simulate Threat
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={generateMultipleThreats}
        disabled={isGenerating}
        className="gap-2"
      >
        <AlertTriangle className="h-4 w-4" />
        Attack Burst
      </Button>
    </div>
  );
}
