import React, { useState, useEffect } from 'react';
import { LeaderboardCreator, UserProfile } from '../types';
import { campaignService } from '../services/campaignService';
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Megaphone,
  Users,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LeaderboardViewProps {
  userProfile: UserProfile | null;
  openAuthModal: () => void;
  setActiveTab: (tab: 'earn' | 'promote' | 'referrals' | 'wallet' | 'profile' | 'leaderboard' | 'economy') => void;
  showToast: (msg: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  userProfile,
  setActiveTab,
  showToast,
}) => {
  const [metric, setMetric] = useState<'points' | 'campaigns' | 'referrals'>('points');
  const [timeframe, setTimeframe] = useState<'all_time' | 'this_week'>('all_time');
  const [creators, setCreators] = useState<LeaderboardCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    campaignService.getLeaderboard(metric, userProfile).then((data) => {
      if (isMounted) {
        if (timeframe === 'this_week') {
          const scaled = data.map((c, i) => ({
            ...c,
            pointsEarned: Math.max(5, Math.round(c.pointsEarned * 0.35) + (i < 3 ? 15 : 0)),
            campaignsCompleted: Math.max(1, Math.round(c.campaignsCompleted * 0.4)),
          }));
          scaled.sort((a, b) => {
            if (metric === 'points') return b.pointsEarned - a.pointsEarned;
            if (metric === 'campaigns') return b.campaignsCompleted - a.campaignsCompleted;
            return b.referralsCount - a.referralsCount;
          });
          setCreators(scaled.map((c, idx) => ({ ...c, rank: idx + 1 })));
        } else {
          setCreators(data);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [metric, timeframe, userProfile]);

  const top1 = creators[0];
  const top2 = creators[1];
  const top3 = creators[2];
  const restCreators = creators.slice(3);

  const currentUserStanding = creators.find((c) => c.isCurrentUser);

  const triggerPodiumCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#60A5FA', '#93C5FD'],
      });
      showToast('Recognizing community exchange leaders');
    } catch (e) {}
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Section */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Rankings & Recognition
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Top Creators Leaderboard
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed">
              Community standing based on verified watch time, campaigns completed, and referral network growth.
              Top performers receive weekly bonus ST Tokens.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={triggerPodiumCelebration}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-800 transition-colors"
            >
              Celebrate Top 3
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F172A]/50 p-2.5 rounded-xl border border-slate-800/80">
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setMetric('points')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              metric === 'points'
                ? 'bg-slate-800 text-white border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Most ST Tokens</span>
          </button>

          <button
            onClick={() => setMetric('campaigns')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              metric === 'campaigns'
                ? 'bg-slate-800 text-white border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Most Campaigns</span>
          </button>

          <button
            onClick={() => setMetric('referrals')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              metric === 'referrals'
                ? 'bg-slate-800 text-white border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Top Referrers</span>
          </button>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setTimeframe('all_time')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              timeframe === 'all_time' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            All-Time
          </button>
          <button
            onClick={() => setTimeframe('this_week')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              timeframe === 'this_week' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* User Standing Card */}
      {currentUserStanding && (
        <div className="bg-[#0F172A]/80 border border-blue-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="relative">
              <img
                src={currentUserStanding.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUserStanding.uid}`}
                alt={currentUserStanding.displayName}
                className="w-10 h-10 rounded-lg object-cover bg-slate-800"
              />
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                #{currentUserStanding.rank}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white text-xs sm:text-sm">{currentUserStanding.displayName}</p>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 font-mono">
                  Your Rank
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current score:{' '}
                <strong className="text-white font-mono">
                  {metric === 'points'
                    ? `${currentUserStanding.pointsEarned} ST Tokens`
                    : metric === 'campaigns'
                    ? `${currentUserStanding.campaignsCompleted} Campaigns`
                    : `${currentUserStanding.referralsCount} Invites`}
                </strong>
                {' • '}
                Rank #{currentUserStanding.rank} of {creators.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('earn')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Earn ST Tokens to Rank Up</span>
          </button>
        </div>
      )}

      {/* Podium Cards for Top 3 */}
      {top1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
          {/* 2nd Place (Silver) */}
          {top2 && (
            <div className="order-2 md:order-1 bg-[#0F172A]/80 border border-slate-800 rounded-xl p-5 text-center flex flex-col items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900 border border-slate-800">
                #2 Silver
              </span>
              <img
                src={top2.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${top2.uid}`}
                alt={top2.displayName}
                className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700"
              />
              <div>
                <h3 className="font-semibold text-white text-sm line-clamp-1">{top2.displayName}</h3>
                <span className="text-[11px] text-slate-400">{top2.badgeTitle}</span>
              </div>
              <div className="w-full bg-slate-900/60 rounded-lg p-2.5 border border-slate-800">
                <p className="text-xl font-mono font-bold text-white">
                  {metric === 'points'
                    ? `${top2.pointsEarned} ST`
                    : metric === 'campaigns'
                    ? `${top2.campaignsCompleted} Runs`
                    : `${top2.referralsCount} Invites`}
                </p>
              </div>
            </div>
          )}

          {/* 1st Place (Gold Champion) */}
          <div className="order-1 md:order-2 bg-[#0F172A] border-2 border-amber-500/30 rounded-xl p-6 text-center flex flex-col items-center gap-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              #1 Champion
            </span>
            <img
              src={top1.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${top1.uid}`}
              alt={top1.displayName}
              className="w-20 h-20 rounded-xl object-cover bg-slate-800 border-2 border-amber-500/40"
            />
            <div>
              <h3 className="font-bold text-white text-base line-clamp-1">{top1.displayName}</h3>
              <span className="text-xs text-amber-400 font-medium">{top1.badgeTitle}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-lg p-3 border border-slate-800">
              <p className="text-2xl font-mono font-black text-amber-300">
                {metric === 'points'
                  ? `${top1.pointsEarned} ST`
                  : metric === 'campaigns'
                  ? `${top1.campaignsCompleted} Runs`
                  : `${top1.referralsCount} Invites`}
              </p>
            </div>
          </div>

          {/* 3rd Place (Bronze) */}
          {top3 && (
            <div className="order-3 bg-[#0F172A]/80 border border-slate-800 rounded-xl p-5 text-center flex flex-col items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900 border border-slate-800">
                #3 Bronze
              </span>
              <img
                src={top3.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3.uid}`}
                alt={top3.displayName}
                className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700"
              />
              <div>
                <h3 className="font-semibold text-white text-sm line-clamp-1">{top3.displayName}</h3>
                <span className="text-[11px] text-slate-400">{top3.badgeTitle}</span>
              </div>
              <div className="w-full bg-slate-900/60 rounded-lg p-2.5 border border-slate-800">
                <p className="text-xl font-mono font-bold text-white">
                  {metric === 'points'
                    ? `${top3.pointsEarned} ST`
                    : metric === 'campaigns'
                    ? `${top3.campaignsCompleted} Runs`
                    : `${top3.referralsCount} Invites`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rankings Table (4+) */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-semibold text-slate-300">Community Rankings</span>
          <span className="text-slate-500 font-mono">{creators.length} active creators</span>
        </div>

        <div className="divide-y divide-slate-800/70">
          {restCreators.map((creator) => {
            const isMe = creator.isCurrentUser;
            return (
              <div
                key={creator.uid}
                className={`py-3 px-2 rounded-lg flex items-center justify-between gap-4 transition-colors ${
                  isMe ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-medium text-xs text-slate-400">
                    #{creator.rank}
                  </span>

                  <img
                    src={creator.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${creator.uid}`}
                    alt={creator.displayName}
                    className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{creator.displayName}</span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{creator.badgeTitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block text-[11px] text-slate-400 font-mono">
                    <span>{creator.tasksCompleted} tasks • {creator.campaignsCompleted} campaigns</span>
                  </div>

                  <span className="font-mono font-bold text-xs sm:text-sm text-white min-w-[60px] text-right">
                    {metric === 'points'
                      ? `${creator.pointsEarned} ST`
                      : metric === 'campaigns'
                      ? `${creator.campaignsCompleted} Runs`
                      : `${creator.referralsCount} Inv`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
