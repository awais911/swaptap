import React, { useState, useEffect } from 'react';
import { Campaign, Platform, TaskType, UserProfile } from '../types';
import { campaignService } from '../services/campaignService';
import { getDailyTasksStatus, DAILY_TASK_LIMIT } from '../utils/safetyUtils';
import { WatchModal } from './WatchModal';
import { SubscribeModal } from './SubscribeModal';
import {
  PlaySquare,
  Search,
  Sparkles,
  CheckCircle2,
  Play,
  UserCheck,
  Megaphone,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Gauge,
  Lock,
} from 'lucide-react';

interface EarnViewProps {
  userProfile: UserProfile | null;
  openAuthModal: () => void;
  setActiveTab: (tab: 'earn' | 'promote' | 'referrals' | 'wallet' | 'profile' | 'leaderboard' | 'economy') => void;
  showToast: (msg: string) => void;
}

export const EarnView: React.FC<EarnViewProps> = ({
  userProfile,
  openAuthModal,
  setActiveTab,
  showToast,
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => campaignService.getLocalCampaigns());
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalCampaign, setActiveModalCampaign] = useState<Campaign | null>(null);

  const dailyStatus = getDailyTasksStatus(userProfile);

  useEffect(() => {
    const unsubscribeCampaigns = campaignService.subscribeToActiveCampaigns((data) => {
      setCampaigns(data);
    });

    return () => {
      if (typeof unsubscribeCampaigns === 'function') unsubscribeCampaigns();
    };
  }, []);

  useEffect(() => {
    if (!userProfile) {
      setCompletedTaskIds(new Set());
      return;
    }

    const unsubscribeTasks = campaignService.subscribeToUserTasks(userProfile.uid, (taskIds) => {
      setCompletedTaskIds(taskIds);
    });

    return () => {
      if (typeof unsubscribeTasks === 'function') unsubscribeTasks();
    };
  }, [userProfile]);

  const filteredCampaigns = campaigns.filter((c) => {
    if (selectedPlatform !== 'all' && c.platform !== selectedPlatform) return false;
    if (selectedTaskType !== 'all' && c.taskType !== selectedTaskType) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.creatorName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleTaskClick = (campaign: Campaign) => {
    if (!userProfile) {
      openAuthModal();
      return;
    }

    if (campaign.taskType === 'subscribe') {
      showToast('Subscribers task is temporarily paused for algorithm safety. Please watch videos to earn ST Tokens.');
      return;
    }

    if (dailyStatus.isLimitReached) {
      showToast(
        `Daily task cap reached (${DAILY_TASK_LIMIT}/${DAILY_TASK_LIMIT} tasks). You have completed today's allowance to preserve channel algorithm safety. Resets at midnight.`
      );
      return;
    }

    setActiveModalCampaign(campaign);
  };

  const handleTaskSuccess = () => {
    const camp = activeModalCampaign;
    setActiveModalCampaign(null);
    showToast(`Earned +1 ST Token supporting ${camp?.creatorName || 'creator'}`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Section - Minimalist SaaS Layout */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Community Pool
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">{campaigns.length} campaigns active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Earn ST Tokens by Supporting Creators
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed">
              Watch videos for at least 30 seconds or subscribe to verified channels to earn wallet ST Tokens.
              Use ST Tokens to launch promotion campaigns for your own content.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('promote')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Promote My Content</span>
            </button>

            <button
              onClick={() => setActiveTab('referrals')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-800 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <span>Invite (+2 ST)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily User Activity & Platform Safety Meter */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              Daily Creator Activity Cap
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                dailyStatus.isLimitReached
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {dailyStatus.isLimitReached
                ? 'Daily Cap Reached (25/25)'
                : `${dailyStatus.remaining} Tasks Remaining Today`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Resets at Midnight (00:00)</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                dailyStatus.isLimitReached ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min(100, Math.round((dailyStatus.used / dailyStatus.max) * 100))}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {dailyStatus.used} of {dailyStatus.max} tasks used today
            </span>
            <span className="text-slate-500">
              25 tasks/day cap protects creators from algorithmic bot-flagging
            </span>
          </div>
        </div>

        {dailyStatus.isLimitReached && (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              You have completed 25 tasks today! Your daily allowance resets at midnight to maintain natural platform growth.
            </span>
          </div>
        )}
      </div>

      {/* Anti-Cheat & Economy Health Transparency Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Platform Safety Guardrails:</strong> 100% Verified Watch Time focus, 25 daily task caps, and Smart Drip-Feed queues.
          </span>
        </div>
        <button
          onClick={() => setActiveTab('economy')}
          className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[11px] self-start sm:self-auto cursor-pointer"
        >
          View Economy Health & Rules →
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F172A]/50 p-2.5 rounded-xl border border-slate-800/80">
        {/* Platform Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedPlatform === 'all'
                ? 'bg-slate-800 text-white border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Platforms
          </button>
          <button
            onClick={() => setSelectedPlatform('youtube')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedPlatform === 'youtube'
                ? 'bg-slate-800 text-white border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>YouTube</span>
          </button>
          <button
            onClick={() => setSelectedPlatform('tiktok')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedPlatform === 'tiktok'
                ? 'bg-slate-800 text-white border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>TikTok</span>
          </button>
          <button
            onClick={() => setSelectedPlatform('instagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedPlatform === 'instagram'
                ? 'bg-slate-800 text-white border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            <span>Instagram</span>
          </button>
        </div>

        {/* Task Type Filters & Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedTaskType}
            onChange={(e) => setSelectedTaskType(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-slate-700"
          >
            <option value="all">All Tasks (Watch Time Focus)</option>
            <option value="watch">Watch Videos (+1 ST Token)</option>
            <option value="subscribe" disabled className="text-slate-500">
              Subscribers (Coming Soon)
            </option>
          </select>

          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#0F172A]/40 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <PlaySquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No campaigns found</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Try adjusting your search criteria or create a new campaign to populate the exchange queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((campaign) => {
            const isCompleted = completedTaskIds.has(campaign.id);
            const isOwner = userProfile?.uid === campaign.creatorId;
            const progressPct = Math.min(
              100,
              Math.round((campaign.completedCount / campaign.targetCount) * 100)
            );

            return (
              <div
                key={campaign.id}
                className="group relative flex flex-col bg-[#0F172A]/80 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden transition-all duration-200"
              >
                {/* Media Preview / Thumbnail Header */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  <img
                    src={
                      campaign.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-black/40" />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${
                        campaign.platform === 'youtube'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : campaign.platform === 'tiktok'
                          ? 'bg-slate-900/80 text-sky-300 border border-sky-500/30'
                          : 'bg-slate-900/80 text-pink-300 border border-pink-500/30'
                      }`}
                    >
                      {campaign.platform}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] font-mono font-medium text-slate-200 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      +1 ST
                    </span>
                  </div>

                  {/* Play / Follow Icon Hover Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md">
                      {campaign.taskType === 'watch' ? (
                        <Play className="w-5 h-5 fill-white" />
                      ) : (
                        <UserCheck className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3.5">
                  <div>
                    {/* Creator Info */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <img
                        src={
                          campaign.creatorPhoto ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${campaign.creatorId}`
                        }
                        alt={campaign.creatorName}
                        className="w-4 h-4 rounded-full object-cover bg-slate-800"
                      />
                      <span className="text-xs text-slate-400 truncate">
                        {campaign.creatorName}
                      </span>
                      {isOwner && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          You
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                      {campaign.title}
                    </h3>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Progress</span>
                      <span>
                        {campaign.completedCount} / {campaign.targetCount} ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  {isCompleted ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Task Completed (+1 ST Token)</span>
                    </div>
                  ) : campaign.taskType === 'subscribe' ? (
                    <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-xs font-medium cursor-not-allowed">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>Subscribers</span>
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        Coming Soon
                      </span>
                    </div>
                  ) : dailyStatus.isLimitReached ? (
                    <button
                      onClick={() => handleTaskClick(campaign)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700/60 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Daily Cap Reached (25/25)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTaskClick(campaign)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm"
                    >
                      <PlaySquare className="w-3.5 h-3.5" />
                      <span>Watch 30s & Earn +1 ST Token</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Watch Modal */}
      {activeModalCampaign && activeModalCampaign.taskType === 'watch' && (
        <WatchModal
          campaign={activeModalCampaign}
          userProfile={userProfile}
          onClose={() => setActiveModalCampaign(null)}
          onSuccess={handleTaskSuccess}
          openAuthModal={openAuthModal}
        />
      )}

      {/* Subscribe Modal */}
      {activeModalCampaign && activeModalCampaign.taskType === 'subscribe' && (
        <SubscribeModal
          campaign={activeModalCampaign}
          userProfile={userProfile}
          onClose={() => setActiveModalCampaign(null)}
          onSuccess={handleTaskSuccess}
          openAuthModal={openAuthModal}
        />
      )}
    </div>
  );
};
