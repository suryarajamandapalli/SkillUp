import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  college: string;
  branch: string;
  year: string;
  phone: string;
  skills: string[];
  interests: string[];
  cgpa: number;
  careerGoal: string;
  roadmapProgress: number;
  latestPrediction?: any;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string, expectedRole: 'student' | 'admin') => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role: 'student' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileUpdates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile data from Firestore with role enforcement
  const syncProfile = async (fbUser: FirebaseUser, targetRole?: 'student' | 'admin') => {
    const userRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      setUser(data);
      return data;
    } else {
      // Create initial profile in Firestore
      const initialProfile: UserProfile = {
        uid: fbUser.uid,
        name: fbUser.displayName || 'Demo Profile',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || '',
        college: '',
        branch: '',
        year: '',
        phone: '',
        skills: [],
        interests: [],
        cgpa: 0,
        careerGoal: '',
        roadmapProgress: 0,
        role: targetRole || 'student'
      };
      
      await setDoc(userRef, {
        ...initialProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setUser(initialProfile);
      return initialProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          await syncProfile(fbUser);
        } catch (err) {
          console.warn("Auth sync error:", err);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      // Google sign-in is always Student role
      await syncProfile(cred.user, 'student');
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string, expectedRole: 'student' | 'admin') => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const userRef = doc(db, 'users', cred.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        if (data.role !== expectedRole) {
          // Force sign out immediately to clean session
          await signOut(auth);
          throw new Error(`Access Denied: Your account is registered as a ${data.role}.`);
        }
        setUser(data);
      } else {
        // Doc not found: sync profile with expected role
        const profile = await syncProfile(cred.user, expectedRole);
        setUser(profile);
      }
    } catch (err) {
      console.error("Email login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: 'student' | 'admin') => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateFirebaseProfile(userCredential.user, {
        displayName: name
      });
      // Force sync profile creation with designated role
      await syncProfile(userCredential.user, role);
    } catch (err) {
      console.error("Email registration failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign-Out failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileUpdates: Partial<UserProfile>) => {
    if (!firebaseUser) throw new Error("No active user session.");
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const updatePayload = {
        ...profileUpdates,
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, updatePayload, { merge: true });

      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...profileUpdates
        };
      });
    } catch (err) {
      console.warn("Firestore profile update issue, updating locally:", err);
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...profileUpdates
        };
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
