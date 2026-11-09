import React, { useState, useEffect, useRef } from 'react';
import { Campaign, UserProfile } from '../types';
import { campaignService } from '../services/campaignService';
import { getYouTubeEmbedUrl } from '../utils/mediaUtils';
import {
  getRandomizedWatchDuration,
  getDailyTasksStatus,
  DAILY_TASK_LIMIT,
} from '../utils/safetyUtils';
import {
  X,
  Play,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  PauseCircle,
  Eye,
  AlertTriangle,
  Lock,
  Sparkles,
} from 'lucide-react';

interface WatchModalProps {
  campaign: Campaign;
  userProfile: UserProfile | null;
  onClose: () => void;
  onSuccess: () => void;
  openAuthModal: () => void;
}

export const WatchModal: React.FC<WatchModalProps> = ({
  campaign,
  userProfile,
  onClose,
  onSuccess,
  openAuthModal,
}) => {
  // Natural human randomized duration (30s base + 1-3s random human jitter)
  const [totalWatchTarget] = useState(() => getRandomizedWatchDuration(30));
  const [secondsRemaining, setSecondsRemaining] = useState(totalWatchTarget);
  const [isClaimable, setIsClaimable] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Daily Tasks Status
  const dailyStatus = getDailyTasksStatus(userProfile);

  // Anti-Cheat: Visibility and Window Focus Tracking
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const [isWindowFocused, setIsWindowFocused] = useState(document.hasFocus());
  const [focusLostCount, setFocusLostCount] = useState(0);

  // Anti-Cheat: Rate Limit Cooldown State
  const [cooldownSeconds, setCooldownSeconds] = useState(() =>
    campaignService.getCooldownRemainingSeconds(userProfile)
  );

  const accumulatedWatchSecRef = useRef(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const cdInterval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(cdInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cdInterval);
  }, [cooldownSeconds]);

  // Page Visibility API & Window Focus Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);
      if (!visible) {
        setFocusLostCount((prev) => prev + 1);
        campaignService.recordAntiCheatViolation(
          `Tab switched/hidden during active watch task for "${campaign.title}"`
        );
      }
    };

    const handleWindowBlur = () => {
      setIsWindowFocused(false);
      setFocusLostCount((prev) => prev + 1);
      campaignService.recordAntiCheatViolation(
        `Window blurred/deselected during active watch task for "${campaign.title}"`
      );
    };

    const handleWindowFocus = () => {
      setIsWindowFocused(true);
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [campaign.title]);

  // Strictly Enforced Watch Countdown (Paused if tab is hidden or window lost focus)
  const isActivelyTracking = isTabVisible && isWindowFocused && !isClaimable;

  useEffect(() => {
    if (!isActivelyTracking) return;

    const interval = setInterval(() => {
      accumulatedWatchSecRef.current += 1;
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Introduce a natural 400ms human cognitive buffer before enabling claim
          setTimeout(() => {
            setIsClaimable(true);
          }, 400);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActivelyTracking]);

  const handleClaim = async () => {
    if (!userProfile) {
      openAuthModal();
      return;
    }

    // Check daily task cap
    if (dailyStatus.isLimitReached) {
      setErrorMsg(`Daily limit reached (${DAILY_TASK_LIMIT}/${DAILY_TASK_LIMIT} tasks). Resets at midnight.`);
      return;
    }

    // Double-check tamper guard
    if (secondsRemaining > 0 || !isClaimable || isClaiming) {
      return;
    }

    if (cooldownSeconds > 0) {
      setErrorMsg(`Anti-Bot Cooldown: Please wait ${cooldownSeconds}s before claiming.`);
      return;
    }

    try {
      setIsClaiming(true);
      setErrorMsg(null);
      await campaignService.completeTask(campaign, userProfile);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to claim reward. Please try again.');
      setIsClaiming(false);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round(((totalWatchTarget - secondsRemaining) / totalWatchTarget) * 100)
  );

  const isPaused = !isTabVisible || !isWindowFocused;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
              YouTube View Task
            </span>
            <span className="text-xs font-mono font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              +1 ST Token
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>{totalWatchTarget}s Natural Duration</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Safe Sandbox</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {campaign.platform === 'youtube' && campaign.videoId ? (
            <iframe
              src={getYouTubeEmbedUrl(campaign.videoId, true)}
              title={campaign.title}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              referrerPolicy="no-referrer-when-downgrade"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <Play className="w-6 h-6 fill-slate-300" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-0.5">{campaign.title}</h4>
                <p className="text-xs text-slate-400">Platform: {campaign.platform.toUpperCase()}</p>
              </div>
              <a
                href={campaign.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              >
                <span>Open Video</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Anti-Cheat Tab Pause Overlay */}
          {isPaused && !isClaimable && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200 z-10">
              <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                <PauseCircle className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Playback Timer Paused
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mb-3 leading-relaxed">
                You switched tabs or minimized the window. Return focus here to resume verifying your {totalWatchTarget}s watch duration.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-amber-400 font-mono">
                <Eye className="w-3.5 h-3.5" />
                <span>Page Visibility Guard Active</span>
              </div>
            </div>
          )}
        </div>

        {/* Verification Status & Controls */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-white line-clamp-1 mb-1">{campaign.title}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Creator: <strong className="text-slate-300 font-medium">{campaign.creatorName}</strong></span>
              <span>•</span>
              <span>Pool Delivery: {campaign.completedCount}/{campaign.targetCount} views</span>
            </div>
          </div>

          {/* Daily Limit Warning if close or reached */}
          {dailyStatus.isLimitReached ? (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Daily Cap Reached ({DAILY_TASK_LIMIT}/{DAILY_TASK_LIMIT} tasks). You have completed your daily task allowance to preserve channel algorithm safety.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span>Daily Creator Activity:</span>
              <span className="font-mono text-slate-200">
                {dailyStatus.used} / {dailyStatus.max} tasks today ({dailyStatus.remaining} remaining)
              </span>
            </div>
          )}

          {/* Verification Bar */}
          <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                {isClaimable ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isPaused ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>
                  {isClaimable
                    ? 'Watch Time Verified'
                    : isPaused
                    ? 'Timer Paused (Keep Tab Visible)'
                    : 'Active Watch Verification'}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-blue-400">
                <Clock className="w-3 h-3" />
                <span>
                  {secondsRemaining > 0 ? `00:${secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}` : 'Completed'}
                </span>
              </div>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isClaimable
                    ? 'bg-emerald-500'
                    : isPaused
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {isClaimable
                  ? `${totalWatchTarget}s duration verified. Claim your +1 ST Token below.`
                  : isPaused
                  ? 'Keep this window active to resume the timer.'
                  : `Watch at least ${secondsRemaining}s more without leaving tab.`}
              </span>
              {focusLostCount > 0 && !isClaimable && (
                <span className="text-amber-400/80 text-[10px] font-mono">
                  {focusLostCount} pause{focusLostCount > 1 ? 's' : ''} detected
                </span>
              )}
            </div>
          </div>

          {/* Anti-Bot Rate Limit Cooldown Notice */}
          {cooldownSeconds > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
              <Clock className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              <span>
                Anti-Bot Cooldown: Rate limiting active. Please wait <strong>{cooldownSeconds}s</strong> before verifying your next task.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleClaim}
              disabled={!isClaimable || isClaiming || cooldownSeconds > 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-xs transition-colors ${
                isClaimable && cooldownSeconds === 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isClaiming ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Transaction...</span>
                </>
              ) : isClaimable ? (
                cooldownSeconds > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Cooldown ({cooldownSeconds}s)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Claim +1 ST Token</span>
                  </>
                )
              ) : isPaused ? (
                <>
                  <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Paused: Return Focus</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Watch {secondsRemaining}s to Claim</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
