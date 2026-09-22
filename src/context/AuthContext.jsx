// Authentication Context with Role-Based Access Control and Firebase Auth Integration
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers } from '../services/seedData';
import { dbService } from '../services/db';
import { firebaseAuthService } from '../services/firebaseAuth';
import { isFirebaseConfigured, auth as fbAuth } from '../services/firebase';

const AuthContext = createContext(null);

const STORAGE_AUTH_KEY = 'sahara_crm_current_user';

export function AuthProvider({ children }) {
  // Default to Super Admin so the CRM is immediately interactive
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialUsers[0]; // Dr. Sharad Patil (Super Admin)
  });

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
        const userProfile = await firebaseAuthService.login(email, password);
        setCurrentUser(userProfile);
        localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(userProfile));
        return userProfile;
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
