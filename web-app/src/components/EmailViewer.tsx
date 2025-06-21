import React from 'react';
import { Product } from '../types/Product';
import './EmailViewer.css';

interface EmailViewerProps {
  product: Product;
  onClose: () => void;
}

export const EmailViewer: React.FC<EmailViewerProps> = ({ product, onClose }) => {
  if (!product.originalEmail) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="email-viewer" onClick={e => e.stopPropagation()}>
          <h2>📧 元メール情報</h2>
          <div className="no-email">
            <p>この商品には元のメール情報が保存されていません。</p>
            <p>Gmail連携で自動取得された商品のみメール情報が表示されます。</p>
          </div>
          <div className="email-actions">
            <button onClick={onClose} className="close-btn">閉じる</button>
          </div>
        </div>
      </div>
    );
  }

  const { originalEmail } = product;

  const formatDate = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatEmailBody = (body: string) => {
    // HTMLタグを除去してプレーンテキストに変換
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = body;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    // 長すぎる場合は省略
    if (plainText.length > 2000) {
      return plainText.substring(0, 2000) + '...（省略）';
    }
    
    return plainText;
  };

  const getSenderDomain = (from: string) => {
    const match = from.match(/@([^>]+)/);
    return match ? match[1] : from;
  };

  const getSenderIcon = (from: string) => {
    const domain = getSenderDomain(from).toLowerCase();
    if (domain.includes('amazon')) return '🛒';
    if (domain.includes('rakuten')) return '🛍️';
    if (domain.includes('mercari')) return '💰';
    return '📧';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="email-viewer" onClick={e => e.stopPropagation()}>
        <div className="email-header">
          <h2>📧 元メール情報</h2>
          <div className="product-info-mini">
            <span className="product-name">{product.itemName}</span>
            <span className="product-site">{getSenderIcon(originalEmail.from)} {product.site}</span>
          </div>
        </div>

        <div className="email-meta">
          <div className="meta-row">
            <span className="meta-label">件名:</span>
            <span className="meta-value">{originalEmail.subject}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">送信者:</span>
            <span className="meta-value">{originalEmail.from}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">受信日時:</span>
            <span className="meta-value">{formatDate(originalEmail.date)}</span>
          </div>
          {originalEmail.messageId && (
            <div className="meta-row">
              <span className="meta-label">メッセージID:</span>
              <span className="meta-value message-id">{originalEmail.messageId}</span>
            </div>
          )}
        </div>

        <div className="email-body">
          <h3>メール本文</h3>
          <div className="email-content">
            <pre>{formatEmailBody(originalEmail.body)}</pre>
          </div>
        </div>

        <div className="email-actions">
          <button onClick={onClose} className="close-btn">閉じる</button>
        </div>
      </div>
    </div>
  );
};