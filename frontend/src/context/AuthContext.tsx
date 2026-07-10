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
  createdAt?: any;
  lastLogin?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: (defaultRole: 'student' | 'admin') => Promise<UserProfile>;
  loginWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  registerWithEmail: (email: string, pass: string, name: string, role: 'student' | 'admin') => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (profileUpdates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile data from Firestore with local storage fallback
  const syncProfile = async (fbUser: FirebaseUser, targetRole?: 'student' | 'admin'): Promise<UserProfile> => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        // Save fallback copy in localStorage
        localStorage.setItem(`profile_${fbUser.uid}`, JSON.stringify(data));
        setUser(data);
        return data;
      } else {
        const role = targetRole || (fbUser.email === 'admin@demo.com' || fbUser.email?.includes('admin') ? 'admin' : 'student');
        const initialProfile: UserProfile = {
          uid: fbUser.uid,
          name: fbUser.displayName || (role === 'admin' ? 'Administrator' : 'Student Profile'),
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
          role: role
        };
        
        try {
          await setDoc(userRef, {
            ...initialProfile,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
        } catch (e) {
          console.warn("Write permission failed in syncProfile:", e);
        }
        
        localStorage.setItem(`profile_${fbUser.uid}`, JSON.stringify(initialProfile));
        setUser(initialProfile);
        return initialProfile;
      }
    } catch (err) {
      console.warn("Firestore syncProfile read failed, using localStorage fallback:", err);
      const cached = localStorage.getItem(`profile_${fbUser.uid}`);
      if (cached) {
        const profile = JSON.parse(cached);
        setUser(profile);
        return profile;
      }
      const role = targetRole || (fbUser.email === 'admin@demo.com' || fbUser.email?.includes('admin') ? 'admin' : 'student');
      const fallback: UserProfile = {
        uid: fbUser.uid,
        name: fbUser.displayName || (role === 'admin' ? 'Administrator' : 'Student Demo'),
        email: fbUser.email || (role === 'admin' ? 'admin@demo.com' : 'student@demo.com'),
        photoURL: fbUser.photoURL || '',
        college: 'University of Engineering',
        branch: 'Computer Science',
        year: '2026',
        phone: '555-0199',
        skills: ['Python', 'SQL', 'React'],
        interests: ['Software Development'],
        cgpa: 8.5,
        careerGoal: 'Software Engineer',
        roadmapProgress: 0,
        role: role
      };
      localStorage.setItem(`profile_${fbUser.uid}`, JSON.stringify(fallback));
      setUser(fallback);
      return fallback;
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
          console.warn("Profile synchronization error:", err);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (defaultRole: 'student' | 'admin'): Promise<UserProfile> => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      return await syncProfile(cred.user, defaultRole);
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const role = (email === 'admin@demo.com' || email.includes('admin') ? 'admin' : 'student');
      return await syncProfile(cred.user, role);
    } catch (err) {
      console.error("Email login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: 'student' | 'admin'): Promise<UserProfile> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateFirebaseProfile(userCredential.user, {
        displayName: name
      });
      return await syncProfile(userCredential.user, role);
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
      console.warn("Profile update failed, modifying locally:", err);
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
