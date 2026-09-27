import type { User, MembershipType, RewardUnlock } from '../types';
import { auditService } from './auditService';

const STORAGE_USERS_KEY = 'fabriciq_users_db_v2';
const STORAGE_CURRENT_USER_KEY = 'fabriciq_current_user_v2';

const SEED_USERS: User[] = [
  {
    id: 'usr-admin-01',
    name: 'Dilnawaz Khan',
    email: 'admin@fabriciq.com',
    googleId: 'google-sub-10839201948201',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastLogin: new Date().toISOString(),
    role: 'admin',
    membershipType: 'LIFETIME',
    membershipStatus: 'active',
    membershipStart: new Date(Date.now() - 86400000 * 30).toISOString(),
    membershipExpiry: null,
    referralCode: 'FABRICIQ-DIL123',
    referredUsersCount: 9,
    qualifiedReferralsCount: 7,
    rewardsUnlocked: [
      {
        id: 'rw-001',
        userId: 'usr-admin-01',
        rewardType: 'PRO_3_MONTHS',
        referralThreshold: 3,
        grantedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        expiryAt: new Date(Date.now() + 86400000 * 70).toISOString(),
        status: 'superseded',
        grantedBy: 'system',
      },
      {
        id: 'rw-002',
        userId: 'usr-admin-01',
        rewardType: 'PRO_6_MONTHS',
        referralThreshold: 5,
        grantedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        expiryAt: new Date(Date.now() + 86400000 * 170).toISOString(),
        status: 'superseded',
        grantedBy: 'system',
      },
      {
        id: 'rw-003',
        userId: 'usr-admin-01',
        rewardType: 'LIFETIME',
        referralThreshold: 12,
        grantedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        expiryAt: null,
        status: 'active',
        grantedBy: 'admin',
        notes: 'Promotional superadmin master grant',
      },
    ],
    isSuspended: false,
  },
  {
    id: 'usr-002',
    name: 'Tariq Mehmood',
    email: 'tariq@textilemills.pk',
    googleId: 'google-sub-2849201948202',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(),
    role: 'user',
    membershipType: 'PRO_3_MONTHS',
    membershipStatus: 'active',
    membershipStart: new Date(Date.now() - 86400000 * 12).toISOString(),
    membershipExpiry: new Date(Date.now() + 86400000 * 78).toISOString(),
    referralCode: 'FABRICIQ-TM882',
    referredUsersCount: 4,
    qualifiedReferralsCount: 3,
    rewardsUnlocked: [
      {
        id: 'rw-004',
        userId: 'usr-002',
        rewardType: 'PRO_3_MONTHS',
        referralThreshold: 3,
        grantedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        expiryAt: new Date(Date.now() + 86400000 * 78).toISOString(),
        status: 'active',
        grantedBy: 'system',
      },
    ],
    isSuspended: false,
  },
  {
    id: 'usr-003',
    name: 'Sarah Chen',
    email: 'sarah.chen@shanghaifabrics.com',
    googleId: 'google-sub-39402948203',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
    role: 'user',
    membershipType: 'LIFETIME',
    membershipStatus: 'active',
    membershipStart: new Date(Date.now() - 86400000 * 5).toISOString(),
    membershipExpiry: null,
    referralCode: 'FABRICIQ-SC501',
    referredUsersCount: 16,
    qualifiedReferralsCount: 14,
    rewardsUnlocked: [
      {
        id: 'rw-005',
        userId: 'usr-003',
        rewardType: 'LIFETIME',
        referralThreshold: 12,
        grantedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        expiryAt: null,
        status: 'active',
        grantedBy: 'system',
      },
    ],
    isSuspended: false,
  },
  {
    id: 'usr-004',
    name: 'Omar Farooq',
    email: 'omar@gulftextiles.ae',
    googleId: 'google-sub-40192849204',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(),
    role: 'user',
    membershipType: 'FREE',
    membershipStatus: 'active',
    membershipStart: new Date(Date.now() - 86400000 * 8).toISOString(),
    membershipExpiry: null,
    referralCode: 'FABRICIQ-OF109',
    referredUsersCount: 1,
    qualifiedReferralsCount: 1,
    rewardsUnlocked: [],
    isSuspended: false,
  },
  {
    id: 'usr-005',
    name: 'Mehmet Yilmaz',
    email: 'mehmet@istanbulyarn.tr',
    googleId: 'google-sub-59102948205',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    lastLogin: new Date(Date.now() - 86400000 * 3).toISOString(),
    role: 'user',
    membershipType: 'FREE',
    membershipStatus: 'active',
    membershipStart: new Date(Date.now() - 86400000 * 4).toISOString(),
    membershipExpiry: null,
    referralCode: 'FABRICIQ-MY420',
    referredUsersCount: 0,
    qualifiedReferralsCount: 0,
    rewardsUnlocked: [],
    isSuspended: false,
  },
];

