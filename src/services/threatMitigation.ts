// Threat mitigation actions
export interface MitigationAction {
  id: string;
  timestamp: number;
  action: 'block_ip' | 'drop_packet' | 'rate_limit' | 'quarantine' | 'alert_only';
  targetIP: string;
  reason: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoMitigated: boolean;
}

export interface BlockedIP {
  ip: string;
  blockedAt: number;
  reason: string;
  severity: string;
  expiresAt?: number;
}

export class ThreatMitigationSystem {
  private blockedIPs: Map<string, BlockedIP> = new Map();
  private rateLimitedIPs: Map<string, { count: number; resetAt: number }> = new Map();
  private mitigationHistory: MitigationAction[] = [];

  // Check if IP is blocked
  isIPBlocked(ip: string): boolean {
    const blocked = this.blockedIPs.get(ip);
    if (!blocked) return false;

    // Check if block has expired
    if (blocked.expiresAt && blocked.expiresAt < Date.now()) {
      this.blockedIPs.delete(ip);
      return false;
    }

    return true;
  }

  // Block an IP address
  blockIP(
    ip: string, 
    reason: string, 
    severity: 'critical' | 'high' | 'medium' | 'low',
    duration?: number // Duration in milliseconds
  ): MitigationAction {
    const action: MitigationAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action: 'block_ip',
      targetIP: ip,
      reason,
      severity,
      autoMitigated: true
    };

    this.blockedIPs.set(ip, {
      ip,
      blockedAt: Date.now(),
      reason,
      severity,
      expiresAt: duration ? Date.now() + duration : undefined
    });

    this.mitigationHistory.push(action);
    return action;
  }

  // Apply rate limiting
  applyRateLimit(ip: string): boolean {
    const limit = this.rateLimitedIPs.get(ip);
    const now = Date.now();

    if (!limit || limit.resetAt < now) {
      this.rateLimitedIPs.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute window
      return false;
    }

    limit.count++;
    
    // If exceeded threshold, return true to indicate rate limit exceeded
    return limit.count > 100; // 100 requests per minute
  }

  // Get mitigation statistics
  getStatistics() {
    return {
      totalBlockedIPs: this.blockedIPs.size,
      totalMitigations: this.mitigationHistory.length,
      criticalActions: this.mitigationHistory.filter(a => a.severity === 'critical').length,
      highActions: this.mitigationHistory.filter(a => a.severity === 'high').length,
      recentActions: this.mitigationHistory.slice(-10)
    };
  }

  // Get all blocked IPs
  getBlockedIPs(): BlockedIP[] {
    return Array.from(this.blockedIPs.values());
  }

  // Unblock an IP
  unblockIP(ip: string): boolean {
    return this.blockedIPs.delete(ip);
  }

  // Get mitigation history
  getMitigationHistory(limit: number = 50): MitigationAction[] {
    return this.mitigationHistory.slice(-limit);
  }

  // Clear expired blocks
  clearExpiredBlocks() {
    const now = Date.now();
    for (const [ip, blocked] of this.blockedIPs.entries()) {
      if (blocked.expiresAt && blocked.expiresAt < now) {
        this.blockedIPs.delete(ip);
      }
    }
  }
}
