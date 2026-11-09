import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Megaphone,
  Users,
  Copy,
  LogOut,
  Trophy,
  Zap,
} from 'lucide-react';

interface ProfileViewProps {
  openAuthModal: () => void;
  setActiveTab: (tab: 'earn' | 'promote' | 'referrals' | 'wallet' | 'profile' | 'leaderboard' | 'economy') => void;
  showToast: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  openAuthModal,
  setActiveTab,
  showToast,
}) => {
  const { userProfile, logout, signInDemoAccount } = useAuth();

  if (!userProfile) {
    return (
      <div className="text-center py-16 px-4 bg-[#0F172A]/40 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white">Sign In to View Profile</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Connect your account to access your wallet, monitor campaigns, and invite creators.
        </p>
        <button
          onClick={openAuthModal}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  const copyReferral = () => {
    const url = `${window.location.origin}/?ref=${userProfile.referralCode}`;
    navigator.clipboard.writeText(url);
    showToast('Referral link copied to clipboard');
  };

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* Profile Card */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={userProfile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.uid}`}
            alt={userProfile.displayName}
            className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700"
          />

          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-white">{userProfile.displayName}</h1>
                <p className="text-xs text-slate-400 font-mono">{userProfile.email || 'Community Creator'}</p>
              </div>

              <span className="self-center sm:self-auto px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-mono font-medium border border-blue-500/20">
                Verified Creator
              </span>
            </div>

            {/* Referral Info */}
            <div className="inline-flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">Referral Code:</span>
              <span className="font-mono font-bold text-blue-400">{userProfile.referralCode}</span>
              <button
                onClick={copyReferral}
                className="p-1 hover:text-white text-slate-400 transition-colors"
                title="Copy Link"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Wallet</p>
            <p className="text-xl font-mono font-bold text-white mt-0.5">
              {userProfile.pointsBalance} <span className="text-xs text-slate-400 font-normal">ST</span>
            </p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Campaigns</p>
            <p className="text-xl font-mono font-bold text-white mt-0.5">
              {userProfile.campaignsCount || 0}
            </p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tasks Done</p>
            <p className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
              {userProfile.tasksCompletedCount || 0}
            </p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Network</p>
            <p className="text-xl font-mono font-bold text-blue-400 mt-0.5">
              {(userProfile.referralsCount || 0) + (userProfile.chainReferralsCount || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setActiveTab('promote')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 transition-colors"
          >
            <Megaphone className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Create Video Campaign</p>
              <p className="text-[11px] text-slate-400">Promote your YouTube, TikTok, or Instagram</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Community Leaderboard</p>
              <p className="text-[11px] text-slate-400">View rankings and active top creators</p>
            </div>
          </button>

          <button
            onClick={() => signInDemoAccount('veteran')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 transition-colors"
          >
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Switch to Veteran Demo (45 ST Tokens)</p>
              <p className="text-[11px] text-slate-400">Test high balance experience</p>
            </div>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-left border border-red-500/20 text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Sign Out</p>
              <p className="text-[11px] text-red-400/80">End your active session</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
