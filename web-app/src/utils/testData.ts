import { Product, Storage } from '../types/Product';

export interface TestProduct {
  itemName: string;
  site: 'Amazon' | '楽天' | 'メルカリ';
  price: number;
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
    category: 'モバイルバッテリー',
    url: 'https://www.amazon.co.jp/dp/B01234567',
    memo: '旅行用に購入'
  },
  {
    itemName: 'Apple Lightning - USBケーブル',
    site: 'Amazon', 
    price: 2480,
    category: 'ケーブル',
    url: 'https://www.amazon.co.jp/dp/B09876543',
    memo: 'iPhone用'
  },
  {
    itemName: 'ソニー ワイヤレスイヤホン WF-1000XM4',
    site: '楽天',
    price: 24800,
    category: 'イヤホン',
    url: 'https://www.rakuten.co.jp/item/12345',
    memo: '通勤用'
  },
  {
    itemName: 'ロジクール ワイヤレスマウス M705m',
    site: '楽天',
    price: 4980,
    category: 'マウス',
    url: 'https://www.rakuten.co.jp/item/67890',
    memo: '仕事用'
  },
  {
    itemName: 'キーボード メカニカル 青軸',
    site: 'メルカリ',
    price: 8500,
    category: 'キーボード',
    url: 'https://jp.mercari.com/item/m98765',
    memo: 'ゲーミング用'
  },
  {
    itemName: 'Dell 24インチ モニター S2421DS',
    site: 'Amazon',
    price: 19800,
    category: 'モニター',
    url: 'https://www.amazon.co.jp/dp/B11111111',
    memo: 'サブモニター'
  },
  {
    itemName: 'JavaScript: The Good Parts',
    site: 'Amazon',
    price: 2640,
    category: '書籍',
    url: 'https://www.amazon.co.jp/dp/B22222222',
    memo: '技術書'
  },
  {
    itemName: 'コクヨ ノート Campus B5',
    site: '楽天',
    price: 180,
    category: '文房具',
    url: 'https://www.rakuten.co.jp/item/33333',
    memo: '会議用'
  },
  {
    itemName: 'パナソニック 充電器 BQ-CC85',
    site: 'メルカリ',
    price: 1200,
    category: '充電器',
    url: 'https://jp.mercari.com/item/m55555',
    memo: '乾電池用'
  },
  {
    itemName: 'スマホケース iPhone 14 Pro',
    site: 'Amazon',
    price: 1480,
    category: 'ケース',
    url: 'https://www.amazon.co.jp/dp/B33333333',
    memo: '透明ケース'
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
  
  return selectedProducts.map(product => ({
    ...product,
    storage: generateRandomStorage(),
    source: 'gmail' as const,
    purchaseDate: generateRandomDate(),
    createdAt: new Date()
  }));
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
  
  return similarNames.map((name, index) => ({
    itemName: name,
    site: ['Amazon', '楽天', 'メルカリ'][index % 3] as 'Amazon' | '楽天' | 'メルカリ',
    price: Math.floor(Math.random() * 20000) + 1000,
    category: category || 'その他',
    url: `https://example.com/test-${index}`,
    memo: `テスト商品 ${index + 1}`
  }));
};

// メール本文のサンプル（Gmail連携テスト用）
export const generateMockEmail = (product: TestProduct, site: 'Amazon' | '楽天' | 'メルカリ') => {
  const templates = {
    Amazon: `
Amazon.co.jp ご注文の確認

○○ 様

ご注文ありがとうございます。

■注文内容
商品名: ${product.itemName}
価格: ¥${product.price.toLocaleString()}
注文日: ${new Date().toLocaleDateString('ja-JP')}

商品の詳細: ${product.url}

引き続きAmazon.co.jpをご利用ください。
    `,
    
    楽天: `
【楽天市場】ご注文確認メール

${product.itemName}のご注文ありがとうございました。

【商品情報】
商品名：${product.itemName}
価格：${product.price.toLocaleString()}円
注文日：${new Date().toLocaleDateString('ja-JP')}

ご注文商品の詳細は以下をご確認ください。
    `,
    
    メルカリ: `
【メルカリ】購入完了のお知らせ

「${product.itemName}」を購入しました。

購入金額：¥${product.price.toLocaleString()}
購入日：${new Date().toLocaleDateString('ja-JP')}

取引を開始してください。
    `
  };
  
  return templates[site];
};

// デモ用のユーザーデータ
export const demoUserData = {
  email: 'demo@example.com',
  displayName: 'デモユーザー',
  photoURL: 'https://via.placeholder.com/100'
};