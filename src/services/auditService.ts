import type { AdminAuditLog } from '../types';

const STORAGE_KEY = 'fabriciq_admin_audit_logs_v2';

const DEFAULT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-001',
    adminId: 'usr-admin-01',
    adminName: 'Dilnawaz Khan (Admin)',
    action: 'SYSTEM_INIT',
    targetUserId: 'usr-admin-01',
    targetUserName: 'Dilnawaz Khan',
    oldValue: 'None',
    newValue: 'System Initialized with Superadmin Role & Lifetime Membership',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'log-002',
    adminId: 'usr-admin-01',
    adminName: 'Dilnawaz Khan (Admin)',
    action: 'GRANT_REWARD',
    targetUserId: 'usr-002',
    targetUserName: 'Ahmad Raza',
    oldValue: 'PRO_3_MONTHS',
    newValue: 'PRO_6_MONTHS (5 Qualified Referrals Milestone)',
    reason: 'Cumulative referral milestone qualification achieved',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

class AuditService {
  private logs: AdminAuditLog[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      } else {
        this.logs = DEFAULT_LOGS;
        this.saveLogs();
      }
    } catch {
      this.logs = DEFAULT_LOGS;
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch {
      // storage quota
    }
  }

  public getLogs(): AdminAuditLog[] {
    return [...this.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public logAction(
    adminId: string,
    adminName: string,
    action: string,
    targetUserId: string,
    targetUserName: string,
    oldValue: string,
    newValue: string,
    reason?: string
  ): AdminAuditLog {
    const entry: AdminAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminId,
      adminName,
      action,
      targetUserId,
      targetUserName,
      oldValue,
      newValue,
      reason,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(entry);
    this.saveLogs();
    return entry;
  }
}

export const auditService = new AuditService();
