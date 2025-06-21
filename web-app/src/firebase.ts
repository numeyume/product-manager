import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase設定 - 直接指定で確実に動作
const firebaseConfig = {
  apiKey: "AIzaSyBiNdLhhzJxdd4oYa1ZVHD6pWZOnndxVXA",
  authDomain: "product-manager-f8432.firebaseapp.com",
  projectId: "product-manager-f8432",
  storageBucket: "product-manager-f8432.firebasestorage.app",
  messagingSenderId: "163137870258",
  appId: "1:163137870258:web:4cedb8a24aa6326a89ecab"
};

console.log('🔥 Firebase設定を直接指定で初期化します');

// Firebase初期化を確実に実行
let app: any;
let auth: any;
let googleProvider: any;
let db: any;
let isFirebaseConfigured = true; // 強制的にtrueに設定

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Google認証プロバイダーの設定
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  
  db = getFirestore(app);
  
  console.log('✅ Firebase初期化成功');
  console.log('✅ Google認証プロバイダー設定完了');
  
} catch (error) {
  console.error('❌ Firebase初期化失敗:', error);
  
  // デモモード用のダミーオブジェクト
  auth = null;
  googleProvider = null;
  db = null;
  isFirebaseConfigured = false;
}

export { auth, googleProvider, db, isFirebaseConfigured };