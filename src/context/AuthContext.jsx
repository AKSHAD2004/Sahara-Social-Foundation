// Authentication Context with Role-Based Access Control, Customer Auth, and Firebase Auth Integration
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initialUsers } from '../services/seedData';
import { dbService } from '../services/db';
import { firebaseAuthService } from '../services/firebaseAuth';
import { isFirebaseConfigured, auth as fbAuth } from '../services/firebase';

// Stable context singleton to prevent HMR and duplicate bundle invalidation
const AuthContext = (typeof window !== 'undefined' && window.__SAHARA_AUTH_CTX__)
  ? window.__SAHARA_AUTH_CTX__
  : (typeof window !== 'undefined' ? (window.__SAHARA_AUTH_CTX__ = createContext(null)) : createContext(null));

const STORAGE_AUTH_KEY = 'sahara_crm_current_user';
const CUSTOMER_STORAGE_KEY = 'sahara_customer_user';

export function AuthProvider({ children }) {
  // Require authentication to access CRM (defaults to null so login page is displayed first)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Customer Authentication for eCommerce Buyers
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const savedCustomer = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (savedCustomer) return JSON.parse(savedCustomer);
    } catch (e) {}
    return null;
  });

  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState(false);
  const customerAuthCallbackRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState(initialUsers);

  useEffect(() => {
    const unsub = dbService.subscribe('users', (users) => {
      setAvailableUsers(users);
      if (currentUser) {
        const updated = users.find((u) => u.id === currentUser.id || u.email?.toLowerCase() === currentUser.email?.toLowerCase());
        if (updated) {
          setCurrentUser(updated);
          localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(updated));
        }
      }
    });
    return unsub;
  }, [currentUser?.id]);

  // Listen to Firebase Auth state if real credentials are configured
  useEffect(() => {
    if (isFirebaseConfigured && fbAuth) {
      const unsubAuth = firebaseAuthService.onAuthStateChanged((fbUser) => {
        if (fbUser) {
          setCurrentUser(fbUser);
          localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(fbUser));
        }
      });
      return unsubAuth;
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && fbAuth) {
        try {
          const userProfile = await firebaseAuthService.login(email, password);
          setCurrentUser(userProfile);
          localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(userProfile));
          return userProfile;
        } catch (fbErr) {
          console.warn('Firebase Auth sign-in failed, checking system users:', fbErr.message);
        }
      }

      // Local fallback auth
      const users = dbService.getAll('users');
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!found) {
        throw new Error('User not found. Try one of the demo role credentials below.');
      }

      setCurrentUser(found);
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(found));
      dbService.logAudit({
        userId: found.id,
        userName: found.name,
        action: 'USER_LOGIN',
        module: 'Auth',
        recordId: found.id,
        description: `User ${found.name} (${found.role}) logged in.`,
        oldValue: null,
        newValue: null
      });

      return found;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && fbAuth) {
      try {
        await firebaseAuthService.logout();
      } catch (e) {
        console.warn('Firebase logout note:', e);
      }
    }

    if (currentUser) {
      dbService.logAudit({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'USER_LOGOUT',
        module: 'Auth',
        recordId: currentUser.id,
        description: `User ${currentUser.name} logged out.`,
        oldValue: null,
        newValue: null
      });
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_AUTH_KEY);
  };

  // Switch role directly (for instant demo, evaluation and testing)
  const switchUser = (userId) => {
    const users = dbService.getAll('users');
    const target = users.find((u) => u.id === userId) || availableUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(target));
      dbService.addNotification({
        title: 'Role Switched',
        message: `Switched active session to ${target.name} (${target.role.replace('_', ' ').toUpperCase()}).`,
        type: 'auth'
      });
    }
  };

  // Customer authentication methods
  const openCustomerAuthModal = (onSuccessCallback) => {
    customerAuthCallbackRef.current = onSuccessCallback || null;
    setIsCustomerAuthModalOpen(true);
  };

  const closeCustomerAuthModal = () => {
    setIsCustomerAuthModalOpen(false);
    customerAuthCallbackRef.current = null;
  };

  const loginCustomer = (userData) => {
    const cleanPhone = (userData.phone || userData.mobile || userData.mobileNumber || '').replace(/\D/g, '').trim();
    const customerObj = {
      id: userData.id || (cleanPhone ? `CUST-${cleanPhone}` : `CUST-${Date.now()}`),
      fullName: userData.fullName || userData.name || 'ग्राहक (Customer)',
      phone: cleanPhone,
      mobileNumber: cleanPhone,
      whatsappNumber: userData.whatsappNumber || cleanPhone,
      email: userData.email || '',
      address: userData.address || '',
      city: userData.city || '',
      state: userData.state || 'Maharashtra',
      pincode: userData.pincode || '',
      loggedInAt: new Date().toISOString()
    };

    setCustomerUser(customerObj);
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerObj));

    // Automatically store and synchronize customer profile with Cloud Firestore
    try {
      dbService.saveCustomerProfile(customerObj);
    } catch (e) {
      console.warn('Auto Firebase profile sync note:', e);
    }

    setIsCustomerAuthModalOpen(false);

    if (customerAuthCallbackRef.current) {
      const cb = customerAuthCallbackRef.current;
      customerAuthCallbackRef.current = null;
      cb(customerObj);
    }

    return customerObj;
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  };

  // Helper permissions check
  const hasRole = (...roles) => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    return roles.includes(currentUser.role);
  };

  const hasAnyRole = (rolesArray) => {
    return hasRole(...rolesArray);
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;
  const isManager = currentUser?.role === 'manager' || isAdmin;
  const isSales = currentUser?.role === 'sales_employee';
  const isAffiliate = currentUser?.role === 'affiliate';
  const isSupport = currentUser?.role === 'support_employee';

  const value = {
    currentUser,
    customerUser,
    isCustomerLoggedIn: !!customerUser,
    isCustomerAuthModalOpen,
    openCustomerAuthModal,
    closeCustomerAuthModal,
    loginCustomer,
    logoutCustomer,
    loading,
    availableUsers,
    isFirebaseConfigured,
    login,
    logout,
    switchUser,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin,
    isManager,
    isSales,
    isAffiliate,
    isSupport
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      currentUser: null,
      customerUser: null,
      isCustomerLoggedIn: false,
      isCustomerAuthModalOpen: false,
      openCustomerAuthModal: () => {},
      closeCustomerAuthModal: () => {},
      loginCustomer: () => null,
      logoutCustomer: () => {},
      loading: false,
      availableUsers: initialUsers,
      isFirebaseConfigured,
      login: async () => null,
      logout: async () => {},
      switchUser: () => {},
      hasRole: () => false,
      hasAnyRole: () => false,
      isSuperAdmin: false,
      isAdmin: false,
      isManager: false,
      isSales: false,
      isAffiliate: false,
      isSupport: false
    };
  }
  return context;
}

