// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXTxofWmCplXuxzaBfEQbckJST0vJYRQ0",
  authDomain: "mi-menu-restaurant.firebaseapp.com",
  projectId: "mi-menu-restaurant",
  storageBucket: "mi-menu-restaurant.firebasestorage.app",
  messagingSenderId: "573735067462",
  appId: "1:573735067462:web:a8afbdef6a6d48945e0f47",
  measurementId: "G-CNRYWBP78Q"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; // Exporta db para usarlo en otros archivos
export { app };