
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyBUFqWT3P9o_lKTuCVkxLxdyRdm8PHDTrI",
  authDomain: "quick-mart-7c9db.firebaseapp.com",
  projectId: "quick-mart-7c9db",
  storageBucket: "quick-mart-7c9db.firebasestorage.app",
  messagingSenderId: "1060780981716",
  appId: "1:1060780981716:web:7e8a590e8d9d771cf22a41",
  measurementId: "G-QQL4NQSH7X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app); 
