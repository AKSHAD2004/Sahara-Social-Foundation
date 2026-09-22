// Firebase Cloud Storage Helper for Avatars and Media Uploads
import { storage, ref, uploadBytes, getDownloadURL, isFirebaseConfigured } from './firebase';

export const firebaseStorageService = {
  /**
   * Upload an image file (File or Blob) to Firebase Storage
   * @param {File|Blob} file 
   * @param {string} folder 'avatars' | 'products' | 'receipts'
   * @param {string} customId Optional identifier
   * @returns {Promise<string>} Download URL
   */
  async uploadFile(file, folder = 'avatars', customId = '') {
    if (!file) throw new Error('No file provided for upload.');

    // If Firebase Storage is not configured with real bucket, convert to base64 Data URL for instant local persistence
    if (!isFirebaseConfigured || !storage) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }

    try {
      const extension = file.name ? file.name.split('.').pop() : 'png';
      const filename = `${folder}/${customId ? `${customId}_` : ''}${Date.now()}.${extension}`;
      const storageRef = ref(storage, filename);

      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/png'
      });

      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.warn('Firebase Storage upload failed, falling back to Data URL:', error);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }
  },

  /**
   * Upload user avatar specifically
   */
  async uploadUserAvatar(file, userId) {
    return this.uploadFile(file, 'avatars', userId);
  }
};
