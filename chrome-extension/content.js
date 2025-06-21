const SITES = {
  AMAZON: 'Amazon',
  RAKUTEN: '楽天',
  MERCARI: 'メルカリ'
};

function detectSite() {
  const hostname = window.location.hostname;
  if (hostname.includes('amazon.co.jp')) return SITES.AMAZON;
  if (hostname.includes('rakuten.co.jp')) return SITES.RAKUTEN;
  if (hostname.includes('mercari.com')) return SITES.MERCARI;
  return null;
}

// 注文完了ページかどうかを判定（Gmail連携があるため、この機能は削除）
function isOrderCompletePage() {
  return false; // 常にfalseを返して購入完了ページでの処理を無効化
}

function checkForDuplicates() {
  const site = detectSite();
  if (!site) return;
  
  let productName = '';
  
  if (site === SITES.AMAZON && window.location.href.includes('/dp/')) {
    productName = document.querySelector('#productTitle')?.textContent?.trim() || '';
  } else if (site === SITES.RAKUTEN && window.location.href.includes('/item/')) {
    productName = document.querySelector('.item_name')?.textContent?.trim() || '';
  } else if (site === SITES.MERCARI && window.location.href.includes('/items/')) {
    productName = document.querySelector('[data-testid="item-name"]')?.textContent?.trim() || '';
  }
  
  if (productName) {
    chrome.runtime.sendMessage(
      { action: 'checkDuplicate', productName },
      response => {
        if (response.success && response.duplicates && response.duplicates.length > 0) {
          showDuplicateWarning(response.duplicates);
        }
      }
    );
  }
}

function showDuplicateWarning(duplicates) {
  // 既存の警告を削除
  const existingWarning = document.getElementById('duplicate-warning');
  if (existingWarning) existingWarning.remove();
  
  const warningDiv = document.createElement('div');
  warningDiv.id = 'duplicate-warning';
  warningDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff6b6b;
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      max-width: 350px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">⚠️ 類似商品を購入済みです</h3>
      <p style="margin: 0 0 10px 0; font-size: 14px;">以下の商品を既に購入しています：</p>
      <ul style="margin: 0 0 10px 0; padding-left: 20px; font-size: 14px;">
        ${duplicates.map(item => {
          const itemName = item.itemName || item.fields?.itemName?.stringValue || '商品名不明';
          const purchaseDate = item.purchaseDate || item.fields?.purchaseDate?.timestampValue;
          const dateStr = purchaseDate ? new Date(purchaseDate).toLocaleDateString('ja-JP') : '日付不明';
          const storage = item.storage || item.fields?.storage?.mapValue?.fields;
          const storageStr = storage ? [
            storage.level1?.stringValue || storage.level1,
            storage.level2?.stringValue || storage.level2,
            storage.level3?.stringValue || storage.level3
          ].filter(Boolean).join(' > ') : '';
          
          return `
            <li style="margin-bottom: 8px;">
              <strong>${itemName}</strong><br>
              購入日: ${dateStr}${storageStr ? '<br>保管場所: ' + storageStr : ''}
            </li>
          `;
        }).join('')}
      </ul>
      <button onclick="this.parentElement.parentElement.remove()" style="
        margin-top: 10px;
        background: white;
        color: #ff6b6b;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        width: 100%;
      ">閉じる</button>
    </div>
  `;
  document.body.appendChild(warningDiv);
}


// 商品ページ閲覧時のみ重複チェックを実行
if (!isOrderCompletePage()) {
  setTimeout(checkForDuplicates, 1000);
  
  // ページ遷移時にも再チェック
  const observer = new MutationObserver(() => {
    if (window.location.href !== observer.lastUrl) {
      observer.lastUrl = window.location.href;
      setTimeout(checkForDuplicates, 1000);
    }
  });
  observer.lastUrl = window.location.href;
  observer.observe(document.body, { childList: true, subtree: true });
}