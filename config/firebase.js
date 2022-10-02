import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyDZx1WRlCV1lsSIJ5J9vTAqRe4hCiWRfe8',
  authDomain: 'test-4595a.firebaseapp.com',
  projectId: 'test-4595a',
  storageBucket: 'test-4595a.appspot.com',
  messagingSenderId: '375148346004',
  appId: '1:375148346004:web:cd91fafaa0e039050dd281',
  measurementId: 'G-8RG2MBX8VG',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service (db)
export const db = getFirestore(app);

// Get a reference to the Firebase auth object
export const auth = getAuth();
