import React, { createContext, useContext, useState, useEffect } from 'react';

interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface DemoModeContextType {
  isDemoMode: boolean;
  demoUser: DemoUser | null;
  startDemoMode: () => void;
  exitDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};

export const DemoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    // ページロード時にデモモードの状態を確認
    const storedDemoUser = localStorage.getItem('demoUser');
    if (storedDemoUser) {
      try {
        const parsedUser = JSON.parse(storedDemoUser);
        setDemoUser(parsedUser);
        setIsDemoMode(true);
        console.log('デモモードが検出されました:', parsedUser);
      } catch (error) {
        console.error('デモユーザーデータの解析に失敗:', error);
        localStorage.removeItem('demoUser');
      }
    }
  }, []);

  const startDemoMode = () => {
    const newDemoUser: DemoUser = {
      uid: 'demo-user-123',
      email: 'demo@example.com',
      displayName: 'デモユーザー',
      photoURL: 'https://via.placeholder.com/100'
    };

    localStorage.setItem('demoUser', JSON.stringify(newDemoUser));
    setDemoUser(newDemoUser);
    setIsDemoMode(true);
    
    console.log('デモモードを開始しました:', newDemoUser);
  };

  const exitDemoMode = () => {
    localStorage.removeItem('demoUser');
    setDemoUser(null);
    setIsDemoMode(false);
    console.log('デモモードを終了しました');
  };

  const value = {
    isDemoMode,
    demoUser,
    startDemoMode,
    exitDemoMode
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};