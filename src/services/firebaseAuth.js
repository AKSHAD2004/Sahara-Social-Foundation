// Firebase Authentication Service with Firestore User Synchronization
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  isFirebaseConfigured
} from './firebase';

export const firebaseAuthService = {
  /**
   * Listen to Firebase Auth state changes and fetch associated Firestore user profile & role
   */
  onAuthStateChanged(callback) {
    if (!auth) {
      callback(null);
      return () => {};
    }

    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        let userProfile = null;
        if (db) {
          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              userProfile = { id: fbUser.uid, ...userDoc.data() };
            }
          } catch (err) {
            console.warn('Error fetching Firestore user profile:', err);
          }
        }

        const resolvedUser = userProfile || {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email,
          role: 'sales_employee',
          avatar: fbUser.photoURL || null,
          status: 'active'
        };

        callback(resolvedUser);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Sign in with Email and Password
   */
  async login(email, password) {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Auth is not configured. Use demo switch or configure .env keys.');
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;

    let userProfile = null;
    if (db) {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        userProfile = { id: fbUser.uid, ...userDoc.data() };
      }
    }

    return userProfile || {
      id: fbUser.uid,
      name: fbUser.displayName || email.split('@')[0],
      email: fbUser.email,
      role: 'admin',
      status: 'active'
    };
  },

  /**
   * Register new user in Firebase Auth and create document in Firestore `users` collection
   */
  async register(email, password, userData = {}) {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Auth is not configured.');
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;

    const userPayload = {
      name: userData.name || email.split('@')[0],
      email: email.toLowerCase(),
      phone: userData.phone || '',
      role: userData.role || 'sales_employee',
      department: userData.department || 'Sales & Counseling',
      status: 'active',
      avatar: userData.avatar || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (db) {
      await setDoc(doc(db, 'users', fbUser.uid), userPayload);
    }

    return { id: fbUser.uid, ...userPayload };
  },

  /**
   * Send Password Reset Link
   */
  async resetPassword(email) {
    if (!auth) throw new Error('Firebase Auth is not initialized.');
    await sendPasswordResetEmail(auth, email);
    return true;
  },

  /**
   * Sign out
   */
  async logout() {
    if (auth) {
      await fbSignOut(auth);
    }
  }
};
