// Standalone script to upload all official necessary catalog data to Firebase Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Load environment variables from .env
function loadEnv() {
  const envPath = resolve(rootDir, '.env');
  const env = {};
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        env[k] = v;
      }
    }
  }
  return env;
}

const env = loadEnv();

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBmkRYTuqvnwv7O6Ji4M71OI41-V48hw3Y',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'sahara-social-foundation.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'sahara-social-foundation',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'sahara-social-foundation.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '850771512299',
  appId: env.VITE_FIREBASE_APP_ID || '1:850771512299:web:e1cdfef630d9236393e7ae',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-SX3ECX1WVQ'
};

console.log('--- Sahara Social Foundation - Firebase Sync Tool ---');
console.log('Project ID:', firebaseConfig.projectId);

if (!firebaseConfig.apiKey) {
  console.error('Error: VITE_FIREBASE_API_KEY is not defined in .env');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Import clean seed data dynamically
import('../src/services/seedData.js').then(async (seed) => {
  // Sync ONLY necessary static/catalog collections (no dummy operational data)
  const collections = {
    users: seed.initialUsers,
    products: seed.initialProducts,
    commissionSlabs: seed.initialCommissionSlabs,
    heroSlides: seed.initialHeroSlides || [],
    galleryPhotos: seed.galleryPhotos || [],
    videos: seed.horizontalVideosData || [],
    reviews: seed.initialReviews || []
  };

  let totalUploaded = 0;

  for (const [colName, items] of Object.entries(collections)) {
    console.log(`Syncing collection: ${colName} (${items.length} records)...`);
    for (const item of items) {
      const docId = String(item.id || `${colName}_${Date.now()}`);
      await setDoc(doc(db, colName, docId), {
        ...item,
        id: docId,
        syncedAt: new Date().toISOString()
      }, { merge: true });
      totalUploaded++;
    }
  }

  // Sync Settings
  console.log('Syncing settings: company_settings...');
  await setDoc(doc(db, 'settings', 'company_settings'), {
    ...seed.initialSettings,
    syncedAt: new Date().toISOString()
  }, { merge: true });
  totalUploaded++;

  console.log(`\nSUCCESS: Uploaded ${totalUploaded} necessary records to Firebase Firestore!`);
  process.exit(0);
}).catch((err) => {
  console.error('Failed to sync to Firebase:', err);
  process.exit(1);
});
