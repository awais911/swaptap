# CreatorPulse - Content Creator Engagement Exchange Platform (PWA)

A community-driven content creator exchange platform designed to help new YouTubers, TikTokers, and Instagram creators gain initial views, watch time, subscribers, and engagement through a fair, point-based exchange mechanism.

---

## 1. Core Architecture & Concept

- **Point-Based Economy**:
  - Creators earn points by performing verified engagement tasks: watching videos (with anti-cheat 30-second timers), subscribing/following channels, and inviting other creators.
  - Creators spend accumulated points to launch their own promotion campaigns for YouTube, TikTok, or Instagram videos.
- **Web-Based PWA Architecture**:
  - Fully accessible on modern desktop & mobile browsers as an installable Progressive Web App (PWA) with responsive dark-mode styling, avoiding mobile app store restrictions on peer engagement apps.
- **Anti-Cheat Verification**:
  - Video tasks enforce an active 30-second countdown with progress tracking and playback state checks before points can be claimed.
  - Subscription/follow tasks enforce an external channel visit and verification timer.

---

## 2. Wallet & Points System

| Action | Points Change | Notes |
| :--- | :--- | :--- |
| **New User Onboarding Bonus** | `+5 Points` | Automatically credited upon first account creation |
| **Watch Video Task** | `+1 Point` | 30s verified watch time via embedded player |
| **Subscribe / Follow Task** | `+1 Point` | Channel subscription & verification |
| **Direct Referral (Tier 1)** | `+2 Points` | When a friend signs up with your invite link |
| **Multi-Level Referral (Tier 2)** | `+1 Point` | When your invited friend's invitee joins the network |
| **Launch Campaign** | `-X Points` | `1 Point = 1 Real View / Subscriber delivered` |

---

## 3. Database Schema (Firestore)

### Collection: `users/{userId}`
```typescript
interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  referralCode: string;
  referredBy?: string;        // Tier 1 direct referrer UID
  chainReferralBy?: string;   // Tier 2 ancestor referrer UID
  pointsBalance: number;      // Current spendable wallet balance
  totalPointsEarned: number;  // Lifetime points earned
  totalPointsSpent: number;   // Lifetime points spent
  campaignsCount: number;     // Number of campaigns created
  tasksCompletedCount: number;// Number of tasks completed
  referralsCount: number;     // Number of direct invites (Tier 1)
  chainReferralsCount: number;// Number of network invites (Tier 2)
  createdAt: string;
  updatedAt: string;
}
```

### Collection: `campaigns/{campaignId}`
```typescript
interface Campaign {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorPhoto?: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  taskType: 'watch' | 'subscribe';
  title: string;
  mediaUrl: string;
  targetCount: number;        // Total views/subs requested
  completedCount: number;     // Total views/subs fulfilled so far
  pointsAllocated: number;    // Points deducted from creator
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}
```

### Collection: `tasks/{taskId}`
```typescript
interface TaskLog {
  id: string;                 // Format: task_{campaignId}_{userId}
  campaignId: string;
  userId: string;
  taskType: 'watch' | 'subscribe';
  pointsEarned: number;
  createdAt: string;
}
```

### Collection: `transactions/{transactionId}`
```typescript
interface Transaction {
  id: string;
  userId: string;
  type: 'bonus' | 'earn_watch' | 'earn_subscribe' | 'earn_referral' | 'earn_chain_referral' | 'spend_campaign';
  points: number;             // e.g. +5, +1, +2, -25
  description: string;
  campaignId?: string;
  createdAt: string;
}
```

### Collection: `referrals/{referralId}`
```typescript
interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeName: string;
  level: 1 | 2;               // 1 = Direct, 2 = Chain
  pointsAwarded: number;      // 2 for level 1, 1 for level 2
  createdAt: string;
}
```

---

## 4. Environment Variables & Setup

Configuration is automatically stored in `firebase-applet-config.json` and `.env.example`:

```bash
# Optional server or runtime variables
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
```

### Local Development:
```bash
npm install
npm run dev
```

### Build for Production:
```bash
npm run build
```

Ready for instant deployment on Vercel, Netlify, Cloud Run, or Firebase Hosting.
