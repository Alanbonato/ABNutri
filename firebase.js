// firebase.js - initializes Firebase and exports helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// NOTE: this uses the same firebaseConfig as your original file.
// Keep keys as in your environment or replace with environment variables for production.
const firebaseConfig = {
  apiKey: "AIzaSyDYcgm0wfWgecIFvjSV3MF2QLdUuuCwoLU",
  authDomain: "abfitness-af1cc.firebaseapp.com",
  projectId: "abfitness-af1cc",
  storageBucket: "abfitness-af1cc.firebasestorage.app",
  messagingSenderId: "392827676437",
  appId: "1:392827676437:web:386a433fffbeef99bdab1c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, doc, getDoc, setDoc, collection, getDocs, updateDoc, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
