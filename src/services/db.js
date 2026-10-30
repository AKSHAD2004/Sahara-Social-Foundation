// Unified Database Service Layer for Samarth Kolhapur CRM
// Dual Architecture: Cloud Firestore with persistent local reactive fallback for seamless zero-error operation

import { 
  initialUsers, 
  initialCustomers, 
  initialLeads, 
  initialFollowups, 
  initialOrders, 
  initialProducts, 
  initialHeroSlides,
  initialGalleryPhotos,
  initialVideos,
  initialCommissionSlabs, 
  initialCommissionTransactions, 
  initialPayouts, 
  initialSupportTickets, 
  initialAuditLogs, 
  initialSettings,
  initialReviews
} from './seedData.js';
import { 
  isFirebaseConfigured, 
  db as firestoreDb,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  limit,
  writeBatch,
  serverTimestamp,
  ensureFirebaseAuth,
  syncOrderToFirebase,
  syncUserToFirebase,
  disconnectFirestoreNetwork,
  isFirestoreNetworkDisconnected
} from './firebase';
import { buildCommissionTransactions, buildCommissionReversal, isOrderCommissionEligible } from './commissionEngine';

const STORAGE_PREFIX = 'sahara_crm_prod_';
const DELETED_STORAGE_PREFIX = 'sahara_crm_deleted_';

export const UNWANTED_DUMMY_IDS = new Set([]);

export const PURGE_DUMMY_IDS = new Set([
  'CUST-9822154002',
  'CUST-9423154003',
  'SSF-842102',
  'SSF-842103',
  'LEAD-842101',
  'LEAD-842102',
  'FOL-842101',
  'ORD-2026-9748',
  'ORD-2026-2275',
  'ORD-2026-2678',
  'ORD-2026-3904',
  'ORD-2026-4762',
  'SSF-842101',
  'CUST-8421154090',
  'cust_1791196143353_678',
  'cust_1790320149581_425',
  'cust_1790320226158_861',
  'orde_1790218824760_893',
  'orde_1790218876781_361',
  'orde_1790219118957_36',
  'orde_1790320226159_297',
  'lead_1789981569824_327',
  'lead_1789984653453_688',
  'lead_1790320351272_631'
]);

export function getDeletedSet(collectionName) {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(DELETED_STORAGE_PREFIX + collectionName) : null;
    const set = raw ? new Set(JSON.parse(raw)) : new Set();
    // Guarantee customer and order records are never blocked by residual deleted sets
    set.delete('CUST-8055557120');
    return set;
  } catch (e) {
    return new Set();
  }
}

// Cleanse any residual operational records from browser storage on init
const CRM_CLEAN_VERSION_KEY = 'sahara_crm_fresh_data_v2026';
if (typeof localStorage !== 'undefined') {
  try {
    const isCleaned = localStorage.getItem(CRM_CLEAN_VERSION_KEY);
    if (!isCleaned) {
      ['orders', 'customers', 'leads', 'followups', 'commissionTransactions', 'commissionPayouts', 'supportTickets', 'notifications', 'auditLogs'].forEach((col) => {
        localStorage.removeItem(STORAGE_PREFIX + col);
        localStorage.removeItem(DELETED_STORAGE_PREFIX + col);
      });
      localStorage.removeItem('ssf_last_order');
      localStorage.setItem(CRM_CLEAN_VERSION_KEY, 'true');
    }
  } catch (e) {}
}

export function recordDeletedId(collectionName, ...ids) {
  try {
    if (typeof localStorage === 'undefined') return;
    const set = getDeletedSet(collectionName);
    ids.filter(Boolean).forEach((id) => set.add(String(id)));
    localStorage.setItem(DELETED_STORAGE_PREFIX + collectionName, JSON.stringify([...set]));
  } catch (e) {}
}

export function isItemDeleted(collectionName, itemOrId) {
  if (!itemOrId) return false;
  const set = getDeletedSet(collectionName);
  if (typeof itemOrId === 'string' || typeof itemOrId === 'number') {
    const sId = String(itemOrId);
    return set.has(sId) || PURGE_DUMMY_IDS.has(sId);
  }
  const id = itemOrId.id ? String(itemOrId.id) : null;
  const orderId = itemOrId.orderId ? String(itemOrId.orderId) : null;
  const customerId = itemOrId.customerId ? String(itemOrId.customerId) : null;
  const leadId = itemOrId.leadId ? String(itemOrId.leadId) : null;
  return (id && (set.has(id) || PURGE_DUMMY_IDS.has(id))) || 
         (orderId && (set.has(orderId) || PURGE_DUMMY_IDS.has(orderId))) || 
         (customerId && (set.has(customerId) || PURGE_DUMMY_IDS.has(customerId))) || 
         (leadId && (set.has(leadId) || PURGE_DUMMY_IDS.has(leadId)));
}

// In-memory state and listeners
const state = {};
const listeners = {};
const firestoreUnsubscribers = {};
const lastFetchTimestamps = {};
const FETCH_COOLDOWN_MS = 300000; // 5-minute cooldown per collection to eliminate redundant reads

export const COLLECTIONS = [
  'users',
  'customers',
  'leads',
  'followups',
  'orders',
  'products',
  'heroSlides',
  'galleryPhotos',
  'videos',
  'reviews',
  'commissionSlabs',
  'commissionTransactions',
  'commissionPayouts',
  'supportTickets',
  'auditLogs',
  'settings',
  'notifications',
  'affiliateClicks'
];

// Strictly necessary collections synced with Cloud Firestore.
// Ephemeral/audit logs, notifications, media, and static data stay local to keep Firestore clean and fast.
export const FIRESTORE_SYNCED_COLLECTIONS = [
  'orders',
  'customers',
  'users',
  'leads',
  'commissionTransactions',
  'commissionPayouts',
  'settings'
];

// Recursively clean object/array to ensure no undefined values are sent to Cloud Firestore
export function sanitizeForFirestore(data) {
  if (data === undefined) {
    return null;
  }
  if (data === null) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item));
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && typeof value !== 'function') {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return data;
}

