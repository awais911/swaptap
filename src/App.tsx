/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { testConnection } from './firebase/config';
import { campaignService } from './services/campaignService';
import { Navbar } from './components/Navbar';
import { EarnView } from './components/EarnView';
import { PromoteView } from './components/PromoteView';
import { ReferralView } from './components/ReferralView';
import { WalletView } from './components/WalletView';
import { ProfileView } from './components/ProfileView';
import { LeaderboardView } from './components/LeaderboardView';
import { EconomyHealthView } from './components/EconomyHealthView';
import { AuthModal } from './components/AuthModal';
import { CheckCircle2, Shield, Heart } from 'lucide-react';

function MainLayout() {
  const { userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'earn' | 'promote' | 'referrals' | 'wallet' | 'profile' | 'leaderboard' | 'economy'>('earn');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Validate Firestore connection on boot (CRITICAL CONSTRAINT)
  useEffect(() => {
    testConnection();
    campaignService.seedInitialCampaignsInFirestore();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700/80 text-slate-200 text-xs font-medium shadow-xl animate-in slide-in-from-top-2 duration-150 max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'earn' && (
          <EarnView
            userProfile={userProfile}
            openAuthModal={() => setIsAuthModalOpen(true)}
            setActiveTab={setActiveTab}
            showToast={showToast}
          />
        )}

        {activeTab === 'promote' && (
          <PromoteView
            userProfile={userProfile}
            openAuthModal={() => setIsAuthModalOpen(true)}
            setActiveTab={setActiveTab}
            showToast={showToast}
          />
        )}

        {activeTab === 'referrals' && (
          <ReferralView
            userProfile={userProfile}
            openAuthModal={() => setIsAuthModalOpen(true)}
            showToast={showToast}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletView
            userProfile={userProfile}
            openAuthModal={() => setIsAuthModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            openAuthModal={() => setIsAuthModalOpen(true)}
            setActiveTab={setActiveTab}
            showToast={showToast}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            userProfile={userProfile}
            openAuthModal={() => setIsAuthModalOpen(true)}
            setActiveTab={setActiveTab}
            showToast={showToast}
          />
        )}

        {activeTab === 'economy' && (
          <EconomyHealthView />
        )}
      </main>

      {/* Footer - Minimalist SaaS with Transparency Links */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#0B0F17] py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SwapTap</span>
            <span>•</span>
            <span>Community-driven engagement exchange for creators</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => setActiveTab('economy')}
              className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Economy Health & Proof</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('earn')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Verified 30s Human Watch Time
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        showToast={showToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
