import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDlxB_dTCm4SZ0wBsgTCkZYS649VnLWx9g",
  authDomain: "centrodrinks.firebaseapp.com",
  projectId: "centrodrinks",
  storageBucket: "centrodrinks.appspot.com",
  messagingSenderId: "407701189524",
  appId: "1:407701189524:web:eda05e534e6ac8649b1581"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };