import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types/Product';
import './ProductEdit.css';

interface ProductEditProps {
  product: Product;
  onClose: () => void;
}

export const ProductEdit: React.FC<ProductEditProps> = ({ product, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    itemName: product.itemName,
    price: product.price,
    category: product.category,
    memo: product.memo,
    storage: {
      level1: product.storage.level1,
      level2: product.storage.level2,
      level3: product.storage.level3
    }
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product.id) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, `users/${user.uid}/items`, product.id), formData);
      onClose();
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
            <label>価格</label>
            <input
              type="number"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
              required
            />
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