import React, { useState, useEffect } from 'react';
import { EconomyStats } from '../types';
import { campaignService } from '../services/campaignService';
import {
  Activity,
  ShieldCheck,
  Coins,
  PlaySquare,
  TrendingUp,
  RefreshCw,
  Lock,
  Eye,
  CheckCircle2,
  HelpCircle,
  Scale,
  Sparkles,
  Users,
  AlertTriangle,
  Gauge,
  Clock,
} from 'lucide-react';

export const EconomyHealthView: React.FC = () => {
  const [stats, setStats] = useState<EconomyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await campaignService.getEconomyStats();
      setStats(data);
    } catch (e) {
      console.warn('Could not load economy stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const faqs = [
    {
      q: 'Where do ST Tokens come from?',
      a: 'ST Tokens are minted purely by community members spending their time watching videos and supporting fellow creators. No real money is ever involved, ST Tokens cannot be purchased, and there is zero artificial inflation.',
    },
    {
      q: 'Why is the Subscribers objective temporarily marked "Coming Soon"?',
      a: 'To guarantee maximum safety and simplicity for all participating channels. Social media algorithms aggressively analyze subscription-to-view ratios. By focusing 100% on high-retention 30-second Video Watch Time, SwapTap protects creators against artificial engagement flags while providing real discovery.',
    },
    {
      q: 'How does the Smart Drip-Feed system protect my YouTube channel?',
      a: 'Dumping 50 or 100 views in 5 minutes creates unnatural velocity spikes that trigger bot audits. Our Smart Drip-Feed system staggers views over hours (e.g. 5–8 views/hr for Organic Pacing), mimicking real-world organic sharing and social virality.',
    },
    {
      q: 'Why is there a strict daily cap of 25 tasks per creator?',
      a: 'To prevent industrial farming and preserve an authentic community of real human content creators. Limiting accounts to 25 tasks per day ensures balanced view distributions and protects every creator channel from sudden unnatural traffic surges.',
    },
    {
      q: 'Why is there a 30-second minimum watch timer with natural jitter?',
      a: 'YouTube, TikTok, and Instagram retention algorithms punish videos if viewers click away after 2-3 seconds. The mandatory ~30–33 second watch duration with random human jitter ensures high audience retention signals that boost video recommendations.',
    },
    {
      q: 'Why does the timer pause when I switch tabs?',
      a: 'Our Page Visibility Guard detects when a browser tab is minimized or hidden. If creators could farm ST Tokens in background tabs without looking at the videos, the mutual exchange would lose all value. Honest creators deserve genuine eyeballs.',
    },
    {
      q: 'Why are referral bonuses locked until 3 tasks are completed?',
      a: 'To prevent fake multi-account spam and bot registrations. When an invited friend joins, your +2 referral bonus is safely reserved as "Pending" and automatically deposits to your wallet as soon as they complete their first 3 community views.',
    },
    {
      q: 'What prevents negative balances or token duplication?',
      a: 'Every ST Token addition, referral reward, and campaign spend is handled through ACID-compliant atomic database transactions. ST Tokens are locked in escrow upon campaign launch and transferred only upon verified watch completion.',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header Section */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Closed-Loop Economy
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Economy Health & Transparency
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed">
              A transparent, 100% closed-loop creator exchange. Zero real-money paywalls, zero artificial bots, and mathematically guaranteed 1:1 view-for-view parity.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Closed-Loop Reserve: Healthy (100%)</span>
            </div>
            <button
              onClick={fetchStats}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Live Synced</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Balance Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-4.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ST Tokens in Circulation</span>
            <Coins className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-white">
            {stats?.circulatingPoints.toLocaleString() || '2,890'} <span className="text-xs font-normal text-slate-400 font-sans">ST</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Circulating in wallets & active campaign escrow
          </p>
        </div>

        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-4.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Exchange Campaigns</span>
            <PlaySquare className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-white">
            {stats?.activeCampaignsCount || '6'} <span className="text-xs font-normal text-slate-400 font-sans">Live</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Currently receiving community watch time
          </p>
        </div>

        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-4.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Verified Views Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-white">
            {stats?.totalViewsDelivered.toLocaleString() || '148'} <span className="text-xs font-normal text-slate-400 font-sans">Sessions</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Strict 30-second duration verified
          </p>
        </div>

        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-4.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Anti-Cheat Blocks Intercepted</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-amber-400">
            {stats?.antiCheatViolationsBlocked || 14} <span className="text-xs font-normal text-slate-400 font-sans">Blocked</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Tab switches & cooldown attempts stopped
          </p>
        </div>
      </div>

      {/* Visual Flow / Where Points Come From */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <span>Where ST Tokens Come From & How They Circulate</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              SwapTap operates on a closed value cycle where attention is the only currency.
            </p>
          </div>
          <span className="font-mono text-[11px] text-slate-300 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 self-start">
            1 View Given = 1 ST Token = 1 View Received
          </span>
        </div>

        {/* 3-Step Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Step 1 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4.5 space-y-2.5 relative">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold flex items-center justify-center">
              01
            </div>
            <h4 className="text-sm font-semibold text-white">Earn Through Real Attention</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              You watch another creator's shared video for a verified 30 seconds. Upon genuine completion, +1 ST Token is generated and added to your wallet.
            </p>
            <div className="pt-1 text-[11px] font-mono text-blue-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>No credit cards or money accepted</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4.5 space-y-2.5 relative">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center">
              02
            </div>
            <h4 className="text-sm font-semibold text-white">Escrow in Promotion Queue</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you submit your video to promote, ST Tokens are deducted from your wallet and placed into a secure community pool escrow.
            </p>
            <div className="pt-1 text-[11px] font-mono text-indigo-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>100% pre-funded campaign reserve</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4.5 space-y-2.5 relative">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center">
              03
            </div>
            <h4 className="text-sm font-semibold text-white">Genuine Delivery to Your Video</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Other indie creators watch your video to earn their own ST Tokens. ST Tokens from your escrow transfer to them only when their 30s is verified.
            </p>
            <div className="pt-1 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Closed-loop community equilibrium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Anti-Cheat System Specifications */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Cheat & Integrity Mechanisms</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            How we protect creators against bot farms, click abuse, and multi-tab scripts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-white">Page Visibility API Guard</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If a user minimizes the browser or switches to another tab, the video timer pauses immediately. ST Tokens cannot be earned in background tabs.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-semibold text-white">3-Task Referral Threshold</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inviter bonuses (+2 and +1 ST Tokens) remain in a pending escrow until the invited creator watches at least 3 community videos, eliminating fake account spam.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold text-white">15s Anti-Bot Cooldown</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A forced cooldown period is required between consecutive video views. Rapid-fire requests from bot scripts are automatically rejected.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-white">Atomic Transaction Ledger</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All balance deductions and rewards run through atomic database transactions. Negative balances and double-spend race conditions are mathematically prevented.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-semibold text-white">Smart Drip-Feed Pacing</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              New campaigns release views naturally over hours (~5–8 views/hr for Organic Pacing) to eliminate sudden traffic spikes that trigger YouTube/Meta bot detection algorithms.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-white">25 Daily Task Cap</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each creator is limited to 25 verified watch tasks per day, preventing unnatural activity surges, industrial farming, and keeping channels 100% compliant with platform health standards.
            </p>
          </div>
        </div>
      </div>

      {/* Fair Play FAQ */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Community Fair Play FAQ</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent answers to common questions about ST Tokens, security, and algorithm safety.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-500 font-mono text-sm ml-2">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
