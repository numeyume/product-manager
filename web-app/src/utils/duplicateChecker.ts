import { Product } from '../types/Product';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingProduct?: Product;
  suggestion: 'add_quantity' | 'create_new' | 'no_action';
  message: string;
}

export interface SimilarityScore {
  product: Product;
  score: number;
  reasons: string[];
}

/**
 * 商品名の類似度を計算（簡易版）
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().replace(/\s+/g, '');
  const s2 = str2.toLowerCase().replace(/\s+/g, '');
  
  if (s1 === s2) return 1.0;
  
  // 部分一致チェック
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.includes(shorter)) return 0.8;
  
  // 共通の単語数チェック
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  const commonWords = words1.filter(word => 
    words2.some(w => w.includes(word) || word.includes(w))
  );
  
  const similarity = (commonWords.length * 2) / (words1.length + words2.length);
  return Math.max(similarity, 0);
};

/**
 * 商品の重複チェック
 */
export const checkDuplicateProduct = (
  newProduct: Partial<Product>, 
  existingProducts: Product[]
): DuplicateCheckResult => {
  
  if (!newProduct.itemName) {
    return {
      isDuplicate: false,
      suggestion: 'no_action',
      message: '商品名が不明です'
    };
  }

  const similarities: SimilarityScore[] = [];

  for (const existing of existingProducts) {
    const reasons: string[] = [];
    let score = 0;

    // 商品名の類似度チェック
    const nameScore = calculateSimilarity(newProduct.itemName, existing.itemName);
    if (nameScore > 0.7) {
      score += nameScore * 0.6; // 商品名は60%の重み
      reasons.push(`商品名が類似 (${Math.round(nameScore * 100)}%)`);
    }

    // URL完全一致チェック
    if (newProduct.url && existing.url && newProduct.url === existing.url) {
      score += 0.4; // URL一致は40%の重み
      reasons.push('商品URLが完全一致');
    }

    // サイト一致チェック
    if (newProduct.site && existing.site && newProduct.site === existing.site) {
      score += 0.1; // サイト一致は10%の重み
      reasons.push('同じサイトでの購入');
    }

    // 価格帯チェック（±20%以内）
    if (newProduct.price && existing.price) {
      const priceDiff = Math.abs(newProduct.price - existing.price) / existing.price;
      if (priceDiff <= 0.2) {
        score += 0.1;
        reasons.push(`価格が近似 (差額: ${Math.round(priceDiff * 100)}%)`);
      }
    }

    if (score > 0.6 && reasons.length > 0) {
      similarities.push({
        product: existing,
        score,
        reasons
      });
    }
  }

  // 最も類似度の高い商品を取得
  similarities.sort((a, b) => b.score - a.score);
  const mostSimilar = similarities[0];

  if (!mostSimilar) {
    return {
      isDuplicate: false,
      suggestion: 'create_new',
      message: '新しい商品として登録できます'
    };
  }

  // 在庫があるかチェック
  const hasStock = mostSimilar.product.remainingQuantity > 0;
  const highSimilarity = mostSimilar.score > 0.8;

  if (highSimilarity && hasStock) {
    return {
      isDuplicate: true,
      existingProduct: mostSimilar.product,
      suggestion: 'add_quantity',
      message: `「${mostSimilar.product.itemName}」の在庫が ${mostSimilar.product.remainingQuantity}個 残っています。\n\n類似理由: ${mostSimilar.reasons.join('、')}\n\n新規登録せず、既存商品の数量を追加しますか？`
    };
  } else if (highSimilarity && !hasStock) {
    return {
      isDuplicate: true,
      existingProduct: mostSimilar.product,
      suggestion: 'add_quantity',
      message: `「${mostSimilar.product.itemName}」の在庫は0ですが、同じ商品の可能性があります。\n\n類似理由: ${mostSimilar.reasons.join('、')}\n\n既存商品に追加購入として記録しますか？`
    };
  } else if (mostSimilar.score > 0.6) {
    return {
      isDuplicate: false,
      existingProduct: mostSimilar.product,
      suggestion: 'create_new',
      message: `「${mostSimilar.product.itemName}」と似ていますが、別商品として登録できます。\n\n類似理由: ${mostSimilar.reasons.join('、')}`
    };
  }

  return {
    isDuplicate: false,
    suggestion: 'create_new',
    message: '新しい商品として登録できます'
  };
};

/**
 * 在庫がある類似商品の警告チェック
 */
export const checkInventoryWarning = (
  newProduct: Partial<Product>,
  existingProducts: Product[]
): { hasWarning: boolean; products: Product[]; message: string } => {
  
  const productsWithStock = existingProducts.filter(p => p.remainingQuantity > 0);
  
  if (productsWithStock.length === 0) {
    return {
      hasWarning: false,
      products: [],
      message: ''
    };
  }

  const similarities = productsWithStock
    .map(product => ({
      product,
      score: calculateSimilarity(newProduct.itemName || '', product.itemName)
    }))
    .filter(item => item.score > 0.5)
    .sort((a, b) => b.score - a.score);

  if (similarities.length > 0) {
    const warningProducts = similarities.slice(0, 3).map(s => s.product);
    return {
      hasWarning: true,
      products: warningProducts,
      message: `以下の商品に在庫があります:\n${warningProducts.map(p => 
        `• ${p.itemName} (残り${p.remainingQuantity}個)`
      ).join('\n')}\n\n本当に新しく購入しますか？`
    };
  }

  return {
    hasWarning: false,
    products: [],
    message: ''
  };
};

/**
 * 重複商品の統合処理
 */
export const mergeProducts = (
  existingProduct: Product,
  newPurchase: Partial<Product>
): Product => {
  const newQuantity = newPurchase.quantity || 1;
  const newTotalPrice = newPurchase.price || 0;
  
  // 加重平均で単価を計算
  const existingTotalValue = existingProduct.quantity * existingProduct.unitPrice;
  const newTotalValue = newQuantity * (newTotalPrice / newQuantity);
  const combinedQuantity = existingProduct.quantity + newQuantity;
  const newUnitPrice = Math.round((existingTotalValue + newTotalValue) / combinedQuantity);

  return {
    ...existingProduct,
    quantity: combinedQuantity,
    remainingQuantity: existingProduct.remainingQuantity + newQuantity,
    unitPrice: newUnitPrice,
    price: existingProduct.price + newTotalPrice, // 累計購入額
    memo: existingProduct.memo ? 
      `${existingProduct.memo}\n\n[追加購入 ${new Date().toLocaleDateString()}] ${newPurchase.memo || ''}`.trim() 
      : newPurchase.memo || ''
  };
};