// Initialize collection cache
function initCollection(collectionName, defaultData) {
  try {
    const key = STORAGE_PREFIX + collectionName;
    const deletedSet = getDeletedSet(collectionName);
    const stored = localStorage.getItem(key);
    if (stored) {
      let parsed = JSON.parse(stored);
      // Filter out any previously deleted items from parsed
      if (Array.isArray(parsed)) {
        parsed = parsed.filter((item) => {
          const idKey = String(item.id || '');
          const orderKey = String(item.orderId || '');
          const custKey = String(item.customerId || '');
          const leadKey = String(item.leadId || '');
          return !deletedSet.has(idKey) && (!orderKey || !deletedSet.has(orderKey)) && (!custKey || !deletedSet.has(custKey)) && (!leadKey || !deletedSet.has(leadKey));
        });
      }

      // For products collection, ensure all official products exist with updated official pricing (3200 for combos, 1600 for singles)
      if (collectionName === 'products' && Array.isArray(defaultData)) {
        const existingList = Array.isArray(parsed) ? parsed : [];
        const merged = defaultData.map((defProd) => {
          const found = existingList.find((p) => p.id === defProd.id || (p.sku && p.sku === defProd.sku));
          if (found) {
            return {
              ...defProd,
              ...found,
              name: found.name || defProd.name,
              price: Number(found.price !== undefined ? found.price : defProd.price),
              sellingPrice: Number(found.sellingPrice !== undefined ? found.sellingPrice : (found.price || defProd.sellingPrice)),
              mrp: Number(found.mrp !== undefined ? found.mrp : defProd.mrp),
              isCombo: defProd.isCombo !== undefined ? defProd.isCombo : found.isCombo,
              image: found.image || defProd.image
            };
          }
          return defProd;
        });
        // Also keep any extra custom products from existingList
        existingList.forEach((p) => {
          if (!defaultData.some((dp) => dp.id === p.id || (dp.sku && dp.sku === p.sku))) {
            merged.push(p);
          }
        });
        state[collectionName] = merged;
        localStorage.setItem(key, JSON.stringify(merged));
      } else if (collectionName === 'settings' && parsed && defaultData) {
        const mergedSettings = { ...parsed, phone: defaultData.phone, whatsappNumber: defaultData.whatsappNumber };
        state[collectionName] = mergedSettings;
        localStorage.setItem(key, JSON.stringify(mergedSettings));
      } else if (collectionName === 'videos' && Array.isArray(parsed)) {
        const cleanedVideos = parsed.map((v) => ({ ...v, thumbnail: '', fallbackThumbnail: '' }));
        state[collectionName] = cleanedVideos;
        localStorage.setItem(key, JSON.stringify(cleanedVideos));
      } else if (collectionName === 'orders') {
        let existingOrders = (Array.isArray(parsed) ? parsed : []).filter((o) => !isItemDeleted('orders', o));

        // Also recover any order placed via website checkout in ssf_last_order ONLY IF NOT deleted
        try {
          const lastOrderRaw = localStorage.getItem('ssf_last_order');
          if (lastOrderRaw) {
            const lastOrd = JSON.parse(lastOrderRaw);
            const lKey = String(lastOrd.id || lastOrd.orderId || '');
            if (isItemDeleted('orders', lKey) || isItemDeleted('orders', lastOrd)) {
              localStorage.removeItem('ssf_last_order');
            } else if (lKey && !existingOrders.some((o) => String(o.id || o.orderId) === lKey)) {
              existingOrders.unshift({
                ...lastOrd,
                id: lKey,
                orderId: lKey,
                source: 'Website Checkout',
                orderStatus: lastOrd.status || 'Confirmed'
              });
            }
          }
        } catch (e) {}

        // Sort newest first
        existingOrders.sort((a, b) => {
          const dateA = new Date(a.orderDate || a.createdAt || a.syncedAt || 0).getTime();
          const dateB = new Date(b.orderDate || b.createdAt || b.syncedAt || 0).getTime();
          return dateB - dateA;
        });

        // Filter out dummy items
        existingOrders = existingOrders.filter((o) => !PURGE_DUMMY_IDS.has(String(o.id || o.orderId)));

        // Ensure real baseline defaultData is present
        if (Array.isArray(defaultData)) {
          defaultData.forEach((defOrd) => {
            const defKey = String(defOrd.id || defOrd.orderId);
            if (defKey && !existingOrders.some((o) => String(o.id || o.orderId) === defKey)) {
              existingOrders.push(defOrd);
            }
          });
        }

        state[collectionName] = existingOrders;
        localStorage.setItem(key, JSON.stringify(existingOrders));
      } else if (collectionName === 'customers') {
        let existingCustomers = (Array.isArray(parsed) ? parsed : [])
          .filter((c) => !isItemDeleted('customers', c))
          .filter((c) => !PURGE_DUMMY_IDS.has(String(c.id || c.customerId)));

        // Ensure real baseline defaultData is present
        if (Array.isArray(defaultData)) {
          defaultData.forEach((defCust) => {
            const defKey = String(defCust.id || defCust.customerId);
            if (defKey && !existingCustomers.some((c) => String(c.id || c.customerId) === defKey)) {
              existingCustomers.push(defCust);
            }
          });
        }
        state[collectionName] = existingCustomers;
        localStorage.setItem(key, JSON.stringify(existingCustomers));
      } else if (collectionName === 'leads') {
        let existingLeads = (Array.isArray(parsed) ? parsed : [])
          .filter((l) => !isItemDeleted('leads', l))
          .filter((l) => !PURGE_DUMMY_IDS.has(String(l.id || l.leadId)));
        state[collectionName] = existingLeads;
        localStorage.setItem(key, JSON.stringify(existingLeads));
      } else if (collectionName === 'followups') {
        let existingFollowups = (Array.isArray(parsed) ? parsed : [])
          .filter((f) => !isItemDeleted('followups', f))
          .filter((f) => !PURGE_DUMMY_IDS.has(String(f.id || f.followupId)));
        state[collectionName] = existingFollowups;
        localStorage.setItem(key, JSON.stringify(existingFollowups));
      } else if (collectionName === 'users') {
        const existingUsers = (Array.isArray(parsed) ? parsed : []).filter((u) => !isItemDeleted('users', u));
        
        // Also retrieve any custom registered users from backup storage
        let customBackups = [];
        try {
          if (typeof window !== 'undefined') {
            const rawBackups = localStorage.getItem('sahara_custom_registered_users');
            if (rawBackups) customBackups = JSON.parse(rawBackups);
          }
        } catch (e) {}

        const mergedMap = new Map();
        initialUsers.forEach((u) => mergedMap.set(String(u.id), u));
        existingUsers.forEach((u) => {
          if (!mergedMap.has(String(u.id))) {
            mergedMap.set(String(u.id), u);
          }
        });
        if (Array.isArray(customBackups)) {
          customBackups.forEach((cu) => {
            if (cu && cu.id && !mergedMap.has(String(cu.id))) {
              mergedMap.set(String(cu.id), cu);
            }
          });
        }

        const mergedUsers = Array.from(mergedMap.values());
        state[collectionName] = mergedUsers;
        localStorage.setItem(key, JSON.stringify(mergedUsers));
      } else {
        state[collectionName] = parsed;
      }
    } else {
      const activeDefault = Array.isArray(defaultData)
        ? defaultData.filter((item) => {
            const idKey = String(item.id || '');
            const orderKey = String(item.orderId || '');
            return !deletedSet.has(idKey) && (!orderKey || !deletedSet.has(orderKey));
          })
        : defaultData;
      state[collectionName] = activeDefault;
      localStorage.setItem(key, JSON.stringify(activeDefault));
    }
  } catch (e) {
    state[collectionName] = defaultData;
  }
}

export const initialDataMap = {
  users: initialUsers,
  customers: initialCustomers,
  leads: initialLeads,
  followups: initialFollowups,
  orders: initialOrders,
  products: initialProducts,
  heroSlides: initialHeroSlides,
  galleryPhotos: initialGalleryPhotos,
  videos: initialVideos,
  reviews: initialReviews,
  commissionSlabs: initialCommissionSlabs,
  commissionTransactions: initialCommissionTransactions,
  commissionPayouts: initialPayouts,
  supportTickets: initialSupportTickets,
  auditLogs: initialAuditLogs,
  settings: initialSettings,
  notifications: [],
  affiliateClicks: []
};

