import React, { useState } from 'react';
import { Product } from '../types/Product';
import { ProductEdit } from './ProductEdit';
import './ProductList.css';

interface ProductListProps {
  products: Product[];
  onDelete: (productId: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onDelete }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
                  <span className="site-badge">
                    {getSiteIcon(product.site)} {product.site}
                  </span>
                  <span className="source-badge">
                    {getSourceLabel(product.source)}
                  </span>
                </div>
              </div>
              
              <div className="product-info">
                <div className="info-row">
                  <span className="label">価格:</span>
                  <span>¥{product.price.toLocaleString()}</span>
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
                {product.memo && (
                  <div className="info-row">
                    <span className="label">メモ:</span>
                    <span>{product.memo}</span>
                  </div>
                )}
              </div>
              
              <div className="product-actions">
                <a href={product.url} target="_blank" rel="noopener noreferrer" className="link-btn">
                  商品ページを開く
                </a>
                <button onClick={() => setEditingProduct(product)} className="edit-btn">
                  編集
                </button>
                <button onClick={() => product.id && onDelete(product.id)} className="delete-btn">
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
        />
      )}
    </>
  );
};