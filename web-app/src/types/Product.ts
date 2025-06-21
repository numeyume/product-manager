export interface Storage {
  level1: string;
  level2: string;
  level3: string;
}

export interface Product {
  id?: string;
  itemName: string;
  url: string;
  site: 'Amazon' | '楽天' | 'メルカリ';
  price: number;
  purchaseDate: Date;
  category: string;
  memo?: string;
  storage: Storage;
  source?: 'gmail' | 'extension' | 'manual';
  createdAt: Date;
}