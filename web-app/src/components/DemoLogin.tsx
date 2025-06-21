import React from 'react';
import { useNavigate } from 'react-router-dom';

export const DemoLogin: React.FC = () => {
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    // デモ用の一時的なユーザー情報をローカルストレージに保存
    const demoUser = {
      uid: 'demo-user-123',
      email: 'demo@example.com',
      displayName: 'デモユーザー',
      photoURL: 'https://via.placeholder.com/100'
    };
    
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    window.location.reload(); // ページをリロードして認証状態を更新
  };

  return (
    <div style={{
      margin: '20px 0',
      padding: '15px',
      background: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '4px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>
        🧪 デモモード
      </h4>
      <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#856404' }}>
        Firebase設定前でも、デモモードでアプリの機能をテストできます
      </p>
      <button
        onClick={handleDemoLogin}
        style={{
          padding: '10px 20px',
          background: '#ff6b35',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        🚀 デモモードで開始
      </button>
    </div>
  );
};