// Initialize all data stores
export function initDatabase() {
  COLLECTIONS.forEach((col) => {
    initCollection(col, initialDataMap[col] || []);
  });

  // Connect Firestore synchronization cleanly: public visitors only sync settings,
  // CRM interface connects full collections only when accessed.
  if (isFirebaseConfigured && firestoreDb && !isFirestoreQuotaExhausted()) {
    ensureFirebaseAuth().catch(() => {});
    if (typeof window !== 'undefined') {
      setTimeout(() => setupFirestoreRealtimeSync(false), 50);
    } else {
      setupFirestoreRealtimeSync(false);
    }
  }

  // NOTE: Redundant refreshAllFromFirebase removed to prevent double-reading collections on startup.
}

let permissionWarningDispatched = false;
let quotaExhaustedFlag = false;

// Global Quota & Error Circuit Breaker
export function isFirestoreQuotaExhausted() {
  return quotaExhaustedFlag || isFirestoreNetworkDisconnected();
}

export function handleFirestoreQuotaExceeded(err) {
  if (quotaExhaustedFlag) return;
  quotaExhaustedFlag = true;

  console.warn(
    '[Cloud Firestore Quota Protected] Firebase Spark (Free) plan daily read/write quota was reached. ' +
    'To protect the application and stop console errors, real-time listeners have been gracefully detached and network disconnected. ' +
    'The website and CRM are operating at full speed using high-speed local reactive cache. ' +
    'Quota automatically refreshes daily at midnight PST on Firebase, or you can upgrade to Blaze (Pay-as-you-go) in Firebase Console.'
  );

  // Unsubscribe all active Firestore listeners to prevent repeating backoff delay attempts
  Object.keys(firestoreUnsubscribers).forEach((key) => {
    try {
      if (typeof firestoreUnsubscribers[key] === 'function') {
        firestoreUnsubscribers[key]();
      }
      delete firestoreUnsubscribers[key];
    } catch (e) {}
  });

  // Explicitly tell the Firestore SDK to disable network so background retries immediately cease
  disconnectFirestoreNetwork().catch(() => {});

  if (typeof window !== 'undefined') {
    window.__firestoreQuotaExceeded = true;
    window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
  }
}

function handleFirestorePermissionError(source, colName, err) {
  if (
    err?.code === 'resource-exhausted' ||
    err?.message?.includes('Quota exceeded') ||
    err?.message?.includes('resource-exhausted')
  ) {
    handleFirestoreQuotaExceeded(err);
    return;
  }

  if (err?.code === 'permission-denied' || err?.message?.includes('permissions') || err?.message?.includes('Missing or insufficient')) {
    if (!permissionWarningDispatched) {
      permissionWarningDispatched = true;
      console.warn('[Cloud Firestore Permission Notice] Database security rules currently restrict read/write access. The system is operating safely in local reactive mode. To sync live across all devices, open Firebase Console > Firestore Database > Rules and publish: allow read, write: if true;');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('firestore-permission-error', { detail: { collection: colName, source } }));
      }
    }
  } else {
    console.warn(`Firestore note for ${colName}:`, err?.message || err);
  }
}

// Unsubscribe all active live Firestore listeners cleanly
export function unsubscribeFirestoreRealtimeSync() {
  Object.keys(firestoreUnsubscribers).forEach((key) => {
    try {
      if (typeof firestoreUnsubscribers[key] === 'function') {
        firestoreUnsubscribers[key]();
      }
      delete firestoreUnsubscribers[key];
    } catch (e) {}
  });
}

// Setup live listeners to Cloud Firestore (Ultra-low reads & zero auto-writes)
export function setupFirestoreRealtimeSync(forceCrm = false) {
  if (isFirestoreQuotaExhausted() || (typeof window !== 'undefined' && window.__firestoreQuotaExceeded)) {
    return;
  }

  // Public visitors NEVER listen to CRM collections. Only active CRM routes attach listeners.
  const isCrm = forceCrm || (typeof window !== 'undefined' && window.location.pathname.startsWith('/crm'));

  // Strictly operational collections with query limit to prevent reading thousands of legacy docs
  const SYNC_COLLECTIONS = isCrm ? ['orders', 'customers', 'leads', 'settings'] : ['settings'];

  SYNC_COLLECTIONS.forEach((colName) => {
    try {
      if (firestoreUnsubscribers[colName]) return;

      if (colName === 'settings') {
        const settingsDocRef = doc(firestoreDb, 'settings', 'company_settings');
        firestoreUnsubscribers[colName] = onSnapshot(settingsDocRef, (snap) => {
          if (snap.exists()) {
            state.settings = snap.data();
            saveCollection('settings', false);
          } else {
            const currentSettings = state.settings || initialSettings;
            state.settings = currentSettings;
            saveCollection('settings', false);
          }
        }, (err) => handleFirestorePermissionError('sync-settings', colName, err));
      } else {
        // Query bounded to latest 100 items - drastically reduces initial read quota usage
        const colQuery = query(collection(firestoreDb, colName), limit(100));
        firestoreUnsubscribers[colName] = onSnapshot(colQuery, (snapshot) => {
          const remoteDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          const deletedSet = getDeletedSet(colName);

          // In-memory filter: NEVER issue deleteDoc or setDoc calls inside a snapshot listener!
          const activeRemoteDocs = remoteDocs.filter((rDoc) => {
            const rId = String(rDoc.id || '');
            const rOrd = String(rDoc.orderId || '');
            const rCust = String(rDoc.customerId || '');
            const rLead = String(rDoc.leadId || '');
            return !deletedSet.has(rId) && !PURGE_DUMMY_IDS.has(rId) &&
                   (!rOrd || (!deletedSet.has(rOrd) && !PURGE_DUMMY_IDS.has(rOrd))) &&
                   (!rCust || (!deletedSet.has(rCust) && !PURGE_DUMMY_IDS.has(rCust))) &&
                   (!rLead || (!deletedSet.has(rLead) && !PURGE_DUMMY_IDS.has(rLead)));
          });

          const remoteMap = new Map(activeRemoteDocs.map((d) => [String(d.id || d.orderId), d]));
          const localItems = (Array.isArray(state[colName]) ? state[colName] : []).filter((item) => !isItemDeleted(colName, item));
          const mergedDocs = [...activeRemoteDocs];

          // Merge genuine local items in memory without writing back to Firestore
          localItems.forEach((localItem) => {
            const localKey = String(localItem.id || localItem.orderId || localItem.customerId || localItem.leadId || '');
            if (localKey && !remoteMap.has(localKey) && !isItemDeleted(colName, localItem) && !PURGE_DUMMY_IDS.has(localKey)) {
              mergedDocs.push(localItem);
            }
          });

          // Ensure newest records are always on top
          if (colName === 'orders' || colName === 'leads' || colName === 'notifications') {
            mergedDocs.sort((a, b) => {
              const dateA = new Date(a.orderDate || a.createdAt || a.syncedAt || 0).getTime();
              const dateB = new Date(b.orderDate || b.createdAt || b.syncedAt || 0).getTime();
              return dateB - dateA;
            });
          }

          // Guard against redundant state updates and re-renders
          const currentJson = JSON.stringify(state[colName] || []);
          const newJson = JSON.stringify(mergedDocs);
          if (currentJson !== newJson) {
            state[colName] = mergedDocs;
            saveCollection(colName, false);
          }
        }, (err) => {
          handleFirestorePermissionError('sync', colName, err);
        });
      }
    } catch (err) {
      console.warn(`Firestore sync registration note for ${colName}:`, err.message);
    }
  });
}

