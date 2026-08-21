// ==========================================
// Brintha Builders - Firebase Init
// firebase/firebase.js
// ==========================================
// Uses the Firebase CDN modular SDK (no build step needed).
// Replace firebaseConfig below with YOUR project's config,
// found in Firebase Console > Project Settings > General > Your apps.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHUx4NdpaVqjrztd6YkwHVw1IDyLG8NnY",
  authDomain: "brintha-tracker.firebaseapp.com",
  projectId: "brintha-tracker",
  storageBucket: "brintha-tracker.firebasestorage.app",
  messagingSenderId: "544201336921",
  appId: "1:544201336921:web:2df674621a8c7b593b6948",
  measurementId: "G-H2W1QGWP4F",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  app,
  auth,
  db,
  storage,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
};
