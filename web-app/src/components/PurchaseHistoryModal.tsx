import React, { useState } from 'react';
import { Product } from '../types/Product';
import './PurchaseHistoryModal.css';

interface PurchaseHistoryModalProps {
  product: Product;
  onClose: () => void;
  onCreateNew: (product: Product) => void;
  onAddToExisting: (productId: string, quantity: number) => void;
}

export const PurchaseHistoryModal: React.FC<PurchaseHistoryModalProps> = ({
  product,
  onClose,
  onCreateNew,
  onAddToExisting
}) => {
  const [selectedOption, setSelectedOption] = useState<'new' | 'existing'>('existing');
  const [quantity, setQuantity] = useState(1);
  const [newPrice, setNewPrice] = useState(product.unitPrice || 0);

  const handleSubmit = () => {
    if (selectedOption === 'existing') {
      onAddToExisting(product.id!, quantity);
    } else {
      // 新しい商品として追加
      const newProduct: Product = {
        ...product,
        id: undefined, // 新しいIDが生成される
        quantity: quantity,
        remainingQuantity: quantity,
        price: newPrice * quantity,
        unitPrice: newPrice,
        purchaseDate: new Date(),
        createdAt: new Date(),
        source: 'manual'
      };
      onCreateNew(newProduct);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="purchase-history-modal" onClick={e => e.stopPropagation()}>
        <h2>🛒 買い足し方法を選択</h2>
        
        <div className="product-info">
          <h3>{product.itemName}</h3>
          <p>前回購入価格: ¥{product.unitPrice?.toLocaleString()}</p>
        </div>

        <div className="option-section">
          <label className="option-label">
            <input
              type="radio"
              value="existing"
              checked={selectedOption === 'existing'}
              onChange={() => setSelectedOption('existing')}
            />
            <div className="option-content">
              <strong>📦 既存の商品に在庫追加</strong>
              <p>同じカードで在庫数を増やす（シンプル管理）</p>
            </div>
          </label>

          <label className="option-label">
            <input
              type="radio"
              value="new"
              checked={selectedOption === 'new'}
              onChange={() => setSelectedOption('new')}
            />
            <div className="option-content">
              <strong>📝 新しい購入記録として追加</strong>
              <p>別カードで履歴を残す（価格変動・購入日を記録）</p>
            </div>
          </label>
        </div>

        <div className="input-section">
          <div className="form-row">
            <div className="form-group">
              <label>数量</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value))}
              />
            </div>
            
            {selectedOption === 'new' && (
              <div className="form-group">
                <label>単価</label>
                <input
                  type="number"
                  min="0"
                  value={newPrice}
                  onChange={e => setNewPrice(parseInt(e.target.value))}
                />
              </div>
            )}
          </div>

          {selectedOption === 'new' && (
            <div className="price-summary">
              合計価格: ¥{(newPrice * quantity).toLocaleString()}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">キャンセル</button>
          <button onClick={handleSubmit} className="confirm-btn">
            {selectedOption === 'existing' ? '在庫を追加' : '新しい記録を作成'}
          </button>
        </div>
      </div>
    </div>
  );
};