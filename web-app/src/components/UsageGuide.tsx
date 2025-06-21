import React from 'react';
import './UsageGuide.css';

interface UsageGuideProps {
  onClose: () => void;
}

export const UsageGuide: React.FC<UsageGuideProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="usage-guide" onClick={e => e.stopPropagation()}>
        <div className="guide-header">
          <h2>📖 通販商品管理アプリ 使い方ガイド</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        
        <div className="guide-content">
          {/* 事前準備 */}
          <section className="guide-section">
            <h3>🛠️ 事前準備</h3>
            <div className="preparation-steps">
              <div className="prep-item">
                <h4>1. 認証の準備</h4>
                <ul>
                  <li><strong>デモモード:</strong> すぐに開始可能（準備不要）</li>
                  <li><strong>本格運用:</strong> Firebase設定が必要</li>
                </ul>
              </div>
              <div className="prep-item">
                <h4>2. Gmail連携（オプション）</h4>
                <ul>
                  <li>Googleアカウントでのログインが必要</li>
                  <li>注文確認メールから商品情報を自動取得</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 基本的な使い方 */}
          <section className="guide-section">
            <h3>🚀 基本的な使い方</h3>
            <div className="basic-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>アプリを起動</h4>
                  <p>デモモードか本格運用を選択してください</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>商品を登録</h4>
                  <p>手動登録またはGmail連携で商品情報を追加</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>在庫管理</h4>
                  <p>使用時に「使用(-1)」ボタンで在庫を減らす</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>保管場所管理</h4>
                  <p>商品の保管場所を3階層で管理</p>
                </div>
              </div>
            </div>
          </section>

          {/* 個人用とビジネス用の違い */}
          <section className="guide-section">
            <h3>👥 個人用 vs 🏢 ビジネス用</h3>
            <div className="mode-comparison">
              <div className="mode-card personal">
                <h4>👥 個人用モード</h4>
                <div className="features">
                  <h5>主な機能:</h5>
                  <ul>
                    <li>購入商品の管理</li>
                    <li>在庫追跡</li>
                    <li>保管場所管理</li>
                    <li>利用場所・用途記録</li>
                    <li>Gmail連携</li>
                  </ul>
                  <h5>適用シーン:</h5>
                  <ul>
                    <li>家庭での買い物管理</li>
                    <li>趣味のコレクション管理</li>
                    <li>日用品の在庫管理</li>
                  </ul>
                </div>
              </div>
              
              <div className="mode-card business">
                <h4>🏢 ビジネス用モード</h4>
                <div className="features">
                  <h5>主な機能:</h5>
                  <ul>
                    <li>個人用機能 + 以下</li>
                    <li>仕入れ先管理</li>
                    <li>原価・利益計算</li>
                    <li>発注点・最低在庫管理</li>
                    <li>納期管理</li>
                  </ul>
                  <h5>適用シーン:</h5>
                  <ul>
                    <li>小売業の在庫管理</li>
                    <li>EC事業者の商品管理</li>
                    <li>オフィス用品管理</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 詳細機能説明 */}
          <section className="guide-section">
            <h3>⚙️ 詳細機能</h3>
            <div className="feature-details">
              <div className="feature-item">
                <h4>📦 商品登録</h4>
                <ul>
                  <li><strong>手動登録:</strong> 商品名、価格、数量等を直接入力</li>
                  <li><strong>Gmail連携:</strong> 注文確認メールから自動抽出</li>
                  <li>商品URLを保存してワンクリックでサイトへ</li>
                </ul>
              </div>
              
              <div className="feature-item">
                <h4>📍 保管場所管理</h4>
                <ul>
                  <li><strong>3階層管理:</strong> 大分類 {'>'} 中分類 {'>'} 小分類</li>
                  <li><strong>例:</strong> 押入れ {'>'} 上段 {'>'} ボックスA</li>
                  <li>視覚的な場所管理で商品を見つけやすく</li>
                </ul>
              </div>
              
              <div className="feature-item">
                <h4>🎯 利用場所・用途</h4>
                <ul>
                  <li><strong>複数登録可能:</strong> 一つの商品に複数の用途</li>
                  <li><strong>例:</strong> ケーブル → デスク（充電用）+ リビング（データ転送用）</li>
                  <li>保管場所とは別の概念で使用目的を管理</li>
                </ul>
              </div>
              
              <div className="feature-item">
                <h4>📊 在庫管理</h4>
                <ul>
                  <li><strong>個人用:</strong> 使用時に「使用(-1)」で在庫減</li>
                  <li><strong>ビジネス用:</strong> 発注点設定で自動アラート</li>
                  <li>在庫切れ時の再注文確認機能</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 操作方法 */}
          <section className="guide-section">
            <h3>🖱️ 操作方法</h3>
            <div className="operation-guide">
              <div className="operation-item">
                <h4>商品カードの操作</h4>
                <ul>
                  <li><strong>サイトバッジ:</strong> クリックで購入サイトへ</li>
                  <li><strong>📦 使用(-1):</strong> 在庫を1つ減らす</li>
                  <li><strong>編集:</strong> 商品情報を修正</li>
                  <li><strong>削除:</strong> 商品を完全削除</li>
                </ul>
              </div>
              
              <div className="operation-item">
                <h4>フィルター・検索</h4>
                <ul>
                  <li><strong>在庫切れ非表示:</strong> 在庫のある商品のみ表示</li>
                  <li><strong>保管場所別:</strong> 場所ごとに商品を整理</li>
                  <li><strong>カテゴリ別:</strong> 商品種別で分類表示</li>
                </ul>
              </div>
            </div>
          </section>

          {/* トラブルシューティング */}
          <section className="guide-section">
            <h3>🔧 よくある質問・トラブル</h3>
            <div className="faq">
              <div className="faq-item">
                <h4>Q: Gmail連携でエラーが出る</h4>
                <p>A: Firebase設定が正しいか確認してください。デモモードでは代替機能をお試しください。</p>
              </div>
              
              <div className="faq-item">
                <h4>Q: 商品が削除できない</h4>
                <p>A: ブラウザをリロードしてから再度お試しください。それでも解決しない場合は開発者にお問い合わせください。</p>
              </div>
              
              <div className="faq-item">
                <h4>Q: 在庫が正しく減らない</h4>
                <p>A: 商品IDが重複している可能性があります。該当商品を一度削除して再登録してください。</p>
              </div>
              
              <div className="faq-item">
                <h4>Q: ビジネス機能が表示されない</h4>
                <p>A: 画面右上のビジネスモードトグルをONにしてください。</p>
              </div>
            </div>
          </section>
        </div>
        
        <div className="guide-footer">
          <button onClick={onClose} className="close-guide-btn">
            📖 ガイドを閉じる
          </button>
        </div>
      </div>
    </div>
  );
};