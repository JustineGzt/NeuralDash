// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCB6g1kvn06L58uFujhhlF51oyCYSn5eB0",
  authDomain: "neuraldash-ba1c4.firebaseapp.com",
  projectId: "neuraldash-ba1c4",
  storageBucket: "neuraldash-ba1c4.firebasestorage.app",
  messagingSenderId: "716707781403",
  appId: "1:716707781403:web:8d8660329274f2065111be",
  measurementId: "G-43KE3RWWKR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
