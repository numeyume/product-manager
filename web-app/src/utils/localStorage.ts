import { Product } from '../types/Product';

const DEMO_PRODUCTS_KEY = 'demo_products';

export const localStorageDB = {
  // 商品の取得
  getProducts: (): Product[] => {
    try {
      const stored = localStorage.getItem(DEMO_PRODUCTS_KEY);
      if (!stored) return [];
      
      const products = JSON.parse(stored);
      // Date型に変換 & 新フィールドのデフォルト値設定
      return products.map((product: any) => ({
        ...product,
        quantity: product.quantity || 1,
        remainingQuantity: product.remainingQuantity !== undefined ? product.remainingQuantity : (product.quantity || 1),
        unitPrice: product.unitPrice || Math.round((product.price || 0) / (product.quantity || 1)),
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
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9) // ユニークなID生成
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
    console.log('localStorage削除処理:', { 削除ID: id });
    
    const products = localStorageDB.getProducts();
    console.log('削除前の商品リスト:', products.map(p => ({ id: p.id, name: p.itemName })));
    
    const filteredProducts = products.filter(p => p.id !== id);
    
    console.log('フィルター後:', {
      元の商品数: products.length,
      フィルター後の商品数: filteredProducts.length,
      削除対象が見つかったか: products.length !== filteredProducts.length
    });
    
    if (filteredProducts.length === products.length) {
      console.warn('削除対象が見つかりませんでした:', id);
      return false;
    }
    
    localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(filteredProducts));
    console.log('削除完了');
    return true;
  },

  // 商品の在庫数更新
  updateProductQuantity: (id: string, remainingQuantity: number): boolean => {
    return localStorageDB.updateProduct(id, { remainingQuantity });
  },

  // 全商品の削除（デバッグ用）
  clearAll: (): void => {
    localStorage.removeItem(DEMO_PRODUCTS_KEY);
  }
};