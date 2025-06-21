import { Product, Storage, Usage } from '../types/Product';

export interface TestProduct {
  itemName: string;
  site: 'Amazon' | '楽天' | 'メルカリ' | '仕入れ先' | 'その他';
  price: number;
  quantity: number;
  category: string;
  url: string;
  memo?: string;
}

// テスト用商品データ
const testProducts: TestProduct[] = [
  {
    itemName: 'Anker PowerCore 10000 モバイルバッテリー',
    site: 'Amazon',
    price: 2990,
    quantity: 1,
    category: 'モバイルバッテリー',
    url: 'https://www.amazon.co.jp/dp/B01234567',
    memo: '旅行用に購入'
  },
  {
    itemName: 'Apple Lightning - USBケーブル',
    site: 'Amazon', 
    price: 4960,
    quantity: 2,
    category: 'ケーブル',
    url: 'https://www.amazon.co.jp/dp/B09876543',
    memo: 'iPhone用（2本セット）'
  },
  {
    itemName: 'ソニー ワイヤレスイヤホン WF-1000XM4',
    site: '楽天',
    price: 24800,
    quantity: 1,
    category: 'イヤホン',
    url: 'https://www.rakuten.co.jp/item/12345',
    memo: '通勤用'
  },
  {
    itemName: 'ロジクール ワイヤレスマウス M705m',
    site: '楽天',
    price: 4980,
    quantity: 1,
    category: 'マウス',
    url: 'https://www.rakuten.co.jp/item/67890',
    memo: '仕事用'
  },
  {
    itemName: 'キーボード メカニカル 青軸',
    site: 'メルカリ',
    price: 8500,
    quantity: 1,
    category: 'キーボード',
    url: 'https://jp.mercari.com/item/m98765',
    memo: 'ゲーミング用'
  },
  {
    itemName: 'Dell 24インチ モニター S2421DS',
    site: 'Amazon',
    price: 19800,
    quantity: 1,
    category: 'モニター',
    url: 'https://www.amazon.co.jp/dp/B11111111',
    memo: 'サブモニター'
  },
  {
    itemName: 'JavaScript: The Good Parts',
    site: 'Amazon',
    price: 2640,
    quantity: 1,
    category: '書籍',
    url: 'https://www.amazon.co.jp/dp/B22222222',
    memo: '技術書'
  },
  {
    itemName: 'コクヨ ノート Campus B5',
    site: '楽天',
    price: 540,
    quantity: 3,
    category: '文房具',
    url: 'https://www.rakuten.co.jp/item/33333',
    memo: '会議用（3冊セット）'
  },
  {
    itemName: 'パナソニック 充電器 BQ-CC85',
    site: 'メルカリ',
    price: 1200,
    quantity: 1,
    category: '充電器',
    url: 'https://jp.mercari.com/item/m55555',
    memo: '乾電池用'
  },
  {
    itemName: 'スマホケース iPhone 14 Pro',
    site: 'Amazon',
    price: 2960,
    quantity: 2,
    category: 'ケース',
    url: 'https://www.amazon.co.jp/dp/B33333333',
    memo: '透明ケース（2個セット）'
  }
];

// ランダムな保管場所を生成
const generateRandomStorage = (): Storage => {
  const level1Options = ['押入れ', 'クローゼット', '書斎', 'リビング', '寝室'];
  const level2Options = ['上段', '下段', '棚', '引き出し', '机の上'];
  const level3Options = ['ボックスA', 'ボックスB', '左側', '右側', '奥'];
  
  return {
    level1: level1Options[Math.floor(Math.random() * level1Options.length)],
    level2: level2Options[Math.floor(Math.random() * level2Options.length)],
    level3: level3Options[Math.floor(Math.random() * level3Options.length)]
  };
};

