import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateTestProducts, generateMockEmail, getSimilarProducts } from '../utils/testData';
import { localStorageDB } from '../utils/localStorage';
import './TestMode.css';

interface TestModeProps {
  onClose: () => void;
}

export const TestMode: React.FC<TestModeProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestProducts = async (count: number) => {
    if (!user) return;
    
    setIsGenerating(true);
    setTestResults([]);
    
    try {
      const testProducts = generateTestProducts(count);
      const results: string[] = [];
      
      // デモモードの場合はローカルストレージに保存
      const isDemo = localStorage.getItem('demoUser');
      if (isDemo) {
        for (const product of testProducts) {
          localStorageDB.saveProduct(product);
          results.push(`✅ ${product.itemName} を追加しました（${product.site}）`);
        }
        results.push('');
        results.push('🔄 ページをリロードすると一覧に表示されます');
      } else {
        // Firebase認証の場合は通常のFirestore処理
        if (isFirebaseConfigured && db) {
          for (const product of testProducts) {
            await addDoc(collection(db, `users/${user.uid}/items`), product);
            results.push(`✅ ${product.itemName} を追加しました（${product.site}）`);
          }
        } else {
          results.push('❌ Firebase設定が必要です');
        }
      }
      
      setTestResults(results);
    } catch (error) {
      console.error('Error adding test products:', error);
      setTestResults(['❌ テストデータの追加に失敗しました']);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateEmailSample = () => {
    const testProducts = generateTestProducts(1);
    const product = testProducts[0];
    const mockEmail = generateMockEmail(product, product.site);
    
    setTestResults([
      `📧 ${product.site}の注文確認メールサンプル:`,
      '------------------------',
      mockEmail,
      '------------------------',
      '💡 このメールをGmail連携で解析すると、商品情報が自動取得されます'
    ]);
  };

  const testDuplicateDetection = () => {
    const testProductName = 'Anker モバイルバッテリー PowerCore';
    const similarProducts = getSimilarProducts(testProductName);
    
    const results = [
      `🔍 重複検出テスト: "${testProductName}"`,
      '以下の類似商品が検出されました:',
      '------------------------'
    ];
    
    similarProducts.forEach((product, index) => {
      results.push(`${index + 1}. ${product.itemName} (${product.site}) - ¥${product.price.toLocaleString()}`);
    });
    
    results.push('------------------------');
    results.push('💡 Chrome拡張でこれらの商品ページを訪問すると警告が表示されます');
    
    setTestResults(results);
  };

  const testCategoryClassification = () => {
    const testItems = [
      'iPhone 15 Pro ケース',
      'USB-C ケーブル 2m',
      'ワイヤレス充電器',
      'Bluetooth イヤホン',
      'プログラミング入門書'
    ];
    
    const categorizeProduct = (itemName: string) => {
      const categories = {
        'ケース': ['ケース', 'case', 'カバー'],
        'ケーブル': ['ケーブル', 'cable', 'USB'],
        '充電器': ['充電器', 'charger'],
        'イヤホン': ['イヤホン', 'bluetooth'],
        '書籍': ['書', 'book', '入門']
      };
      
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => itemName.toLowerCase().includes(keyword.toLowerCase()))) {
          return category;
        }
      }
      return 'その他';
    };
    
    const results = [
      '🏷️ カテゴリ分類テスト:',
      '------------------------'
    ];
    
    testItems.forEach(item => {
      const category = categorizeProduct(item);
      results.push(`"${item}" → ${category}`);
    });
    
    results.push('------------------------');
    results.push('💡 Firebase Functionsで自動的にカテゴリが分類されます');
    
    setTestResults(results);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="test-mode" onClick={e => e.stopPropagation()}>
        <h2>🧪 テストモード</h2>
        
        <div className="test-description">
          <p>実際に商品を購入せずにシステムの動作を確認できます。</p>
        </div>

        <div className="test-section">
          <h3>📦 テストデータの生成</h3>
          <div className="test-buttons">
            <button 
              onClick={() => addTestProducts(3)} 
              disabled={isGenerating}
              className="test-btn primary"
            >
              {isGenerating ? '生成中...' : '少量データ（3件）'}
            </button>
            <button 
              onClick={() => addTestProducts(8)} 
              disabled={isGenerating}
              className="test-btn primary"
            >
              {isGenerating ? '生成中...' : '標準データ（8件）'}
            </button>
            <button 
              onClick={() => addTestProducts(15)} 
              disabled={isGenerating}
              className="test-btn primary"
            >
              {isGenerating ? '生成中...' : '大量データ（15件）'}
            </button>
          </div>
          <p className="test-note">
            Amazon、楽天、メルカリの様々な商品データを自動生成します
          </p>
        </div>

        <div className="test-section">
          <h3>📧 Gmail連携のシミュレーション</h3>
          <div className="test-buttons">
            <button onClick={generateEmailSample} className="test-btn secondary">
              メールサンプル表示
            </button>
          </div>
          <p className="test-note">
            注文確認メールの解析例を確認できます
          </p>
        </div>

        <div className="test-section">
          <h3>⚠️ 重複検出のテスト</h3>
          <div className="test-buttons">
            <button onClick={testDuplicateDetection} className="test-btn secondary">
              重複検出シミュレーション
            </button>
          </div>
          <p className="test-note">
            類似商品の検出ロジックを確認できます
          </p>
        </div>

        <div className="test-section">
          <h3>🏷️ カテゴリ分類のテスト</h3>
          <div className="test-buttons">
            <button onClick={testCategoryClassification} className="test-btn secondary">
              分類ロジック確認
            </button>
          </div>
          <p className="test-note">
            商品名からのカテゴリ自動分類を確認できます
          </p>
        </div>

        {testResults.length > 0 && (
          <div className="test-results">
            <h3>📊 テスト結果</h3>
            <div className="results-content">
              {testResults.map((result, index) => (
                <div key={index} className="result-line">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="test-actions">
          <button onClick={onClose} className="close-btn">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};