import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  PlaySquare,
  Megaphone,
  Users,
  Wallet,
  User as UserIcon,
  LogIn,
  LogOut,
  Download,
  Trophy,
  ChevronDown,
  Activity,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'earn' | 'promote' | 'referrals' | 'wallet' | 'profile' | 'leaderboard' | 'economy';
  setActiveTab: (tab: 'earn' | 'promote' | 'referrals' | 'wallet' | 'profile' | 'leaderboard' | 'economy') => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openAuthModal }) => {
  const { userProfile, logout } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const navItems = [
    { id: 'earn' as const, label: 'Earn ST', icon: PlaySquare, badge: '+1 ST' },
    { id: 'promote' as const, label: 'Promote', icon: Megaphone },
    { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
    { id: 'referrals' as const, label: 'Invite & Earn', icon: Users },
    { id: 'economy' as const, label: 'Economy', icon: Activity },
    { id: 'wallet' as const, label: 'Ledger', icon: Wallet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo - Minimalist SaaS */}
        <div
          onClick={() => setActiveTab('earn')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="relative w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-blue-500 transition-colors overflow-hidden">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-4 h-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 7H8C5.79086 7 4 8.79086 4 11V12M4 17H16C18.2091 17 20 15.2091 20 13V12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 4L20 7L17 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 20L4 17L7 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white">
              SwapTap
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
              Exchange
            </span>
          </div>
        </div>

        {/* Desktop Navigation - Linear/Vercel Style Clean Segments */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0F172A]/60 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] rounded bg-blue-500/10 text-blue-400 font-mono font-medium">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Wallet Balance & User Menu */}
        <div className="flex items-center gap-2.5">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Install App</span>
            </button>
          )}

          {/* Wallet Balance Badge */}
          {userProfile ? (
            <div
              onClick={() => setActiveTab('wallet')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-mono font-bold text-white">
                  {userProfile.pointsBalance}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">ST</span>
              </div>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <span>Get 5 Free ST Tokens</span>
            </button>
          )}

          {/* User Profile / Menu */}
          {userProfile ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pl-2 rounded-lg bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-colors text-xs text-slate-300"
              >
                <span className="font-medium max-w-[90px] truncate hidden sm:inline">
                  {userProfile.displayName}
                </span>
                <img
                  src={userProfile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.uid}`}
                  alt={userProfile.displayName}
                  className="w-6 h-6 rounded-md object-cover bg-slate-800"
                />
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </button>

              {/* Minimalist Profile Dropdown */}
              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0F172A] border border-slate-800 shadow-xl p-1.5 z-50 text-xs"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="font-semibold text-white truncate">{userProfile.displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{userProfile.email || 'Demo Creator'}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                      <span className="text-slate-400">Code:</span>
                      <span className="font-mono font-bold text-blue-400">{userProfile.referralCode}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('promote')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white transition-colors"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Campaigns ({userProfile.campaignsCount || 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Leaderboard</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('referrals')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Referrals ({userProfile.referralsCount || 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('economy')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    <span>Economy Health & Proof</span>
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Top-Right Animated SwapTap Logo Element */}
          <div
            title="SwapTap Active Exchange Loop"
            className="flex items-center gap-2 pl-2 sm:pl-2.5 border-l border-slate-800/80 select-none"
          >
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-b from-[#0F172A] to-slate-950 border border-slate-800 hover:border-blue-500/40 transition-colors flex items-center justify-center overflow-hidden shadow-sm">
              {/* Soft Ambient Glow */}
              <div className="absolute inset-0 bg-blue-500/10 blur-sm animate-swaptap-glow pointer-events-none" />

              {/* Rotating Outer Swap Ring */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 text-blue-400 animate-swaptap-spin relative z-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.58 3.39 17.06"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 22C17.52 22 22 17.52 22 12C22 10.15 21.5 8.42 20.61 6.94"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.4"
                />
                <path
                  d="M5 19L3 17L1 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 5L21 7L23 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Center Micro Pulse Core */}
              <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-400 animate-swaptap-dot z-20 shadow-[0_0_6px_rgba(96,165,250,0.9)]" />
            </div>

            {/* Micro Status Tag */}
            <div className="hidden xl:flex flex-col items-start leading-none gap-0.5">
              <span className="text-[10px] font-mono font-medium text-slate-300 flex items-center gap-1 tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
                SWAPTAP
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                LIVE LOOP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar - Minimalist */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F17]/95 backdrop-blur-lg border-t border-slate-800 px-3 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 transition-colors ${
                isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
