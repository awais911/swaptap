import React, { useState, useEffect } from 'react';
import { UserProfile, Referral } from '../types';
import { campaignService } from '../services/campaignService';
import {
  Users,
  Copy,
  Check,
  Share2,
  Network,
  Link,
  MessageCircle,
  Twitter,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ReferralViewProps {
  userProfile: UserProfile | null;
  openAuthModal: () => void;
  showToast: (msg: string) => void;
}

export const ReferralView: React.FC<ReferralViewProps> = ({
  userProfile,
  openAuthModal,
  showToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const referralCode = userProfile?.referralCode || 'SIGNUP';
  const referralUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${referralCode}`
      : `https://swaptap.app/?ref=${referralCode}`;

  useEffect(() => {
    if (!userProfile) return;
    const unsubscribe = campaignService.subscribeToReferrals(userProfile.uid, (list) => {
      setReferrals(list);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [userProfile]);

  const handleCopy = async () => {
    if (!userProfile) {
      openAuthModal();
      return;
    }
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      showToast('Referral link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      showToast(`Link: ${referralUrl}`);
    }
  };

  const handleShare = async () => {
    if (!userProfile) {
      openAuthModal();
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join SwapTap - Creator Growth Exchange',
          text: `Join SwapTap to exchange real YouTube and TikTok views! Use my invite link for 5 free ST Tokens:`,
          url: referralUrl,
        });
      } catch (err) {}
    } else {
      handleCopy();
    }
  };

  const unlockedReferrals = referrals.filter((r) => r.status === 'active');
  const pendingReferrals = referrals.filter((r) => r.status === 'pending');

  const directReferrals = userProfile?.referralsCount || referrals.filter((r) => r.level === 1 && r.status === 'active').length;
  const chainReferrals = userProfile?.chainReferralsCount || referrals.filter((r) => r.level === 2 && r.status === 'active').length;
  const totalReferralEarnings = directReferrals * 2 + chainReferrals * 1;
  const pendingEarnings = pendingReferrals.reduce((sum, r) => sum + (r.level === 1 ? 2 : 1), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Section */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              2-Tier Creator Network
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Invite Creators, Earn Verified ST Tokens
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            Expand the community exchange pool. Earn ST Tokens when creators join and begin watching community videos. Multi-tier chain bonuses let you earn when your invites invite others.
          </p>
        </div>
      </div>

      {/* Anti-Abuse Protection Banner */}
      <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5 text-blue-200">
          <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong className="text-white font-semibold">Anti-Abuse Verification:</strong> Referral ST Tokens unlock after the invited creator completes at least <strong>3 community tasks</strong>. This protects creator videos from fake bot sign-ups.
          </span>
        </div>
        <span className="shrink-0 font-mono text-[11px] px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
          Threshold: 3 Tasks
        </span>
      </div>

      {/* 2-Tier Explanation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tier 1 */}
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20">
              Tier 1 • Direct Invite
            </span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              +2 ST Tokens
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white">Direct Friend Sign-Ups</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When a creator signs up with your link, they receive 5 welcome ST Tokens. Once they watch 3 community videos, you receive <strong className="text-slate-200">+2 ST Tokens</strong> to run your campaigns.
          </p>
        </div>

        {/* Tier 2 */}
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-slate-300 bg-slate-800 border border-slate-700">
              Tier 2 • Multi-Level Chain
            </span>
            <span className="text-sm font-mono font-bold text-blue-400">
              +1 ST Token
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white">Network Chain Referrals</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When your invited creators invite their friends (Chain Level 2), you receive <strong className="text-slate-200">+1 bonus ST Token</strong> once the referee completes 3 active tasks.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-[#0F172A]/70 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Direct Friends (Tier 1)</p>
          <p className="text-2xl font-mono font-bold text-white mt-1">{directReferrals}</p>
        </div>

        <div className="bg-[#0F172A]/70 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Network Chain (Tier 2)</p>
          <p className="text-2xl font-mono font-bold text-white mt-1">{chainReferrals}</p>
        </div>

        <div className="bg-[#0F172A]/70 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Unlocked Earnings</p>
          <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">+{totalReferralEarnings} ST</p>
        </div>

        <div className="bg-[#0F172A]/70 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span>Pending Threshold</span>
            <Clock className="w-3 h-3 text-amber-400" />
          </p>
          <p className="text-2xl font-mono font-bold text-amber-400 mt-1">
            {pendingEarnings > 0 ? `+${pendingEarnings} ST` : '0 ST'}
          </p>
        </div>
      </div>

      {/* Referral Link Box */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Link className="w-4 h-4 text-blue-400" />
              <span>Your Personal Referral Link</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Share with creators in Discord communities, Twitter, or WhatsApp groups.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Code:</span>
            <span className="text-blue-400 font-bold">{referralCode}</span>
          </div>
        </div>

        {/* Input & Copy */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:outline-none"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Social Shares */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 mr-1">Share:</span>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `Join SwapTap with me to exchange video views & subscribers! Use my link for 5 free ST Tokens: ${referralUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `Growing my YouTube & TikTok channels with SwapTap! Join with my link to get 5 free promotion ST Tokens: ${referralUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <Twitter className="w-3 h-3 text-sky-400" />
            <span>X</span>
          </a>
        </div>
      </div>

      {/* Referral Log Table with Anti-Abuse States */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Referral Network Log & Verification
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            {unlockedReferrals.length} active • {pendingReferrals.length} pending
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No referral registrations yet. Share your invite link above to get started.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {referrals.map((ref) => {
              const isPending = ref.status === 'pending';
              const progress = ref.tasksCompletedByReferee || 0;
              const target = ref.tasksRequired || 3;
              const pendingPts = ref.level === 1 ? 2 : 1;

              return (
                <div key={ref.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{ref.refereeName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                        {ref.level === 1 ? 'Tier 1 Direct' : 'Tier 2 Chain'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Joined {new Date(ref.createdAt).toLocaleDateString()}</span>
                      {isPending && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400/90 font-mono">
                            {progress}/{target} active tasks completed
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Needs {target - progress} tasks</span>
                        </span>
                        <span className="font-mono text-slate-500 text-xs">
                          +{pendingPts} ST
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Unlocked</span>
                        </span>
                        <span className="font-mono font-semibold text-emerald-400 text-xs">
                          +{ref.pointsAwarded} ST
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
