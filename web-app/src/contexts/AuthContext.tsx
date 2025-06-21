import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // デモモードの確認
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        setUser(parsedUser as User);
        setLoading(false);
        return;
      } catch (error) {
        localStorage.removeItem('demoUser');
      }
    }

    // Firebase認証の監視（Firebaseが設定されている場合のみ）
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Firebase未設定の場合はローディング完了
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw new Error('Firebase is not configured. Please check your .env file or use demo mode.');
    }
    
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // デモモードの場合はローカルストレージから削除
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        localStorage.removeItem('demoUser');
        setUser(null);
        return;
      }
      
      // Firebase認証の場合は通常のログアウト
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};