// Run initial boot
initDatabase();

// Cross-tab synchronization with equality guard to prevent re-render cascades
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith(STORAGE_PREFIX)) {
      const colName = event.key.replace(STORAGE_PREFIX, '');
      try {
        if (event.newValue && event.newValue !== event.oldValue) {
          const currentSerialized = JSON.stringify(state[colName]);
          if (currentSerialized !== event.newValue) {
            const parsed = JSON.parse(event.newValue);
            state[colName] = parsed;
            emitChange(colName);
          }
        }
      } catch (err) {
        console.warn('Cross-tab storage sync note:', err);
      }
    }
  });
}

function saveCollection(collectionName, syncToCloud = true) {
  try {
    const key = STORAGE_PREFIX + collectionName;
    const serialized = JSON.stringify(state[collectionName]);
    const previous = localStorage.getItem(key);
    // If the data is identical, do not trigger storage events or re-emit to listeners
    if (previous === serialized) {
      return;
    }
    localStorage.setItem(key, serialized);
  } catch (e) {
    console.error(`Failed to persist collection ${collectionName}:`, e);
  }
  emitChange(collectionName);
}

function emitChange(collectionName) {
  if (listeners[collectionName]) {
    listeners[collectionName].forEach((cb) => {
      try {
        if (collectionName === 'settings') {
          cb(state.settings ? { ...state.settings } : { ...initialSettings });
        } else {
          cb([...(state[collectionName] || [])]);
        }
      } catch (err) {
        console.warn('Listener notification error:', err);
      }
    });
  }
}

