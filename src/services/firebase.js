// Firebase Configuration & Service Layer for Samarth Kolhapur / Sahara Social Foundation CRM
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Read config from Vite environment variables with graceful fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sahara-social-foundation.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sahara-social-foundation',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sahara-social-foundation.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Check if real production credentials are provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('DemoKey') &&
  !firebaseConfig.apiKey.includes('placeholder')
);

// Initialize Firebase App safely
let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.warn('Firebase initialized in offline/demo mode:', error.message);
}

/**
 * Health check to verify real-time connection with Cloud Firestore
 */
export async function testFirebaseConnection() {
  if (!isFirebaseConfigured || !db) {
    return {
      connected: false,
      mode: 'Local Reactive Storage',
      message: 'Running in high-speed local reactive cache. Add your Firebase keys in .env to connect to Cloud Firestore.'
    };
  }

  try {
    const healthDoc = doc(db, '_healthcheck', 'status');
    await setDoc(healthDoc, {
      lastChecked: serverTimestamp(),
      system: 'Samarth CRM',
      organization: 'Sahara Social Foundation'
    }, { merge: true });

    return {
      connected: true,
      mode: 'Cloud Firestore Online',
      projectId: firebaseConfig.projectId,
      message: `Successfully connected to Cloud Firestore project "${firebaseConfig.projectId}".`
    };
  } catch (error) {
    return {
      connected: false,
      mode: 'Connection Error',
      message: error.message
    };
  }
}

export { 
  app, 
  auth, 
  db, 
  storage, 
  googleProvider,
  firebaseConfig,
  // Auth methods
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  // Firestore methods
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
  // Storage methods
  ref,
  uploadBytes,
  getDownloadURL
};

export default app;
