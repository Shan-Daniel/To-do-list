// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3H-6ywaItrGwvvnvhF8oMQErHgA50gbg",
  authDomain: "list-c5dcd.firebaseapp.com",
  projectId: "list-c5dcd",
  storageBucket: "list-c5dcd.firebasestorage.app",
  messagingSenderId: "930813865029",
  appId: "1:930813865029:web:8500635318e26645f7c72c",
  measurementId: "G-SHZD2K0WG9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
