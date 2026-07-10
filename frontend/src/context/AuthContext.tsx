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
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileUpdates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile data from Firestore
  const syncProfile = async (fbUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUser(userSnap.data() as UserProfile);
      } else {
        // Create initial profile in Firestore
        const initialProfile: UserProfile = {
          uid: fbUser.uid,
          name: fbUser.displayName || 'Student',
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
          role: fbUser.email === 'admin@demo.com' || fbUser.email?.endsWith('@skillup.com') ? 'admin' : 'student'
        };
        
        await setDoc(userRef, {
          ...initialProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        setUser(initialProfile);
      }
    } catch (err) {
      console.warn("Firestore profile sync failed. Using local storage fallback:", err);
      // Fallback local profile if Firestore is not created or throws permissions issue
      const localProfile: UserProfile = {
        uid: fbUser.uid,
        name: fbUser.displayName || 'Demo Student',
        email: fbUser.email || 'student@demo.com',
        photoURL: fbUser.photoURL || '',
        college: 'Demo University',
        branch: 'Computer Science',
        year: '2026',
        phone: '123-456-7890',
        skills: ['Python', 'SQL', 'React'],
        interests: ['Web Development'],
        cgpa: 8.5,
        careerGoal: 'Software Engineer',
        roadmapProgress: 0,
        role: fbUser.email === 'admin@demo.com' || fbUser.email?.endsWith('@skillup.com') ? 'admin' : 'student'
      };
      setUser(localProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        await syncProfile(fbUser);
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
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      console.error("Email login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // Update display name in Firebase Auth
      await updateFirebaseProfile(userCredential.user, {
        displayName: name
      });
      // Force sync profile creation
      await syncProfile(userCredential.user);
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
      console.warn("Failed to update user profile in Firestore. Updating local profile state instead:", err);
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
