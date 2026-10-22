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
} from './seedData';
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
  writeBatch,
  serverTimestamp,
  ensureFirebaseAuth,
  syncOrderToFirebase,
  disconnectFirestoreNetwork,
  isFirestoreNetworkDisconnected
} from './firebase';
import { buildCommissionTransactions, buildCommissionReversal, isOrderCommissionEligible } from './commissionEngine';

const STORAGE_PREFIX = 'sahara_crm_prod_';
const DELETED_STORAGE_PREFIX = 'sahara_crm_deleted_';

export const UNWANTED_DUMMY_IDS = new Set([
  'ORD-2026-9953',
  'orde_1790320226159_297',
  'orde_1791196143354_124',
  'SSF-842101',
  'CUST-8421154090',
  'cust_1789982815598_992',
  'lead_1789981569824_327',
  'lead_1789984653453_688',
  'user_1791544252159_4',
  'user_1792565317925_821'
]);

export function getDeletedSet(collectionName) {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(DELETED_STORAGE_PREFIX + collectionName) : null;
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
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
    return set.has(sId) || UNWANTED_DUMMY_IDS.has(sId);
  }
  const id = itemOrId.id ? String(itemOrId.id) : null;
  const orderId = itemOrId.orderId ? String(itemOrId.orderId) : null;
  const customerId = itemOrId.customerId ? String(itemOrId.customerId) : null;
  const leadId = itemOrId.leadId ? String(itemOrId.leadId) : null;
  return (id && (set.has(id) || UNWANTED_DUMMY_IDS.has(id))) || 
         (orderId && (set.has(orderId) || UNWANTED_DUMMY_IDS.has(orderId))) || 
         (customerId && (set.has(customerId) || UNWANTED_DUMMY_IDS.has(customerId))) || 
         (leadId && (set.has(leadId) || UNWANTED_DUMMY_IDS.has(leadId)));
}

// In-memory state and listeners
const state = {};
const listeners = {};
const firestoreUnsubscribers = {};

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
  'notifications'
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
        const existingOrders = (Array.isArray(parsed) ? parsed : []).filter((o) => !isItemDeleted('orders', o));

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

        state[collectionName] = existingOrders;
        localStorage.setItem(key, JSON.stringify(existingOrders));
      } else if (collectionName === 'customers') {
        const existingCustomers = (Array.isArray(parsed) ? parsed : []).filter((c) => !isItemDeleted('customers', c));
        state[collectionName] = existingCustomers;
        localStorage.setItem(key, JSON.stringify(existingCustomers));
      } else if (collectionName === 'users') {
        const existingUsers = (Array.isArray(parsed) ? parsed : []).filter((u) => !isItemDeleted('users', u));
        const officialUserIds = new Set(initialUsers.map((u) => u.id));
        const mergedUsers = [...initialUsers];
        existingUsers.forEach((u) => {
          if (!officialUserIds.has(u.id)) {
            mergedUsers.push(u);
          }
        });
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
  notifications: []
};

