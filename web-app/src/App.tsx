import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DemoModeProvider } from './components/DemoModeProvider';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { pwaManager } from './utils/pwaUtils';
import './App.css';

function App() {
  useEffect(() => {
    // PWA機能の初期化
    if (pwaManager.isPWASupported()) {
      pwaManager.setupShoppingReminders();
      pwaManager.setupOfflineDetection();
      
      // ユーザーの購買履歴を取得してパターンベースアラートを設定
      const setupPatternAlerts = () => {
        try {
          const products = JSON.parse(localStorage.getItem('products') || '[]');
          pwaManager.setupPatternBasedAlerts(products);
          pwaManager.setupLowStockAlerts(products);
        } catch (error) {
          console.error('Failed to setup pattern alerts:', error);
        }
      };

      // 初回設定と定期実行
      setupPatternAlerts();
      setInterval(setupPatternAlerts, 60 * 60 * 1000); // 1時間ごと
    }

    // URL パラメータによるアクション処理
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'check-stock') {
      // 在庫確認アクション
      setTimeout(() => {
        const event = new CustomEvent('pwa-action', { detail: { action: 'check-stock' } });
        window.dispatchEvent(event);
      }, 1000);
    } else if (action === 'add-product') {
      // 商品登録アクション
      setTimeout(() => {
        const event = new CustomEvent('pwa-action', { detail: { action: 'add-product' } });
        window.dispatchEvent(event);
      }, 1000);
    }
  }, []);

  return (
    <DemoModeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </DemoModeProvider>
  );
}

export default App;
