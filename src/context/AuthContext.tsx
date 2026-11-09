import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile } from '../types';
import { generateReferralCode } from '../utils/mediaUtils';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInDemoAccount: (role?: 'creator' | 'veteran') => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'creatorpulse_demo_user';
const PENDING_REF_KEY = 'creatorpulse_pending_referral';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check URL query parameters for referral code on initial load
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode && refCode.trim().length > 0) {
        localStorage.setItem(PENDING_REF_KEY, refCode.trim().toUpperCase());
      }
    } catch (e) {
      console.warn('Could not read ref param', e);
    }
  }, []);

  // Sync user profile from Firestore or handle demo account
  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Authenticated via Firebase Auth
        setCurrentUser(firebaseUser);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          // Listen for real-time changes to the user's wallet and profile
          unsubscribeProfile = onSnapshot(
            userDocRef,
            async (snapshot) => {
              if (snapshot.exists()) {
                setUserProfile(snapshot.data() as UserProfile);
                setLoading(false);
              } else {
                // First-time user registration flow
                await initializeNewUser(firebaseUser);
              }
            },
            (error) => {
              handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
            }
          );
        } catch (error) {
          console.error('Error in user profile listener:', error);
          setLoading(false);
        }
      } else {
        // Check for Demo Account stored in localStorage
        const savedDemo = localStorage.getItem(DEMO_USER_KEY);
        if (savedDemo) {
          try {
            const parsed = JSON.parse(savedDemo) as UserProfile;
            setUserProfile(parsed);
          } catch (e) {
            localStorage.removeItem(DEMO_USER_KEY);
          }
        } else {
          setUserProfile(null);
        }
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Initialize a brand new user document with 5 Welcome Points and referral link checking
  const initializeNewUser = async (firebaseUser: FirebaseUser) => {
    const pendingReferralCode = localStorage.getItem(PENDING_REF_KEY);
    let referredByUid = '';
    let chainReferralByUid = '';
    let referrerDocData: UserProfile | null = null;

    if (pendingReferralCode) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', pendingReferralCode));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          referrerDocData = querySnapshot.docs[0].data() as UserProfile;
          referredByUid = referrerDocData.uid;
          if (referrerDocData.referredBy) {
            chainReferralByUid = referrerDocData.referredBy;
          }
        }
      } catch (err) {
        console.warn('Error resolving referral code:', err);
      }
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || 'Creator ' + Math.floor(1000 + Math.random() * 9000),
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
      referralCode: generateReferralCode(),
      referredBy: referredByUid || undefined,
      chainReferralBy: chainReferralByUid || undefined,
      pointsBalance: 5, // Requirement 2: Automatically credit 5 free points upon first account creation
      totalPointsEarned: 5,
      totalPointsSpent: 0,
      campaignsCount: 0,
      tasksCompletedCount: 0,
      referralsCount: 0,
      chainReferralsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    try {
      // 1. Create user profile
      await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);

      // 2. Log onboarding transaction
      const bonusTxId = `tx_bonus_${firebaseUser.uid}`;
      await setDoc(doc(db, 'transactions', bonusTxId), {
        id: bonusTxId,
        userId: firebaseUser.uid,
        type: 'bonus',
        points: 5,
        description: '🎉 Welcome Onboarding Bonus: 5 Free Points to start your campaigns!',
        createdAt: now,
      });

      // 3. Register Pending Direct Referral (+2 points held until 3 active tasks completed)
      if (referrerDocData && referredByUid && referredByUid !== firebaseUser.uid) {
        try {
          const directRefId = `ref_d_${firebaseUser.uid}`;
          await setDoc(doc(db, 'referrals', directRefId), {
            id: directRefId,
            referrerId: referredByUid,
            refereeId: firebaseUser.uid,
            refereeName: newProfile.displayName,
            level: 1,
            pointsAwarded: 0,
            status: 'pending',
            tasksRequired: 3,
            tasksCompletedByReferee: 0,
            createdAt: now,
            updatedAt: now,
          });
        } catch (refErr) {
          console.warn('Failed registering direct referral:', refErr);
        }

        // 4. Register Pending Multi-Level Referral Chain (+1 point held until 3 active tasks completed)
        if (chainReferralByUid && chainReferralByUid !== firebaseUser.uid && chainReferralByUid !== referredByUid) {
          try {
            const chainRefId = `ref_c_${firebaseUser.uid}`;
            await setDoc(doc(db, 'referrals', chainRefId), {
              id: chainRefId,
              referrerId: chainReferralByUid,
              refereeId: firebaseUser.uid,
              refereeName: newProfile.displayName,
              level: 2,
              pointsAwarded: 0,
              status: 'pending',
              tasksRequired: 3,
              tasksCompletedByReferee: 0,
              createdAt: now,
              updatedAt: now,
            });
          } catch (chainErr) {
            console.warn('Failed registering chain referral:', chainErr);
          }
        }
      }

      // Clear pending referral after registration
      localStorage.removeItem(PENDING_REF_KEY);
      setUserProfile(newProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signInDemoAccount = async (role: 'creator' | 'veteran' = 'creator') => {
    setLoading(true);
    const demoId = role === 'veteran' ? 'demo_veteran_creator' : 'demo_new_creator';
    const now = new Date().toISOString();
    
    const demoProfile: UserProfile = {
      uid: demoId,
      displayName: role === 'veteran' ? 'Alex Creator Pro' : 'Sarah Vlogs (Demo)',
      email: `${demoId}@creatorpulse.app`,
      photoURL: role === 'veteran'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      referralCode: role === 'veteran' ? 'PULSE999' : 'GROWTH44',
      pointsBalance: role === 'veteran' ? 45 : 15,
      totalPointsEarned: role === 'veteran' ? 120 : 25,
      totalPointsSpent: role === 'veteran' ? 75 : 10,
      campaignsCount: role === 'veteran' ? 6 : 1,
      tasksCompletedCount: role === 'veteran' ? 38 : 10,
      referralsCount: role === 'veteran' ? 8 : 2,
      chainReferralsCount: role === 'veteran' ? 14 : 3,
      createdAt: now,
      updatedAt: now,
    };

    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoProfile));
    setUserProfile(demoProfile);
    setCurrentUser(null);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem(DEMO_USER_KEY);
    setUserProfile(null);
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout error', e);
    }
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      }
    } else {
      const savedDemo = localStorage.getItem(DEMO_USER_KEY);
      if (savedDemo) {
        setUserProfile(JSON.parse(savedDemo));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        signInDemoAccount,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
