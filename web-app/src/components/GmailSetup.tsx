import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import './GmailSetup.css';

interface GmailSetupProps {
  onClose: () => void;
}

export const GmailSetup: React.FC<GmailSetupProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const connectGmail = async () => {
    if (!user) return;

    setIsConnecting(true);
    try {
      // Gmail APIの認証スコープを設定
      const scope = 'https://www.googleapis.com/auth/gmail.readonly';
      
      // Google OAuth2を使用してGmail認証
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${window.location.origin}/gmail-callback&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

      // 新しいウィンドウでGmail認証を開始
      const authWindow = window.open(authUrl, 'gmail-auth', 'width=500,height=600');
      
      // 認証完了を待機
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          // 認証完了後の処理はpostMessageで受け取る
        }
      }, 1000);

      // 認証結果を受け取る
      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'gmail-auth-success') {
          const { accessToken } = event.data;
          
          try {
            // Firebase Functionにトークンを保存
            const functions = getFunctions();
            const saveGmailToken = httpsCallable(functions, 'saveGmailToken');
            await saveGmailToken({ accessToken });
            
            setIsConnected(true);
            alert('Gmail連携が完了しました！注文メールから自動的に商品情報が取得されます。');
          } catch (error) {
            console.error('Token save error:', error);
            alert('Gmail連携に失敗しました。');
          }
          
          setIsConnecting(false);
        }
      }, { once: true });

    } catch (error) {
      console.error('Gmail connection error:', error);
      alert('Gmail接続に失敗しました。');
      setIsConnecting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="gmail-setup" onClick={e => e.stopPropagation()}>
        <h2>Gmail連携設定</h2>
        
        <div className="gmail-info">
          <p>Gmail連携により、以下の機能が利用できます：</p>
          <ul>
            <li>注文確認メールから商品情報を自動取得</li>
            <li>Amazon、楽天、メルカリの購入情報を自動登録</li>
            <li>手動入力の手間を削減</li>
          </ul>
          
          <div className="privacy-note">
            <h4>プライバシーについて</h4>
            <p>
              この機能はあなたのGmailを読み取り専用でアクセスします。
              注文確認メールのみを対象とし、その他のメールは一切読み取りません。
              取得した情報はFirestoreに安全に保存され、第三者と共有されることはありません。
            </p>
          </div>
        </div>

        {!isConnected ? (
          <div className="gmail-actions">
            <button 
              onClick={connectGmail} 
              disabled={isConnecting}
              className="connect-btn"
            >
              {isConnecting ? 'Gmail接続中...' : 'Gmailと連携する'}
            </button>
            <button onClick={onClose} className="cancel-btn">
              後で設定する
            </button>
          </div>
        ) : (
          <div className="gmail-actions">
            <div className="success-message">
              ✅ Gmail連携が完了しました
            </div>
            <button onClick={onClose} className="close-btn">
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
};