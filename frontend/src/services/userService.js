import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  
  export const userService = {
    async createOrUpdateUser(userData) {
      const userRef = doc(db, 'users', userData.uid);
      const userDoc = await getDoc(userRef);
  
      const userInfo = {
        email: userData.email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(!userDoc.exists() && { createdAt: serverTimestamp() })
      };
  
      if (!userDoc.exists()) {
        // Create new user
        await setDoc(userRef, {
          ...userInfo,
          // Add default values for new users
          bio: '',
          phoneNumber: '',
          address: '',
          preferences: {
            notifications: true,
            newsletter: false
          }
        });
      } else {
        // Update existing user
        await updateDoc(userRef, userInfo);
      }
  
      return userInfo;
    },
  
    async getUser(uid) {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
  
      return { id: userDoc.id, ...userDoc.data() };
    },
  
    async updateUserProfile(uid, profileData) {
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
  
      return this.getUser(uid);
    }
  };