// Initialize all data stores
export function initDatabase() {
  COLLECTIONS.forEach((col) => {
    initCollection(col, initialDataMap[col] || []);
  });

  // Connect Firestore real-time synchronization immediately if configured and quota is intact
  if (isFirebaseConfigured && firestoreDb && !isFirestoreQuotaExhausted()) {
    ensureFirebaseAuth().catch(() => {});
    if (typeof window !== 'undefined') {
      setTimeout(setupFirestoreRealtimeSync, 50);
    } else {
      setupFirestoreRealtimeSync();
    }
  }

  // Defer cloud refresh until browser is idle to ensure instant initial render
  if (typeof window !== 'undefined' && isFirebaseConfigured && firestoreDb && !isFirestoreQuotaExhausted()) {
    const scheduleRefresh = window.requestIdleCallback || ((cb) => setTimeout(cb, 2500));
    scheduleRefresh(() => {
      try {
        dbService.refreshAllFromFirebase().catch(() => {});
      } catch (e) {}
    });
  }
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

// Setup live listeners to Cloud Firestore
function setupFirestoreRealtimeSync() {
  if (isFirestoreQuotaExhausted() || (typeof window !== 'undefined' && window.__firestoreQuotaExceeded)) {
    return;
  }

  // Real-time bidirectional sync across Cloud Firestore and local reactive stores
  const SYNC_COLLECTIONS = [
    'products',
    'orders',
    'leads',
    'users',
    'customers',
    'heroSlides',
    'reviews',
    'commissionSlabs',
    'videos',
    'galleryPhotos',
    'settings'
  ];

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
        const colRef = collection(firestoreDb, colName);
        firestoreUnsubscribers[colName] = onSnapshot(colRef, (snapshot) => {
          const remoteDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

          if (colName === 'products') {
            // Core catalog guarantee: ALL official products must ALWAYS be present, never disappear!
            const defaultProds = initialProducts;
            const remoteMap = new Map(remoteDocs.map((p) => [String(p.id), p]));

            // Overlay remote updates onto initial catalog
            const fullCatalog = defaultProds.map((defP) => {
              const remote = remoteMap.get(String(defP.id)) || remoteDocs.find((r) => r.sku && r.sku === defP.sku);
              if (remote) {
                return {
                  ...defP,
                  ...remote,
                  id: defP.id,
                  price: Number(remote.price !== undefined ? remote.price : defP.price),
                  sellingPrice: Number(remote.sellingPrice !== undefined ? remote.sellingPrice : (remote.price || defP.sellingPrice)),
                  mrp: Number(remote.mrp !== undefined ? remote.mrp : defP.mrp),
                  stock: remote.stock !== undefined ? Number(remote.stock) : defP.stock,
                  image: remote.image || defP.image
                };
              }
              return defP;
            });

            // Append any additional custom products added in Firestore
            remoteDocs.forEach((r) => {
              if (!defaultProds.some((dp) => String(dp.id) === String(r.id) || (dp.sku && dp.sku === r.sku))) {
                fullCatalog.push(r);
              }
            });

            const currentJson = JSON.stringify(state.products || []);
            const newJson = JSON.stringify(fullCatalog);
            if (currentJson !== newJson) {
              state.products = fullCatalog;
              saveCollection('products', false);
            }
          } else if (colName === 'commissionSlabs') {
            const defaultSlabs = initialCommissionSlabs;
            const remoteMap = new Map(remoteDocs.map((s) => [String(s.id), s]));
            const fullSlabs = defaultSlabs.map((defS) => remoteMap.get(String(defS.id)) || defS);
            remoteDocs.forEach((r) => {
              if (!defaultSlabs.some((ds) => String(ds.id) === String(r.id))) fullSlabs.push(r);
            });
            const currentJson = JSON.stringify(state.commissionSlabs || []);
            const newJson = JSON.stringify(fullSlabs);
            if (currentJson !== newJson) {
              state.commissionSlabs = fullSlabs;
              saveCollection('commissionSlabs', false);
            }
          } else if (colName === 'users') {
            const defaultUsers = initialUsers;
            const remoteMap = new Map(remoteDocs.map((u) => [String(u.id), u]));
            const fullUsers = defaultUsers.map((defU) => remoteMap.get(String(defU.id)) || defU);
            remoteDocs.forEach((r) => {
              if (!defaultUsers.some((du) => String(du.id) === String(r.id)) && !isItemDeleted('users', r)) {
                fullUsers.push(r);
              }
            });
            const currentJson = JSON.stringify(state.users || []);
            const newJson = JSON.stringify(fullUsers);
            if (currentJson !== newJson) {
              state.users = fullUsers;
              saveCollection('users', false);
            }
          } else if (colName === 'heroSlides') {
            // Filter out any broken base64 slides, fall back to official initial slides
            const validSlides = remoteDocs.filter((s) => s.image && !s.image.startsWith('data:'));
            const finalSlides = validSlides.length > 0 ? validSlides : initialHeroSlides;
            finalSlides.sort((a, b) => (Number(a.displayOrder) || 99) - (Number(b.displayOrder) || 99));
            state.heroSlides = finalSlides;
            saveCollection('heroSlides', false);
          } else if (remoteDocs.length === 0) {
            // For operational collections, 0 documents in Firestore means clean and empty!
            const isOperational = ['orders', 'customers', 'leads', 'followups', 'commissionTransactions', 'commissionPayouts', 'supportTickets', 'auditLogs', 'notifications'].includes(colName);
            if (isOperational) {
              state[colName] = [];
              saveCollection(colName, false);
              return;
            }

            const localItems = (Array.isArray(state[colName]) && state[colName].length > 0)
              ? state[colName]
              : (initialDataMap[colName] || []);

            state[colName] = localItems;
            saveCollection(colName, false);
          } else {
            // Remote Cloud Firestore has documents: purge any deleted/unwanted ones and synchronize
            const activeRemoteDocs = [];
            for (const rDoc of remoteDocs) {
              if (isItemDeleted(colName, rDoc)) {
                // Clean from Cloud Firestore if found remotely
                const dRef = doc(firestoreDb, colName, rDoc.id);
                deleteDoc(dRef).catch(() => {});
              } else {
                activeRemoteDocs.push(rDoc);
              }
            }

            const remoteMap = new Map(activeRemoteDocs.map((d) => [String(d.id || d.orderId), d]));
            const localItems = Array.isArray(state[colName]) ? state[colName] : [];
            const mergedDocs = [...activeRemoteDocs];

            // Only preserve and upload local orders placed directly from this device while offline (NEVER deleted!)
            if (colName === 'orders') {
              localItems.forEach((localItem) => {
                const localKey = String(localItem.id || localItem.orderId || '');
                if (
                  localKey &&
                  !isItemDeleted('orders', localItem) &&
                  !remoteMap.has(localKey) &&
                  (localItem.source === 'Website Checkout' || localItem.orderStatus === 'Confirmed')
                ) {
                  mergedDocs.unshift(localItem);
                  const docRef = doc(firestoreDb, colName, localKey);
                  setDoc(docRef, sanitizeForFirestore({ ...localItem, id: localKey, syncedAt: new Date().toISOString() }), { merge: true }).catch(() => {});
                }
              });
            }

            // Ensure orders, leads, and notifications are sorted newest first
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
          }
        }, (err) => {
          handleFirestorePermissionError('sync', colName, err);
        });
      }
    } catch (err) {
      console.warn(`Firestore sync registration failed for ${colName}:`, err.message);
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

    // Sync to Cloud Firestore if connected
    if (isFirebaseConfigured && firestoreDb) {
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
        await setDoc(docRef, cleanItem, { merge: true });

        if (collectionName === 'orders') {
          await syncOrderToFirebase(cleanItem).catch(() => {});
        }
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
    }

    // Auto audit log
    if (collectionName !== 'auditLogs' && collectionName !== 'notifications') {
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
      if (isFirebaseConfigured && firestoreDb) {
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

    if (isFirebaseConfigured && firestoreDb) {
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
    if (collectionName !== 'auditLogs' && collectionName !== 'notifications') {
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
        oldItem.orderStatus === 'Delivered'
      ) {
        // Reverse any generated commission
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
    if (isFirebaseConfigured && firestoreDb) {
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
    if (collectionName !== 'auditLogs' && collectionName !== 'notifications') {
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

    if (isFirebaseConfigured && firestoreDb && Array.isArray(items)) {
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

    // Direct Cloud Firestore write guarantee
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'customers', String(payload.id));
        const cleanPayload = sanitizeForFirestore({ ...payload, syncedToFirebase: true });
        await setDoc(docRef, cleanPayload, { merge: true });
        console.log(`[Firestore Sync] Profile stored on Cloud Firestore: customers/${payload.id}`);
      } catch (err) {
        console.warn(`[Firebase] Firestore customer profile write note:`, err.message);
      }
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

    // Resolve employee and affiliate names
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
    const slabs = this.getAll('commissionSlabs');
    const existingTx = this.getAll('commissionTransactions') || [];

    let generatedCount = 0;
    for (const order of orders) {
      if (isOrderCommissionEligible(order, settings)) {
        const matchingTx = existingTx.find(
          (tx) => tx.orderId === order.id || tx.orderRef === order.orderId
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

  // Audit Logger
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
    saveCollection('auditLogs');

    if (isFirebaseConfigured && firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'auditLogs', String(log.id));
        setDoc(docRef, sanitizeForFirestore(log), { merge: true }).catch((err) => {
          console.warn('Firestore logAudit note:', err.message);
        });
      } catch (e) {}
    }
  },

  // Notification Helper
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
    saveCollection('notifications');

    if (isFirebaseConfigured && firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'notifications', String(notif.id));
        setDoc(docRef, sanitizeForFirestore(notif), { merge: true }).catch((err) => {
          console.warn('Firestore addNotification note:', err.message);
        });
      } catch (e) {}
    }
  },

  // Mark all notifications read
  markAllNotificationsRead() {
    if (state.notifications) {
      state.notifications.forEach((n) => (n.read = true));
      saveCollection('notifications');

      if (isFirebaseConfigured && firestoreDb) {
        state.notifications.forEach((n) => {
          const docRef = doc(firestoreDb, 'notifications', String(n.id));
          setDoc(docRef, { read: true }, { merge: true }).catch(() => {});
        });
      }
    }
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
      customers: (state.customers && state.customers.length > 0) ? state.customers : initialCustomers,
      leads: (state.leads && state.leads.length > 0) ? state.leads : initialLeads,
      followups: (state.followups && state.followups.length > 0) ? state.followups : initialFollowups,
      orders: (state.orders && state.orders.length > 0) ? state.orders : initialOrders,
      products: (state.products && state.products.length > 0) ? state.products : initialProducts,
      commissionSlabs: (state.commissionSlabs && state.commissionSlabs.length > 0) ? state.commissionSlabs : initialCommissionSlabs,
      commissionTransactions: (state.commissionTransactions && state.commissionTransactions.length > 0) ? state.commissionTransactions : initialCommissionTransactions,
      commissionPayouts: (state.commissionPayouts && state.commissionPayouts.length > 0) ? state.commissionPayouts : initialPayouts,
      supportTickets: (state.supportTickets && state.supportTickets.length > 0) ? state.supportTickets : initialSupportTickets,
      auditLogs: (state.auditLogs && state.auditLogs.length > 0) ? state.auditLogs : initialAuditLogs
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
      ? [
          'orders',
          'leads',
          'users',
          'customers',
          'heroSlides',
          'galleryPhotos',
          'videos',
          'reviews',
          'products',
          'settings'
        ]
      : [
          'settings',
          'heroSlides',
          'products'
        ];

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
   * Manually fetch latest collection data from Cloud Firestore and sync local store
   */
  async refreshFromFirebase(collectionName = 'orders') {
    if (!isFirebaseConfigured || !firestoreDb || isFirestoreQuotaExhausted()) {
      return state[collectionName] || [];
    }
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

      const colRef = collection(firestoreDb, collectionName);
      const snap = await getDocs(colRef);
      const rawRemoteDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const deletedSet = getDeletedSet(collectionName);

      // Filter out and purge any remotely returned docs that were marked as deleted
      const remoteDocs = [];
      for (const rDoc of rawRemoteDocs) {
        const rId = String(rDoc.id || '');
        const rOrd = String(rDoc.orderId || '');
        const rCust = String(rDoc.customerId || '');
        const rLead = String(rDoc.leadId || '');
        if (deletedSet.has(rId) || (rOrd && deletedSet.has(rOrd)) || (rCust && deletedSet.has(rCust)) || (rLead && deletedSet.has(rLead))) {
          const dRef = doc(firestoreDb, collectionName, rDoc.id);
          deleteDoc(dRef).catch((dErr) => {
            if (dErr?.code === 'resource-exhausted' || dErr?.message?.includes('Quota exceeded') || dErr?.message?.includes('resource-exhausted')) {
              handleFirestoreQuotaExceeded(dErr);
            }
          });
        } else {
          remoteDocs.push(rDoc);
        }
      }

      const localItems = (Array.isArray(state[collectionName]) ? state[collectionName] : []).filter((item) => {
        const iId = String(item.id || '');
        const iOrd = String(item.orderId || '');
        const iCust = String(item.customerId || '');
        const iLead = String(item.leadId || '');
        return !deletedSet.has(iId) && (!iOrd || !deletedSet.has(iOrd)) && (!iCust || !deletedSet.has(iCust)) && (!iLead || !deletedSet.has(iLead));
      });

      if (remoteDocs.length > 0) {
        const remoteMap = new Map(remoteDocs.map((d) => [String(d.id || d.orderId), d]));
        const merged = [...remoteDocs];

        // ONLY for orders placed offline on this device: preserve and upload them (NEVER deleted!)
        if (collectionName === 'orders') {
          for (const local of localItems) {
            const key = String(local.id || local.orderId || '');
            const ordKey = String(local.orderId || '');
            if (
              key &&
              !deletedSet.has(key) &&
              (!ordKey || !deletedSet.has(ordKey)) &&
              !remoteMap.has(key) &&
              (local.source === 'Website Checkout' || local.orderStatus === 'Confirmed')
            ) {
              merged.unshift(local);
              try {
                const docRef = doc(firestoreDb, collectionName, key);
                const cleanDoc = sanitizeForFirestore({ ...local, id: key, syncedAt: new Date().toISOString() });
                await setDoc(docRef, cleanDoc, { merge: true });
                console.log(`[Firestore live sync] Auto-uploaded local ${collectionName}/${key} to Firestore!`);
              } catch (err) {
                console.warn(`[Firestore live sync] Error uploading ${key}:`, err.message);
              }
            }
          }
        }

        // Sort collection items properly
        if (collectionName === 'orders' || collectionName === 'leads' || collectionName === 'notifications' || collectionName === 'reviews') {
          merged.sort((a, b) => {
            const dateA = new Date(a.orderDate || a.createdAt || a.syncedAt || 0).getTime();
            const dateB = new Date(b.orderDate || b.createdAt || b.syncedAt || 0).getTime();
            return dateB - dateA;
          });
        } else if (collectionName === 'heroSlides') {
          merged.sort((a, b) => (Number(a.displayOrder) || 99) - (Number(b.displayOrder) || 99));
        }

        state[collectionName] = merged;
        saveCollection(collectionName, false);
        return merged;
      } else {
        const isOperational = ['orders', 'customers', 'leads', 'followups', 'commissionTransactions', 'commissionPayouts', 'supportTickets', 'auditLogs', 'notifications'].includes(collectionName);
        if (isOperational) {
          state[collectionName] = [];
          saveCollection(collectionName, false);
          return [];
        }
        state[collectionName] = localItems.length > 0 ? localItems : (initialDataMap[collectionName] || []);
        saveCollection(collectionName, false);
        return state[collectionName];
      }
    } catch (err) {
      handleFirestorePermissionError('refresh', collectionName, err);
    }
    return state[collectionName] || [];
  }
};
