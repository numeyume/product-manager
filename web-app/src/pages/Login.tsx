import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DemoLogin } from '../components/DemoLogin';
import './Login.css';

export const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>通販商品管理</h1>
        <p>購入した商品を管理し、重複購入を防止します</p>
        
        <DemoLogin />
        
        <div style={{ margin: '20px 0', textAlign: 'center', color: '#666' }}>
          または
        </div>
        
        <button className="google-login-btn" onClick={handleLogin}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Googleでログイン
        </button>
        
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666'
        }}>
          💡 Googleログインには Firebase 設定が必要です。<br/>
          設定前は「デモモード」でアプリをお試しください。
        </div>
      </div>
    </div>
  );
};