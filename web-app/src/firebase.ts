import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase設定の確認
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:demo'
};

// Firebase設定が有効かチェック
const isFirebaseConfigured = Boolean(
  process.env.REACT_APP_FIREBASE_API_KEY &&
  process.env.REACT_APP_FIREBASE_PROJECT_ID &&
  !process.env.REACT_APP_FIREBASE_API_KEY.includes('your-') &&
  !process.env.REACT_APP_FIREBASE_PROJECT_ID.includes('your-')
);

console.log('Firebase configured:', isFirebaseConfigured);

let app: any;
let auth: any;
let googleProvider: any;
let db: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  console.log('Running in demo mode without Firebase');
  
  // デモモード用のダミーオブジェクト
  auth = null;
  googleProvider = null;
  db = null;
}

export { auth, googleProvider, db, isFirebaseConfigured };