# Security Specification & Threat Model: CreatorPulse

## 1. Data Invariants

1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created by an authenticated user matching `request.auth.uid == userId`.
2. **Wallet Non-Negative & Integrity**: A user's points balance cannot be directly inflated by arbitrary client writes. Balances are validated against maximum thresholds and point changes correspond to verified actions.
3. **Immutability of Historical Ledger**: Transaction records in `/transactions/{transactionId}` and task logs in `/tasks/{taskId}` are append-only. They cannot be updated or deleted by normal users once created.
4. **Campaign Ownership**: A campaign can only be created with `creatorId == request.auth.uid`. A creator can update or pause their own campaign, or claim counters can be incremented when tasks are fulfilled.
5. **No Orphan Writes**: Tasks must reference an existing campaign and valid authenticated user.
6. **Rate & Size Bounding**: All string inputs (titles, media URLs, descriptions) must adhere to strict length limits to prevent Denial-of-Wallet payload attacks.
7. **Referral Chain Integrity**: Level 1 and Level 2 referral rewards require matching referrer IDs and valid points amounts (+2 for level 1, +1 for level 2).

---

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)

1. **Payload 1 (Ghost Profile Hijack)**: Unauthenticated user attempts to create a document in `/users/hacker123`.
2. **Payload 2 (Impersonation Write)**: Authenticated user `alice` attempts to create or overwrite `/users/bob`.
3. **Payload 3 (Arbitrary Points Inflation)**: User `alice` attempts to update `/users/alice` with `pointsBalance: 9999999` and arbitrary `isOwner: true` field.
4. **Payload 4 (Campaign Forgery)**: User `bob` attempts to create a campaign at `/campaigns/c1` with `creatorId: 'alice'`.
5. **Payload 5 (Over-sized Payload Attack)**: Attacker attempts to post a campaign with a 500KB string title or 1MB malicious script URL.
6. **Payload 6 (Shadow Field Injection)**: Attacker attempts to inject `{ isSuperAdmin: true, bypassRules: true }` into campaign or user docs.
7. **Payload 7 (Negative Points Exploit)**: Attacker attempts to submit `points: -500` in a reward task to corrupt wallet balances.
8. **Payload 8 (Foreign Transaction Tampering)**: User `alice` attempts to delete or modify a completed transaction from `/transactions/tx_bob_1`.
9. **Payload 9 (Terminal State Bypass)**: Attacker attempts to reactivate a campaign whose status was set to `'completed'`.
10. **Payload 10 (Duplicate Task Claim Manipulation)**: Attacker attempts to update an existing `/tasks/{taskId}` log with a different `pointsEarned: 50`.
11. **Payload 11 (Referral Identity Spoofing)**: Attacker creates a referral record awarding points to themselves with `pointsAwarded: 5000`.
12. **Payload 12 (Foreign Private Profile Read)**: Unauthenticated scraper attempts blanket listing of all user documents without query filters.

---

## 3. Test Runner Invariant

All automated and manual security assertions ensure that requests violating any of the Dirty Dozen result in `PERMISSION_DENIED` (`insufficient permissions`), guaranteeing zero-trust attribute-based access control.
