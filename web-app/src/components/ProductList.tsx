import React, { useState } from 'react';
import { Product } from '../types/Product';
import { ProductEdit } from './ProductEdit';
import { EmailViewer } from './EmailViewer';
import './ProductList.css';

interface ProductListProps {
  products: Product[];
  onDelete: (productId: string) => void;
  onQuantityUpdate?: (productId: string, newRemainingQuantity: number) => void;
  onProductUpdated?: () => void;
  onReorder?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onDelete, onQuantityUpdate, onProductUpdated, onReorder }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingEmail, setViewingEmail] = useState<Product | null>(null);

  const handleReorderClick = (product: Product) => {
    const choice = window.confirm(
      `「${product.itemName}」を買い足しますか？\n\n` +
      `✅ OK: 商品ページを開く\n` +
      `❌ キャンセル: この画面で在庫を追加`
    );

    if (choice) {
      // 商品ページを開く
      if (product.url) {
        window.open(product.url, '_blank');
      }
    } else {
      // この場で在庫を追加
      handleQuickRestock(product);
    }
  };

  const handleQuickRestock = (product: Product) => {
    const quantityStr = window.prompt(
      `「${product.itemName}」の在庫を追加します。\n\n` +
      `追加する数量を入力してください：`,
      '1'
    );

    if (quantityStr && !isNaN(Number(quantityStr))) {
      const addQuantity = parseInt(quantityStr);
      if (addQuantity > 0 && product.id && onQuantityUpdate) {
        const newQuantity = (product.remainingQuantity || 0) + addQuantity;
        onQuantityUpdate(product.id, newQuantity);
      }
    }
  };

  const handleQuantityDecrease = (product: Product) => {
    if (product.remainingQuantity > 0 && product.id && onQuantityUpdate) {
      const newQuantity = product.remainingQuantity - 1;
      onQuantityUpdate(product.id, newQuantity);
    }
  };

  const getSiteIcon = (site: string) => {
    switch (site) {
      case 'Amazon':
        return '🛒';
      case '楽天':
        return '🛍️';
      case 'メルカリ':
        return '💰';
      default:
        return '📦';
    }
  };

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'gmail':
        return '📧 Gmail';
      case 'extension':
        return '🔌 拡張機能';
      case 'manual':
        return '✏️ 手動';
      default:
        return '❓ 不明';
    }
  };

  return (
    <>
      <div className="product-list">
        {products.length === 0 ? (
          <div className="no-products">商品が登録されていません</div>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3>{product.itemName}</h3>
                <div className="badges">
                  <a 
                    href={product.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="site-badge clickable"
                    title={`${product.site}で商品ページを開く`}
                  >
                    {getSiteIcon(product.site)} {product.site}
                  </a>
                  {product.source === 'gmail' ? (
                    <button 
                      className="source-badge clickable-source"
                      onClick={() => setViewingEmail(product)}
                      title="元のメール内容を表示"
                    >
                      {getSourceLabel(product.source)}
                    </button>
                  ) : (
                    <span className="source-badge">
                      {getSourceLabel(product.source)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="product-info">
                <div className="info-row">
                  <span className="label">合計価格:</span>
                  <span>¥{product.price.toLocaleString()}</span>
                </div>
                <div className="info-row">
                  <span className="label">数量・在庫:</span>
                  <span className="quantity-info">
                    残り{product.remainingQuantity || 0}個 / 購入{product.quantity || 1}個
                    {product.remainingQuantity === 0 && (
                      <span className="out-of-stock">
                        （在庫切れ）
                        <button 
                          onClick={() => handleReorderClick(product)}
                          className="reorder-btn"
                          title="買い足しますか？"
                        >
                          🛒 買い足し
                        </button>
                      </span>
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">単価:</span>
                  <span>¥{(product.unitPrice || Math.round(product.price / (product.quantity || 1))).toLocaleString()}</span>
                </div>
                <div className="info-row">
                  <span className="label">購入日:</span>
                  <span>{product.purchaseDate.toLocaleDateString('ja-JP')}</span>
                </div>
                <div className="info-row">
                  <span className="label">カテゴリ:</span>
                  <span>{product.category}</span>
                </div>
                <div className="info-row">
                  <span className="label">保管場所:</span>
                  <span>
                    {[product.storage.level1, product.storage.level2, product.storage.level3]
                      .filter(Boolean)
                      .join(' > ')}
                  </span>
                </div>
                {product.usage && product.usage.length > 0 && (
                  <div className="info-row">
                    <span className="label">利用場所:</span>
                    <span className="usage-info">
                      {product.usage.map((usage, index) => (
                        <React.Fragment key={index}>
                          {usage.location && <span className="usage-tag">📍 {usage.location}</span>}
                          {usage.purpose && <span className="usage-tag">🎯 {usage.purpose}</span>}
                          {usage.device && <span className="usage-tag">📱 {usage.device}</span>}
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                )}
                {product.memo && (
                  <div className="info-row">
                    <span className="label">メモ:</span>
                    <span>{product.memo}</span>
                  </div>
                )}
              </div>
              
              <div className="product-actions">
                {product.remainingQuantity > 0 && (
                  <button 
                    onClick={() => handleQuantityDecrease(product)} 
                    className="use-btn"
                    title="在庫を1つ減らす"
                  >
                    📦 使用(-1)
                  </button>
                )}
                <button onClick={() => setEditingProduct(product)} className="edit-btn">
                  編集
                </button>
                <button 
                  onClick={() => {
                    console.log('削除ボタンクリック:', { 
                      商品名: product.itemName, 
                      ID: product.id,
                      IDの型: typeof product.id 
                    });
                    if (product.id) {
                      onDelete(product.id);
                    } else {
                      console.error('商品IDが存在しません');
                    }
                  }} 
                  className="delete-btn"
                >
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {editingProduct && (
        <ProductEdit
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={onProductUpdated}
        />
      )}
      
      {viewingEmail && (
        <EmailViewer
          product={viewingEmail}
          onClose={() => setViewingEmail(null)}
        />
      )}
    </>
  );
};