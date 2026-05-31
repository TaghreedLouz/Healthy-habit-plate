// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPzphqG1qQGIhyY6m-SyhU5FWlHRTDCJc",
  authDomain: "healthy-habit-plate-98efc.firebaseapp.com",
  projectId: "healthy-habit-plate-98efc",
  storageBucket: "healthy-habit-plate-98efc.firebasestorage.app",
  messagingSenderId: "71028562923",
  appId: "1:71028562923:web:1d862a952b6f2f511fd7ae",
  measurementId: "G-GF8PVJB4CE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);