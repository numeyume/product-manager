/**
 * 在庫確認ブックマークレット
 * Amazon/楽天/メルカリの商品ページで在庫をチェック
 */
(function() {
  'use strict';
  
  // アプリのベースURL（実際のデプロイ先に変更）
  const APP_BASE_URL = 'https://yourapp.netlify.app'; // TODO: 実際のURLに変更
  
  // 商品情報を抽出
  function extractProductInfo() {
    const hostname = window.location.hostname;
    let productName = '';
    let price = '';
    let site = '';
    
    if (hostname.includes('amazon')) {
      site = 'Amazon';
      // Amazon商品名取得
      productName = document.querySelector('#productTitle')?.textContent?.trim() ||
                   document.querySelector('.product-title')?.textContent?.trim() ||
                   document.title.replace(' | Amazon', '');
      
      // Amazon価格取得
      price = document.querySelector('.a-price-whole')?.textContent?.trim() ||
             document.querySelector('.a-offscreen')?.textContent?.trim();
             
    } else if (hostname.includes('rakuten')) {
      site = '楽天';
      // 楽天商品名取得
      productName = document.querySelector('.item_name')?.textContent?.trim() ||
                   document.querySelector('h1')?.textContent?.trim() ||
                   document.title.replace(' | 楽天市場', '');
      
      // 楽天価格取得
      price = document.querySelector('.price')?.textContent?.trim() ||
             document.querySelector('.item_price')?.textContent?.trim();
             
    } else if (hostname.includes('mercari')) {
      site = 'メルカリ';
      // メルカリ商品名取得
      productName = document.querySelector('[data-testid="name"]')?.textContent?.trim() ||
                   document.querySelector('.item-name')?.textContent?.trim() ||
                   document.title.replace(' | メルカリ', '');
      
      // メルカリ価格取得
      price = document.querySelector('[data-testid="price"]')?.textContent?.trim() ||
             document.querySelector('.item-price')?.textContent?.trim();
    } else {
      // その他のサイト
      site = 'その他';
      productName = document.title;
    }
    
    return {
      name: productName,
      price: price,
      site: site,
      url: window.location.href
    };
  }
  
  // 在庫確認ポップアップを表示
  function showStockChecker() {
    const product = extractProductInfo();
    
    if (!product.name) {
      alert('商品情報を取得できませんでした。');
      return;
    }
    
    // ローディング表示
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'stock-checker-loading';
    loadingDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fff;
      border: 2px solid #007bff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    loadingDiv.innerHTML = `
      <div style="text-align: center;">
        <div style="margin-bottom: 10px;">📦 在庫確認中...</div>
        <div style="color: #666; font-size: 12px;">${product.name.substring(0, 50)}${product.name.length > 50 ? '...' : ''}</div>
      </div>
    `;
    document.body.appendChild(loadingDiv);
    
    // LocalStorageから在庫情報を取得（簡易版）
    const checkStock = () => {
      try {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const similarProducts = products.filter(p => {
          return p.itemName.toLowerCase().includes(product.name.toLowerCase().substring(0, 10)) ||
                 product.name.toLowerCase().includes(p.itemName.toLowerCase().substring(0, 10));
        });
        
        showResult(similarProducts, product);
      } catch (error) {
        showResult([], product);
      }
    };
    
    // 結果表示
    const showResult = (similarProducts, productInfo) => {
      // ローディングを削除
      const loading = document.getElementById('stock-checker-loading');
      if (loading) loading.remove();
      
      // 結果表示
      const resultDiv = document.createElement('div');
      resultDiv.id = 'stock-checker-result';
      resultDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff;
        border: 2px solid ${similarProducts.length > 0 ? '#ff6b6b' : '#28a745'};
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        max-width: 350px;
        max-height: 400px;
        overflow-y: auto;
      `;
      
      let content = '';
      
      if (similarProducts.length > 0) {
        const inStockProducts = similarProducts.filter(p => (p.remainingQuantity || 0) > 0);
        
        if (inStockProducts.length > 0) {
          content = `
            <div style="color: #ff6b6b; font-weight: bold; margin-bottom: 10px;">
              🚨 在庫あり商品を検出！
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
              ${productInfo.name.substring(0, 40)}${productInfo.name.length > 40 ? '...' : ''}
            </div>
          `;
          
          inStockProducts.forEach((product, index) => {
            content += `
              <div style="background: #fff3cd; padding: 8px; margin: 8px 0; border-radius: 4px; border-left: 3px solid #ffc107;">
                <div style="font-weight: 600; font-size: 12px;">${product.itemName.substring(0, 30)}${product.itemName.length > 30 ? '...' : ''}</div>
                <div style="font-size: 11px; color: #666;">残り${product.remainingQuantity}個 | ¥${product.price?.toLocaleString()}</div>
              </div>
            `;
          });
          
          content += `
            <div style="margin-top: 15px; display: flex; gap: 8px;">
              <button onclick="document.getElementById('stock-checker-result').remove();" 
                style="flex: 1; padding: 8px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                閉じる
              </button>
              <button onclick="window.open('${APP_BASE_URL}', '_blank'); document.getElementById('stock-checker-result').remove();" 
                style="flex: 1; padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                アプリで確認
              </button>
            </div>
          `;
        } else {
          content = `
            <div style="color: #ffc107; font-weight: bold; margin-bottom: 10px;">
              ⚠️ 類似商品あり（在庫なし）
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
              ${productInfo.name.substring(0, 40)}${productInfo.name.length > 40 ? '...' : ''}
            </div>
            <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 12px;">
              類似商品はありますが在庫切れです。購入しても重複にはなりません。
            </div>
            <div style="margin-top: 15px; display: flex; gap: 8px;">
              <button onclick="document.getElementById('stock-checker-result').remove();" 
                style="flex: 1; padding: 8px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                閉じる
              </button>
              <button onclick="window.open('${APP_BASE_URL}', '_blank'); document.getElementById('stock-checker-result').remove();" 
                style="flex: 1; padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                アプリで確認
              </button>
            </div>
          `;
        }
      } else {
        content = `
          <div style="color: #28a745; font-weight: bold; margin-bottom: 10px;">
            ✅ 在庫なし - 安心して購入！
          </div>
          <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
            ${productInfo.name.substring(0, 40)}${productInfo.name.length > 40 ? '...' : ''}
          </div>
          <div style="background: #d4edda; padding: 8px; border-radius: 4px; font-size: 12px; color: #155724;">
            類似商品は見つかりませんでした。重複の心配なく購入できます。
          </div>
          <div style="margin-top: 15px; display: flex; gap: 8px;">
            <button onclick="document.getElementById('stock-checker-result').remove();" 
              style="flex: 1; padding: 8px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              閉じる
            </button>
            <button onclick="window.open('${APP_BASE_URL}?add=${encodeURIComponent(JSON.stringify(productInfo))}', '_blank'); document.getElementById('stock-checker-result').remove();" 
              style="flex: 1; padding: 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              購入後登録
            </button>
          </div>
        `;
      }
      
      resultDiv.innerHTML = content;
      document.body.appendChild(resultDiv);
      
      // 5秒後に自動で閉じる（在庫なしの場合のみ）
      if (similarProducts.length === 0) {
        setTimeout(() => {
          const result = document.getElementById('stock-checker-result');
          if (result) result.remove();
        }, 5000);
      }
    };
    
    // 在庫チェック実行
    setTimeout(checkStock, 500);
  }
  
  // 既存の結果がある場合は削除
  const existing = document.getElementById('stock-checker-result') || document.getElementById('stock-checker-loading');
  if (existing) existing.remove();
  
  // 在庫確認開始
  showStockChecker();
})();