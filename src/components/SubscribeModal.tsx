import React, { useState, useEffect } from 'react';
import { Campaign, UserProfile } from '../types';
import { campaignService } from '../services/campaignService';
import { X, ExternalLink, UserCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface SubscribeModalProps {
  campaign: Campaign;
  userProfile: UserProfile | null;
  onClose: () => void;
  onSuccess: () => void;
  openAuthModal: () => void;
}

const VERIFY_SECONDS = 10;

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
  campaign,
  userProfile,
  onClose,
  onSuccess,
  openAuthModal,
}) => {
  const [hasVisited, setHasVisited] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(VERIFY_SECONDS);
  const [isClaimable, setIsClaimable] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!hasVisited) return;
    if (secondsRemaining <= 0) {
      setIsClaimable(true);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsClaimable(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasVisited, secondsRemaining]);

  const handleVisitChannel = () => {
    setHasVisited(true);
    window.open(campaign.mediaUrl, '_blank', 'noopener,noreferrer');
  };

  const handleClaim = async () => {
    if (!userProfile) {
      openAuthModal();
      return;
    }
    if (!isClaimable || isClaiming) return;

    try {
      setIsClaiming(true);
      setErrorMsg(null);
      await campaignService.completeTask(campaign, userProfile);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to claim ST Tokens.');
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              {campaign.platform} {campaign.platform === 'youtube' ? 'Subscribe' : 'Follow'}
            </span>
            <span className="text-xs font-mono font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              +1 ST Token
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Info */}
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <img
              src={campaign.creatorPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${campaign.creatorId}`}
              alt={campaign.creatorName}
              className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700"
            />
            <div className="absolute -bottom-1 -right-1 p-1 rounded bg-blue-600 text-white shadow-sm">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-0.5">{campaign.creatorName}</h3>
            <p className="text-xs text-slate-400 max-w-xs">{campaign.title}</p>
          </div>

          {/* Step 1: Open external page */}
          <div className="w-full bg-slate-900/70 rounded-xl p-3.5 border border-slate-800 flex flex-col gap-2.5 text-left">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 font-mono text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <p className="text-xs font-medium text-slate-200">Open channel & subscribe</p>
                <p className="text-[11px] text-slate-400">
                  Click the link below, subscribe on the platform, then return to claim.
                </p>
              </div>
            </div>

            <button
              onClick={handleVisitChannel}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <span>Visit @{campaign.creatorName}&apos;s Channel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step 2: Verification */}
          {hasVisited && (
            <div className="w-full bg-slate-900/70 rounded-xl p-3.5 border border-slate-800 flex flex-col gap-2 text-left animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Subscription verification</span>
                <span className="font-mono text-xs text-blue-400">
                  {secondsRemaining > 0 ? `${secondsRemaining}s` : 'Ready'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isClaimable
                  ? 'Ready to confirm. Click below to receive your ST Token.'
                  : `Please wait ${secondsRemaining}s while we register activity.`}
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex items-center justify-between gap-2.5 pt-1">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleClaim}
              disabled={!isClaimable || isClaiming}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg font-medium text-xs transition-colors ${
                isClaimable
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isClaiming ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : isClaimable ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Claim +1 ST</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{hasVisited ? `Confirm in ${secondsRemaining}s` : 'Open Channel First'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
