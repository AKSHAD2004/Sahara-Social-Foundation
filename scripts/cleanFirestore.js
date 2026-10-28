// Dedicated maintenance script to purge all unwanted data from Firestore
// and keep only necessary core operational data.
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
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

console.log('--- Sahara Social Foundation - Firestore Deep Cleanup ---');
console.log('Project ID:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runCleanup() {
  // 1. Purge completely unwanted collections that belong strictly to local mock/static assets
  const unwantedCollections = [
    'auditLogs',
    'notifications',
    'galleryPhotos',
    'reviews',
    'heroSlides',
    'videos',
    'supportTickets',
    'commissionSlabs',
    'affiliateClicks',
    'followups'
  ];

  for (const colName of unwantedCollections) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (snap.size > 0) {
        console.log(`Purging unwanted collection "${colName}" (${snap.size} documents)...`);
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        console.log(`✓ Purged "${colName}".`);
      } else {
        console.log(`✓ "${colName}" is already empty (0 docs).`);
      }
    } catch (err) {
      console.warn(`Error purging ${colName}:`, err.message);
    }
  }

  // 2. Remove corrupted & dummy orders
  const dummyOrderIds = new Set([
    'ORD-2026-9748',
    'ORD-2026-2275',
    'ORD-2026-2678',
    'ORD-2026-3904',
    'ORD-2026-4762',
    'SSF-842101',
    'orde_1790218824760_893',
    'orde_1790218876781_361',
    'orde_1790219118957_36',
    'orde_1790320226159_297'
  ]);

  try {
    const ordersSnap = await getDocs(collection(db, 'orders'));
    console.log(`\nInspecting orders collection (${ordersSnap.size} total docs)...`);
    for (const d of ordersSnap.docs) {
      const data = d.data();
      const isCorrupt = 
        dummyOrderIds.has(d.id) ||
        data.customerPhone === '123456789' ||
        data.phone === '123456789' ||
        (!data.customerName && !data.items && !data.pricing && !data.grandTotal);

      if (isCorrupt) {
        console.log(`  Deleting junk/dummy order: ${d.id}`);
        await deleteDoc(d.ref);
      }
    }
    console.log('✓ Cleaned orders collection.');
  } catch (err) {
    console.warn('Error cleaning orders:', err.message);
  }

  // 3. Remove dummy/test customers
  const dummyCustomerIds = new Set([
    'cust_1791196143353_678',
    'cust_1790320149581_425',
    'cust_1790320226158_861',
    'CUST-8421154090'
  ]);

  try {
    const custSnap = await getDocs(collection(db, 'customers'));
    console.log(`\nInspecting customers collection (${custSnap.size} total docs)...`);
    for (const d of custSnap.docs) {
      const data = d.data();
      const isDummy = 
        dummyCustomerIds.has(d.id) ||
        data.fullName === 'bhb njnj' ||
        data.whatsappNumber === '9000000000' ||
        data.phone === '123456789';

      if (isDummy) {
        console.log(`  Deleting junk/dummy customer: ${d.id} (${data.fullName || ''})`);
        await deleteDoc(d.ref);
      }
    }
    console.log('✓ Cleaned customers collection.');
  } catch (err) {
    console.warn('Error cleaning customers:', err.message);
  }

  // 4. Remove dummy/demo leads
  const dummyLeadIds = new Set([
    'lead_1789981569824_327',
    'lead_1789984653453_688',
    'lead_1790320351272_631'
  ]);

  try {
    const leadsSnap = await getDocs(collection(db, 'leads'));
    console.log(`\nInspecting leads collection (${leadsSnap.size} total docs)...`);
    for (const d of leadsSnap.docs) {
      const data = d.data();
      const isDummy = 
        dummyLeadIds.has(d.id) || 
        (data.notes && data.notes.includes('demo data'));

      if (isDummy) {
        console.log(`  Deleting dummy lead: ${d.id}`);
        await deleteDoc(d.ref);
      }
    }
    console.log('✓ Cleaned leads collection.');
  } catch (err) {
    console.warn('Error cleaning leads:', err.message);
  }

  // 5. Final verification of remaining collections
  console.log('\n--- Final Firestore State Summary ---');
  const collectionsToCheck = [
    'orders',
    'customers',
    'users',
    'leads',
    'commissionTransactions',
    'commissionPayouts',
    'settings'
  ];

  for (const col of collectionsToCheck) {
    try {
      const snap = await getDocs(collection(db, col));
      console.log(`Collection "${col}": ${snap.size} active documents.`);
    } catch (e) {
      console.log(`Collection "${col}": query error (${e.message})`);
    }
  }

  console.log('\nFirestore cleanup completed successfully.');
  process.exit(0);
}

runCleanup().catch((err) => {
  console.error('Fatal cleanup error:', err);
  process.exit(1);
});
