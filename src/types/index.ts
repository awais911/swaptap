export type Platform = 'youtube' | 'tiktok' | 'instagram';
export type TaskType = 'watch' | 'subscribe';
export type CampaignStatus = 'active' | 'completed' | 'paused';
export type TransactionType =
  | 'bonus'
  | 'earn_watch'
  | 'earn_subscribe'
  | 'earn_referral'
  | 'earn_chain_referral'
  | 'spend_campaign';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  referralCode: string;
  referredBy?: string;
  chainReferralBy?: string;
  pointsBalance: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  campaignsCount: number;
  tasksCompletedCount: number;
  referralsCount: number;
  chainReferralsCount: number;
  lastTaskCompletedAt?: string;
  dailyTasksCount?: number;
  dailyTasksDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorPhoto?: string;
  platform: Platform;
  taskType: TaskType;
  title: string;
  mediaUrl: string;
  targetCount: number;
  completedCount: number;
  pointsAllocated: number;
  status: CampaignStatus;
  dripFeedRate?: 'organic' | 'steady' | 'batch';
  dripFeedViewsPerHour?: number;
  createdAt: string;
  updatedAt: string;
  // Computed/parsed helpers for UI
  thumbnailUrl?: string;
  videoId?: string;
  channelName?: string;
}

export interface TaskLog {
  id: string;
  campaignId: string;
  userId: string;
  taskType: TaskType;
  pointsEarned: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  points: number;
  description: string;
  campaignId?: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeName: string;
  level: 1 | 2;
  pointsAwarded: number;
  status: 'pending' | 'active';
  tasksRequired: number;
  tasksCompletedByReferee: number;
  createdAt: string;
  updatedAt?: string;
}

export interface LeaderboardCreator {
  uid: string;
  displayName: string;
  photoURL?: string;
  badgeTitle?: string;
  platform?: Platform;
  pointsEarned: number;
  campaignsCompleted: number;
  tasksCompleted: number;
  referralsCount: number;
  rank?: number;
  trend?: 'up' | 'down' | 'steady' | 'fire';
  isCurrentUser?: boolean;
}

export interface EconomyStats {
  circulatingPoints: number;
  activeCampaignsCount: number;
  totalViewsDelivered: number;
  totalTasksCompleted: number;
  reserveBackingRatio: number;
  totalCreators: number;
  averageWatchDurationSeconds: number;
  pendingReferralsCount: number;
  unlockedReferralsCount: number;
  antiCheatViolationsBlocked: number;
}


