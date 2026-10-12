import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { Merchant } from '../types/store';

interface AuthContextType {
  user: User | null;
  merchant: Merchant | null;
  loading: boolean;
  merchantLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  createStoreProfile: (data: { storeName: string; whatsappNumber: string; slug: string; description?: string }) => Promise<Merchant>;
  updateStoreProfile: (data: Partial<Merchant>) => Promise<void>;
  refreshMerchant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [merchantLoading, setMerchantLoading] = useState(false);

  const fetchMerchantProfile = async (uid: string) => {
    setMerchantLoading(true);
    const path = `merchants/${uid}`;
    try {
      const docRef = doc(db, 'merchants', uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setMerchant({
          ...(snapshot.data() as Merchant),
          id: snapshot.id,
        });
      } else {
        setMerchant(null);
      }
    } catch (err) {
      console.warn("Could not fetch merchant profile:", err);
      // Fallback for safety if permissions check on brand new user
      setMerchant(null);
    } finally {
      setMerchantLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchMerchantProfile(currentUser.uid);
      } else {
        setMerchant(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setMerchant(null);
  };

  const createStoreProfile = async (data: {
    storeName: string;
    whatsappNumber: string;
    slug: string;
    description?: string;
  }): Promise<Merchant> => {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to create a store.");
    }
    const uid = auth.currentUser.uid;
    const path = `merchants/${uid}`;
    const newMerchant: Merchant = {
      id: uid,
      ownerId: uid,
      storeName: data.storeName.trim(),
      whatsappNumber: data.whatsappNumber.trim(),
      slug: data.slug.toLowerCase().trim(),
      description: data.description?.trim() || '',
      currency: 'NGN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'merchants', uid), newMerchant);
      setMerchant(newMerchant);
      return newMerchant;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateStoreProfile = async (data: Partial<Merchant>) => {
    if (!auth.currentUser || !merchant) return;
    const uid = auth.currentUser.uid;
    const path = `merchants/${uid}`;
    const updated: Merchant = {
      ...merchant,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'merchants', uid), updated, { merge: true });
      setMerchant(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const refreshMerchant = async () => {
    if (auth.currentUser) {
      await fetchMerchantProfile(auth.currentUser.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        merchant,
        loading,
        merchantLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        createStoreProfile,
        updateStoreProfile,
        refreshMerchant,
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
