import React, { useState, useEffect } from 'react';
import { UserProfile, Transaction, TransactionType } from '../types';
import { campaignService } from '../services/campaignService';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Megaphone,
  Gift,
  Coins,
  Sparkles,
} from 'lucide-react';

interface WalletViewProps {
  userProfile: UserProfile | null;
  openAuthModal: () => void;
  setActiveTab: (tab: 'earn' | 'promote' | 'referrals' | 'wallet' | 'profile' | 'leaderboard' | 'economy') => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  userProfile,
  setActiveTab,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'earned' | 'spent'>('all');

  useEffect(() => {
    if (!userProfile) return;
    const unsubscribe = campaignService.subscribeToTransactions(userProfile.uid, (list) => {
      setTransactions(list);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [userProfile]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'earned') return tx.points > 0;
    if (filterType === 'spent') return tx.points < 0;
    return true;
  });

  const getTxIcon = (type: TransactionType) => {
    switch (type) {
      case 'bonus':
        return <Gift className="w-3.5 h-3.5 text-blue-400" />;
      case 'earn_watch':
      case 'earn_subscribe':
        return <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />;
      case 'earn_referral':
      case 'earn_chain_referral':
        return <Sparkles className="w-3.5 h-3.5 text-blue-400" />;
      case 'spend_campaign':
        return <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />;
      default:
        return <Coins className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Wallet Balance Hero */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Available ST Token Balance
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight">
                {userProfile?.pointsBalance || 0}
              </span>
              <span className="text-sm font-semibold text-slate-400">ST Token</span>
            </div>
            <p className="text-xs text-slate-400">
              Spend ST Tokens to fund real video views (30s minimum watch time) and subscribers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('earn')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm"
            >
              <span>Earn ST Tokens</span>
            </button>

            <button
              onClick={() => setActiveTab('promote')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-800 transition-colors"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Launch Campaign</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
            <p className="text-[11px] text-slate-400">Lifetime ST Tokens Earned</p>
            <p className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
              +{userProfile?.totalPointsEarned || 0} ST
            </p>
          </div>

          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
            <p className="text-[11px] text-slate-400">Total ST Tokens Spent</p>
            <p className="text-lg font-mono font-bold text-slate-300 mt-0.5">
              -{userProfile?.totalPointsSpent || 0} ST
            </p>
          </div>

          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
            <p className="text-[11px] text-slate-400">Total Campaigns Run</p>
            <p className="text-lg font-mono font-bold text-white mt-0.5">
              {userProfile?.campaignsCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-[#0F172A]/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>ST Token Transaction Ledger</span>
            </h3>
            <p className="text-xs text-slate-400">Audit trail of ST Tokens earned, spent, and escrow transfers.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('earned')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterType === 'earned' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Earned (+)
            </button>
            <button
              onClick={() => setFilterType('spent')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterType === 'spent' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Spent (-)
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No transactions found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {getTxIcon(tx.type)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-200">{tx.description}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <span
                  className={`font-mono font-medium text-xs whitespace-nowrap ${
                    tx.points > 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {tx.points > 0 ? `+${tx.points}` : tx.points} ST
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
