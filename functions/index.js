const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

admin.initializeApp();

const db = admin.firestore();
const gmail = google.gmail('v1');

// Gmail APIの認証設定
const getGmailAuth = async (accessToken) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
};

// 定期的にメールをチェックする関数（Cloud Schedulerで実行）
exports.checkOrderEmails = functions.pubsub.schedule('every 30 minutes').onRun(async (context) => {
  try {
    // 全ユーザーの処理
    const usersSnapshot = await db.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      if (userData.gmailAccessToken) {
        await processUserEmails(userId, userData.gmailAccessToken);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking emails:', error);
    throw error;
  }
});

// ユーザーのメールを処理
async function processUserEmails(userId, accessToken) {
  try {
    const auth = await getGmailAuth(accessToken);
    
    // 注文確認メールを検索
    const query = 'subject:(注文確認 OR ご注文 OR 購入完了 OR 発送のお知らせ) newer_than:1d';
    
    const response = await gmail.users.messages.list({
      auth,
      userId: 'me',
      q: query,
      maxResults: 10
    });
    
    if (!response.data.messages) {
      return;
    }
    
    for (const message of response.data.messages) {
      const fullMessage = await gmail.users.messages.get({
        auth,
        userId: 'me',
        id: message.id
      });
      
      const productInfo = await parseOrderEmail(fullMessage.data);
      
      if (productInfo) {
        await saveProductToFirestore(userId, productInfo);
      }
    }
  } catch (error) {
    console.error(`Error processing emails for user ${userId}:`, error);
  }
}

// メールから商品情報を抽出
async function parseOrderEmail(emailData) {
  const headers = emailData.payload.headers;
  const from = headers.find(h => h.name === 'From')?.value || '';
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  const date = headers.find(h => h.name === 'Date')?.value || '';
  
  // メール本文を取得
  const body = getEmailBody(emailData);
  
  // 販売元を判定
  let site = '';
  if (from.includes('amazon.co.jp')) {
    site = 'Amazon';
  } else if (from.includes('rakuten.co.jp')) {
    site = '楽天';
  } else if (from.includes('mercari.com')) {
    site = 'メルカリ';
  } else {
    return null; // 対象外のメール
  }
  
  // サイトごとの解析
  let productInfo = null;
  
  switch (site) {
    case 'Amazon':
      productInfo = parseAmazonEmail(body, subject);
      break;
    case '楽天':
      productInfo = parseRakutenEmail(body, subject);
      break;
    case 'メルカリ':
      productInfo = parseMercariEmail(body, subject);
      break;
  }
  
  if (productInfo) {
    productInfo.site = site;
    productInfo.purchaseDate = new Date(date);
    productInfo.source = 'gmail';
    productInfo.createdAt = new Date();
  }
  
  return productInfo;
}

// メール本文を取得
function getEmailBody(emailData) {
  let body = '';
  
  const extractBody = (part) => {
    if (part.body?.data) {
      body += Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
    if (part.parts) {
      part.parts.forEach(extractBody);
    }
  };
  
  extractBody(emailData.payload);
  return body;
}

// Amazon注文メールの解析
function parseAmazonEmail(body, subject) {
  const productInfo = {
    itemName: '',
    price: 0,
    url: ''
  };
  
  // 商品名の抽出（正規表現は実際のメール形式に合わせて調整必要）
  const nameMatch = body.match(/商品名[：:]\s*(.+?)[\r\n]/);
  if (nameMatch) {
    productInfo.itemName = nameMatch[1].trim();
  }
  
  // 価格の抽出
  const priceMatch = body.match(/￥\s*([\d,]+)/);
  if (priceMatch) {
    productInfo.price = parseInt(priceMatch[1].replace(/,/g, ''));
  }
  
  // URLの抽出
  const urlMatch = body.match(/https:\/\/www\.amazon\.co\.jp\/[^\s]+/);
  if (urlMatch) {
    productInfo.url = urlMatch[0];
  }
  
  return productInfo.itemName ? productInfo : null;
}

// 楽天注文メールの解析
function parseRakutenEmail(body, subject) {
  const productInfo = {
    itemName: '',
    price: 0,
    url: ''
  };
  
  // 商品名の抽出
  const nameMatch = body.match(/【商品名】\s*(.+?)[\r\n]/);
  if (nameMatch) {
    productInfo.itemName = nameMatch[1].trim();
  }
  
  // 価格の抽出
  const priceMatch = body.match(/価格[：:]\s*([\d,]+)円/);
  if (priceMatch) {
    productInfo.price = parseInt(priceMatch[1].replace(/,/g, ''));
  }
  
  return productInfo.itemName ? productInfo : null;
}

// メルカリ購入メールの解析
function parseMercariEmail(body, subject) {
  const productInfo = {
    itemName: '',
    price: 0,
    url: ''
  };
  
  // 商品名の抽出（件名から）
  if (subject.includes('購入完了')) {
    const nameMatch = subject.match(/「(.+?)」/);
    if (nameMatch) {
      productInfo.itemName = nameMatch[1];
    }
  }
  
  // 価格の抽出
  const priceMatch = body.match(/¥([\d,]+)/);
  if (priceMatch) {
    productInfo.price = parseInt(priceMatch[1].replace(/,/g, ''));
  }
  
  return productInfo.itemName ? productInfo : null;
}

// Firestoreに商品情報を保存
async function saveProductToFirestore(userId, productInfo) {
  try {
    // 重複チェック
    const existingQuery = await db.collection(`users/${userId}/items`)
      .where('itemName', '==', productInfo.itemName)
      .where('purchaseDate', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000)) // 24時間以内
      .get();
    
    if (!existingQuery.empty) {
      console.log('Duplicate item found, skipping:', productInfo.itemName);
      return;
    }
    
    // カテゴリ分類
    productInfo.category = categorizeProduct(productInfo.itemName);
    
    // 保存
    await db.collection(`users/${userId}/items`).add(productInfo);
    console.log('Product saved:', productInfo.itemName);
  } catch (error) {
    console.error('Error saving product:', error);
  }
}

// カテゴリ分類関数
function categorizeProduct(productName) {
  const categories = {
    'モバイルバッテリー': ['モバイルバッテリー', 'power bank', 'powerbank', '充電器'],
    'ケーブル': ['ケーブル', 'cable', 'USB', 'HDMI', 'Lightning', 'Type-C'],
    'イヤホン': ['イヤホン', 'ヘッドホン', 'earphone', 'headphone', 'AirPods', 'イヤフォン'],
    '充電器': ['充電器', 'charger', 'アダプタ', 'adapter', 'ACアダプター'],
    'ケース': ['ケース', 'case', 'カバー', 'cover', 'スマホケース'],
    'マウス': ['マウス', 'mouse', 'ワイヤレスマウス'],
    'キーボード': ['キーボード', 'keyboard', 'ワイヤレスキーボード'],
    'モニター': ['モニター', 'monitor', 'ディスプレイ', 'display', 'スクリーン'],
    '書籍': ['本', '書籍', 'book', '雑誌', 'magazine', 'Kindle', '電子書籍'],
    '文房具': ['ペン', 'ノート', '文房具', 'pen', 'notebook', '筆記用具'],
    '家電': ['家電', '電化製品', '掃除機', '冷蔵庫', 'エアコン', '洗濯機'],
    '衣類': ['服', 'シャツ', 'パンツ', 'ジャケット', 'コート', '衣類', 'Tシャツ'],
    '食品': ['食品', '食べ物', 'お菓子', '飲み物', 'ドリンク', 'コーヒー', 'お茶']
  };
  
  const lowerName = productName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  return 'その他';
}

// Gmail認証トークンを保存するHTTP関数
exports.saveGmailToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '認証が必要です');
  }
  
  const userId = context.auth.uid;
  const { accessToken } = data;
  
  try {
    await db.collection('users').doc(userId).set({
      gmailAccessToken: accessToken,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving Gmail token:', error);
    throw new functions.https.HttpsError('internal', 'トークンの保存に失敗しました');
  }
});