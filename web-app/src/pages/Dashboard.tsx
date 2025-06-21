import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types/Product';
import { ProductList } from '../components/ProductList';
import { SearchBar } from '../components/SearchBar';
import { StorageManager } from '../components/StorageManager';
import { GmailSetup } from '../components/GmailSetup';
import { TestMode } from '../components/TestMode';
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
          items.push({
            id: doc.id,
            ...data,
            purchaseDate: data.purchaseDate.toDate(),
            createdAt: data.createdAt.toDate()
          } as Product);
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

  const handleSearch = (searchTerm: string, category: string, storageLevel1: string) => {
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

    setFilteredProducts(filtered);
  };

  const handleDelete = async (productId: string) => {
    if (!user || !productId) return;
    
    if (window.confirm('この商品を削除しますか？')) {
      try {
        // デモモードの場合はローカルストレージから削除
        const isDemo = localStorage.getItem('demoUser');
        if (isDemo) {
          const success = localStorageDB.deleteProduct(productId);
          if (success) {
            const updatedProducts = localStorageDB.getProducts();
            setProducts(updatedProducts);
            setFilteredProducts(updatedProducts);
          }
          return;
        }

        // Firebase認証の場合は通常のFirestore処理
        if (isFirebaseConfigured && db) {
          await deleteDoc(doc(db, `users/${user.uid}/items`, productId));
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>通販商品管理</h1>
        <div className="header-actions">
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
          <div className="stat-card">
            <h3>Gmail取得数</h3>
            <p>{products.filter(p => p.source === 'gmail').length}</p>
          </div>
        </div>

        <SearchBar
          onSearch={handleSearch}
          categories={Array.from(new Set(products.map(p => p.category)))}
          storageLocations={Array.from(new Set(products.map(p => p.storage.level1)))}
        />

        <ProductList
          products={filteredProducts}
          onDelete={handleDelete}
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
    </div>
  );
};