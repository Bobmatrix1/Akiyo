import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDAP2WFNoxqQrqQKRd6X5MKbxKjBE3Jwms",
  authDomain: "akiyo-780ff.firebaseapp.com",
  projectId: "akiyo-780ff",
  storageBucket: "akiyo-780ff.firebasestorage.app",
  messagingSenderId: "445041384311",
  appId: "1:445041384311:web:28a92609e9f2d7c6ba5f72",
  measurementId: "G-2PZZ331Q8W"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app); 
