// Simulated packet structure
export interface NetworkPacket {
  id: string;
  timestamp: number;
  sourceIP: string;
  destIP: string;
  sourcePort: number;
  destPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS';
  size: number;
  payload: string;
  flags?: string[];
}

export interface ThreatSignature {
  id: string;
  name: string;
  pattern: RegExp | string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

// Known threat signatures (signature-based detection)
export const threatSignatures: ThreatSignature[] = [
  {
    id: 'sql_injection',
    name: 'SQL Injection',
    pattern: /(\bSELECT\b.*\bFROM\b|\bUNION\b.*\bSELECT\b|'\s*OR\s*'1'\s*=\s*'1)/i,
    severity: 'critical',
    category: 'injection'
  },
  {
    id: 'xss_attack',
    name: 'Cross-Site Scripting',
    pattern: /<script[^>]*>.*<\/script>|javascript:|onerror=/i,
    severity: 'high',
    category: 'injection'
  },
  {
    id: 'path_traversal',
    name: 'Path Traversal',
    pattern: /\.\.[\/\\]|\.\.%2f|\.\.%5c/i,
    severity: 'high',
    category: 'file_access'
  },
  {
    id: 'command_injection',
    name: 'Command Injection',
    pattern: /(\||;|`|&|\$\(|\$\{)/,
    severity: 'critical',
    category: 'injection'
  },
  {
    id: 'brute_force',
    name: 'Brute Force',
    pattern: /login|auth|password/i,
    severity: 'high',
    category: 'authentication'
  }
];

// Anomaly detection using statistical analysis
export class AnomalyDetector {
  private baselineMetrics = {
    avgPacketSize: 500,
    avgPacketsPerSecond: 1000,
    normalPorts: new Set([80, 443, 22, 21, 25, 53]),
    avgConnectionDuration: 5000
  };

  detectAnomaly(packet: NetworkPacket, recentPackets: NetworkPacket[]): { 
    isAnomaly: boolean; 
    reason?: string; 
    confidence: number 
  } {
    const anomalies: string[] = [];
    let confidence = 0;

    // Check for unusual packet size
    if (packet.size > this.baselineMetrics.avgPacketSize * 3) {
      anomalies.push('Unusually large packet size');
      confidence += 0.3;
    }

    // Check for port scanning (multiple ports from same IP)
    const sameSourcePackets = recentPackets.filter(p => p.sourceIP === packet.sourceIP);
    const uniquePorts = new Set(sameSourcePackets.map(p => p.destPort));
    if (uniquePorts.size > 10) {
      anomalies.push('Potential port scanning detected');
      confidence += 0.4;
    }

    // Check for DDoS patterns (high packet rate from single or multiple sources)
    const recentFromSameSource = recentPackets.filter(
      p => p.sourceIP === packet.sourceIP && 
      (packet.timestamp - p.timestamp) < 1000
    );
    if (recentFromSameSource.length > 100) {
      anomalies.push('Potential DDoS attack pattern');
      confidence += 0.5;
    }

    // Check for unusual port usage
    if (!this.baselineMetrics.normalPorts.has(packet.destPort) && packet.destPort < 1024) {
      anomalies.push('Access to unusual privileged port');
      confidence += 0.2;
    }

    // Check for suspicious protocols
    if (packet.protocol === 'ICMP') {
      const icmpCount = recentPackets.filter(
        p => p.protocol === 'ICMP' && p.sourceIP === packet.sourceIP
      ).length;
      if (icmpCount > 20) {
        anomalies.push('Excessive ICMP traffic (potential ping flood)');
        confidence += 0.4;
      }
    }

    return {
      isAnomaly: anomalies.length > 0,
      reason: anomalies.join('; '),
      confidence: Math.min(confidence, 1.0)
    };
  }
}

// Signature-based detection
export function detectSignatureMatch(packet: NetworkPacket): ThreatSignature | null {
  for (const signature of threatSignatures) {
    if (typeof signature.pattern === 'string') {
      if (packet.payload.includes(signature.pattern)) {
        return signature;
      }
    } else {
      if (signature.pattern.test(packet.payload)) {
        return signature;
      }
    }
  }
  return null;
}

// Analyze packet for threats
export function analyzePacket(
  packet: NetworkPacket, 
  recentPackets: NetworkPacket[], 
  anomalyDetector: AnomalyDetector
): {
  isThreat: boolean;
  threatType?: string;
  severity?: string;
  detectionMethod: 'signature' | 'anomaly' | 'hybrid' | 'none';
  details?: string;
  confidence?: number;
} {
  // First, check signature-based detection
  const signatureMatch = detectSignatureMatch(packet);
  
  // Then, check anomaly-based detection
  const anomalyResult = anomalyDetector.detectAnomaly(packet, recentPackets);

  if (signatureMatch && anomalyResult.isAnomaly) {
    return {
      isThreat: true,
      threatType: signatureMatch.name,
      severity: signatureMatch.severity,
      detectionMethod: 'hybrid',
      details: `Signature: ${signatureMatch.name}; Anomaly: ${anomalyResult.reason}`,
      confidence: 0.95
    };
  } else if (signatureMatch) {
    return {
      isThreat: true,
      threatType: signatureMatch.name,
      severity: signatureMatch.severity,
      detectionMethod: 'signature',
      details: `Matched signature pattern for ${signatureMatch.category}`,
      confidence: 0.9
    };
  } else if (anomalyResult.isAnomaly && anomalyResult.confidence > 0.5) {
    return {
      isThreat: true,
      threatType: 'Anomaly Detected',
      severity: anomalyResult.confidence > 0.7 ? 'high' : 'medium',
      detectionMethod: 'anomaly',
      details: anomalyResult.reason,
      confidence: anomalyResult.confidence
    };
  }

  return {
    isThreat: false,
    detectionMethod: 'none'
  };
}
