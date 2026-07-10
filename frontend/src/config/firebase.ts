import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDufu01J452Ol1nUS6DDUc6syBBnioVkCI",
  authDomain: "skillup-admin-2026.firebaseapp.com",
  projectId: "skillup-admin-2026",
  storageBucket: "skillup-admin-2026.firebasestorage.app",
  messagingSenderId: "603067428806",
  appId: "1:603067428806:web:c14533ac6b7773fab20cc7",
  measurementId: "G-EQ28ZEH4R4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
