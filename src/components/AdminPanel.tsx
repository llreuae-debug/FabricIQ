import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Users, 
  Coins, 
  Clock, 
  Plus, 
  Edit, 
  Server,
  Gift,
  UserX,
  UserCheck,
  Trash2,
  Crown,
  Search,
  AlertTriangle,
  Award,
  Sparkles
} from 'lucide-react';
import type { CurrencyCode, MarketRate, RateCategory, User, Referral, MembershipType, AdminAuditLog } from '../types';
import { marketRateService } from '../services/marketRateService';
import { currencyService, CURRENCY_MAP } from '../services/currencyService';
import { authService } from '../services/authService';
import { referralService } from '../services/referralService';
import { auditService } from '../services/auditService';
import { MembershipBadge } from './MembershipBadge';

interface AdminPanelProps {
  currentCurrency?: CurrencyCode;
  onRatesUpdated: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onRatesUpdated }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'referrals' | 'rates' | 'forex' | 'admin_audit' | 'suppliers' | 'apis'>('members');
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());

  // Members Management State
  const [usersList, setUsersList] = useState<User[]>(authService.getAllUsers());
  const [userSearch, setUserSearch] = useState('');
  const [userFilterTier, setUserFilterTier] = useState<string>('all');
  const [userFilterStatus, setUserFilterStatus] = useState<string>('all');

  // Referrals Management State
  const [referralsList, setReferralsList] = useState<Referral[]>(referralService.getReferrals());
  const [referralSearch, setReferralSearch] = useState('');
  const [referralFilterStatus, setReferralFilterStatus] = useState<string>('all');

  // Audit Logs State
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditLog[]>(auditService.getLogs());

  // Rates & Market State
  const [rates, setRates] = useState<MarketRate[]>(marketRateService.getRates());
  const suppliers = marketRateService.getSuppliers();

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: 'suspend' | 'reactivate' | 'delete' | 'grant' | 'revoke' | 'approve_ref' | 'reject_ref' | 'convert_lifetime';
    targetUser?: User;
    targetReferral?: Referral;
    grantTier?: MembershipType;
    grantMonths?: number | 'lifetime';
    reason?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    actionType: 'suspend',
  });
  const [actionReason, setActionReason] = useState('');

  // Edit Rate Modal State
  const [editingRate, setEditingRate] = useState<MarketRate | null>(null);
  const [overrideRateVal, setOverrideRateVal] = useState<number>(0);
  const [overrideStatus, setOverrideStatus] = useState<'LIVE' | 'MANUAL' | 'ESTIMATED'>('MANUAL');
  const [overrideSource, setOverrideSource] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string>('');

  // Add Rate State
  const [addRateModalOpen, setAddRateModalOpen] = useState<boolean>(false);
  const [newRateName, setNewRateName] = useState('');
  const [newRateSpec, setNewRateSpec] = useState('');
  const [newRateVal, setNewRateVal] = useState<number>(0);
  const [newRateUnit, setNewRateUnit] = useState('meter');
  const [newRateCategory, setNewRateCategory] = useState<RateCategory>('grey_fabric');
  const [newRateSource, setNewRateSource] = useState('');

  // Forex Editor State
  const [forexCur, setForexCur] = useState<CurrencyCode>('PKR');
  const [forexRateVal, setForexRateVal] = useState<number>(currencyService.getRateAgainstUSD('PKR'));

  useEffect(() => {
    const unsub = authService.subscribe((u) => setCurrentUser(u));
    return unsub;
  }, []);

  const refreshAll = () => {
    setUsersList(authService.getAllUsers());
    setReferralsList(referralService.getReferrals());
    setAdminAuditLogs(auditService.getLogs());
    setRates(marketRateService.getRates());
  };

  const ensureAdmin = (): User => {
    if (currentUser && currentUser.role === 'admin') return currentUser;
    // Fallback superadmin if running as demo
    const admin = authService.getUserById('usr-admin-01') || {
      id: 'usr-admin-01',
      name: 'Dilnawaz Khan (Admin)',
      email: 'admin@fabriciq.com',
      avatar: '',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      role: 'admin',
      membershipType: 'LIFETIME',
      membershipStatus: 'active',
      membershipStart: new Date().toISOString(),
      membershipExpiry: null,
      referralCode: 'FABRICIQ-DIL123',
      referredUsersCount: 0,
      qualifiedReferralsCount: 0,
      rewardsUnlocked: [],
    };
    return admin;
  };

  // Execution of Destructive / Confirmed Admin Actions
  const handleExecuteConfirmedAction = () => {
    const admin = ensureAdmin();
    const reason = actionReason.trim() || 'Admin manual action';

    try {
      if (confirmModal.actionType === 'suspend' && confirmModal.targetUser) {
        authService.suspendMember(confirmModal.targetUser.id, admin, reason);
        setActionNotice(`Suspended member: ${confirmModal.targetUser.name}`);
      } else if (confirmModal.actionType === 'reactivate' && confirmModal.targetUser) {
        authService.reactivateMember(confirmModal.targetUser.id, admin, reason);
        setActionNotice(`Reactivated member: ${confirmModal.targetUser.name}`);
      } else if (confirmModal.actionType === 'delete' && confirmModal.targetUser) {
        authService.removeMember(confirmModal.targetUser.id, admin, reason);
        setActionNotice(`Permanently removed member: ${confirmModal.targetUser.name}`);
      } else if (confirmModal.actionType === 'grant' && confirmModal.targetUser && confirmModal.grantTier) {
        authService.manuallyGrantMembership(
          confirmModal.targetUser.id,
          confirmModal.grantTier,
          confirmModal.grantMonths || 3,
          admin,
          reason
        );
        setActionNotice(`Granted ${confirmModal.grantTier} to ${confirmModal.targetUser.name}`);
      } else if (confirmModal.actionType === 'revoke' && confirmModal.targetUser) {
        authService.revokePromotionalMembership(confirmModal.targetUser.id, admin, reason);
        setActionNotice(`Revoked promotional membership for ${confirmModal.targetUser.name}`);
      } else if (confirmModal.actionType === 'approve_ref' && confirmModal.targetReferral) {
        referralService.approveReferral(confirmModal.targetReferral.id, admin, reason);
        setActionNotice(`Approved referral for ${confirmModal.targetReferral.referredUserName}`);
      } else if (confirmModal.actionType === 'reject_ref' && confirmModal.targetReferral) {
        referralService.rejectReferral(confirmModal.targetReferral.id, admin, reason);
        setActionNotice(`Rejected referral for ${confirmModal.targetReferral.referredUserName}`);
      } else if (confirmModal.actionType === 'convert_lifetime' && confirmModal.targetUser) {
        authService.manuallyGrantMembership(confirmModal.targetUser.id, 'LIFETIME', 'lifetime', admin, reason);
        setActionNotice(`Converted ${confirmModal.targetUser.name} to Lifetime Member`);
      }

      refreshAll();
      setConfirmModal({ isOpen: false, title: '', message: '', actionType: 'suspend' });
      setActionReason('');
      setTimeout(() => setActionNotice(''), 3500);
    } catch (err: any) {
      alert(err?.message || 'Action failed');
    }
  };

  // Filtered Users List
  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.referralCode.toLowerCase().includes(userSearch.toLowerCase());
    const matchTier = userFilterTier === 'all' || u.membershipType === userFilterTier;
    const matchStatus =
      userFilterStatus === 'all' ||
      (userFilterStatus === 'active' && !u.isSuspended) ||
      (userFilterStatus === 'suspended' && u.isSuspended);
    return matchSearch && matchTier && matchStatus;
  });

  // Filtered Referrals List
  const filteredReferrals = referralsList.filter((r) => {
    const matchSearch =
      r.referredUserName.toLowerCase().includes(referralSearch.toLowerCase()) ||
      r.referredUserEmail.toLowerCase().includes(referralSearch.toLowerCase()) ||
      r.referrerCode.toLowerCase().includes(referralSearch.toLowerCase());
    const matchStatus = referralFilterStatus === 'all' || r.status === referralFilterStatus;
    return matchSearch && matchStatus;
  });

  // KPI Metrics
  const totalUsersCount = usersList.length;
  const lifetimeUsersCount = usersList.filter((u) => u.membershipType === 'LIFETIME').length;
  const proUsersCount = usersList.filter((u) => u.membershipType === 'PRO_3_MONTHS' || u.membershipType === 'PRO_6_MONTHS').length;
  const totalReferralsCount = referralsList.length;
  const qualifiedReferralsCount = referralsList.filter((r) => r.status === 'qualified').length;
  const pendingReferralsCount = referralsList.filter((r) => r.status === 'pending').length;
  const suspiciousReferralsCount = referralsList.filter((r) => r.status === 'suspicious').length;

  const handleOpenEdit = (rate: MarketRate) => {
    setEditingRate(rate);
    setOverrideRateVal(rate.currentRate);
    setOverrideStatus(rate.status);
    setOverrideSource(rate.source);
    setAdminNotes(rate.notes || '');
  };

  const handleSaveOverride = () => {
    if (!editingRate) return;
    marketRateService.updateRate(
      editingRate.id,
      overrideRateVal,
      overrideStatus,
      overrideSource,
      'Senior Costing Admin',
      adminNotes
    );
    setRates(marketRateService.getRates());
    setEditingRate(null);
    onRatesUpdated();
    setActionNotice('Rate updated and logged to audit trail.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleCreateNewRate = () => {
    if (!newRateName || newRateVal <= 0) return;
    marketRateService.addRate({
      name: newRateName,
      spec: newRateSpec || 'Standard specification',
      currentRate: newRateVal,
      previousRate: newRateVal,
      changePercent: 0,
      unit: newRateUnit,
      baseCurrency: 'PKR',
      source: newRateSource || 'Admin Direct Entry',
      status: 'MANUAL',
      category: newRateCategory,
    });
    setRates(marketRateService.getRates());
    setAddRateModalOpen(false);
    onRatesUpdated();
    setActionNotice(`Added ${newRateName} to active commodity index.`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleUpdateForexRate = () => {
    if (forexRateVal <= 0) return;
    currencyService.setCustomRate(forexCur, forexRateVal);
    setActionNotice(`Custom exchange rate for ${forexCur} saved at ${forexRateVal}`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] flex items-center gap-2">
              <span>FabricIQ Central Administration</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                Superadmin
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Manage members, referral reward pipelines, anti-abuse fraud rules, commodity price feeds, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {actionNotice && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
              {actionNotice}
            </span>
          )}
        </div>
      </div>

      {/* 3D Admin Navigation Tabs Dock */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950/90 border border-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-xl overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeTab === 'members'
              ? 'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white shadow-[0_6px_20px_rgba(37,99,235,0.45),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.25)] border border-blue-400/60 scale-[1.02] -translate-y-0.5'
              : 'bg-slate-900/60 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-0.5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members ({totalUsersCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeTab === 'referrals'
              ? 'bg-gradient-to-b from-cyan-500 via-cyan-600 to-cyan-700 text-white shadow-[0_6px_20px_rgba(6,182,212,0.45),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.25)] border border-cyan-400/60 scale-[1.02] -translate-y-0.5'
              : 'bg-slate-900/60 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-0.5'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Referrals & Rewards ({totalReferralsCount})</span>
          {suspiciousReferralsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold shadow-md">
              {suspiciousReferralsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('admin_audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeTab === 'admin_audit'
              ? 'bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-[0_6px_20px_rgba(99,102,241,0.45),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.25)] border border-indigo-400/60 scale-[1.02] -translate-y-0.5'
              : 'bg-slate-900/60 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-0.5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Audit Logs ({adminAuditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeTab === 'rates'
              ? 'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white shadow-[0_6px_20px_rgba(37,99,235,0.45),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.25)] border border-blue-400/60 scale-[1.02] -translate-y-0.5'
              : 'bg-slate-900/60 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-0.5'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Market Rates ({rates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('forex')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeTab === 'forex'
              ? 'bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-[0_6px_20px_rgba(16,185,129,0.45),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.25)] border border-emerald-400/60 scale-[1.02] -translate-y-0.5'
              : 'bg-slate-900/60 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-0.5'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Forex Override</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'suppliers'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Suppliers ({suppliers.length})</span>
        </button>
      </div>

      {/* TAB 1: MEMBERS MANAGEMENT */}
      {activeTab === 'members' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Member KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Members</span>
              <div className="text-2xl font-black text-white font-['Outfit'] mt-1">{totalUsersCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Lifetime Members</span>
              <div className="text-2xl font-black text-amber-300 font-['Outfit'] mt-1">{lifetimeUsersCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Pro Reward Members</span>
              <div className="text-2xl font-black text-cyan-300 font-['Outfit'] mt-1">{proUsersCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Free Accounts</span>
              <div className="text-2xl font-black text-slate-200 font-['Outfit'] mt-1">
                {totalUsersCount - lifetimeUsersCount - proUsersCount}
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search member by name, email, or referral code..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userFilterTier}
                onChange={(e) => setUserFilterTier(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Tiers</option>
                <option value="FREE">Free</option>
                <option value="PRO_3_MONTHS">3-Month Reward</option>
                <option value="PRO_6_MONTHS">6-Month Reward</option>
                <option value="LIFETIME">Lifetime</option>
              </select>

              <select
                value={userFilterStatus}
                onChange={(e) => setUserFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 pl-4">Member</th>
                    <th className="p-3.5">Membership Tier</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Referral Code</th>
                    <th className="p-3.5">Referrals</th>
                    <th className="p-3.5">Joined</th>
                    <th className="p-3.5 text-right pr-4">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <img src={usr.avatar} alt={usr.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{usr.name}</span>
                              {usr.role === 'admin' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{usr.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <MembershipBadge type={usr.membershipType} size="sm" />
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            usr.isSuspended
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {usr.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-cyan-400 font-bold">
                        {usr.referralCode}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-200">{usr.qualifiedReferralsCount || 0}</span>
                        <span className="text-slate-500 text-[10px]"> / {usr.referredUsersCount || 0}</span>
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {new Date(usr.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Grant Lifetime */}
                          {usr.membershipType !== 'LIFETIME' && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Grant Lifetime Membership',
                                  message: `Are you sure you want to permanently upgrade ${usr.name} to Lifetime Membership?`,
                                  actionType: 'convert_lifetime',
                                  targetUser: usr,
                                })
                              }
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs border border-amber-500/20 transition-colors"
                              title="Grant Lifetime Membership"
                            >
                              <Crown className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Grant 3 Months */}
                          {usr.membershipType === 'FREE' && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Grant Promotional 3-Month Access',
                                  message: `Grant 3 months full access reward to ${usr.name}?`,
                                  actionType: 'grant',
                                  targetUser: usr,
                                  grantTier: 'PRO_3_MONTHS',
                                  grantMonths: 3,
                                })
                              }
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/20 transition-colors"
                              title="Grant 3 Months"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Revoke Promotional */}
                          {usr.membershipType !== 'FREE' && usr.role !== 'admin' && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Revoke Promotional Membership',
                                  message: `Revoke promotional access for ${usr.name} and return to standard FREE membership?`,
                                  actionType: 'revoke',
                                  targetUser: usr,
                                })
                              }
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors"
                              title="Revoke Promotional Membership"
                            >
                              <Award className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Suspend / Reactivate */}
                          {usr.role !== 'admin' && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  title: usr.isSuspended ? 'Reactivate Member' : 'Suspend Member',
                                  message: usr.isSuspended
                                    ? `Reactivate account for ${usr.name}?`
                                    : `Suspend account for ${usr.name}? This member will be blocked from access.`,
                                  actionType: usr.isSuspended ? 'reactivate' : 'suspend',
                                  targetUser: usr,
                                })
                              }
                              className={`p-1.5 rounded-lg text-xs transition-colors ${
                                usr.isSuspended
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                              }`}
                              title={usr.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                            >
                              {usr.isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Delete Member */}
                          {usr.role !== 'admin' && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete Member Account',
                                  message: `Are you sure you want to permanently delete member ${usr.name} (${usr.email})? This action cannot be undone.`,
                                  actionType: 'delete',
                                  targetUser: usr,
                                })
                              }
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors"
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REFERRALS & REWARDS MANAGEMENT */}
      {activeTab === 'referrals' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Referral Pipeline KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Signups</span>
              <div className="text-2xl font-black text-white font-['Outfit'] mt-1">{totalReferralsCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Qualified Referrals</span>
              <div className="text-2xl font-black text-emerald-300 font-['Outfit'] mt-1">{qualifiedReferralsCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Pending Verification</span>
              <div className="text-2xl font-black text-amber-300 font-['Outfit'] mt-1">{pendingReferralsCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
              <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Suspicious / Flagged</span>
              <div className="text-2xl font-black text-rose-300 font-['Outfit'] mt-1">{suspiciousReferralsCount}</div>
            </div>
          </div>

          {/* Referral Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={referralSearch}
                onChange={(e) => setReferralSearch(e.target.value)}
                placeholder="Search referral by name, email, or code..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={referralFilterStatus}
                onChange={(e) => setReferralFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Referral Statuses</option>
                <option value="qualified">Qualified</option>
                <option value="pending">Pending</option>
                <option value="suspicious">Suspicious</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Referrals List Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 pl-4">Referred Member</th>
                    <th className="p-3.5">Referrer Code</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Fraud / Flag Reason</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right pr-4">Review Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredReferrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="font-bold text-white">{ref.referredUserName}</div>
                        <div className="text-[11px] text-slate-400">{ref.referredUserEmail}</div>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-cyan-400 font-bold">
                        {ref.referrerCode}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            ref.status === 'qualified'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : ref.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : ref.status === 'suspicious'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ref.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px] max-w-xs truncate">
                        {ref.flagReason || '—'}
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {ref.status !== 'qualified' && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Approve Referral',
                                  message: `Approve referral for ${ref.referredUserName}? This will count towards the referrer's milestone progress.`,
                                  actionType: 'approve_ref',
                                  targetReferral: ref,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30 transition-colors"
                            >
                              Approve
                            </button>
                          )}

                          {ref.status !== 'rejected' && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Reject Fraudulent Referral',
                                  message: `Reject referral for ${ref.referredUserName}? This will disqualify it from rewards.`,
                                  actionType: 'reject_ref',
                                  targetReferral: ref,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold text-[11px] border border-rose-500/30 transition-colors"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN AUDIT LOGS */}
      {activeTab === 'admin_audit' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">Administrative Audit Trail</h3>
              <p className="text-xs text-slate-400">
                Immutable chronological log of all member promotions, suspensions, reward grants, and referral reviews.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              {adminAuditLogs.length} Records
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 pl-4">Timestamp</th>
                    <th className="p-3.5">Admin</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Target User</th>
                    <th className="p-3.5">Previous Value</th>
                    <th className="p-3.5">New Value</th>
                    <th className="p-3.5 pr-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {adminAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/50">
                      <td className="p-3.5 pl-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-indigo-300 font-sans font-bold">{log.adminName}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-white font-sans font-semibold">{log.targetUserName}</td>
                      <td className="p-3.5 text-slate-400">{log.oldValue}</td>
                      <td className="p-3.5 text-emerald-400">{log.newValue}</td>
                      <td className="p-3.5 pr-4 text-slate-300 font-sans text-xs">{log.reason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MARKET RATES */}
      {activeTab === 'rates' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">Textile Commodity Price Index</h3>
              <p className="text-xs text-slate-400">Override live prices or create custom yard/meter benchmarks.</p>
            </div>
            <button
              onClick={() => setAddRateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Commodity Benchmark</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {rates.map((rate) => (
              <div
                key={rate.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{rate.name}</h4>
                    <span className="text-[10px] text-slate-400">{rate.spec}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rate.status === 'LIVE'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : rate.status === 'MANUAL'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {rate.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Rate</span>
                    <span className="text-lg font-black text-cyan-400 font-mono">
                      ₨ {rate.currentRate.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ {rate.unit}</span>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(rate)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <Edit className="w-3 h-3 text-cyan-400" />
                    <span>Override</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FOREX OVERRIDE */}
      {activeTab === 'forex' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 max-w-xl animate-in fade-in">
          <h3 className="text-base font-bold text-white font-['Outfit']">USD Currency Exchange Peg Override</h3>
          <p className="text-xs text-slate-400">
            Manually calibrate foreign exchange conversions relative to base 1 USD for international commercial quotes.
          </p>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Currency</label>
                <select
                  value={forexCur}
                  onChange={(e) => {
                    const c = e.target.value as CurrencyCode;
                    setForexCur(c);
                    setForexRateVal(currencyService.getRateAgainstUSD(c));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  {Object.values(CURRENCY_MAP).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Rate per 1 USD</label>
                <input
                  type="number"
                  step="0.01"
                  value={forexRateVal}
                  onChange={(e) => setForexRateVal(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateForexRate}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Save Forex Benchmark Rate
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suppliers.map((sup) => (
              <div key={sup.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{sup.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    Reliability {sup.reliabilityScore}%
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {sup.city}, {sup.country} • {sup.email}
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {sup.categories.map((cat, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DESTRUCTIVE ADMIN ACTIONS */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">{confirmModal.title}</h3>
                <p className="text-xs text-slate-400">{confirmModal.message}</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-semibold text-slate-300">Reason for Audit Trail:</label>
              <input
                type="text"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g. Administrative policy check, verified compliance, user request"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteConfirmedAction}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COMMODITY RATE MODAL */}
      {editingRate && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">Override Commodity Rate: {editingRate.name}</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">New Rate (PKR / {editingRate.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  value={overrideRateVal}
                  onChange={(e) => setOverrideRateVal(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Source / Verification Origin</label>
                <input
                  type="text"
                  value={overrideSource}
                  onChange={(e) => setOverrideSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Audit Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingRate(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
              >
                Save Rate Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD COMMODITY RATE MODAL */}
      {addRateModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">Add New Commodity Benchmark</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Commodity Name</label>
                <input
                  type="text"
                  value={newRateName}
                  onChange={(e) => setNewRateName(e.target.value)}
                  placeholder="e.g. 30/1 Combed Compact Cotton"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Technical Spec</label>
                <input
                  type="text"
                  value={newRateSpec}
                  onChange={(e) => setNewRateSpec(e.target.value)}
                  placeholder="e.g. Ring Spun Ne 30/1 100% Cotton"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Rate (PKR)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRateVal}
                    onChange={(e) => setNewRateVal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={newRateUnit}
                    onChange={(e) => setNewRateUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newRateCategory}
                    onChange={(e) => setNewRateCategory(e.target.value as RateCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="cotton_yarn">Cotton Yarn</option>
                    <option value="poly_yarn">Polyester Yarn</option>
                    <option value="blended_yarn">Blended Yarn</option>
                    <option value="grey_fabric">Grey Fabric</option>
                    <option value="weaving">Weaving</option>
                    <option value="processing">Processing</option>
                    <option value="dyeing">Dyeing</option>
                    <option value="finishing">Finishing</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Source / Verification</label>
                  <input
                    type="text"
                    value={newRateSource}
                    onChange={(e) => setNewRateSource(e.target.value)}
                    placeholder="e.g. Faisalabad Exchange"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setAddRateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewRate}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Create Benchmark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
