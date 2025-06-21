import React, { useState, useEffect } from 'react';
import { pwaManager } from '../utils/pwaUtils';
import './PWASetup.css';

interface PWASetupProps {
  onClose: () => void;
}

export const PWASetup: React.FC<PWASetupProps> = ({ onClose }) => {
  const [canInstall, setCanInstall] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    setCanInstall(pwaManager.canInstall());
    setNotificationEnabled(Notification.permission === 'granted');
  }, []);

  const handleInstallPWA = async () => {
    const installed = await pwaManager.showInstallPrompt();
    if (installed) {
      setCurrentStep(2);
    }
  };

  const handleEnableNotifications = async () => {
    const enabled = await pwaManager.requestNotificationPermission();
    setNotificationEnabled(enabled);
    if (enabled) {
      setCurrentStep(3);
    }
  };

  const getBookmarkletCode = () => {
    const baseURL = window.location.origin;
    return `javascript:(function(){
      const script = document.createElement('script');
      script.src = '${baseURL}/bookmarklet.js';
      document.body.appendChild(script);
    })();`;
  };

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(getBookmarkletCode());
    alert('ブックマークレットをコピーしました！');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pwa-setup" onClick={e => e.stopPropagation()}>
        <div className="setup-header">
          <h2>🚀 無意識的重複防止の設定</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        
        <div className="setup-content">
          <div className="setup-intro">
            <p>以下の設定により、Chrome拡張に近い無意識的な重複防止体験を実現できます。</p>
          </div>

          {/* ステップ1: PWAインストール */}
          <div className={`setup-step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-header">
              <span className="step-number">1</span>
              <h3>📱 PWAとしてインストール</h3>
            </div>
            <div className="step-content">
              <p>アプリをスマートフォンのホーム画面に追加して、ネイティブアプリのように使用できます。</p>
              <div className="step-benefits">
                <ul>
                  <li>ホーム画面からワンタップで起動</li>
                  <li>プッシュ通知での自動リマインダー</li>
                  <li>オフラインでも基本機能が利用可能</li>
                </ul>
              </div>
              {canInstall ? (
                <button onClick={handleInstallPWA} className="install-btn">
                  📲 アプリをインストール
                </button>
              ) : (
                <div className="manual-install">
                  <p><strong>手動インストール方法:</strong></p>
                  <ul>
                    <li><strong>iPhone/iPad:</strong> Safari の共有ボタン → "ホーム画面に追加"</li>
                    <li><strong>Android:</strong> Chrome のメニュー → "ホーム画面に追加"</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ステップ2: 通知の有効化 */}
          <div className={`setup-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-header">
              <span className="step-number">2</span>
              <h3>🔔 スマート通知の有効化</h3>
            </div>
            <div className="step-content">
              <p>購買パターンを学習して、適切なタイミングで在庫確認を促します。</p>
              <div className="notification-features">
                <ul>
                  <li>週末の買い物前自動リマインダー</li>
                  <li>よく買い物する時間帯での通知</li>
                  <li>在庫切れアラート</li>
                  <li>重複購入リスクの警告</li>
                </ul>
              </div>
              {!notificationEnabled ? (
                <button onClick={handleEnableNotifications} className="notification-btn">
                  🔔 通知を有効にする
                </button>
              ) : (
                <div className="notification-enabled">
                  ✅ 通知が有効になりました！
                </div>
              )}
            </div>
          </div>

          {/* ステップ3: ブックマークレット */}
          <div className={`setup-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-header">
              <span className="step-number">3</span>
              <h3>🔖 ブックマークレット（上級者向け）</h3>
            </div>
            <div className="step-content">
              <p>Amazon・楽天・メルカリの商品ページで即座に在庫確認ができます。</p>
              <div className="bookmarklet-setup">
                <h4>設定方法:</h4>
                <ol>
                  <li>下のボタンをクリックしてコードをコピー</li>
                  <li>ブラウザのブックマークバーを表示</li>
                  <li>新しいブックマークを作成</li>
                  <li>名前を「📦在庫確認」に設定</li>
                  <li>URLにコピーしたコードを貼り付け</li>
                </ol>
                <button onClick={copyBookmarklet} className="bookmarklet-btn">
                  📋 ブックマークレットをコピー
                </button>
              </div>
              <div className="bookmarklet-usage">
                <h4>使い方:</h4>
                <p>Amazon/楽天/メルカリの商品ページで「📦在庫確認」ブックマークをクリックすると、
                   即座に在庫状況がポップアップで表示されます。</p>
              </div>
            </div>
          </div>

          {/* ステップ4: 習慣化のコツ */}
          <div className="setup-step">
            <div className="step-header">
              <span className="step-number">4</span>
              <h3>🎯 効果的な使い方</h3>
            </div>
            <div className="step-content">
              <div className="usage-tips">
                <h4>無意識化のコツ:</h4>
                <ul>
                  <li><strong>購入前の一瞬チェック:</strong> 「カートに入れる」前に在庫確認</li>
                  <li><strong>通知への即座の反応:</strong> リマインダーが来たら即チェック</li>
                  <li><strong>ルーティン化:</strong> 買い物アプリを開く前にこのアプリを開く習慣</li>
                  <li><strong>家族での共有:</strong> URLで家族と在庫情報を共有</li>
                </ul>
              </div>
              <div className="success-metrics">
                <h4>成功の指標:</h4>
                <ul>
                  <li>重複購入の防止回数</li>
                  <li>節約できた金額</li>
                  <li>在庫回転率の改善</li>
                  <li>買い物の効率化</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="setup-footer">
          <div className="completion-status">
            {currentStep >= 3 ? (
              <div className="setup-complete">
                🎉 設定完了！無意識的重複防止システムが有効になりました
              </div>
            ) : (
              <div className="setup-progress">
                進捗: {Math.min(currentStep, 3)}/3 ステップ完了
              </div>
            )}
          </div>
          <button onClick={onClose} className="close-setup-btn">
            設定を完了
          </button>
        </div>
      </div>
    </div>
  );
};