import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA7-tyaHSYeqQVTqeUyJhmMIeQWKChbXjs",
  authDomain: "chatwithme-d9f86.firebaseapp.com",
  projectId: "chatwithme-d9f86",
  storageBucket: "chatwithme-d9f86.appspot.com",
  messagingSenderId: "407136523929",
  appId: "1:407136523929:web:44577cf48e190b51444a08",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