export const dbService = {
  // Subscribe to collection changes
  subscribe(collectionName, callback) {
    if (!listeners[collectionName]) {
      listeners[collectionName] = new Set();
    }
    listeners[collectionName].add(callback);
    // Initial call
    if (collectionName === 'settings') {
      callback(state.settings ? { ...state.settings } : { ...initialSettings });
    } else {
      callback(Array.isArray(state[collectionName]) ? [...state[collectionName]] : []);
    }

    return () => {
      listeners[collectionName]?.delete(callback);
    };
  },

  // Get all items
  getAll(collectionName) {
    if (collectionName === 'settings') {
      return state.settings ? { ...state.settings } : { ...initialSettings };
    }
    return state[collectionName] ? [...state[collectionName]] : [];
  },

  // Get by ID
  getById(collectionName, id) {
    if (!state[collectionName]) return null;
    return state[collectionName].find((item) => item.id === id) || null;
  },

  // Add new item (with simultaneous Cloud Firestore write)
  async add(collectionName, item, currentUser = null) {
    const newItem = {
      ...item,
      id: item.id || `${collectionName.slice(0, 4)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!Array.isArray(state[collectionName])) {
      state[collectionName] = [];
    }

    state[collectionName].unshift(newItem);
    saveCollection(collectionName);

    // Save persistent backup for newly created/registered users
    if (collectionName === 'users' && typeof window !== 'undefined') {
      try {
        const backupKey = 'sahara_custom_registered_users';
        const existing = JSON.parse(localStorage.getItem(backupKey) || '[]');
        const idStr = String(newItem.id);
        const filtered = existing.filter((u) => String(u.id) !== idStr);
        filtered.unshift(newItem);
        localStorage.setItem(backupKey, JSON.stringify(filtered));
      } catch (e) {}
    }

    // Sync to Cloud Firestore if connected and part of operational core (non-blocking with timeout so UI never freezes)
    if (isFirebaseConfigured && firestoreDb && FIRESTORE_SYNCED_COLLECTIONS.includes(collectionName)) {
      (async () => {
        try {
          await ensureFirebaseAuth().catch(() => {});
          const docId = String(newItem.id || newItem.orderId);
          const docRef = doc(firestoreDb, collectionName, docId);
          const cleanItem = sanitizeForFirestore({
            ...newItem,
            id: docId,
            orderId: newItem.orderId || docId,
            syncedAt: new Date().toISOString()
          });
          await Promise.race([
            setDoc(docRef, cleanItem, { merge: true }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore write timeout')), 2500))
          ]);

          console.log(`[Firestore Sync] Created document ${collectionName}/${docId}`);
        } catch (err) {
          if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
            handleFirestoreQuotaExceeded(err);
          } else {
            console.warn(`Firestore Cloud write note (${collectionName}):`, err.message);
            if (err?.code === 'permission-denied' && typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('firestore-permission-error', { detail: { collection: collectionName, operation: 'add' } }));
            }
          }
        }
      })();
    }

    // Auto audit log
    if (collectionName !== 'auditLogs' && collectionName !== 'notifications' && collectionName !== 'affiliateClicks') {
      this.logAudit({
        userId: currentUser?.id || 'sys_user',
        userName: currentUser?.name || 'System / User',
        action: `CREATE_${collectionName.toUpperCase()}`,
        module: collectionName,
        recordId: newItem.id,
        description: `Created new ${collectionName.slice(0, -1)} (${newItem.name || newItem.customerName || newItem.orderId || newItem.title || newItem.id})`,
        oldValue: null,
        newValue: JSON.stringify(newItem)
      });
    }

    // If adding an order, check if we need to auto trigger commission
    if (collectionName === 'orders') {
      const currentSettings = this.getAll('settings');
      if (isOrderCommissionEligible(newItem, currentSettings)) {
        this.processOrderCommission(newItem, currentUser);
      }
    }

    return newItem;
  },

  // Update item (with simultaneous Cloud Firestore update)
  async update(collectionName, id, updates, currentUser = null) {
    if (collectionName === 'settings') {
      const oldSettings = { ...state.settings };
      state.settings = { ...state.settings, ...updates, updatedAt: new Date().toISOString() };
      saveCollection('settings');

      if (isFirebaseConfigured && firestoreDb) {
        try {
          await ensureFirebaseAuth().catch(() => {});
          const docRef = doc(firestoreDb, 'settings', 'company_settings');
          const cleanSettings = sanitizeForFirestore(state.settings);
          await setDoc(docRef, cleanSettings, { merge: true });
          console.log('[Firestore Sync] Updated company_settings');
        } catch (err) {
          console.warn('Firestore Settings update note:', err.message);
          if (err?.code === 'permission-denied' && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('firestore-permission-error', { detail: { collection: 'settings', operation: 'update' } }));
          }
        }
      }

      this.logAudit({
        userId: currentUser?.id || 'sys_user',
        userName: currentUser?.name || 'Admin',
        action: 'UPDATE_SETTINGS',
        module: 'Settings',
        recordId: 'company_settings',
        description: 'Updated system/commission settings',
        oldValue: JSON.stringify(oldSettings),
        newValue: JSON.stringify(state.settings)
      });
      return state.settings;
    }

    const items = state[collectionName] || [];
    const index = items.findIndex((i) => String(i.id) === String(id));
    if (index === -1) {
      if (isFirebaseConfigured && firestoreDb && FIRESTORE_SYNCED_COLLECTIONS.includes(collectionName)) {
        try {
          await ensureFirebaseAuth().catch(() => {});
          const docRef = doc(firestoreDb, collectionName, String(id));
          const cleanUpdates = sanitizeForFirestore({ ...updates, id, updatedAt: new Date().toISOString() });
          await setDoc(docRef, cleanUpdates, { merge: true });
        } catch (err) {
          console.warn(`Firestore Cloud update note (${collectionName}):`, err.message);
          if (err?.code === 'permission-denied' && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('firestore-permission-error', { detail: { collection: collectionName, operation: 'update' } }));
          }
        }
      }
      return updates;
    }

    const oldItem = { ...items[index] };
    const updatedItem = {
      ...oldItem,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedItem;
    saveCollection(collectionName);

    if (isFirebaseConfigured && firestoreDb && FIRESTORE_SYNCED_COLLECTIONS.includes(collectionName)) {
      try {
        await ensureFirebaseAuth().catch(() => {});
        const docRef = doc(firestoreDb, collectionName, String(id));
        const cleanItem = sanitizeForFirestore(updatedItem);
        await setDoc(docRef, cleanItem, { merge: true });
        console.log(`[Firestore Sync] Updated document ${collectionName}/${id}`);
      } catch (err) {
        if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
          handleFirestoreQuotaExceeded(err);
        } else {
          console.warn(`Firestore Cloud update note (${collectionName}):`, err.message);
          if (err?.code === 'permission-denied' && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('firestore-permission-error', { detail: { collection: collectionName, operation: 'update' } }));
          }
        }
      }
    }

    // Auto audit log
    if (collectionName !== 'auditLogs' && collectionName !== 'notifications' && collectionName !== 'affiliateClicks') {
      this.logAudit({
        userId: currentUser?.id || 'sys_user',
        userName: currentUser?.name || 'System / User',
        action: `UPDATE_${collectionName.toUpperCase()}`,
        module: collectionName,
        recordId: id,
        description: `Updated ${collectionName.slice(0, -1)} #${id}`,
        oldValue: JSON.stringify(oldItem),
        newValue: JSON.stringify(updatedItem)
      });
    }

    // If order status or payment was updated, check commission trigger
    if (collectionName === 'orders') {
      const currentSettings = this.getAll('settings');
      const wasEligible = isOrderCommissionEligible(oldItem, currentSettings);
      const isNowEligible = isOrderCommissionEligible(updatedItem, currentSettings);

      if (!wasEligible && isNowEligible) {
        this.processOrderCommission(updatedItem, currentUser);
      } else if (
        (updatedItem.orderStatus === 'Cancelled' || updatedItem.paymentStatus === 'Refunded') &&
        oldItem.orderStatus !== 'Cancelled'
      ) {
        // Reverse any generated commission on order cancellation
        this.reverseOrderCommission(updatedItem, currentUser);
      }
    }

    return updatedItem;
  },

  // Delete item (with simultaneous Cloud Firestore deletion & permanent blacklist)
  async delete(collectionName, id, currentUser = null) {
    const items = state[collectionName] || [];
    const targetIdStr = String(id);

    // Find the item to delete (by id, orderId, customerId, leadId)
    const itemToDelete = items.find((i) => 
      String(i.id) === targetIdStr || 
      (i.orderId && String(i.orderId) === targetIdStr) ||
      (i.customerId && String(i.customerId) === targetIdStr) ||
      (i.leadId && String(i.leadId) === targetIdStr)
    );

    const idToDelete = itemToDelete?.id ? String(itemToDelete.id) : targetIdStr;
    const orderIdToDelete = itemToDelete?.orderId ? String(itemToDelete.orderId) : (collectionName === 'orders' ? targetIdStr : null);
    const customerIdToDelete = itemToDelete?.customerId ? String(itemToDelete.customerId) : null;
    const leadIdToDelete = itemToDelete?.leadId ? String(itemToDelete.leadId) : null;

    // Permanently record in persistent deleted registry so it can NEVER be resurrected
    recordDeletedId(collectionName, idToDelete, targetIdStr, orderIdToDelete, customerIdToDelete, leadIdToDelete);

    // If order was in ssf_last_order, clear it immediately
    if (collectionName === 'orders' && typeof localStorage !== 'undefined') {
      try {
        const lastRaw = localStorage.getItem('ssf_last_order');
        if (lastRaw) {
          const parsedLast = JSON.parse(lastRaw);
          const pId = String(parsedLast.id || parsedLast.orderId || '');
          if (pId === idToDelete || pId === targetIdStr || (orderIdToDelete && pId === orderIdToDelete)) {
            localStorage.removeItem('ssf_last_order');
          }
        }
      } catch (e) {}
    }

    // Filter out completely from in-memory state
    state[collectionName] = items.filter((i) => {
      const iId = String(i.id || '');
      const iOrd = String(i.orderId || '');
      const iCust = String(i.customerId || '');
      const iLead = String(i.leadId || '');
      return (
        iId !== idToDelete &&
        iId !== targetIdStr &&
        (!orderIdToDelete || iOrd !== orderIdToDelete) &&
        (!customerIdToDelete || iCust !== customerIdToDelete) &&
        (!leadIdToDelete || iLead !== leadIdToDelete)
      );
    });
    saveCollection(collectionName);

    // Delete directly from Firebase Cloud Firestore
    if (isFirebaseConfigured && firestoreDb && FIRESTORE_SYNCED_COLLECTIONS.includes(collectionName)) {
      try {
        await ensureFirebaseAuth().catch(() => {});
        const keysToDelete = new Set([targetIdStr, idToDelete, orderIdToDelete, customerIdToDelete, leadIdToDelete].filter(Boolean));
        for (const k of keysToDelete) {
          try {
            const docRef = doc(firestoreDb, collectionName, String(k));
            await deleteDoc(docRef);
            console.log(`[Firestore Sync] Permanently deleted document ${collectionName}/${k}`);
          } catch (delErr) {
            // Key might not exist in remote DB, ignore
          }
        }
      } catch (err) {
        console.warn(`[Firestore] Delete error (${collectionName}/${id}):`, err.message);
        if (err?.code === 'permission-denied' && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('firestore-permission-error', { detail: { collection: collectionName, operation: 'delete' } }));
        }
      }
    }

    // Auto audit log
    if (collectionName !== 'auditLogs' && collectionName !== 'notifications' && collectionName !== 'affiliateClicks') {
      this.logAudit({
        userId: currentUser?.id || 'sys_user',
        userName: currentUser?.name || 'System / User',
        action: `DELETE_${collectionName.toUpperCase()}`,
        module: collectionName,
        recordId: id,
        description: `Permanently deleted ${collectionName.slice(0, -1)} #${id} (${itemToDelete?.name || itemToDelete?.fullName || itemToDelete?.customerName || itemToDelete?.title || ''})`,
        oldValue: JSON.stringify(itemToDelete || {}),
        newValue: null
      });
    }

    return true;
  },

  // Set or replace an entire collection (e.g. commissionSlabs, products) with persistence & Cloud Firestore sync
  async setCollection(collectionName, items, currentUser = null) {
    state[collectionName] = Array.isArray(items) ? [...items] : items;
    saveCollection(collectionName);

    if (isFirebaseConfigured && firestoreDb && FIRESTORE_SYNCED_COLLECTIONS.includes(collectionName) && Array.isArray(items)) {
      try {
        await ensureFirebaseAuth().catch(() => {});
        // Fetch existing remote docs to remove deleted items from Firestore
        const colRef = collection(firestoreDb, collectionName);
        const existingRemoteSnap = await getDocs(colRef);
        const currentItemIds = new Set(items.map((i) => String(i.id)));

        const batch = writeBatch(firestoreDb);

        // Delete remote documents that are no longer in items
        existingRemoteSnap.docs.forEach((d) => {
          if (!currentItemIds.has(d.id)) {
            batch.delete(d.ref);
          }
        });

        // Set or update current items
        items.forEach((item) => {
          const docId = String(item.id || `item_${Date.now()}_${Math.random()}`);
          const docRef = doc(firestoreDb, collectionName, docId);
          const cleanItem = sanitizeForFirestore({ ...item, id: docId, updatedAt: new Date().toISOString() });
          batch.set(docRef, cleanItem, { merge: true });
        });

        await batch.commit();
        console.log(`[Firestore Sync] Batch synced collection ${collectionName} (${items.length} records)`);
      } catch (err) {
        console.warn(`Firestore batch update note (${collectionName}):`, err.message);
        if (err?.code === 'permission-denied' && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('firestore-permission-error', { detail: { collection: collectionName, operation: 'setCollection' } }));
        }
      }
    }

    if (collectionName !== 'auditLogs' && collectionName !== 'notifications') {
      this.logAudit({
        userId: currentUser?.id || 'sys_user',
        userName: currentUser?.name || 'Admin',
        action: `UPDATE_ALL_${collectionName.toUpperCase()}`,
        module: collectionName,
        recordId: 'all',
        description: `Updated all records in ${collectionName} (${Array.isArray(items) ? items.length : 1} records)`,
        oldValue: null,
        newValue: JSON.stringify(items)
      });
    }

    return state[collectionName];
  },

  // Save or update customer profile both in reactive cache and Cloud Firestore
  async saveCustomerProfile(profile) {
    if (!profile) return null;

    const cleanPhone = (profile.phone || profile.mobileNumber || '').replace(/\D/g, '').trim();
    const custId = profile.id || (cleanPhone ? `CUST-${cleanPhone}` : `CUST-${Date.now()}`);

    const existingList = state.customers || [];
    const existing = existingList.find((c) => 
      c.id === custId || 
      (cleanPhone && (c.phone === cleanPhone || c.mobileNumber === cleanPhone))
    );

    const payload = {
      ...profile,
      id: existing ? existing.id : custId,
      customerId: existing ? (existing.customerId || existing.id) : custId,
      fullName: (profile.fullName || profile.name || '').trim() || 'ग्राहक (Customer)',
      phone: cleanPhone || profile.phone || '',
      mobileNumber: cleanPhone || profile.phone || '',
      whatsappNumber: profile.whatsappNumber || cleanPhone || profile.phone || '',
      email: (profile.email || '').trim(),
      address: (profile.address || '').trim(),
      city: (profile.city || '').trim() || 'कोल्हापूर',
      state: profile.state || 'Maharashtra',
      pincode: (profile.pincode || '').trim(),
      category: profile.category || 'Nutraceutical Buyer',
      source: profile.source || 'Website Profile',
      status: 'Active',
      updatedAt: new Date().toISOString()
    };

    if (existing) {
      await this.update('customers', existing.id, payload);
    } else {
      payload.createdAt = new Date().toISOString();
      await this.add('customers', payload);
    }

    return payload;
  },

  // Commission Engine triggers
  async processOrderCommission(order, currentUser = null) {
    const settings = this.getAll('settings');
    const slabs = this.getAll('commissionSlabs');

    // If order has no beneficiary set, look up the customer's assigned employee/affiliate
    let effectiveOrder = { ...order };
    if (!effectiveOrder.assignedEmployee && !effectiveOrder.assignedAffiliate && effectiveOrder.customerId) {
      const cust = this.getById('customers', effectiveOrder.customerId);
      if (cust) {
        effectiveOrder.assignedEmployee = cust.assignedEmployee;
        effectiveOrder.assignedAffiliate = cust.assignedAffiliate;
      }
    }

    // Default to active users if needed
    if (!effectiveOrder.assignedEmployee && !effectiveOrder.assignedAffiliate) {
      const allUsers = this.getAll('users');
      if (allUsers.length > 0) {
        effectiveOrder.assignedEmployee = allUsers[0].id;
        effectiveOrder.employeeName = allUsers[0].name;
      }
    }

    // Resolve employee and affiliate names and bidirectional referral matching
    if (!effectiveOrder.assignedAffiliate && effectiveOrder.referralCode) {
      const allUsers = this.getAll('users') || [];
      const affUser = allUsers.find(
        (u) => u.referralCode && u.referralCode.toUpperCase() === String(effectiveOrder.referralCode).toUpperCase()
      );
      if (affUser) {
        effectiveOrder.assignedAffiliate = affUser.id;
        effectiveOrder.affiliateName = affUser.name;
      }
    }

    if (effectiveOrder.assignedAffiliate && !effectiveOrder.referralCode) {
      const aff = this.getById('users', effectiveOrder.assignedAffiliate);
      if (aff && aff.referralCode) effectiveOrder.referralCode = aff.referralCode;
    }

    if (effectiveOrder.assignedEmployee && !effectiveOrder.employeeName) {
      const emp = this.getById('users', effectiveOrder.assignedEmployee);
      if (emp) effectiveOrder.employeeName = emp.name;
    }
    if (effectiveOrder.assignedAffiliate && !effectiveOrder.affiliateName) {
      const aff = this.getById('users', effectiveOrder.assignedAffiliate);
      if (aff) effectiveOrder.affiliateName = aff.name;
    }

    // Calculate beneficiary's total cumulative eligible sales volume
    const allOrders = this.getAll('orders') || [];
    const empOrders = allOrders.filter((o) =>
      (o.assignedEmployee === effectiveOrder.assignedEmployee || (!o.assignedEmployee && effectiveOrder.assignedEmployee)) &&
      isOrderCommissionEligible(o, settings)
    );
    const empCumulativeSales = empOrders.reduce((sum, o) => sum + Number(o.eligibleAmount || o.grandTotal || 0), 0);

    const generatedTx = buildCommissionTransactions(effectiveOrder, slabs, settings, empCumulativeSales);

    if (generatedTx.length > 0) {
      for (const tx of generatedTx) {
        const existingTx = (state.commissionTransactions || []).find(
          (t) => (t.orderId === effectiveOrder.id || t.orderRef === effectiveOrder.orderId) && t.beneficiaryId === tx.beneficiaryId
        );

        if (existingTx) {
          // If existing transaction was 0 or pending without rate, update with latest slab calculation
          if (Number(existingTx.commissionAmount) === 0 || existingTx.slabApplied === 'None' || !existingTx.slabApplied) {
            await this.update('commissionTransactions', existingTx.id, {
              saleAmount: tx.saleAmount,
              eligibleAmount: tx.eligibleAmount,
              slabApplied: tx.slabApplied,
              slabRate: tx.slabRate,
              commissionAmount: tx.commissionAmount,
              calculationType: tx.calculationType
            }, currentUser);
          }
        } else {
          await this.add('commissionTransactions', tx, currentUser);
        }
      }

      this.addNotification({
        title: 'New Commission Generated',
        message: `Commission of ₹${generatedTx.reduce((s, t) => s + t.commissionAmount, 0)} generated for Order #${order.orderId || order.id}.`,
        type: 'commission',
        link: '/crm/commission/transactions'
      });
    }
  },

  // Sync and generate missing commissions for all existing paid/delivered orders
  async syncAllOrderCommissions(currentUser = null) {
    const orders = this.getAll('orders');
    const settings = this.getAll('settings');
    const existingTx = this.getAll('commissionTransactions') || [];

    let generatedCount = 0;
    for (const order of orders) {
      if (isOrderCommissionEligible(order, settings)) {
        const hasAffiliate = Boolean(order.assignedAffiliate || order.referralCode);
        const matchingTx = existingTx.find(
          (tx) => (tx.orderId === order.id || tx.orderRef === order.orderId) &&
                  (!hasAffiliate || tx.beneficiaryType === 'Affiliate' || tx.beneficiaryId === order.assignedAffiliate)
        );
        if (!matchingTx || Number(matchingTx.commissionAmount) === 0) {
          await this.processOrderCommission(order, currentUser);
          generatedCount++;
        }
      }
    }
    return generatedCount;
  },

  async reverseOrderCommission(order, currentUser = null) {
    const allTx = this.getAll('commissionTransactions');
    const reversals = buildCommissionReversal(order, allTx);

    for (const rev of reversals) {
      await this.add('commissionTransactions', rev, currentUser);
    }

    if (reversals.length > 0) {
      this.addNotification({
        title: 'Commission Reversed',
        message: `Commission reversed for cancelled/refunded Order #${order.orderId || order.id}.`,
        type: 'commission',
        link: '/crm/commission/transactions'
      });
    }
  },

  // Audit Logger (Kept strictly in reactive local storage to avoid polluting Cloud Firestore)
  logAudit({ userId, userName, action, module, recordId, description, oldValue, newValue }) {
    const log = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      module,
      recordId,
      description,
      oldValue,
      newValue
    };

    if (!state.auditLogs) state.auditLogs = [];
    state.auditLogs.unshift(log);
    // Keep max 200 audit logs locally
    if (state.auditLogs.length > 200) {
      state.auditLogs = state.auditLogs.slice(0, 200);
    }
    saveCollection('auditLogs');
  },

  // Notification Helper (Kept strictly in reactive local storage to avoid polluting Cloud Firestore)
  addNotification({ title, message, type = 'info', link = '/crm' }) {
    const notif = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
      link
    };

    if (!state.notifications) state.notifications = [];
    state.notifications.unshift(notif);
    // Keep max 50 notifications locally
    if (state.notifications.length > 50) {
      state.notifications = state.notifications.slice(0, 50);
    }
    saveCollection('notifications');
  },

  // Mark all notifications read
  markAllNotificationsRead() {
    if (state.notifications) {
      state.notifications.forEach((n) => (n.read = true));
      saveCollection('notifications');
    }
  },

  // Affiliate Marketing Traffic & Click Tracker
  async trackAffiliateClick(referralCode, pageUrl = '', campaign = '') {
    if (!referralCode) return null;
    const cleanCode = String(referralCode).trim().toUpperCase();
    const clickId = `clk_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const clickRecord = {
      id: clickId,
      referralCode: cleanCode,
      pageUrl: pageUrl || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      campaign: campaign || 'direct',
      timestamp: new Date().toISOString()
    };
    try {
      await this.add('affiliateClicks', clickRecord);
    } catch (e) {
      console.warn('Click tracking note:', e);
    }
    return clickRecord;
  },

  // Calculate full affiliate marketing conversion metrics
  getAffiliatePerformance(referralCodeOrId) {
    if (!referralCodeOrId) return { clicks: 0, orders: 0, conversionRate: '0.0%', salesVolume: 0, totalCommission: 0 };
    const needle = String(referralCodeOrId).trim().toUpperCase();
    const allClicks = this.getAll('affiliateClicks') || [];
    const allOrders = this.getAll('orders') || [];
    const allCommTx = this.getAll('commissionTransactions') || [];

    const clicks = allClicks.filter((c) => String(c.referralCode || '').toUpperCase() === needle);
    const orders = allOrders.filter((o) => 
      String(o.referralCode || '').toUpperCase() === needle ||
      String(o.assignedAffiliate || '').toUpperCase() === needle
    );
    const txs = allCommTx.filter((t) => 
      String(t.referralCode || '').toUpperCase() === needle ||
      String(t.beneficiaryId || '').toUpperCase() === needle
    );

    const clicksCount = Math.max(clicks.length, orders.length > 0 ? orders.length : 0);
    const ordersCount = orders.length;
    const conversionRate = clicksCount > 0 ? ((ordersCount / clicksCount) * 100).toFixed(1) + '%' : (ordersCount > 0 ? '100.0%' : '0.0%');
    const salesVolume = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    const totalCommission = txs
      .filter((t) => t.status === 'Approved' || t.status === 'Paid')
      .reduce((sum, t) => sum + (Number(t.commissionAmount) || 0), 0);

    return {
      clicks: clicksCount,
      orders: ordersCount,
      conversionRate,
      salesVolume,
      totalCommission
    };
  },

  // Factory reset to seed data
  resetToSeed() {
    localStorage.clear();
    initDatabase();
    COLLECTIONS.forEach(emitChange);
  },

  // Clear all operational CRM records (customers, leads, orders, transactions, payouts, tickets, logs)
  async clearAllOperationalData() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('crm_explicitly_purged', 'true');
    }

    const operationalCols = [
      'customers',
      'leads',
      'followups',
      'orders',
      'commissionTransactions',
      'commissionPayouts',
      'supportTickets',
      'auditLogs',
      'notifications'
    ];

    // Clear local memory & local storage
    operationalCols.forEach((col) => {
      state[col] = [];
      saveCollection(col);
      emitChange(col);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_PREFIX + col);
          localStorage.removeItem(DELETED_STORAGE_PREFIX + col);
        }
      } catch (e) {}
    });
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('ssf_last_order');
      }
    } catch (e) {}

    // Delete all operational documents from Cloud Firestore
    if (isFirebaseConfigured && firestoreDb) {
      for (const colName of operationalCols) {
        try {
          const colRef = collection(firestoreDb, colName);
          const snapshot = await getDocs(colRef);
          if (!snapshot.empty) {
            const batch = writeBatch(firestoreDb);
            snapshot.docs.forEach((d) => {
              batch.delete(d.ref);
            });
            await batch.commit();
            console.log(`[Firestore] Purged collection: ${colName}`);
          }
        } catch (err) {
          console.warn(`[Firestore] Clear collection error for ${colName}:`, err.message);
        }
      }
    }
  },

  /**
   * Seed and update all CRM collections directly into Cloud Firestore
   */
  async seedFirestore() {
    if (!isFirebaseConfigured || !firestoreDb) {
      throw new Error('Firebase credentials are not configured in .env. Please configure VITE_FIREBASE_PROJECT_ID.');
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('crm_explicitly_purged');
    }

    const dataMap = {
      users: (state.users && state.users.length > 0) ? state.users : initialUsers,
      customers: (state.customers && state.customers.length > 0) ? state.customers : [],
      leads: (state.leads && state.leads.length > 0) ? state.leads : [],
      orders: (state.orders && state.orders.length > 0) ? state.orders : [],
      commissionTransactions: state.commissionTransactions || [],
      commissionPayouts: state.commissionPayouts || []
    };

    let count = 0;
    for (const [colName, items] of Object.entries(dataMap)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          const docId = item.id || `${colName}_${Date.now()}_${Math.random()}`;
          const docRef = doc(firestoreDb, colName, docId);
          await setDoc(docRef, { ...item, id: docId, syncedAt: new Date().toISOString() }, { merge: true });
          count++;
        }
      }
    }

    // Save settings document
    const currentSettings = state.settings || initialSettings;
    await setDoc(doc(firestoreDb, 'settings', 'company_settings'), {
      ...currentSettings,
      syncedAt: new Date().toISOString()
    }, { merge: true });
    count++;

    return { success: true, seededCount: count };
  },

  /**
   * Proactively refresh all primary collections from Cloud Firestore across all devices
   */
  async refreshAllFromFirebase(isCrmContext = false) {
    const isCrm = isCrmContext || (typeof window !== 'undefined' && window.location.pathname.startsWith('/crm'));
    const collectionsToRefresh = isCrm
      ? FIRESTORE_SYNCED_COLLECTIONS
      : ['settings'];

    const results = {};
    for (const col of collectionsToRefresh) {
      try {
        results[col] = await this.refreshFromFirebase(col);
      } catch (e) {
        results[col] = null;
      }
    }
    return results;
  },

  /**
   * Manually fetch latest collection data from Cloud Firestore and sync local store.
   * Fully optimized with cooldown and active listener awareness to prevent quota drain.
   */
  async refreshFromFirebase(collectionName = 'orders', force = false) {
    if (!isFirebaseConfigured || !firestoreDb || isFirestoreQuotaExhausted() || !FIRESTORE_SYNCED_COLLECTIONS.includes(collectionName)) {
      return state[collectionName] || [];
    }

    // 1. If real-time listener is already actively listening, local state is automatically updated. Avoid duplicate read.
    if (firestoreUnsubscribers[collectionName] && !force) {
      return state[collectionName] || [];
    }

    // 2. Cooldown guard: Prevent duplicate getDocs calls within 5 minutes unless explicitly forced
    const now = Date.now();
    const lastFetch = lastFetchTimestamps[collectionName] || 0;
    if (!force && now - lastFetch < FETCH_COOLDOWN_MS && (state[collectionName]?.length > 0 || lastFetch > 0)) {
      return state[collectionName] || [];
    }
    lastFetchTimestamps[collectionName] = now;

    try {
      await ensureFirebaseAuth().catch(() => {});

      // Special handling for singleton 'settings' document
      if (collectionName === 'settings') {
        const settingsDocRef = doc(firestoreDb, 'settings', 'company_settings');
        const snap = await getDoc(settingsDocRef);
        if (snap.exists()) {
          state.settings = snap.data();
          saveCollection('settings', false);
          return state.settings;
        }
        return state.settings || initialSettings;
      }

      // Query with limit(100) to protect read quota
      const colQuery = query(collection(firestoreDb, collectionName), limit(100));
      const snap = await getDocs(colQuery);
      const rawRemoteDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const deletedSet = getDeletedSet(collectionName);

      // In-memory filter: NEVER call deleteDoc inside refresh!
      const activeRemoteDocs = rawRemoteDocs.filter((rDoc) => {
        const rId = String(rDoc.id || '');
        const rOrd = String(rDoc.orderId || '');
        const rCust = String(rDoc.customerId || '');
        const rLead = String(rDoc.leadId || '');
        return !deletedSet.has(rId) && !PURGE_DUMMY_IDS.has(rId) &&
               (!rOrd || (!deletedSet.has(rOrd) && !PURGE_DUMMY_IDS.has(rOrd))) &&
               (!rCust || (!deletedSet.has(rCust) && !PURGE_DUMMY_IDS.has(rCust))) &&
               (!rLead || (!deletedSet.has(rLead) && !PURGE_DUMMY_IDS.has(rLead)));
      });

      const localItems = (Array.isArray(state[collectionName]) ? state[collectionName] : []).filter((item) => !isItemDeleted(collectionName, item));
      const remoteMap = new Map(activeRemoteDocs.map((d) => [String(d.id || d.orderId), d]));
      const merged = [...activeRemoteDocs];

      // Pure in-memory merge without background write calls
      localItems.forEach((local) => {
        const key = String(local.id || local.orderId || local.customerId || local.leadId || '');
        if (key && !remoteMap.has(key) && !deletedSet.has(key) && !PURGE_DUMMY_IDS.has(key)) {
          merged.push(local);
        }
      });

      // Sort newest first
      if (collectionName === 'orders' || collectionName === 'leads' || collectionName === 'notifications' || collectionName === 'reviews') {
        merged.sort((a, b) => {
          const dateA = new Date(a.orderDate || a.createdAt || a.syncedAt || 0).getTime();
          const dateB = new Date(b.orderDate || b.createdAt || b.syncedAt || 0).getTime();
          return dateB - dateA;
        });
      }

      state[collectionName] = merged;
      saveCollection(collectionName, false);
      return merged;
    } catch (err) {
      handleFirestorePermissionError('refresh', collectionName, err);
    }
    return state[collectionName] || [];
  },

  /**
   * Targeted customer order retrieval: Queries ONLY the logged-in customer's orders
   * rather than reading the entire database collection. Zero reads if already in local cache!
   */
  async fetchCustomerOrders(customerUser) {
    if (!customerUser) return [];

    const cleanPhone = (customerUser.phone || customerUser.mobileNumber || '').replace(/\D/g, '').trim();
    const custId = customerUser.id ? String(customerUser.id) : null;

    // Check local store first - 0 reads!
    const localOrders = state.orders || [];
    const localMatches = localOrders.filter((o) => {
      const oPhone = String(o.customerMobile || o.customerPhone || o.phone || '').replace(/\D/g, '');
      const matchPhone = cleanPhone && oPhone && (oPhone === cleanPhone || oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone));
      const matchCustId = custId && (o.customerId === custId || o.id === custId);
      return matchPhone || matchCustId;
    });

    if (localMatches.length > 0) {
      return localMatches;
    }

    if (!isFirebaseConfigured || !firestoreDb || isFirestoreQuotaExhausted()) {
      return [];
    }

    try {
      await ensureFirebaseAuth().catch(() => {});
      const fetched = [];

      // Targeted single-customer query with limit(20)
      if (cleanPhone && cleanPhone.length >= 10) {
        const qPhone = query(collection(firestoreDb, 'orders'), where('customerMobile', '==', cleanPhone), limit(20));
        const snap = await getDocs(qPhone);
        snap.docs.forEach((d) => fetched.push({ id: d.id, ...d.data() }));
      }

      if (fetched.length === 0 && custId) {
        const qCust = query(collection(firestoreDb, 'orders'), where('customerId', '==', custId), limit(20));
        const snap = await getDocs(qCust);
        snap.docs.forEach((d) => fetched.push({ id: d.id, ...d.data() }));
      }

      if (fetched.length > 0) {
        const existing = state.orders || [];
        const existingMap = new Map(existing.map((o) => [String(o.id || o.orderId), o]));
        fetched.forEach((f) => {
          const k = String(f.id || f.orderId);
          if (k && !existingMap.has(k)) {
            existing.unshift(f);
          }
        });
        state.orders = existing;
        saveCollection('orders', false);
      }

      return fetched;
    } catch (e) {
      console.warn('Targeted customer order query note:', e.message);
      return [];
    }
  }
};
