import { initializeApp } from 'firebase/app';
 import { getAuth } from 'firebase/auth';
 import { getFirestore } from 'firebase/firestore';
 const firebaseConfig = {
 // Pegar configuración de Firebase Console
  apiKey: "AIzaSyCNL1erWO4XHEpJ9I6WrTOhgYOrnKtfV4w",
  authDomain: "modulo5univalle.firebaseapp.com",
  projectId: "modulo5univalle",
  storageBucket: "modulo5univalle.firebasestorage.app",
  messagingSenderId: "651845571700",
  appId: "1:651845571700:web:b2b9f2dea5b372ed4f2d21",
  measurementId: "G-J88RD5PY2F"
 };
 const app = initializeApp(firebaseConfig);
 export const auth = getAuth(app);
 export const db = getFirestore(app);