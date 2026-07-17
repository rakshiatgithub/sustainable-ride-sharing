import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "greencommute-972f1.firebaseapp.com",
  projectId: "greencommute-972f1",
  storageBucket: "greencommute-972f1.firebasestorage.app",
  messagingSenderId: "654782987889",
  appId: "1:654782987889:web:d9e5ef3aaf883e55a165d0",
  measurementId: "G-926TDZ9R6G"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser doesn\'t support persistence');
    }
  });
}

console.log('✅ Firebase initialized');

export default app;
