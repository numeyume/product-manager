import React from 'react';
import { Product } from '../types/Product';
import { DuplicateCheckResult } from '../utils/duplicateChecker';
import './DuplicateWarningModal.css';

interface DuplicateWarningModalProps {
  duplicateResult: DuplicateCheckResult;
  newProduct: Partial<Product>;
  onConfirm: (action: 'merge' | 'create_new' | 'cancel') => void;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  duplicateResult,
  newProduct,
  onConfirm
}) => {
  const { isDuplicate, existingProduct, suggestion, message } = duplicateResult;

  const renderExistingProductInfo = () => {
    if (!existingProduct) return null;

    return (
      <div className="existing-product-info">
        <h4>📦 既存商品情報</h4>
        <div className="product-card-mini">
          <div className="product-name">{existingProduct.itemName}</div>
          <div className="product-details">
            <span className="price">¥{existingProduct.price.toLocaleString()}</span>
            <span className="quantity">購入数: {existingProduct.quantity}個</span>
            <span className={`stock ${(existingProduct.remainingQuantity || 0) > 0 ? 'in-stock' : 'out-of-stock'}`}>
              残り: {existingProduct.remainingQuantity || 0}個
            </span>
          </div>
          <div className="purchase-date">
            購入日: {existingProduct.purchaseDate.toLocaleDateString('ja-JP')}
          </div>
          {existingProduct.storage && (
            <div className="storage-location">
              📍 {[existingProduct.storage.level1, existingProduct.storage.level2, existingProduct.storage.level3]
                .filter(Boolean).join(' > ')}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNewProductInfo = () => {
    return (
      <div className="new-product-info">
        <h4>🆕 新規購入予定</h4>
        <div className="product-card-mini new">
          <div className="product-name">{newProduct.itemName}</div>
          <div className="product-details">
            <span className="price">¥{newProduct.price?.toLocaleString()}</span>
            <span className="quantity">購入予定: {newProduct.quantity}個</span>
          </div>
          {newProduct.site && (
            <div className="site">サイト: {newProduct.site}</div>
          )}
        </div>
      </div>
    );
  };

  const getModalTitle = () => {
    if (isDuplicate && existingProduct && (existingProduct.remainingQuantity || 0) > 0) {
      return '⚠️ 在庫あり商品の重複購入';
    } else if (isDuplicate) {
      return '🔄 類似商品の検出';
    } else {
      return '💡 在庫確認';
    }
  };

  const getActionButtons = () => {
    if (suggestion === 'add_quantity') {
      return (
        <>
          <button 
            onClick={() => onConfirm('merge')} 
            className="merge-btn"
          >
            📥 既存商品に追加
          </button>
          <button 
            onClick={() => onConfirm('create_new')} 
            className="create-new-btn"
          >
            🆕 別商品として登録
          </button>
          <button 
            onClick={() => onConfirm('cancel')} 
            className="cancel-btn"
          >
            ❌ キャンセル
          </button>
        </>
      );
    } else {
      return (
        <>
          <button 
            onClick={() => onConfirm('create_new')} 
            className="create-new-btn"
          >
            ✅ 新規登録を続行
          </button>
          <button 
            onClick={() => onConfirm('cancel')} 
            className="cancel-btn"
          >
            ❌ キャンセル
          </button>
        </>
      );
    }
  };

  const getWarningLevel = () => {
    if (isDuplicate && existingProduct && (existingProduct.remainingQuantity || 0) > 0) {
      return 'high-warning';
    } else if (isDuplicate) {
      return 'medium-warning';
    } else {
      return 'low-warning';
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`duplicate-warning-modal ${getWarningLevel()}`}>
        <div className="modal-header">
          <h3>{getModalTitle()}</h3>
        </div>
        
        <div className="modal-content">
          <div className="warning-message">
            {message.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          <div className="product-comparison">
            {renderExistingProductInfo()}
            {renderNewProductInfo()}
          </div>

          {isDuplicate && suggestion === 'add_quantity' && (
            <div className="merge-preview">
              <h4>📊 統合後の予想</h4>
              <div className="merge-result">
                <div className="merge-item">
                  <span className="label">合計購入数:</span>
                  <span className="value">
                    {(existingProduct?.quantity || 0) + (newProduct.quantity || 0)}個
                  </span>
                </div>
                <div className="merge-item">
                  <span className="label">残り在庫:</span>
                  <span className="value">
                    {(existingProduct?.remainingQuantity || 0) + (newProduct.quantity || 0)}個
                  </span>
                </div>
                <div className="merge-item">
                  <span className="label">累計支払額:</span>
                  <span className="value">
                    ¥{((existingProduct?.price || 0) + (newProduct.price || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {getActionButtons()}
        </div>
      </div>
    </div>
  );
};