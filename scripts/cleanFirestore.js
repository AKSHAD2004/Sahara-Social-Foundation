// Dedicated maintenance script to purge all unwanted test data from Firestore
// and verify only necessary nodes are active.
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

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

console.log('--- Sahara Social Foundation - Firestore Maintenance Cleanup ---');
console.log('Project ID:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const UNWANTED_DUMMY_IDS = new Set([]);

import('../src/services/seedData.js').then(async (seed) => {
  // 1. Purge unwanted ephemeral collections (notifications, auditLogs, etc.)
  const collectionsToClear = [
    'notifications',
    'auditLogs',
    'commissionTransactions',
    'commissionPayouts',
    'supportTickets'
  ];

  for (const colName of collectionsToClear) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (snap.size > 0) {
        console.log(`Clearing collection "${colName}" (${snap.size} documents)...`);
        for (const docSnap of snap.docs) {
          try {
            await deleteDoc(docSnap.ref);
          } catch (delErr) {
            console.warn(`  Warning deleting ${colName}/${docSnap.id}:`, delErr.message);
          }
        }
        console.log(`✓ "${colName}" cleared.`);
      } else {
        console.log(`✓ "${colName}" is empty (0 docs).`);
      }
    } catch (err) {
      console.warn(`Error querying ${colName}:`, err.message);
    }
  }

  // 2. Clean test users from 'users'
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const officialUserIds = new Set(['usr_super_admin', 'usr_emp_akash', 'usr_aff_rahul']);
    for (const d of usersSnap.docs) {
      if (!officialUserIds.has(d.id)) {
        console.log(`Deleting test user: ${d.id}`);
        try {
          await deleteDoc(d.ref);
        } catch (e) {
          console.warn(`  Warning:`, e.message);
        }
      }
    }
    // Ensure official users are set
    for (const user of seed.initialUsers) {
      await setDoc(doc(db, 'users', user.id), {
        ...user,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log('✓ Official users verified in Firestore.');
  } catch (err) {
    console.warn('Error cleaning users:', err.message);
  }

  // 3. Clean 'heroSlides'
  try {
    const slidesSnap = await getDocs(collection(db, 'heroSlides'));
    for (const d of slidesSnap.docs) {
      if (d.data().image?.startsWith('data:') || d.id.startsWith('slide_179')) {
        console.log(`Deleting bloated/outdated slide: ${d.id}`);
        try {
          await deleteDoc(d.ref);
        } catch (e) {}
      }
    }
    for (const slide of seed.initialHeroSlides) {
      await setDoc(doc(db, 'heroSlides', slide.id), {
        ...slide,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log('✓ Hero slides cleaned and updated.');
  } catch (err) {
    console.warn('Error cleaning heroSlides:', err.message);
  }

  // 4. Update settings
  try {
    await setDoc(doc(db, 'settings', 'company_settings'), {
      ...seed.initialSettings,
      syncedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✓ company_settings updated.');
  } catch (err) {
    console.warn('Error updating settings:', err.message);
  }

  console.log('\nCleanup routine finished.');
  process.exit(0);
}).catch((err) => {
  console.error('Maintenance error:', err);
  process.exit(1);
});
