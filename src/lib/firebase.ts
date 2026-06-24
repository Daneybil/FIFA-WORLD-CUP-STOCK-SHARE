import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { 
  getFirestore 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA9jeJK8CItiH-NkcNg2cUSExozN476pwI",
  authDomain: "fifa-world-cup-stock-share.firebaseapp.com",
  projectId: "fifa-world-cup-stock-share",
  storageBucket: "fifa-world-cup-stock-share.firebasestorage.app",
  messagingSenderId: "1086379398263",
  appId: "1:1086379398263:web:6e3003107c5bf0fab92272",
  measurementId: "G-EJWR4CZWJX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable local persistence so sessions remain intact upon reloads
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Firebase auth persistence error:", err);
});

export default app;
