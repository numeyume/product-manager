export interface Storage {
  level1: string;
  level2: string;
  level3: string;
}

export interface Usage {
  location: string;    // 利用場所（例：デスク、リビング、寝室）
  purpose: string;     // 用途（例：充電用、データ転送用、予備）
  device?: string;     // 対象機器（例：iPhone、MacBook、テレビ）
}

export interface Product {
  id?: string;
  itemName: string;
  url: string;
  site: 'Amazon' | '楽天' | 'メルカリ' | '仕入れ先' | 'その他';
  price: number;
  quantity: number;
  remainingQuantity: number;
  unitPrice: number;
  purchaseDate: Date;
  category: string;
  memo?: string;
  storage: Storage;
  usage?: Usage[];      // 利用場所・用途情報（複数可）
  source?: 'gmail' | 'extension' | 'manual';
  originalEmail?: {
    subject: string;
    body: string;
    date: Date;
    from: string;
    messageId?: string;
  };
  // ビジネス用フィールド
  business?: {
    supplier: string;        // 仕入れ先
    supplierCode: string;    // 仕入れ先商品コード
    orderDate?: Date;        // 発注日
    deliveryDate?: Date;     // 納期
    minStock: number;        // 最低在庫数
    reorderPoint: number;    // 発注点
    costPrice: number;       // 仕入れ原価
    sellingPrice?: number;   // 販売価格
    profit?: number;         // 利益
  };
  createdAt: Date;
}