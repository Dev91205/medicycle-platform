// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcx8kGcm87Z1Kg1N0J67XOuKO100hMZSg",
  authDomain: "medicycle-auth.firebaseapp.com",
  projectId: "medicycle-auth",
  storageBucket: "medicycle-auth.firebasestorage.app",
  messagingSenderId: "650747913036",
  appId: "1:650747913036:web:a058981907f3315aa0a5e9",
  measurementId: "G-XB5FZDJ2TT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();