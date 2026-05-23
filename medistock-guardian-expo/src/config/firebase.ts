import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyCdQhi6Oo5K4rNms57KfPn63lij7bm5AFQ",
  authDomain: "medistock-51865.firebaseapp.com",
  projectId: "medistock-51865",
  storageBucket: "medistock-51865.firebasestorage.app",
  messagingSenderId: "9318667705",
  appId: "1:9318667705:android:c4e219f4561647448fd268",
  databaseURL: "https://medistock-51865-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
export default app;
