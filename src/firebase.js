import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPzphqG1qQGIhyY6m-SyhU5FWlHRTDCJc",
  authDomain: "healthy-habit-plate-98efc.firebaseapp.com",
  projectId: "healthy-habit-plate-98efc",
  storageBucket: "healthy-habit-plate-98efc.firebasestorage.app",
  messagingSenderId: "71028562923",
  appId: "1:71028562923:web:1d862a952b6f2f511fd7ae",
  measurementId: "G-GF8PVJB4CE",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => getAnalytics(app));
}
