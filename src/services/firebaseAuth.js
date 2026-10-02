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
   * Sign in with Email and Password using Firebase Authentication
   * Automatically provisions user in Firebase Auth & Firestore if not existing yet
   */
  async login(email, password) {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Auth is not configured. Please verify .env keys.');
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    let fbUser = null;

    try {
      // First attempt to sign in to Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      fbUser = cred.user;
    } catch (authError) {
      const code = authError.code || '';
      // If user does not exist in Firebase Auth, auto-register them in Firebase Auth
      if (
        code === 'auth/user-not-found' || 
        code === 'auth/invalid-credential' || 
        authError.message?.includes('user-not-found') ||
        authError.message?.includes('invalid-credential')
      ) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          fbUser = newCred.user;
        } catch (createError) {
          // If creation fails because email already exists, throw the authentication error
          if (createError.code === 'auth/email-already-in-use') {
            throw new Error('Incorrect password for this Firebase account.');
          }
          throw createError;
        }
      } else {
        throw authError;
      }
    }

    // Retrieve or populate user profile in Cloud Firestore
    let userProfile = null;
    if (db && fbUser) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          userProfile = { id: fbUser.uid, ...userDoc.data() };
        } else {
          const isSuper = cleanEmail.includes('admin');
          userProfile = {
            id: fbUser.uid,
            name: isSuper ? 'Dr. Sharad Patil (Super Admin)' : (fbUser.displayName || cleanEmail.split('@')[0]),
            email: cleanEmail,
            role: isSuper ? 'super_admin' : 'sales_employee',
            department: isSuper ? 'Executive Management' : 'Sales & Support',
            status: 'active',
            syncedToFirebase: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(userDocRef, userProfile, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore profile sync note:', err.message);
      }
    }

    return userProfile || {
      id: fbUser.uid,
      name: cleanEmail.includes('admin') ? 'Dr. Sharad Patil (Super Admin)' : cleanEmail.split('@')[0],
      email: cleanEmail,
      role: cleanEmail.includes('admin') ? 'super_admin' : 'sales_employee',
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
