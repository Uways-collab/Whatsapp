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
  setDoc 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { Merchant } from '../types/store';

const SANDBOX_KEY = 'quickstore_sandbox_merchant';

interface AuthContextType {
  user: User | null;
  merchant: Merchant | null;
  loading: boolean;
  merchantLoading: boolean;
  isSandbox: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInSandboxMerchant: () => void;
  signOut: () => Promise<void>;
  createStoreProfile: (data: { storeName: string; whatsappNumber: string; slug: string; description?: string }) => Promise<Merchant>;
  updateStoreProfile: (data: Partial<Merchant>) => Promise<void>;
  refreshMerchant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isSandbox, setIsSandbox] = useState<boolean>(() => {
    return localStorage.getItem(SANDBOX_KEY) === 'true';
  });
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
      setMerchant(null);
    } finally {
      setMerchantLoading(false);
    }
  };

  useEffect(() => {
    // If sandbox was active
    if (localStorage.getItem(SANDBOX_KEY) === 'true') {
      const mockUser = {
        uid: 'demo_merchant_user_1',
        email: 'merchant.demo@quickstore.app',
        displayName: 'Demo Nigerian Merchant',
      } as unknown as User;
      setUser(mockUser);
      setIsSandbox(true);
      setMerchant({
        id: 'demo_merchant_user_1',
        ownerId: 'demo_merchant_user_1',
        storeName: 'Lagos Glamour & Crafts',
        whatsappNumber: '2348012345678',
        slug: 'lagos-glamour',
        description: 'Authentic Nigerian fashion, tech lifestyle gadgets & gourmet treats delivered across Lagos, Abuja & nationwide.',
        currency: 'NGN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsSandbox(false);
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
    localStorage.removeItem(SANDBOX_KEY);
    setIsSandbox(false);
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    localStorage.removeItem(SANDBOX_KEY);
    setIsSandbox(false);
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    localStorage.removeItem(SANDBOX_KEY);
    setIsSandbox(false);
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signInSandboxMerchant = () => {
    localStorage.setItem(SANDBOX_KEY, 'true');
    const mockUser = {
      uid: 'demo_merchant_user_1',
      email: 'merchant.demo@quickstore.app',
      displayName: 'Demo Nigerian Merchant',
    } as unknown as User;
    setUser(mockUser);
    setIsSandbox(true);
    setMerchant({
      id: 'demo_merchant_user_1',
      ownerId: 'demo_merchant_user_1',
      storeName: 'Lagos Glamour & Crafts',
      whatsappNumber: '2348012345678',
      slug: 'lagos-glamour',
      description: 'Authentic Nigerian fashion, tech lifestyle gadgets & gourmet treats delivered across Lagos, Abuja & nationwide.',
      currency: 'NGN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const signOut = async () => {
    localStorage.removeItem(SANDBOX_KEY);
    setIsSandbox(false);
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    setMerchant(null);
  };

  const createStoreProfile = async (data: {
    storeName: string;
    whatsappNumber: string;
    slug: string;
    description?: string;
  }): Promise<Merchant> => {
    const activeUid = user?.uid || auth.currentUser?.uid;
    if (!activeUid) {
      throw new Error("You must be logged in to create a store.");
    }
    const newMerchant: Merchant = {
      id: activeUid,
      ownerId: activeUid,
      storeName: data.storeName.trim(),
      whatsappNumber: data.whatsappNumber.trim(),
      slug: data.slug.toLowerCase().trim(),
      description: data.description?.trim() || '',
      currency: 'NGN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSandbox) {
      setMerchant(newMerchant);
      return newMerchant;
    }

    const path = `merchants/${activeUid}`;
    try {
      await setDoc(doc(db, 'merchants', activeUid), newMerchant);
      setMerchant(newMerchant);
      return newMerchant;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateStoreProfile = async (data: Partial<Merchant>) => {
    const activeUid = user?.uid || auth.currentUser?.uid;
    if (!activeUid || !merchant) return;
    const updated: Merchant = {
      ...merchant,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (isSandbox) {
      setMerchant(updated);
      return;
    }

    const path = `merchants/${activeUid}`;
    try {
      await setDoc(doc(db, 'merchants', activeUid), updated, { merge: true });
      setMerchant(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const refreshMerchant = async () => {
    const activeUid = user?.uid || auth.currentUser?.uid;
    if (activeUid && !isSandbox) {
      await fetchMerchantProfile(activeUid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        merchant,
        loading,
        merchantLoading,
        isSandbox,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInSandboxMerchant,
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