// ランダムな利用場所を生成
const generateRandomUsage = (itemName: string): Usage[] => {
  // 50%の確率で利用場所情報を追加しない
  if (Math.random() < 0.5) return [];

  const usagePatterns = {
    'ケーブル': [
      { location: 'デスク', purpose: '充電用', device: 'iPhone' },
      { location: 'リビング', purpose: 'データ転送', device: 'MacBook' },
      { location: '寝室', purpose: '予備', device: 'iPad' }
    ],
    'バッテリー': [
      { location: '外出時', purpose: '緊急充電', device: 'スマホ' },
      { location: 'カバン', purpose: '旅行用', device: '各種機器' }
    ],
    'イヤホン': [
      { location: '通勤', purpose: '音楽鑑賞', device: 'iPhone' },
      { location: 'リビング', purpose: 'TV視聴', device: 'テレビ' }
    ],
    'マウス': [
      { location: 'デスク', purpose: '作業用', device: 'PC' },
      { location: '書斎', purpose: 'ゲーム用', device: 'ゲーミングPC' }
    ],
    'その他': [
      { location: 'デスク', purpose: '作業用', device: '' },
      { location: 'リビング', purpose: '日常使用', device: '' }
    ]
  };

  let category = 'その他';
  for (const [cat, patterns] of Object.entries(usagePatterns)) {
    if (itemName.toLowerCase().includes(cat.toLowerCase())) {
      category = cat;
      break;
    }
  }

  const patterns = usagePatterns[category as keyof typeof usagePatterns];
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  // 30%の確率で複数の利用場所を生成
  if (Math.random() < 0.3 && patterns.length > 1) {
    const shuffled = [...patterns].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(2, patterns.length));
  }
  
  return [selectedPattern];
};

// ランダムな日付を生成（過去1年間）
const generateRandomDate = (daysAgo: number = 365): Date => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return date;
};

// テスト用商品データを生成
export const generateTestProducts = (count: number = 5): Omit<Product, 'id'>[] => {
  const selectedProducts = testProducts
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, testProducts.length));
  
  return selectedProducts.map(product => {
    const emailDate = generateRandomDate();
    const mockEmail = generateMockEmail(product, product.site);
    
    return {
      ...product,
      remainingQuantity: product.quantity,
      unitPrice: Math.round(product.price / product.quantity),
      storage: generateRandomStorage(),
      usage: generateRandomUsage(product.itemName),
      source: 'gmail' as const,
      purchaseDate: emailDate,
      originalEmail: {
        subject: `ご注文確認 - ${product.itemName}`,
        body: mockEmail,
        date: emailDate,
        from: getEmailSender(product.site),
        messageId: `<${Date.now()}-${Math.random().toString(36).substr(2, 9)}@${getEmailDomain(product.site)}>`
      },
      createdAt: new Date()
    };
  });
};

// 類似商品のテストデータ（重複チェック用）
export const getSimilarProducts = (productName: string): TestProduct[] => {
  const similarityMap: Record<string, string[]> = {
    'モバイルバッテリー': [
      'Anker PowerCore 20000',
      'RAVPower 26800mAh',
      'cheero Power Plus 3'
    ],
    'ケーブル': [
      'USB-C - Lightningケーブル',
      'USB-A - USB-Cケーブル',
      'HDMI ケーブル 2m'
    ],
    'イヤホン': [
      'Apple AirPods Pro',
      'Bose QuietComfort Earbuds',
      'Audio-Technica ATH-CKR70'
    ],
    'マウス': [
      'ロジクール MX Master 3',
      'エレコム ワイヤレスマウス',
      'Microsoft Surface Mobile Mouse'
    ]
  };
  
  // 商品名からカテゴリを推測
  let category = '';
  for (const [cat, keywords] of Object.entries({
    'モバイルバッテリー': ['モバイルバッテリー', 'powercore', 'power bank'],
    'ケーブル': ['ケーブル', 'cable', 'usb', 'lightning'],
    'イヤホン': ['イヤホン', 'ヘッドホン', 'earphone', 'airpods'],
    'マウス': ['マウス', 'mouse']
  })) {
    if (keywords.some(keyword => productName.toLowerCase().includes(keyword.toLowerCase()))) {
      category = cat;
      break;
    }
  }
  
  const similarNames = similarityMap[category] || [];
  
  return similarNames.map((name, index) => {
    const quantity = Math.floor(Math.random() * 3) + 1;
    const price = Math.floor(Math.random() * 20000) + 1000;
    return {
      itemName: name,
      site: ['Amazon', '楽天', 'メルカリ'][index % 3] as 'Amazon' | '楽天' | 'メルカリ' | '仕入れ先' | 'その他',
      price: price,
      quantity: quantity,
      category: category || 'その他',
      url: `https://example.com/test-${index}`,
      memo: `テスト商品 ${index + 1}`
    };
  });
};

