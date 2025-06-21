import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';
import { useDemoMode } from '../components/DemoModeProvider';

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
  const { isDemoMode, demoUser } = useDemoMode();

  useEffect(() => {
    // デモモードの確認
    if (isDemoMode && demoUser) {
      setUser(demoUser as User);
      setLoading(false);
      return;
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
  }, [isDemoMode, demoUser]);

  const signInWithGoogle = async () => {
    console.log('🚀 Google認証開始');
    console.log('Firebase状態:', {
      configured: isFirebaseConfigured,
      auth: !!auth,
      googleProvider: !!googleProvider
    });

    if (!isFirebaseConfigured || !auth || !googleProvider) {
      console.error('❌ Firebase初期化失敗 - デモモードを使用してください');
      throw new Error('Firebase設定エラー。デモモードをご利用ください。');
    }
    
    try {
      console.log('signInWithPopup実行中...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google認証成功:', result.user?.email);
    } catch (error: any) {
      console.error('Google認証エラー:', error);
      
      // より詳細なエラーメッセージ
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('認証がキャンセルされました。');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('ポップアップがブロックされました。ブラウザの設定を確認してください。');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google認証が有効化されていません。Firebase設定を確認してください。');
      } else {
        throw new Error(`認証エラー: ${error.message}`);
      }
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