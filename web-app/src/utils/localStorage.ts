import { Product } from '../types/Product';

const DEMO_PRODUCTS_KEY = 'demo_products';

export const localStorageDB = {
  // 商品の取得
  getProducts: (): Product[] => {
    try {
      const stored = localStorage.getItem(DEMO_PRODUCTS_KEY);
      if (!stored) return [];
      
      const products = JSON.parse(stored);
      // Date型に変換
      return products.map((product: any) => ({
        ...product,
        purchaseDate: new Date(product.purchaseDate),
        createdAt: new Date(product.createdAt)
      }));
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
      return [];
    }
  },

  // 商品の保存
  saveProduct: (product: Omit<Product, 'id'>): Product => {
    const products = localStorageDB.getProducts();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString() // 簡単なID生成
    };
    
    products.push(newProduct);
    localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(products));
    return newProduct;
  },

  // 商品の更新
  updateProduct: (id: string, updates: Partial<Product>): boolean => {
    const products = localStorageDB.getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    products[index] = { ...products[index], ...updates };
    localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(products));
    return true;
  },

  // 商品の削除
  deleteProduct: (id: string): boolean => {
    const products = localStorageDB.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(filteredProducts));
    return true;
  },

  // 全商品の削除（デバッグ用）
  clearAll: (): void => {
    localStorage.removeItem(DEMO_PRODUCTS_KEY);
  }
};