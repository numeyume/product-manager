import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { localStorageDB } from '../utils/localStorage';
import { Product, Usage } from '../types/Product';
import './ProductEdit.css';

interface ProductEditProps {
  product: Product;
  onClose: () => void;
  onUpdated?: () => void;
}

export const ProductEdit: React.FC<ProductEditProps> = ({ product, onClose, onUpdated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    itemName: product.itemName,
    price: product.price,
    quantity: product.quantity || 1,
    remainingQuantity: product.remainingQuantity || 0,
    category: product.category,
    memo: product.memo || '',
    storage: {
      level1: product.storage.level1,
      level2: product.storage.level2,
      level3: product.storage.level3
    },
    usage: product.usage || []
  });
  const [saving, setSaving] = useState(false);
  const [showUsageFields, setShowUsageFields] = useState(false);

  const addUsage = () => {
    setFormData(prev => ({
      ...prev,
      usage: [...prev.usage, { location: '', purpose: '', device: '' }]
    }));
  };

  const updateUsage = (index: number, field: keyof Usage, value: string) => {
    setFormData(prev => ({
      ...prev,
      usage: prev.usage.map((usage, i) => 
        i === index ? { ...usage, [field]: value } : usage
      )
    }));
  };

  const removeUsage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      usage: prev.usage.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product.id) return;

    setSaving(true);
    try {
      const updateData = {
        ...formData,
        unitPrice: Math.round(formData.price / formData.quantity)
      };

      const isDemo = localStorage.getItem('demoUser');
      
      if (isDemo) {
        const success = localStorageDB.updateProduct(product.id, updateData);
        if (success) {
          onUpdated?.();
          onClose();
        } else {
          alert('更新に失敗しました');
        }
      } else {
        if (isFirebaseConfigured && db) {
          await updateDoc(doc(db, `users/${user.uid}/items`, product.id), updateData);
          onClose();
        } else {
          alert('Firebase設定が必要です');
        }
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>商品編集</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>商品名</label>
            <input
              type="text"
              value={formData.itemName}
              onChange={e => setFormData({ ...formData, itemName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>合計価格</label>
            <input
              type="number"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>購入数量</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>残在庫</label>
              <input
                type="number"
                min="0"
                max={formData.quantity}
                value={formData.remainingQuantity}
                onChange={e => setFormData({ ...formData, remainingQuantity: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>単価（自動計算）</label>
            <div className="unit-price-display">
              ¥{Math.round(formData.price / formData.quantity).toLocaleString()}
            </div>
          </div>

          <div className="form-group">
            <label>カテゴリ</label>
            <input
              type="text"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>保管場所</label>
            <div className="storage-inputs">
              <input
                type="text"
                placeholder="場所1"
                value={formData.storage.level1}
                onChange={e => setFormData({
                  ...formData,
                  storage: { ...formData.storage, level1: e.target.value }
                })}
              />
              <input
                type="text"
                placeholder="場所2"
                value={formData.storage.level2}
                onChange={e => setFormData({
                  ...formData,
                  storage: { ...formData.storage, level2: e.target.value }
                })}
              />
              <input
                type="text"
                placeholder="場所3"
                value={formData.storage.level3}
                onChange={e => setFormData({
                  ...formData,
                  storage: { ...formData.storage, level3: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="form-group">
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
                        <div className="form-group">
                          <label>利用場所</label>
                          <input
                            type="text"
                            value={usage.location}
                            onChange={e => updateUsage(index, 'location', e.target.value)}
                            placeholder="例: デスク、リビング、寝室"
                          />
                        </div>
                        <div className="form-group">
                          <label>用途</label>
                          <input
                            type="text"
                            value={usage.purpose}
                            onChange={e => updateUsage(index, 'purpose', e.target.value)}
                            placeholder="例: 充電用、データ転送用"
                          />
                        </div>
                      </div>
                      <div className="form-group">
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

          <div className="form-group">
            <label>メモ</label>
            <textarea
              value={formData.memo}
              onChange={e => setFormData({ ...formData, memo: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              キャンセル
            </button>
            <button type="submit" disabled={saving} className="save-btn">
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};