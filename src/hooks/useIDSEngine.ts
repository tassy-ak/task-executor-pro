import { useState, useEffect, useCallback, useRef } from 'react';
import { NetworkPacket, AnomalyDetector, analyzePacket } from '@/services/packetAnalyzer';
import { TrafficGenerator } from '@/services/packetGenerator';
import { ThreatMitigationSystem } from '@/services/threatMitigation';
import { supabase } from '@/integrations/supabase/client';

export interface DetectedThreat {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  ip: string;
  time: string;
  status: 'blocked' | 'mitigated' | 'monitoring';
  detectionMethod: 'signature' | 'anomaly' | 'hybrid';
  details: string;
  confidence?: number;
}

export interface SecurityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'success' | 'info';
}

export interface NetworkStats {
  totalPackets: number;
  normalPackets: number;
  threatsDetected: number;
  threatsBlocked: number;
  blockedIPs: number;
}

export function useIDSEngine() {
  const [isActive, setIsActive] = useState(true);
  const [threats, setThreats] = useState<DetectedThreat[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<NetworkStats>({
    totalPackets: 0,
    normalPackets: 0,
    threatsDetected: 0,
    threatsBlocked: 0,
    blockedIPs: 0
  });
  const [trafficData, setTrafficData] = useState<Array<{ time: string; normal: number; threats: number }>>([]);

  const packetsRef = useRef<NetworkPacket[]>([]);
  const anomalyDetectorRef = useRef(new AnomalyDetector());
  const trafficGeneratorRef = useRef(new TrafficGenerator());
  const mitigationSystemRef = useRef(new ThreatMitigationSystem());

  // Add event to the log
  const addEvent = useCallback((type: string, message: string, severity: SecurityEvent['severity']) => {
    const event: SecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
      severity
    };

    setEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
  }, []);

  // Process a packet through the IDS/IPS system
  const processPacket = useCallback((packet: NetworkPacket) => {
    // Check if IP is already blocked
    if (mitigationSystemRef.current.isIPBlocked(packet.sourceIP)) {
      setStats(prev => ({ ...prev, threatsBlocked: prev.threatsBlocked + 1 }));
      return;
    }

    // Analyze packet
    const analysisResult = analyzePacket(
      packet,
      packetsRef.current,
      anomalyDetectorRef.current
    );

    // Update packet history
    packetsRef.current.push(packet);
    if (packetsRef.current.length > 1000) {
      packetsRef.current = packetsRef.current.slice(-1000);
    }

    // Update stats
    setStats(prev => ({
      ...prev,
      totalPackets: prev.totalPackets + 1,
      normalPackets: analysisResult.isThreat ? prev.normalPackets : prev.normalPackets + 1
    }));

    if (analysisResult.isThreat) {
      // Determine status based on severity
      let status: 'blocked' | 'mitigated' | 'monitoring' = 'monitoring';
      
      if (analysisResult.severity === 'critical') {
        status = 'blocked';
        mitigationSystemRef.current.blockIP(
          packet.sourceIP,
          analysisResult.threatType || 'Critical threat detected',
          'critical',
          3600000 // Block for 1 hour
        );
        addEvent(
          'threat_blocked',
          `Critical threat blocked: ${analysisResult.threatType} from ${packet.sourceIP}`,
          'critical'
        );
      } else if (analysisResult.severity === 'high') {
        status = 'mitigated';
        mitigationSystemRef.current.blockIP(
          packet.sourceIP,
          analysisResult.threatType || 'High severity threat',
          'high',
          1800000 // Block for 30 minutes
        );
        addEvent(
          'prevention_success',
          `High severity threat mitigated: ${analysisResult.threatType} from ${packet.sourceIP}`,
          'success'
        );
      } else {
        status = 'monitoring';
        addEvent(
          'threat_detected',
          `Threat detected: ${analysisResult.threatType} from ${packet.sourceIP}`,
          'warning'
        );
      }

      // Create threat object
      const threat: DetectedThreat = {
        id: packet.id,
        type: analysisResult.threatType || 'Unknown Threat',
        severity: analysisResult.severity as DetectedThreat['severity'] || 'medium',
        ip: packet.sourceIP,
        time: new Date(packet.timestamp).toLocaleTimeString(),
        status,
        detectionMethod: analysisResult.detectionMethod === 'none' ? 'anomaly' : analysisResult.detectionMethod,
        details: analysisResult.details || 'No details available',
        confidence: analysisResult.confidence
      };

      setThreats(prev => [threat, ...prev].slice(0, 20));
      setStats(prev => ({
        ...prev,
        threatsDetected: prev.threatsDetected + 1,
        threatsBlocked: status === 'blocked' ? prev.threatsBlocked + 1 : prev.threatsBlocked,
        blockedIPs: mitigationSystemRef.current.getBlockedIPs().length
      }));

      // Save threat to database
      setTimeout(() => {
        supabase.from('threats').insert({
          threat_type: analysisResult.threatType || 'Unknown Threat',
          severity: analysisResult.severity || 'medium',
          source_ip: packet.sourceIP,
          destination_ip: packet.destIP,
          description: analysisResult.details || 'No details available',
          blocked: status === 'blocked'
        })
        .select()
        .single()
        .then(({ data: threatData, error }) => {
          if (error) {
            console.error('Error saving threat:', error);
            return;
          }
          
          // Trigger AI analysis asynchronously (non-blocking)
          if (threatData) {
            supabase.functions.invoke('analyze-threat', {
              body: {
                threatId: threatData.id,
                threatData: {
                  threatType: analysisResult.threatType,
                  severity: analysisResult.severity,
                  detectionMethod: analysisResult.detectionMethod,
                  sourceIP: packet.sourceIP,
                  destIP: packet.destIP,
                  details: analysisResult.details,
                  confidence: analysisResult.confidence || 0.5
                }
              }
            }).then(({ error: aiError }) => {
              if (aiError) {
                console.error('Error triggering AI analysis:', aiError);
              } else {
                console.log('AI analysis triggered for threat:', threatData.id);
              }
            });
          }
        });

        // Save blocked IP to database if blocked
        if (status === 'blocked') {
          supabase.from('blocked_ips')
            .select('*')
            .eq('ip_address', packet.sourceIP)
            .maybeSingle()
            .then(({ data, error }) => {
              if (error) {
                console.error('Error checking blocked IP:', error);
                return;
              }

              if (data) {
                // Update existing blocked IP
                supabase.from('blocked_ips')
                  .update({ threat_count: data.threat_count + 1 })
                  .eq('id', data.id)
                  .then(({ error: updateError }) => {
                    if (updateError) console.error('Error updating blocked IP:', updateError);
                  });
              } else {
                // Insert new blocked IP
                supabase.from('blocked_ips').insert({
                  ip_address: packet.sourceIP,
                  reason: analysisResult.threatType || 'Critical threat detected',
                  threat_count: 1
                }).then(({ error: insertError }) => {
                  if (insertError) console.error('Error inserting blocked IP:', insertError);
                });
              }
            });
        }
      }, 0);
    }
  }, [addEvent]);

  // Start the IDS/IPS engine
  useEffect(() => {
    if (!isActive) return;

    // Initialize with some events
    addEvent('system_info', 'IDS/IPS system initialized and active', 'info');
    addEvent('system_update', 'Threat signature database loaded with 500+ patterns', 'info');

    // Generate traffic at intervals
    const trafficInterval = setInterval(() => {
      // Generate normal traffic (5-10 packets)
      const normalCount = Math.floor(Math.random() * 6) + 5;
      for (let i = 0; i < normalCount; i++) {
        const packet = trafficGeneratorRef.current.generatePacket();
        processPacket(packet);
      }

      // Occasionally generate attack scenarios
      const random = Math.random();
      if (random < 0.05) { // 5% chance of port scan
        const scanPackets = trafficGeneratorRef.current.generatePortScan();
        scanPackets.forEach(p => processPacket(p));
      } else if (random < 0.08) { // 3% chance of DDoS
        const ddosPackets = trafficGeneratorRef.current.generateDDoSBurst();
        ddosPackets.slice(0, 20).forEach(p => processPacket(p)); // Process subset
      }
    }, 2000); // Every 2 seconds

    // Update traffic chart data
    const chartInterval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setTrafficData(prev => {
        const newData = [...prev];
        if (newData.length >= 20) {
          newData.shift();
        }
        
        const lastMinutePackets = packetsRef.current.filter(
          p => Date.now() - p.timestamp < 60000
        );
        
        const normalCount = lastMinutePackets.length - threats.filter(
          t => Date.now() - new Date(t.time).getTime() < 60000
        ).length;
        
        newData.push({
          time: timeStr,
          normal: Math.max(normalCount, Math.floor(Math.random() * 1000) + 2000),
          threats: threats.filter(t => Date.now() - new Date(t.time).getTime() < 60000).length + Math.floor(Math.random() * 200)
        });
        
        return newData;
      });
    }, 3000);

    // System maintenance
    const maintenanceInterval = setInterval(() => {
      mitigationSystemRef.current.clearExpiredBlocks();
      addEvent('system_info', 'Routine maintenance: cleared expired IP blocks', 'info');
    }, 300000); // Every 5 minutes

    return () => {
      clearInterval(trafficInterval);
      clearInterval(chartInterval);
      clearInterval(maintenanceInterval);
    };
  }, [isActive, processPacket, addEvent, threats]);

  return {
    isActive,
    setIsActive,
    threats,
    events,
    stats,
    trafficData,
    mitigationSystem: mitigationSystemRef.current
  };
}
