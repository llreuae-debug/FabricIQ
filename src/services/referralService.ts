import type { Referral, ReferralStatus, RewardUnlock, User, MembershipType } from '../types';
import { authService } from './authService';
import { auditService } from './auditService';

const STORAGE_REFERRALS_KEY = 'fabriciq_referrals_db_v2';
const STORAGE_CAPTURED_REF_KEY = 'fabriciq_captured_referral_code_v2';

const SEED_REFERRALS: Referral[] = [
  {
    id: 'ref-001',
    referrerUserId: 'usr-admin-01',
    referrerCode: 'FABRICIQ-DIL123',
    referredUserId: 'usr-002',
    referredUserName: 'Tariq Mehmood',
    referredUserEmail: 'tariq@textilemills.pk',
    status: 'qualified',
    qualifiedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    rewardApplied: true,
  },
  {
    id: 'ref-002',
    referrerUserId: 'usr-admin-01',
    referrerCode: 'FABRICIQ-DIL123',
    referredUserId: 'usr-003',
    referredUserName: 'Sarah Chen',
    referredUserEmail: 'sarah.chen@shanghaifabrics.com',
    status: 'qualified',
    qualifiedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    rewardApplied: true,
  },
  {
    id: 'ref-003',
    referrerUserId: 'usr-admin-01',
    referrerCode: 'FABRICIQ-DIL123',
    referredUserId: 'usr-004',
    referredUserName: 'Omar Farooq',
    referredUserEmail: 'omar@gulftextiles.ae',
    status: 'qualified',
    qualifiedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    rewardApplied: true,
  },
  {
    id: 'ref-004',
    referrerUserId: 'usr-admin-01',
    referrerCode: 'FABRICIQ-DIL123',
    referredUserId: 'usr-005',
    referredUserName: 'Mehmet Yilmaz',
    referredUserEmail: 'mehmet@istanbulyarn.tr',
    status: 'qualified',
    qualifiedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    rewardApplied: true,
  },
  {
    id: 'ref-005',
    referrerUserId: 'usr-admin-01',
    referrerCode: 'FABRICIQ-DIL123',
    referredUserId: 'usr-mock-01',
    referredUserName: 'Rashid Textile Co',
    referredUserEmail: 'info@rashidtextiles.com',
    status: 'qualified',
    qualifiedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    rewardApplied: true,
  },
  {
    id: 'ref-006',
    referrerUserId: 'usr-admin-01',
    referrerCode: 'FABRICIQ-DIL123',
    referredUserId: 'usr-mock-02',
    referredUserName: 'Al-Madina Weaving',
    referredUserEmail: 'almadina@weavingpk.com',
    status: 'qualified',
    qualifiedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    rewardApplied: true,
  },
  {
    id: 'ref-007',
    referrerUserId: 'usr-admin-01',
    referrerCode: 'FABRICIQ-DIL123',
    referredUserId: 'usr-mock-03',
    referredUserName: 'Denim Dynamics Ltd',
    referredUserEmail: 'ops@denimdynamics.com',
    status: 'qualified',
    qualifiedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    rewardApplied: true,
  },
  {
    id: 'ref-008',
    referrerUserId: 'usr-admin-01',
    referrerCode: 'FABRICIQ-DIL123',
    referredUserId: 'usr-mock-sus-01',
    referredUserName: 'Test Clone Account',
    referredUserEmail: 'test.clone99@tempmail.com',
    status: 'suspicious',
    flagReason: 'Temporary disposable email domain detected during signup',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    rewardApplied: false,
  },
  {
    id: 'ref-009',
    referrerUserId: 'usr-admin-01',
    referrerCode: 'FABRICIQ-DIL123',
    referredUserId: 'usr-mock-pen-01',
    referredUserName: 'Global Spinning Corp',
    referredUserEmail: 'procurement@globalspinning.in',
    status: 'pending',
    flagReason: 'Awaiting email verification confirmation',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    rewardApplied: false,
  },
];

export interface MilestoneProgress {
  currentCount: number;
  currentTier: MembershipType;
  nextThreshold: number | null;
  nextReward: string | null;
  progressPercent: number;
  isLifetime: boolean;
}

