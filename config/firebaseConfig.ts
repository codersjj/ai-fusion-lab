// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "ai-fusion-lab-666.firebaseapp.com",
  projectId: "ai-fusion-lab-666",
  storageBucket: "ai-fusion-lab-666.firebasestorage.app",
  messagingSenderId: "851986226611",
  appId: "1:851986226611:web:a54fa9e32b6f60166c3fc6",
  measurementId: "G-3DF9XJTV29",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };
