import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types/Product';
import { ProductList } from '../components/ProductList';
import { SearchBar } from '../components/SearchBar';
import { StorageManager } from '../components/StorageManager';
import { GmailSetup } from '../components/GmailSetup';
import { TestMode } from '../components/TestMode';
import { ManualProductEntry } from '../components/ManualProductEntry';
import { BusinessModeToggle } from '../components/BusinessModeToggle';
import { UsageGuide } from '../components/UsageGuide';
import { localStorageDB } from '../utils/localStorage';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [showGmailSetup, setShowGmailSetup] = useState(false);
  const [showTestMode, setShowTestMode] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showUsageGuide, setShowUsageGuide] = useState(false);
  const [isBusinessMode, setIsBusinessMode] = useState(() => {
    return localStorage.getItem('businessMode') === 'true';
  });

  useEffect(() => {
    if (!user) return;

    // デモモードの場合はローカルストレージから取得
    const isDemo = localStorage.getItem('demoUser');
    if (isDemo) {
      const demoProducts = localStorageDB.getProducts();
      setProducts(demoProducts);
      setFilteredProducts(demoProducts);
      setLoading(false);
      return;
    }

    // Firebase認証の場合は通常のFirestore処理
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, `users/${user.uid}/items`),
        orderBy('purchaseDate', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const product = {
            id: doc.id,
            ...data,
            quantity: data.quantity || 1,
            remainingQuantity: data.remainingQuantity !== undefined ? data.remainingQuantity : (data.quantity || 1),
            unitPrice: data.unitPrice || Math.round((data.price || 0) / (data.quantity || 1)),
            purchaseDate: data.purchaseDate.toDate(),
            createdAt: data.createdAt.toDate()
          } as Product;
          items.push(product);
        });
        setProducts(items);
        setFilteredProducts(items);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Firebase未設定の場合はローディング完了
      setLoading(false);
    }
  }, [user]);

  const handleSearch = (searchTerm: string, category: string, storageLevel1: string, hideOutOfStock: boolean) => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }

    if (storageLevel1) {
      filtered = filtered.filter(product => product.storage.level1 === storageLevel1);
    }

    if (hideOutOfStock) {
      filtered = filtered.filter(product => product.remainingQuantity > 0);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (productId: string) => {
    if (!user || !productId) return;
    
    console.log('削除処理開始:', { productId, 商品ID: productId });
    
    if (window.confirm('この商品を削除しますか？')) {
      try {
        // デモモードの場合はローカルストレージから削除
        const isDemo = localStorage.getItem('demoUser');
        if (isDemo) {
          console.log('デモモードで削除実行');
          const beforeCount = localStorageDB.getProducts().length;
          const success = localStorageDB.deleteProduct(productId);
          const afterCount = localStorageDB.getProducts().length;
          
          console.log('削除結果:', { 
            success, 
            削除前: beforeCount, 
            削除後: afterCount,
            削除ID: productId 
          });
          
          if (success) {
            const updatedProducts = localStorageDB.getProducts();
            setProducts(updatedProducts);
            setFilteredProducts(updatedProducts);
            console.log('画面更新完了');
          } else {
            console.error('削除に失敗しました');
            alert('削除に失敗しました');
          }
          return;
        }

        // Firebase認証の場合は通常のFirestore処理
        if (isFirebaseConfigured && db) {
          console.log('Firebaseで削除実行');
          await deleteDoc(doc(db, `users/${user.uid}/items`, productId));
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('削除処理でエラーが発生しました');
      }
    }
  };

  const handleProductAdded = () => {
    // Refresh product list
    const isDemo = localStorage.getItem('demoUser');
    if (isDemo) {
      const updatedProducts = localStorageDB.getProducts();
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
    }
  };

  const handleQuantityUpdate = async (productId: string, newRemainingQuantity: number) => {
    if (!user) return;

    try {
      const isDemo = localStorage.getItem('demoUser');
      
      if (isDemo) {
        const success = localStorageDB.updateProductQuantity(productId, newRemainingQuantity);
        if (success) {
          const updatedProducts = localStorageDB.getProducts();
          setProducts(updatedProducts);
          setFilteredProducts(updatedProducts);
        }
      } else {
        if (isFirebaseConfigured && db) {
          const docRef = doc(db, `users/${user.uid}/items`, productId);
          await setDoc(docRef, { remainingQuantity: newRemainingQuantity }, { merge: true });
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleBusinessModeToggle = (enabled: boolean) => {
    setIsBusinessMode(enabled);
    localStorage.setItem('businessMode', enabled.toString());
  };

  // ビジネスモード用の統計
  const getBusinessStats = () => {
    if (!isBusinessMode) return null;
    
    const lowStockItems = products.filter(p => 
      p.business?.reorderPoint && p.remainingQuantity <= p.business.reorderPoint
    );
    
    const totalValue = products.reduce((sum, p) => 
      sum + (p.remainingQuantity * (p.business?.costPrice || p.unitPrice)), 0
    );

    return { lowStockItems, totalValue };
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-main">
          <h1>通販商品管理</h1>
          <BusinessModeToggle 
            isBusinessMode={isBusinessMode}
            onToggle={handleBusinessModeToggle}
          />
        </div>
        <div className="header-actions">
          <button onClick={() => setShowUsageGuide(true)} className="usage-guide-btn">
            📖 使い方
          </button>
          <button onClick={() => setShowManualEntry(true)} className="manual-entry-btn">
            ✏️ 手動登録
          </button>
          <button onClick={() => setShowTestMode(true)} className="test-btn">
            🧪 テストモード
          </button>
          <button onClick={() => setShowGmailSetup(true)} className="gmail-btn">
            Gmail連携
          </button>
          <button onClick={() => setShowStorageManager(true)} className="storage-btn">
            保管場所管理
          </button>
          <button onClick={logout} className="logout-btn">
            ログアウト
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="stats">
          <div className="stat-card">
            <h3>登録商品数</h3>
            <p>{products.length}</p>
          </div>
          <div className="stat-card">
            <h3>今月の購入数</h3>
            <p>
              {products.filter(p => {
                const purchaseMonth = p.purchaseDate.getMonth();
                const currentMonth = new Date().getMonth();
                return purchaseMonth === currentMonth;
              }).length}
            </p>
          </div>
          {isBusinessMode ? (
            <>
              <div className="stat-card">
                <h3>発注点以下の商品</h3>
                <p className="alert-stat">{getBusinessStats()?.lowStockItems.length || 0}</p>
              </div>
              <div className="stat-card">
                <h3>総在庫価値</h3>
                <p>¥{getBusinessStats()?.totalValue.toLocaleString() || 0}</p>
              </div>
            </>
          ) : (
            <div className="stat-card">
              <h3>Gmail取得数</h3>
              <p>{products.filter(p => p.source === 'gmail').length}</p>
            </div>
          )}
        </div>

        <SearchBar
          onSearch={handleSearch}
          categories={Array.from(new Set(products.map(p => p.category)))}
          storageLocations={Array.from(new Set(products.map(p => p.storage.level1)))}
        />

        <ProductList
          products={filteredProducts}
          onDelete={handleDelete}
          onQuantityUpdate={handleQuantityUpdate}
          onProductUpdated={handleProductAdded}
        />
      </main>

      {showStorageManager && (
        <StorageManager onClose={() => setShowStorageManager(false)} />
      )}
      
      {showGmailSetup && (
        <GmailSetup onClose={() => setShowGmailSetup(false)} />
      )}
      
      {showTestMode && (
        <TestMode onClose={() => setShowTestMode(false)} />
      )}
      
      {showManualEntry && (
        <ManualProductEntry 
          onClose={() => setShowManualEntry(false)} 
          onProductAdded={handleProductAdded}
          existingProducts={products}
        />
      )}

      {showUsageGuide && (
        <UsageGuide onClose={() => setShowUsageGuide(false)} />
      )}
    </div>
  );
};