// メール本文のサンプル（Gmail連携テスト用）
export const generateMockEmail = (product: TestProduct, site: 'Amazon' | '楽天' | 'メルカリ' | '仕入れ先' | 'その他') => {
  const templates = {
    Amazon: `
Amazon.co.jp ご注文の確認

○○ 様

ご注文ありがとうございます。

■注文内容
商品名: ${product.itemName}
数量: ${product.quantity}個
価格: ¥${product.price.toLocaleString()}（単価: ¥${Math.round(product.price / product.quantity).toLocaleString()}）
注文日: ${new Date().toLocaleDateString('ja-JP')}

商品の詳細: ${product.url}

引き続きAmazon.co.jpをご利用ください。
    `,
    
    楽天: `
【楽天市場】ご注文確認メール

${product.itemName}のご注文ありがとうございました。

【商品情報】
商品名：${product.itemName}
数量：${product.quantity}個
価格：${product.price.toLocaleString()}円（単価：${Math.round(product.price / product.quantity).toLocaleString()}円）
注文日：${new Date().toLocaleDateString('ja-JP')}

ご注文商品の詳細は以下をご確認ください。
    `,
    
    メルカリ: `
【メルカリ】購入完了のお知らせ

「${product.itemName}」を購入しました。

数量：${product.quantity}個
購入金額：¥${product.price.toLocaleString()}（単価：¥${Math.round(product.price / product.quantity).toLocaleString()}）
購入日：${new Date().toLocaleDateString('ja-JP')}

取引を開始してください。
    `,
    
    仕入れ先: `
【仕入れ先】注文確認書

${product.itemName}のご注文を承りました。

注文内容：
商品名：${product.itemName}
数量：${product.quantity}個
金額：¥${product.price.toLocaleString()}（単価：¥${Math.round(product.price / product.quantity).toLocaleString()}）
注文日：${new Date().toLocaleDateString('ja-JP')}

納期等につきましては別途ご連絡いたします。
    `,
    
    その他: `
注文確認

${product.itemName}のご注文ありがとうございます。

数量：${product.quantity}個
金額：¥${product.price.toLocaleString()}
    `
  };
  
  return templates[site as keyof typeof templates] || templates['その他'];
};

// メール送信者情報を取得
const getEmailSender = (site: 'Amazon' | '楽天' | 'メルカリ' | '仕入れ先' | 'その他'): string => {
  const senders = {
    Amazon: 'auto-confirm@amazon.co.jp',
    楽天: 'order@rakuten.co.jp', 
    メルカリ: 'no-reply@mercari.com',
    仕入れ先: 'order@supplier.co.jp',
    その他: 'noreply@example.com'
  };
  return senders[site as keyof typeof senders] || senders['その他'];
};

// メールドメインを取得
const getEmailDomain = (site: 'Amazon' | '楽天' | 'メルカリ' | '仕入れ先' | 'その他'): string => {
  const domains = {
    Amazon: 'amazon.co.jp',
    楽天: 'rakuten.co.jp',
    メルカリ: 'mercari.com',
    仕入れ先: 'supplier.co.jp',
    その他: 'example.com'
  };
  return domains[site as keyof typeof domains] || domains['その他'];
};

// デモ用のユーザーデータ
export const demoUserData = {
  email: 'demo@example.com',
  displayName: 'デモユーザー',
  photoURL: 'https://via.placeholder.com/100'
};