class AuthService {
  private users: User[] = [];
  private currentUser: User | null = null;
  private listeners: Array<(user: User | null) => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_USERS_KEY);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = SEED_USERS;
        this.saveUsers();
      }

      const storedCurrent = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (storedCurrent) {
        const parsed = JSON.parse(storedCurrent);
        // Refresh with latest from database
        const found = this.users.find((u) => u.id === parsed.id);
        this.currentUser = found || parsed;
      } else {
        // Default to admin user for convenient testing
        this.currentUser = this.users[0] || null;
        if (this.currentUser) {
          localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(this.currentUser));
        }
      }
    } catch {
      this.users = SEED_USERS;
      this.currentUser = SEED_USERS[0];
    }
  }

  private saveUsers() {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(this.users));
    } catch {
      // ignore quota
    }
  }

  private saveCurrent() {
    try {
      if (this.currentUser) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
      this.notifyListeners();
    } catch {
      // ignore
    }
  }

  public subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | null {
    return this.users.find((u) => u.id === id) || null;
  }

  public getUserByEmail(email: string): User | null {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public getUserByReferralCode(code: string): User | null {
    if (!code) return null;
    return this.users.find((u) => u.referralCode.toUpperCase() === code.toUpperCase().trim()) || null;
  }

  public generateReferralCode(name: string): string {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3) || 'USR';
    const randNum = Math.floor(100 + Math.random() * 900);
    let code = `FABRICIQ-${cleanName}${randNum}`;
    
    // Ensure uniqueness
    let attempts = 0;
    while (this.getUserByReferralCode(code) && attempts < 50) {
      code = `FABRICIQ-${cleanName}${Math.floor(100 + Math.random() * 900)}`;
      attempts++;
    }
    return code;
  }

  public async signInWithGoogle(
    googleData?: { name: string; email: string; avatar?: string; sub?: string },
    referralCodeUsed?: string
  ): Promise<{ user: User; isNewUser: boolean; referralStatus?: string }> {
    const name = googleData?.name || 'Google Explorer';
    const email = googleData?.email || `user.${Math.floor(1000 + Math.random() * 9000)}@gmail.com`;
    const avatar = googleData?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    const googleId = googleData?.sub || `google-sub-${Date.now()}`;

    // Check if user already exists
    let user = this.getUserByEmail(email);
    let isNewUser = false;

    if (user) {
      // Existing user: update last login & googleId
      user.lastLogin = new Date().toISOString();
      if (!user.googleId) user.googleId = googleId;
      if (googleData?.avatar) user.avatar = googleData.avatar;
      this.saveUsers();
    } else {
      // Create new user with FREE membership
      isNewUser = true;
      const refCode = this.generateReferralCode(name);
      
      user = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        email,
        googleId,
        avatar,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        role: 'user',
        membershipType: 'FREE',
        membershipStatus: 'active',
        membershipStart: new Date().toISOString(),
        membershipExpiry: null,
        referralCode: refCode,
        referredBy: referralCodeUsed?.trim().toUpperCase(),
        referredUsersCount: 0,
        qualifiedReferralsCount: 0,
        rewardsUnlocked: [],
        isSuspended: false,
      };

      this.users.push(user);
      this.saveUsers();
    }

    this.currentUser = user;
    this.saveCurrent();

    return { user, isNewUser };
  }

  public switchUser(userId: string): User | null {
    const found = this.getUserById(userId);
    if (found) {
      this.currentUser = found;
      this.saveCurrent();
      return found;
    }
    return null;
  }

  public signOut(): void {
    this.currentUser = null;
    this.saveCurrent();
  }

  public updateUser(updatedUser: User): void {
    const idx = this.users.findIndex((u) => u.id === updatedUser.id);
    if (idx !== -1) {
      this.users[idx] = updatedUser;
      this.saveUsers();
      if (this.currentUser?.id === updatedUser.id) {
        this.currentUser = updatedUser;
        this.saveCurrent();
      }
    }
  }

  // Admin Actions
  public suspendMember(userId: string, adminUser: User, reason: string): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');
    const oldStatus = user.isSuspended ? 'Suspended' : 'Active';
    user.isSuspended = true;
    user.membershipStatus = 'suspended';
    this.updateUser(user);

    auditService.logAction(
      adminUser.id,
      adminUser.name,
      'SUSPEND_MEMBER',
      user.id,
      user.name,
      oldStatus,
      'Suspended',
      reason
    );
    return user;
  }

  public reactivateMember(userId: string, adminUser: User, reason: string): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');
    const oldStatus = user.isSuspended ? 'Suspended' : 'Active';
    user.isSuspended = false;
    user.membershipStatus = 'active';
    this.updateUser(user);

    auditService.logAction(
      adminUser.id,
      adminUser.name,
      'REACTIVATE_MEMBER',
      user.id,
      user.name,
      oldStatus,
      'Active',
      reason
    );
    return user;
  }

  public removeMember(userId: string, adminUser: User, reason: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    this.users = this.users.filter((u) => u.id !== userId);
    this.saveUsers();

    if (this.currentUser?.id === userId) {
      this.signOut();
    }

    auditService.logAction(
      adminUser.id,
      adminUser.name,
      'DELETE_MEMBER',
      user.id,
      user.name,
      `Membership: ${user.membershipType}`,
      'Deleted from database',
      reason
    );
    return true;
  }

  public manuallyGrantMembership(
    userId: string,
    type: MembershipType,
    months: number | 'lifetime',
    adminUser: User,
    reason: string
  ): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const oldMembership = user.membershipType;
    user.membershipType = type;
    user.membershipStatus = 'active';
    user.isSuspended = false;

    if (type === 'LIFETIME' || months === 'lifetime') {
      user.membershipExpiry = null;
    } else {
      const durationMs = (typeof months === 'number' ? months : 3) * 30 * 86400000;
      user.membershipExpiry = new Date(Date.now() + durationMs).toISOString();
    }

    const reward: RewardUnlock = {
      id: `rw-adm-${Date.now()}`,
      userId: user.id,
      rewardType: type,
      referralThreshold: type === 'PRO_3_MONTHS' ? 3 : type === 'PRO_6_MONTHS' ? 5 : 12,
      grantedAt: new Date().toISOString(),
      expiryAt: user.membershipExpiry,
      status: 'active',
      grantedBy: 'admin',
      notes: reason,
    };

    user.rewardsUnlocked.push(reward);
    this.updateUser(user);

    auditService.logAction(
      adminUser.id,
      adminUser.name,
      'MANUAL_GRANT_MEMBERSHIP',
      user.id,
      user.name,
      oldMembership,
      `${type} (${months === 'lifetime' ? 'Lifetime' : `${months} Months`})`,
      reason
    );

    return user;
  }

  public revokePromotionalMembership(userId: string, adminUser: User, reason: string): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const oldMembership = user.membershipType;
    user.membershipType = 'FREE';
    user.membershipExpiry = null;
    user.rewardsUnlocked.forEach((r) => {
      if (r.status === 'active') r.status = 'revoked';
    });
    this.updateUser(user);

    auditService.logAction(
      adminUser.id,
      adminUser.name,
      'REVOKE_MEMBERSHIP',
      user.id,
      user.name,
      oldMembership,
      'FREE',
      reason
    );

    return user;
  }
}

export const authService = new AuthService();
