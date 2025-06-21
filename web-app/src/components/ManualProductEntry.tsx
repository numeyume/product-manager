import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { localStorageDB } from '../utils/localStorage';
import { Product, Storage, Usage } from '../types/Product';
import { checkDuplicateProduct, mergeProducts, DuplicateCheckResult } from '../utils/duplicateChecker';
import { DuplicateWarningModal } from './DuplicateWarningModal';
import './ManualProductEntry.css';

interface ManualProductEntryProps {
  onClose: () => void;
  onProductAdded?: () => void;
  existingProducts?: Product[];
}

export const ManualProductEntry: React.FC<ManualProductEntryProps> = ({ onClose, onProductAdded, existingProducts = [] }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Product>>({
    itemName: '',
    url: '',
    site: 'Amazon',
    price: 0,
    quantity: 1,
    category: '',
    memo: '',
    storage: {
      level1: '',
      level2: '',
      level3: ''
    },
    usage: []
  });
  const [storageData, setStorageData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showUsageFields, setShowUsageFields] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResult | null>(null);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const isDemo = localStorage.getItem('demoUser');
      
      if (isDemo) {
        const storedData = localStorage.getItem('storageData');
        if (storedData) {
          setStorageData(JSON.parse(storedData));
        }
      } else {
        // Firebase からのデータ読み込みは必要に応じて実装
      }
    } catch (error) {
      console.error('Storage data load error:', error);
    }
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStorageChange = (level: keyof Storage, value: string) => {
    setFormData(prev => ({
      ...prev,
      storage: {
        ...prev.storage!,
        [level]: value,
        // Reset lower levels when upper level changes
        ...(level === 'level1' ? { level2: '', level3: '' } : {}),
        ...(level === 'level2' ? { level3: '' } : {})
      }
    }));
  };

  const addUsage = () => {
    setFormData(prev => ({
      ...prev,
      usage: [...(prev.usage || []), { location: '', purpose: '', device: '' }]
    }));
  };

  const updateUsage = (index: number, field: keyof Usage, value: string) => {
    setFormData(prev => ({
      ...prev,
      usage: prev.usage?.map((usage, i) => 
        i === index ? { ...usage, [field]: value } : usage
      ) || []
    }));
  };

  const removeUsage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      usage: prev.usage?.filter((_, i) => i !== index) || []
    }));
  };

  const categorizeProduct = (itemName: string): string => {
    const categories = {
      'スマホ・ケース': ['iphone', 'android', 'ケース', 'case', 'カバー'],
      'ケーブル・充電器': ['ケーブル', 'cable', 'usb', '充電器', 'charger'],
      'イヤホン・ヘッドホン': ['イヤホン', 'ヘッドホン', 'bluetooth', 'airpods'],
      '書籍': ['書', 'book', '入門', '攻略', '参考書'],
      'ゲーム': ['ゲーム', 'game', 'ps5', 'nintendo', 'switch'],
      '家電': ['家電', '冷蔵庫', '洗濯機', 'テレビ', 'エアコン'],
      'ファッション': ['服', '靴', 'バッグ', 'アクセサリー'],
      'コスメ・美容': ['化粧品', 'コスメ', '美容', 'スキンケア'],
      '食品・飲料': ['食品', '飲料', 'お菓子', 'サプリ']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => itemName.toLowerCase().includes(keyword.toLowerCase()))) {
        return category;
      }
    }
    return 'その他';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemName || !formData.price || !formData.quantity) {
      alert('商品名、価格、数量は必須項目です');
      return;
    }

    const quantity = formData.quantity!;
    const totalPrice = formData.price!;
    const unitPrice = Math.round(totalPrice / quantity);

    const newProduct: Product = {
      itemName: formData.itemName!,
      url: formData.url || '',
      site: formData.site as 'Amazon' | '楽天' | 'メルカリ' | '仕入れ先' | 'その他',
      price: totalPrice,
      quantity: quantity,
      remainingQuantity: quantity,
      unitPrice: unitPrice,
      purchaseDate: new Date(),
      category: formData.category || categorizeProduct(formData.itemName!),
      memo: formData.memo,
      storage: formData.storage!,
      usage: formData.usage,
      source: 'manual',
      createdAt: new Date()
    };

    // 重複チェック実行
    const duplicateResult = checkDuplicateProduct(newProduct, existingProducts);
    
    if (duplicateResult.isDuplicate || duplicateResult.suggestion === 'add_quantity') {
      setDuplicateCheck(duplicateResult);
      setPendingProduct(newProduct);
      return;
    }

    // 重複なしの場合は直接保存
    await saveProduct(newProduct);
  };

  const handleDuplicateAction = async (action: 'merge' | 'create_new' | 'cancel') => {
    if (!pendingProduct || !duplicateCheck) return;

    if (action === 'cancel') {
      setDuplicateCheck(null);
      setPendingProduct(null);
      return;
    }

    if (action === 'merge' && duplicateCheck.existingProduct) {
      const mergedProduct = mergeProducts(duplicateCheck.existingProduct, pendingProduct);
      await updateExistingProduct(mergedProduct);
    } else if (action === 'create_new') {
      await saveProduct(pendingProduct);
    }

    setDuplicateCheck(null);
    setPendingProduct(null);
  };

  const saveProduct = async (product: Product) => {
    setSaving(true);
    try {
      const isDemo = localStorage.getItem('demoUser');
      
      if (isDemo) {
        localStorageDB.saveProduct(product);
        alert('商品を登録しました');
      } else {
        if (isFirebaseConfigured && db && user) {
          await addDoc(collection(db, `users/${user.uid}/items`), product);
          alert('商品を登録しました');
        } else {
          alert('Firebase設定が必要です');
          return;
        }
      }

      if (onProductAdded) onProductAdded();
      onClose();
    } catch (error) {
      console.error('Product save error:', error);
      alert('商品の登録に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const updateExistingProduct = async (product: Product) => {
    setSaving(true);
    try {
      const isDemo = localStorage.getItem('demoUser');
      
      if (isDemo) {
        if (product.id) {
          localStorageDB.updateProduct(product.id, product);
          alert('既存商品に追加しました');
        }
      } else {
        if (isFirebaseConfigured && db && user && product.id) {
          await setDoc(doc(db, `users/${user.uid}/items`, product.id), product);
          alert('既存商品に追加しました');
        }
      }

      if (onProductAdded) onProductAdded();
      onClose();
    } catch (error) {
      console.error('Product update error:', error);
      alert('商品の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const level1Options: string[] = Object.keys(storageData);
  const level2Options: string[] = formData.storage?.level1 ? Object.keys(storageData[formData.storage.level1] || {}) : [];
  const level3Options: string[] = formData.storage?.level1 && formData.storage?.level2 
    ? storageData[formData.storage.level1][formData.storage.level2] || [] 
    : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="manual-entry" onClick={e => e.stopPropagation()}>
        <h2>🖊️ 手動で商品を登録</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label htmlFor="itemName">商品名 *</label>
            <input
              id="itemName"
              type="text"
              value={formData.itemName || ''}
              onChange={e => handleInputChange('itemName', e.target.value)}
              placeholder="例: iPhone 15 Pro ケース"
              required
            />
          </div>

          <div className="form-section">
            <label htmlFor="url">商品URL</label>
            <input
              id="url"
              type="url"
              value={formData.url || ''}
              onChange={e => handleInputChange('url', e.target.value)}
              placeholder="https://amazon.co.jp/..."
            />
          </div>

          <div className="form-row">
            <div className="form-section">
              <label htmlFor="site">購入サイト</label>
              <select
                id="site"
                value={formData.site || 'Amazon'}
                onChange={e => handleInputChange('site', e.target.value)}
              >
                <option value="Amazon">Amazon</option>
                <option value="楽天">楽天</option>
                <option value="メルカリ">メルカリ</option>
              </select>
            </div>

            <div className="form-section">
              <label htmlFor="price">合計価格 *</label>
              <input
                id="price"
                type="number"
                value={formData.price || ''}
                onChange={e => handleInputChange('price', Number(e.target.value))}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-section">
              <label htmlFor="quantity">数量 *</label>
              <input
                id="quantity"
                type="number"
                value={formData.quantity || 1}
                onChange={e => handleInputChange('quantity', Number(e.target.value))}
                placeholder="1"
                min="1"
                required
              />
            </div>

            <div className="form-section">
              <label>単価（自動計算）</label>
              <div className="unit-price-display">
                ¥{formData.price && formData.quantity ? Math.round(formData.price / formData.quantity).toLocaleString() : '0'}
              </div>
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="category">カテゴリ</label>
            <input
              id="category"
              type="text"
              value={formData.category || ''}
              onChange={e => handleInputChange('category', e.target.value)}
              placeholder="自動分類されます（手動で変更可能）"
            />
          </div>

          <div className="form-section">
            <label>保管場所</label>
            <div className="storage-selects">
              <select
                value={formData.storage?.level1 || ''}
                onChange={e => handleStorageChange('level1', e.target.value)}
              >
                <option value="">場所1を選択</option>
                {level1Options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <select
                value={formData.storage?.level2 || ''}
                onChange={e => handleStorageChange('level2', e.target.value)}
                disabled={!formData.storage?.level1}
              >
                <option value="">場所2を選択</option>
                {level2Options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <select
                value={formData.storage?.level3 || ''}
                onChange={e => handleStorageChange('level3', e.target.value)}
                disabled={!formData.storage?.level2}
              >
                <option value="">場所3を選択</option>
                {level3Options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <div className="usage-header" onClick={() => setShowUsageFields(!showUsageFields)}>
              <label>🎯 利用場所・用途 <span className="optional">(任意・複数可)</span></label>
              <span className="toggle-icon">{showUsageFields ? '▼' : '▶'}</span>
            </div>
            
            {showUsageFields && (
              <div className="usage-fields">
                {formData.usage && formData.usage.length > 0 ? (
                  formData.usage.map((usage, index) => (
                    <div key={index} className="usage-item">
                      <div className="usage-item-header">
                        <span className="usage-item-title">利用場所 {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeUsage(index)}
                          className="remove-usage-btn"
                          title="この利用場所を削除"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="form-row">
                        <div className="form-section">
                          <label>利用場所</label>
                          <input
                            type="text"
                            value={usage.location}
                            onChange={e => updateUsage(index, 'location', e.target.value)}
                            placeholder="例: デスク、リビング、寝室"
                          />
                        </div>
                        <div className="form-section">
                          <label>用途</label>
                          <input
                            type="text"
                            value={usage.purpose}
                            onChange={e => updateUsage(index, 'purpose', e.target.value)}
                            placeholder="例: 充電用、データ転送用"
                          />
                        </div>
                      </div>
                      <div className="form-section">
                        <label>対象機器</label>
                        <input
                          type="text"
                          value={usage.device || ''}
                          onChange={e => updateUsage(index, 'device', e.target.value)}
                          placeholder="例: iPhone、MacBook、テレビ"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-usage-message">
                    <p>利用場所が設定されていません</p>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={addUsage}
                  className="add-usage-btn"
                >
                  ＋ 利用場所を追加
                </button>
              </div>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="memo">メモ</label>
            <textarea
              id="memo"
              value={formData.memo || ''}
              onChange={e => handleInputChange('memo', e.target.value)}
              placeholder="購入理由、使用感など..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              キャンセル
            </button>
            <button type="submit" disabled={saving} className="save-btn">
              {saving ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>
      </div>

      {duplicateCheck && pendingProduct && (
        <DuplicateWarningModal
          duplicateResult={duplicateCheck}
          newProduct={pendingProduct}
          onConfirm={handleDuplicateAction}
        />
      )}
    </div>
  );
};