export interface MilestoneNotification {
  id: string;
  milestone: 3 | 5 | 12;
  title: string;
  message: string;
  rewardType: MembershipType;
  timestamp: string;
}

class ReferralService {
  private referrals: Referral[] = [];
  private capturedCode: string | null = null;
  private pendingNotifications: MilestoneNotification[] = [];
  private notificationListeners: Array<(notif: MilestoneNotification) => void> = [];

  constructor() {
    this.init();
    this.captureFromUrl();
  }

  private init() {
    try {
      const stored = localStorage.getItem(STORAGE_REFERRALS_KEY);
      if (stored) {
        this.referrals = JSON.parse(stored);
      } else {
        this.referrals = SEED_REFERRALS;
        this.saveReferrals();
      }

      const storedCaptured = localStorage.getItem(STORAGE_CAPTURED_REF_KEY);
      if (storedCaptured) {
        this.capturedCode = storedCaptured;
      }
    } catch {
      this.referrals = SEED_REFERRALS;
    }
  }

  private saveReferrals() {
    try {
      localStorage.setItem(STORAGE_REFERRALS_KEY, JSON.stringify(this.referrals));
    } catch {
      // quota
    }
  }

  public captureFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref') || urlParams.get('referral');
    if (ref) {
      const cleanRef = ref.trim().toUpperCase();
      this.capturedCode = cleanRef;
      localStorage.setItem(STORAGE_CAPTURED_REF_KEY, cleanRef);
      return cleanRef;
    }
    return this.capturedCode;
  }

  public getCapturedReferralCode(): string | null {
    return this.capturedCode;
  }

  public clearCapturedReferralCode(): void {
    this.capturedCode = null;
    localStorage.removeItem(STORAGE_CAPTURED_REF_KEY);
  }

  public getReferralLink(referralCode: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fabriciq.com';
    return `${origin}/?ref=${encodeURIComponent(referralCode)}`;
  }

  public getReferrals(): Referral[] {
    return [...this.referrals];
  }

  public getReferralsByReferrer(referrerUserId: string): Referral[] {
    return this.referrals.filter((r) => r.referrerUserId === referrerUserId);
  }

  public subscribeNotifications(listener: (notif: MilestoneNotification) => void): () => void {
    this.notificationListeners.push(listener);
    return () => {
      this.notificationListeners = this.notificationListeners.filter((l) => l !== listener);
    };
  }

  private emitNotification(notif: MilestoneNotification) {
    this.pendingNotifications.push(notif);
    for (const listener of this.notificationListeners) {
      listener(notif);
    }
  }

  public getPendingNotifications(): MilestoneNotification[] {
    return [...this.pendingNotifications];
  }

  public clearNotification(id: string): void {
    this.pendingNotifications = this.pendingNotifications.filter((n) => n.id !== id);
  }

  // Multi-step validation
  public validateReferral(
    referrerCode: string,
    newUserId: string,
    newUserEmail: string
  ): { valid: boolean; status: ReferralStatus; flagReason?: string; referrerUser?: User } {
    if (!referrerCode) {
      return { valid: false, status: 'rejected', flagReason: 'No referral code provided' };
    }

    const referrer = authService.getUserByReferralCode(referrerCode);
    if (!referrer) {
      return { valid: false, status: 'rejected', flagReason: 'Referral code does not exist' };
    }

    // Anti-self referral check
    if (referrer.id === newUserId || referrer.email.toLowerCase() === newUserEmail.toLowerCase()) {
      return { valid: false, status: 'rejected', flagReason: 'Self-referral attempt is prohibited' };
    }

    // Anti-duplicate referral check
    const existing = this.referrals.find(
      (r) => r.referredUserId === newUserId || r.referredUserEmail.toLowerCase() === newUserEmail.toLowerCase()
    );
    if (existing) {
      return { valid: false, status: 'rejected', flagReason: 'User has already been referred' };
    }

    // Anti-abuse disposable domain check
    const disposableDomains = ['tempmail.com', '10minutemail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com'];
    const emailDomain = newUserEmail.split('@')[1]?.toLowerCase();
    if (emailDomain && disposableDomains.includes(emailDomain)) {
      return {
        valid: false,
        status: 'suspicious',
        flagReason: 'Temporary disposable email domain detected during signup',
        referrerUser: referrer,
      };
    }

    return { valid: true, status: 'qualified', referrerUser: referrer };
  }

  // Process referral on user signup
  public processSignupReferral(newUser: User, rawReferralCode?: string): { success: boolean; status: ReferralStatus; message: string } {
    const codeToUse = (rawReferralCode || this.capturedCode || newUser.referredBy || '').trim().toUpperCase();
    if (!codeToUse) {
      return { success: false, status: 'rejected', message: 'No referral code provided' };
    }

    const validation = this.validateReferral(codeToUse, newUser.id, newUser.email);
    if (!validation.referrerUser) {
      return { success: false, status: validation.status, message: validation.flagReason || 'Invalid referral' };
    }

    const referrer = validation.referrerUser;
    const isQualified = validation.status === 'qualified';

    const referralRecord: Referral = {
      id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      referrerUserId: referrer.id,
      referrerCode: referrer.referralCode,
      referredUserId: newUser.id,
      referredUserName: newUser.name,
      referredUserEmail: newUser.email,
      status: validation.status,
      flagReason: validation.flagReason,
      qualifiedAt: isQualified ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      rewardApplied: isQualified,
    };

    this.referrals.unshift(referralRecord);
    this.saveReferrals();

    // Increment referrer counts
    referrer.referredUsersCount = (referrer.referredUsersCount || 0) + 1;
    if (isQualified) {
      referrer.qualifiedReferralsCount = (referrer.qualifiedReferralsCount || 0) + 1;
      this.evaluateAndApplyMilestones(referrer);
    }
    authService.updateUser(referrer);

    this.clearCapturedReferralCode();

    return {
      success: true,
      status: validation.status,
      message: isQualified ? 'Qualified referral recorded successfully' : `Referral recorded with status: ${validation.status}`,
    };
  }

  // Calculate & Apply Cumulative Rewards
  public evaluateAndApplyMilestones(user: User): { milestoneHit: boolean; newReward?: RewardUnlock } {
    const qualifiedCount = user.qualifiedReferralsCount || 0;
    let targetTier: MembershipType = user.membershipType;
    let thresholdHit: 3 | 5 | 12 | null = null;
    let durationMonths: number | 'lifetime' = 0;
    let notifTitle = '';
    let notifMsg = '';

    // If user is already LIFETIME, never demote
    if (user.membershipType === 'LIFETIME') {
      return { milestoneHit: false };
    }

    if (qualifiedCount >= 12) {
      targetTier = 'LIFETIME';
      thresholdHit = 12;
      durationMonths = 'lifetime';
      notifTitle = '🏆 LIFETIME FABRICIQ MEMBERSHIP UNLOCKED!';
      notifMsg = 'Congratulations! You referred 12 qualifying members and unlocked Lifetime FabricIQ Membership. Never expires.';
    } else if (qualifiedCount >= 5) {
      if (user.membershipType !== 'PRO_6_MONTHS') {
        targetTier = 'PRO_6_MONTHS';
        thresholdHit = 5;
        durationMonths = 6;
        notifTitle = '🚀 6 MONTHS FULL ACCESS UNLOCKED!';
        notifMsg = 'Amazing! You referred 5 members and unlocked 6 months of full FabricIQ access.';
      }
    } else if (qualifiedCount >= 3) {
      if (user.membershipType === 'FREE') {
        targetTier = 'PRO_3_MONTHS';
        thresholdHit = 3;
        durationMonths = 3;
        notifTitle = '🎉 3 MONTHS FULL ACCESS UNLOCKED!';
        notifMsg = 'Congratulations! You referred 3 new members and unlocked 3 months of full FabricIQ access.';
      }
    }

    if (thresholdHit) {
      user.membershipType = targetTier;
      user.membershipStatus = 'active';

      if (durationMonths === 'lifetime') {
        user.membershipExpiry = null;
      } else {
        const durationMs = durationMonths * 30 * 86400000;
        user.membershipExpiry = new Date(Date.now() + durationMs).toISOString();
      }

      const reward: RewardUnlock = {
        id: `rw-${Date.now()}`,
        userId: user.id,
        rewardType: targetTier,
        referralThreshold: thresholdHit,
        grantedAt: new Date().toISOString(),
        expiryAt: user.membershipExpiry,
        status: 'active',
        grantedBy: 'system',
      };

      // Mark older rewards as superseded
      user.rewardsUnlocked.forEach((r) => {
        if (r.status === 'active') r.status = 'superseded';
      });
      user.rewardsUnlocked.push(reward);

      this.emitNotification({
        id: `notif-${Date.now()}`,
        milestone: thresholdHit,
        title: notifTitle,
        message: notifMsg,
        rewardType: targetTier,
        timestamp: new Date().toISOString(),
      });

      return { milestoneHit: true, newReward: reward };
    }

    return { milestoneHit: false };
  }

  public getMilestoneProgress(user: User | null): MilestoneProgress {
    if (!user) {
      return {
        currentCount: 0,
        currentTier: 'FREE',
        nextThreshold: 3,
        nextReward: '3 Months Full Access',
        progressPercent: 0,
        isLifetime: false,
      };
    }

    const count = user.qualifiedReferralsCount || 0;
    const isLifetime = user.membershipType === 'LIFETIME' || count >= 12;

    if (isLifetime) {
      return {
        currentCount: count,
        currentTier: 'LIFETIME',
        nextThreshold: null,
        nextReward: 'Lifetime Membership Active',
        progressPercent: 100,
        isLifetime: true,
      };
    }

    if (count < 3) {
      return {
        currentCount: count,
        currentTier: user.membershipType,
        nextThreshold: 3,
        nextReward: '3 Months Full Access Free',
        progressPercent: Math.round((count / 3) * 100),
        isLifetime: false,
      };
    }

    if (count < 5) {
      return {
        currentCount: count,
        currentTier: user.membershipType,
        nextThreshold: 5,
        nextReward: '6 Months Full Access Free',
        progressPercent: Math.round(((count - 3) / (5 - 3)) * 100),
        isLifetime: false,
      };
    }

    return {
      currentCount: count,
      currentTier: user.membershipType,
      nextThreshold: 12,
      nextReward: 'Lifetime Membership Free',
      progressPercent: Math.round(((count - 5) / (12 - 5)) * 100),
      isLifetime: false,
    };
  }

  // Admin Controls
  public approveReferral(referralId: string, adminUser: User, reason: string): Referral {
    const referral = this.referrals.find((r) => r.id === referralId);
    if (!referral) throw new Error('Referral not found');

    const oldStatus = referral.status;
    referral.status = 'qualified';
    referral.qualifiedAt = new Date().toISOString();
    referral.rewardApplied = true;
    referral.flagReason = undefined;
    this.saveReferrals();

    const referrer = authService.getUserById(referral.referrerUserId);
    if (referrer) {
      referrer.qualifiedReferralsCount = (referrer.qualifiedReferralsCount || 0) + 1;
      this.evaluateAndApplyMilestones(referrer);
      authService.updateUser(referrer);
    }

    auditService.logAction(
      adminUser.id,
      adminUser.name,
      'APPROVE_REFERRAL',
      referral.referredUserId,
      referral.referredUserName,
      oldStatus,
      'qualified',
      reason
    );

    return referral;
  }

  public rejectReferral(referralId: string, adminUser: User, reason: string): Referral {
    const referral = this.referrals.find((r) => r.id === referralId);
    if (!referral) throw new Error('Referral not found');

    const oldStatus = referral.status;
    const wasQualified = referral.status === 'qualified';
    referral.status = 'rejected';
    referral.flagReason = reason;
    this.saveReferrals();

    const referrer = authService.getUserById(referral.referrerUserId);
    if (referrer && wasQualified) {
      referrer.qualifiedReferralsCount = Math.max(0, (referrer.qualifiedReferralsCount || 0) - 1);
      authService.updateUser(referrer);
    }

    auditService.logAction(
      adminUser.id,
      adminUser.name,
      'REJECT_REFERRAL',
      referral.referredUserId,
      referral.referredUserName,
      oldStatus,
      'rejected',
      reason
    );

    return referral;
  }
}

export const referralService = new ReferralService();
