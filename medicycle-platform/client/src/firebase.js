// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// 👇 THIS LINE WAS MISSING. IT IS REQUIRED FOR LOGIN TO WORK.
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
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

// Initialize Analytics (Optional, only if you use it)
const analytics = getAnalytics(app);

// 👇 NOW THIS WILL WORK BECAUSE WE IMPORTED THEM AT THE TOP
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();