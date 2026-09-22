// Unified Database Service Layer for Samarth Kolhapur CRM
// Dual Architecture: Cloud Firestore with persistent local reactive fallback for seamless zero-error operation

import { 
  initialUsers, 
  initialCustomers, 
  initialLeads, 
  initialFollowups, 
  initialOrders, 
  initialProducts, 
  initialCommissionSlabs, 
  initialCommissionTransactions, 
  initialPayouts, 
  initialSupportTickets, 
  initialAuditLogs, 
  initialSettings 
} from './seedData';
import { 
  isFirebaseConfigured, 
  db as firestoreDb,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  serverTimestamp 
} from './firebase';
import { buildCommissionTransactions, buildCommissionReversal, isOrderCommissionEligible } from './commissionEngine';

const STORAGE_PREFIX = 'sahara_crm_prod_';

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
  'commissionSlabs',
  'commissionTransactions',
  'commissionPayouts',
  'supportTickets',
  'auditLogs',
  'settings',
  'notifications'
];

// Initialize collection cache
function initCollection(collectionName, defaultData) {
  try {
    const key = STORAGE_PREFIX + collectionName;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // For core catalogs (products, commissionSlabs, users), ensure they don't remain empty
      if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(defaultData) && defaultData.length > 0) {
        state[collectionName] = defaultData;
        localStorage.setItem(key, JSON.stringify(defaultData));
      } else {
        state[collectionName] = parsed;
      }
    } else {
      state[collectionName] = defaultData;
      localStorage.setItem(key, JSON.stringify(defaultData));
    }
  } catch (e) {
    state[collectionName] = defaultData;
  }
}

// Initialize all data stores
export function initDatabase() {
  initCollection('users', initialUsers);
  initCollection('customers', initialCustomers);
  initCollection('leads', initialLeads);
  initCollection('followups', initialFollowups);
  initCollection('orders', initialOrders);
  initCollection('products', initialProducts);
  initCollection('commissionSlabs', initialCommissionSlabs);
  initCollection('commissionTransactions', initialCommissionTransactions);
  initCollection('commissionPayouts', initialPayouts);
  initCollection('supportTickets', initialSupportTickets);
  initCollection('auditLogs', initialAuditLogs);
  initCollection('settings', initialSettings);
  initCollection('notifications', []);

  // Connect Firestore real-time synchronization if configured (deferred after window load so browser tab finishes loading immediately)
  if (isFirebaseConfigured && firestoreDb) {
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        setTimeout(setupFirestoreRealtimeSync, 200);
      } else {
        window.addEventListener('load', () => {
          setTimeout(setupFirestoreRealtimeSync, 200);
        }, { once: true });
      }
    } else {
      setupFirestoreRealtimeSync();
    }
  }

  // Automatically sync/generate commissions for any pending paid orders
  setTimeout(() => {
    try {
      dbService.syncAllOrderCommissions();
    } catch (e) {}
  }, 300);
}

// Setup live listeners to Cloud Firestore
function setupFirestoreRealtimeSync() {
  COLLECTIONS.forEach((colName) => {
    try {
      if (firestoreUnsubscribers[colName]) return;

      if (colName === 'settings') {
        const settingsDocRef = doc(firestoreDb, 'settings', 'company_settings');
        firestoreUnsubscribers[colName] = onSnapshot(settingsDocRef, (snap) => {
          if (snap.exists()) {
            state.settings = snap.data();
            saveCollection('settings', false);
          }
        }, (err) => console.warn(`Firestore sync note for ${colName}:`, err.message));
      } else {
        const colRef = collection(firestoreDb, colName);
        firestoreUnsubscribers[colName] = onSnapshot(colRef, (snapshot) => {
          const remoteDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          // If remote collection is empty for core catalogs, seed with initial catalog
          if (remoteDocs.length === 0 && (colName === 'products' || colName === 'commissionSlabs' || colName === 'users')) {
            if (!state[colName] || state[colName].length === 0) {
              const defaults = colName === 'products' ? initialProducts : (colName === 'commissionSlabs' ? initialCommissionSlabs : initialUsers);
              state[colName] = defaults;
              saveCollection(colName, true);
            }
          } else {
            state[colName] = remoteDocs;
            saveCollection(colName, false);
          }
        }, (err) => console.warn(`Firestore sync note for ${colName}:`, err.message));
      }
    } catch (err) {
      console.warn(`Firestore sync registration failed for ${colName}:`, err.message);
    }
  });
}

// Run initial boot
initDatabase();

