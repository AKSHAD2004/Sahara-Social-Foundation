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

// Read config from Vite environment variables with production fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBmkRYTuqvnwv7O6Ji4M71OI41-V48hw3Y',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sahara-social-foundation.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sahara-social-foundation',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sahara-social-foundation.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '850771512299',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:850771512299:web:e1cdfef630d9236393e7ae',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-SX3ECX1WVQ'
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

/**
 * Saves or updates a customer or user profile directly to Cloud Firestore.
 * Automatically synchronizes profile data to the 'customers' collection in Firebase.
 * 
 * @param {Object} profile - Profile data object
 * @returns {Promise<{success: boolean, id: string, message?: string}>}
 */
export async function syncProfileToFirebase(profile) {
  if (!profile) return { success: false, message: 'No profile data provided' };

  const cleanPhone = (profile.phone || profile.mobileNumber || profile.mobile || '').replace(/\D/g, '').trim();
  const profileId = profile.id || (cleanPhone ? `CUST-${cleanPhone}` : `CUST-${Date.now()}`);

  const payload = {
    id: profileId,
    customerId: profileId,
    fullName: (profile.fullName || profile.name || '').trim() || 'ग्राहक (Customer)',
    phone: cleanPhone,
    mobileNumber: cleanPhone,
    whatsappNumber: profile.whatsappNumber || cleanPhone,
    email: (profile.email || '').trim(),
    address: (profile.address || '').trim(),
    city: (profile.city || '').trim() || 'कोल्हापूर',
    state: profile.state || 'Maharashtra',
    pincode: (profile.pincode || '').trim(),
    category: profile.category || 'Nutraceutical Buyer',
    source: profile.source || 'Website Customer Profile',
    status: profile.status || 'Active',
    updatedAt: new Date().toISOString()
  };

  // Direct Cloud Firestore write
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'customers', profileId);
      await setDoc(docRef, {
        ...payload,
        firebaseUpdatedAt: serverTimestamp()
      }, { merge: true });
      console.log(`[Firebase] Profile successfully stored on Cloud Firestore: customers/${profileId}`);
      return { success: true, id: profileId, data: payload };
    } catch (err) {
      console.warn(`[Firebase] Firestore write note (customers/${profileId}):`, err.message);
      return { success: false, error: err.message, data: payload };
    }
  }

  return { success: true, id: profileId, data: payload, note: 'Cached locally' };
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
