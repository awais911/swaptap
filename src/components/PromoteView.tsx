import React, { useState } from 'react';
import { Campaign, Platform, TaskType, UserProfile } from '../types';
import { campaignService } from '../services/campaignService';
import {
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  detectPlatformFromUrl,
} from '../utils/mediaUtils';
import {
  DRIP_FEED_OPTIONS,
  DripFeedPacing,
} from '../utils/safetyUtils';
import {
  Megaphone,
  Sparkles,
  PlaySquare,
  UserCheck,
  Pause,
  Play,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Gauge,
  Lock,
} from 'lucide-react';

interface PromoteViewProps {
  userProfile: UserProfile | null;
  openAuthModal: () => void;
  setActiveTab: (tab: 'earn' | 'promote' | 'referrals' | 'wallet' | 'profile' | 'leaderboard' | 'economy') => void;
  showToast: (msg: string) => void;
}

export const PromoteView: React.FC<PromoteViewProps> = ({
  userProfile,
  openAuthModal,
  setActiveTab,
  showToast,
}) => {
  const [subTab, setSubTab] = useState<'create' | 'manage'>('create');
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [taskType, setTaskType] = useState<TaskType>('watch');
  const [dripFeedRate, setDripFeedRate] = useState<DripFeedPacing>('organic');
  const [mediaUrl, setMediaUrl] = useState('');
  const [title, setTitle] = useState('');
  const [targetCount, setTargetCount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoId = extractYouTubeVideoId(mediaUrl);
  const previewThumbnail =
    platform === 'youtube' && videoId
      ? getYouTubeThumbnailUrl(videoId)
      : platform === 'tiktok'
      ? 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&w=600&q=80';

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMediaUrl(val);
    setErrorMsg(null);
    if (val.length > 5) {
      const detected = detectPlatformFromUrl(val);
      if (detected !== platform) {
        setPlatform(detected);
      }
    }
  };

  const pointsCost = targetCount;
  const currentBalance = userProfile?.pointsBalance || 0;
  const hasEnoughPoints = currentBalance >= pointsCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      openAuthModal();
      return;
    }

    if (!mediaUrl.trim()) {
      setErrorMsg('Please enter a valid video or channel URL.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please provide a campaign title.');
      return;
    }

    if (targetCount < 1) {
      setErrorMsg('Target engagement volume must be at least 1.');
      return;
    }

    if (!hasEnoughPoints) {
      setErrorMsg(`Insufficient ST Tokens. You need ${pointsCost} ST Tokens, but have ${currentBalance}.`);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await campaignService.createCampaign(
        {
          platform,
          taskType,
          title,
          mediaUrl,
          targetCount,
          dripFeedRate,
        },
        userProfile
      );

      showToast(`Campaign launched! ${pointsCost} ST Tokens deducted from your wallet.`);
      setMediaUrl('');
      setTitle('');
      setSubTab('manage');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create campaign.');
    } finally {
      setLoading(false);
    }
  };

  const allCampaigns = campaignService.getLocalCampaigns();
  const myCampaigns = allCampaigns.filter((c) => c.creatorId === userProfile?.uid);

  const handleToggleStatus = async (campaign: Campaign) => {
    const next = await campaignService.toggleCampaignStatus(campaign.id, campaign.status);
    showToast(`Campaign status updated to ${next}.`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-500" />
            <span>Promote Your Content</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Exchange accumulated ST Tokens for real views, watch time, and subscribers from fellow creators.
          </p>
        </div>

        <div className="flex items-center bg-[#0F172A] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === 'create'
                ? 'bg-slate-800 text-white border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            New Campaign
          </button>
          <button
            onClick={() => setSubTab('manage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              subTab === 'manage'
                ? 'bg-slate-800 text-white border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>My Campaigns</span>
            {myCampaigns.length > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 text-[10px] font-mono border border-slate-800">
                {myCampaigns.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {subTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Campaign Form */}
          <div className="lg:col-span-7 bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step 1: Platform */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  1. Select Platform
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPlatform('youtube')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                      platform === 'youtube'
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>YouTube</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('tiktok')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                      platform === 'tiktok'
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>TikTok</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('instagram')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                      platform === 'instagram'
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>Instagram</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Goal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    2. Campaign Objective
                  </label>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    100% Verified Watch Time Focus
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTaskType('watch')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      taskType === 'watch'
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <PlaySquare className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-200">Video Watch Time</p>
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">30s verified duration per view</p>
                    </div>
                  </button>

                  <div
                    onClick={() =>
                      showToast(
                        'Subscribers objective is temporarily paused to focus 100% on high-retention video watch time and preserve channel algorithm safety.'
                      )
                    }
                    className="relative flex items-start gap-2.5 p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 text-left opacity-60 cursor-not-allowed group transition-all"
                  >
                    <UserCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-400">
                          {platform === 'youtube' ? 'Subscribers' : 'Followers'}
                        </p>
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-mono">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Temporarily paused for channel safety</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  3. {taskType === 'watch' ? 'Video URL' : 'Channel URL'}
                </label>
                <input
                  type="url"
                  required
                  value={mediaUrl}
                  onChange={handleUrlChange}
                  placeholder={
                    platform === 'youtube'
                      ? 'https://www.youtube.com/watch?v=...'
                      : platform === 'tiktok'
                      ? 'https://www.tiktok.com/@creator/video/...'
                      : 'https://www.instagram.com/reel/...'
                  }
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Step 4: Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  4. Campaign Title
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. My Latest Tech Setup Tour - Watch & Share"
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Step 5: Target Volume */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    5. Target {taskType === 'watch' ? 'Views' : 'Subscribers'}
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {targetCount} {taskType === 'watch' ? 'Views' : 'Subs'}
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {[5, 10, 25, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTargetCount(num)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                        targetCount === num
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={1}
                  max={150}
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Step 6: Smart Drip-Feed Pacing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-blue-400" />
                    <label className="text-xs font-semibold text-slate-300">
                      6. Smart Drip-Feed Distribution Queue
                    </label>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Anti-Spike Algorithm Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Controls how views are paced out into the community pool. Prevents sudden traffic dumps that can trigger platform bot-detection algorithms.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(Object.keys(DRIP_FEED_OPTIONS) as DripFeedPacing[]).map((key) => {
                    const opt = DRIP_FEED_OPTIONS[key];
                    const isSelected = dripFeedRate === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDripFeedRate(key)}
                        className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-blue-600/10 border-blue-500 text-white ring-1 ring-blue-500/30'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-200">
                              {opt.title}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded font-mono ${
                                opt.safetyRating === 'Maximum'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : opt.safetyRating === 'High'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {opt.safetyRating} Safety
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                            {opt.description}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">Rate:</span>
                          <span className={isSelected ? 'text-blue-400 font-bold' : 'text-slate-300'}>
                            ~{opt.viewsPerHour}/hr
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Creator Safety Disclaimer Notice */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Creator Safety & Channel Health Notice</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  SwapTap is a community discovery platform powered 100% by fellow indie creators watching videos organically. To protect your channel’s algorithmic standing, please pace campaigns responsibly and avoid sudden traffic floods on newly created or newly monetized channels.
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing to Queue...</span>
                  </>
                ) : (
                  <>
                    <Megaphone className="w-4 h-4" />
                    <span>Launch Campaign ({pointsCost} ST Tokens)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Budget Breakdown & Live Preview */}
          <div className="lg:col-span-5 space-y-5">
            {/* Cost Breakdown */}
            <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-5 space-y-3.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>ST Token Escrow & Cost Summary</span>
              </h3>

              <div className="space-y-2.5 divide-y divide-slate-800 text-xs">
                <div className="flex justify-between text-slate-300 pt-1">
                  <span>Target Volume:</span>
                  <span className="font-mono font-medium text-white">{targetCount} views</span>
                </div>

                <div className="flex justify-between text-slate-300 pt-2.5">
                  <span>Pacing Model:</span>
                  <span className="font-mono text-emerald-400 font-medium capitalize">
                    {DRIP_FEED_OPTIONS[dripFeedRate].title} (~{DRIP_FEED_OPTIONS[dripFeedRate].viewsPerHour}/hr)
                  </span>
                </div>

                <div className="flex justify-between text-slate-300 pt-2.5">
                  <span>Estimated Pacing:</span>
                  <span className="font-mono text-slate-300">
                    ~{(targetCount / DRIP_FEED_OPTIONS[dripFeedRate].viewsPerHour).toFixed(1)} hrs
                  </span>
                </div>

                <div className="flex justify-between text-slate-300 pt-2.5">
                  <span>Rate:</span>
                  <span className="font-mono text-emerald-400 font-medium">1 ST Token = 1 Real View</span>
                </div>

                <div className="flex justify-between text-slate-300 pt-2.5">
                  <span>Campaign Cost:</span>
                  <span className="font-mono font-bold text-white">{pointsCost} ST Tokens</span>
                </div>

                <div className="flex justify-between text-slate-300 pt-2.5">
                  <span>Current Wallet:</span>
                  <span className="font-mono text-slate-300">{currentBalance} ST Tokens</span>
                </div>

                <div className="flex justify-between text-slate-300 pt-2.5">
                  <span>Balance After:</span>
                  <span
                    className={`font-mono font-bold ${
                      hasEnoughPoints ? 'text-blue-400' : 'text-red-400'
                    }`}
                  >
                    {hasEnoughPoints ? `${currentBalance - pointsCost} ST Tokens` : 'Insufficient ST Tokens'}
                  </span>
                </div>
              </div>

              {!hasEnoughPoints && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 space-y-2">
                  <p className="text-[11px] text-slate-400">
                    You need <strong className="text-white">{pointsCost - currentBalance} more ST Tokens</strong>. Watch community videos to earn ST Tokens quickly.
                  </p>
                  <button
                    onClick={() => setActiveTab('earn')}
                    className="w-full py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-medium text-xs border border-blue-500/30 transition-colors"
                  >
                    Earn ST Tokens Now
                  </button>
                </div>
              )}
            </div>

            {/* Preview Card */}
            <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Card Preview in Feed
              </h3>

              <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden">
                <div className="relative aspect-video w-full bg-slate-950">
                  <img
                    src={previewThumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-900/90 text-slate-200 border border-slate-700">
                    {platform}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono text-slate-200 bg-slate-900/90 border border-slate-700">
                    +1 ST
                  </div>
                </div>
                <div className="p-3.5 space-y-1.5">
                  <p className="text-xs font-semibold text-white line-clamp-1">
                    {title || 'Your Video Title Preview'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Creator: <span className="text-slate-300">{userProfile?.displayName || 'You'}</span>
                  </p>
                  <div className="text-[11px] text-blue-400 font-mono">
                    0 / {targetCount} {taskType === 'watch' ? 'Views' : 'Subs'} Delivered
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Manage My Campaigns */
        <div className="space-y-4">
          {myCampaigns.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#0F172A]/40 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">No active campaigns</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                You haven&apos;t launched any campaigns yet. Use your welcome ST Tokens to promote your first video.
              </p>
              <button
                onClick={() => setSubTab('create')}
                className="mt-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
              >
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCampaigns.map((camp) => {
                const progressPct = Math.min(
                  100,
                  Math.round((camp.completedCount / camp.targetCount) * 100)
                );
                return (
                  <div
                    key={camp.id}
                    className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-800">
                          {camp.platform} • {camp.taskType}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium capitalize ${
                            camp.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : camp.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </div>

                      <h3 className="text-xs font-semibold text-white line-clamp-1 mb-1">{camp.title}</h3>
                      <a
                        href={camp.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{camp.mediaUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>Delivered</span>
                        <span className="text-slate-200">
                          {camp.completedCount} / {camp.targetCount} ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-500 font-mono">
                        Escrow Allocated: {camp.pointsAllocated} ST
                      </span>
                      {camp.status !== 'completed' && (
                        <button
                          onClick={() => handleToggleStatus(camp)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition-colors"
                        >
                          {camp.status === 'active' ? (
                            <>
                              <Pause className="w-3 h-3" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Resume</span>
                            </>
                          )}
                        </button>
                      )}
                      {camp.status === 'completed' && (
                        <span className="flex items-center gap-1 text-xs text-blue-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Fulfilled</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