function saveCollection(collectionName, syncToCloud = true) {
  try {
    const key = STORAGE_PREFIX + collectionName;
    localStorage.setItem(key, JSON.stringify(state[collectionName]));
  } catch (e) {
    console.error(`Failed to persist collection ${collectionName}:`, e);
  }
  emitChange(collectionName);
}

function emitChange(collectionName) {
  if (listeners[collectionName]) {
    listeners[collectionName].forEach((cb) => {
      if (collectionName === 'settings') {
        cb(state.settings ? { ...state.settings } : { ...initialSettings });
      } else {
        cb([...(state[collectionName] || [])]);
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
        const docRef = doc(firestoreDb, collectionName, newItem.id);
        await setDoc(docRef, newItem, { merge: true });
      } catch (err) {
        console.warn(`Firestore Cloud write note (${collectionName}):`, err.message);
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
          const docRef = doc(firestoreDb, 'settings', 'company_settings');
          await setDoc(docRef, state.settings, { merge: true });
        } catch (err) {
          console.warn('Firestore Settings update note:', err.message);
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
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Record ${id} not found in ${collectionName}`);
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
        const docRef = doc(firestoreDb, collectionName, id);
        await updateDoc(docRef, updatedItem);
      } catch (err) {
        console.warn(`Firestore Cloud update note (${collectionName}):`, err.message);
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

  // Delete item (with simultaneous Cloud Firestore deletion)
  async delete(collectionName, id, currentUser = null) {
    const items = state[collectionName] || [];
    const itemToDelete = items.find((i) => i.id === id);

    state[collectionName] = items.filter((i) => i.id !== id);
    saveCollection(collectionName);

    // Delete directly from Firebase Cloud Firestore
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const docRef = doc(firestoreDb, collectionName, id);
        await deleteDoc(docRef);
        console.log(`[Firestore] Deleted document ${collectionName}/${id}`);
      } catch (err) {
        console.warn(`[Firestore] Delete error (${collectionName}/${id}):`, err.message);
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
        description: `Deleted ${collectionName.slice(0, -1)} #${id} (${itemToDelete?.name || itemToDelete?.fullName || itemToDelete?.customerName || itemToDelete?.title || ''})`,
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
        // Fetch existing remote docs to remove deleted items from Firestore
        const colRef = collection(firestoreDb, collectionName);
        const existingRemoteSnap = await getDocs(colRef);
        const currentItemIds = new Set(items.map((i) => i.id));

        const batch = writeBatch(firestoreDb);

        // Delete remote documents that are no longer in items
        existingRemoteSnap.docs.forEach((d) => {
          if (!currentItemIds.has(d.id)) {
            batch.delete(d.ref);
          }
        });

        // Set or update current items
        items.forEach((item) => {
          const docId = item.id || `item_${Date.now()}_${Math.random()}`;
          const docRef = doc(firestoreDb, collectionName, docId);
          batch.set(docRef, { ...item, id: docId, updatedAt: new Date().toISOString() }, { merge: true });
        });

        await batch.commit();
      } catch (err) {
        console.warn(`Firestore batch update note (${collectionName}):`, err.message);
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
  },

  // Mark all notifications read
  markAllNotificationsRead() {
    if (state.notifications) {
      state.notifications.forEach((n) => (n.read = true));
      saveCollection('notifications');
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
    });

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
   * Seed all CRM collections directly into Cloud Firestore with 1 click
   */
  async seedFirestore() {
    if (!isFirebaseConfigured || !firestoreDb) {
      throw new Error('Firebase credentials are not configured in .env. Please configure VITE_FIREBASE_PROJECT_ID.');
    }

    const dataMap = {
      users: initialUsers,
      customers: initialCustomers,
      leads: initialLeads,
      followups: initialFollowups,
      orders: initialOrders,
      products: initialProducts,
      commissionSlabs: initialCommissionSlabs,
      commissionTransactions: initialCommissionTransactions,
      commissionPayouts: initialPayouts,
      supportTickets: initialSupportTickets,
      auditLogs: initialAuditLogs
    };

    let count = 0;
    for (const [colName, items] of Object.entries(dataMap)) {
      for (const item of items) {
        const docRef = doc(firestoreDb, colName, item.id);
        await setDoc(docRef, { ...item, syncedAt: new Date().toISOString() }, { merge: true });
        count++;
      }
    }

    // Save settings document
    await setDoc(doc(firestoreDb, 'settings', 'company_settings'), initialSettings, { merge: true });

    return { success: true, seededCount: count };
  }
};
