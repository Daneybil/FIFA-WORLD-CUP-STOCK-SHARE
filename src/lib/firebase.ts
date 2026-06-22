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
  projectId: "enduring-tomorrow-3sjh2",
  appId: "1:1077558186767:web:1006a3b0025b9d2d3b247a",
  apiKey: "AIzaSyBkOaEGRXt14icGjF5Ai2hGiuDlRFkqrok",
  authDomain: "enduring-tomorrow-3sjh2.firebaseapp.com",
  storageBucket: "enduring-tomorrow-3sjh2.firebasestorage.app",
  messagingSenderId: "1077558186767"
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
