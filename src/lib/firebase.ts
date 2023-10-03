// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_IIkYN6NjwyJR-P-noxXyEDq4YcMWdFA",
  authDomain: "me-panel.firebaseapp.com",
  projectId: "me-panel",
  storageBucket: "me-panel.appspot.com",
  messagingSenderId: "61289695994",
  appId: "1:61289695994:web:97c22e7b080d8006351743",
  measurementId: "G-BBP0WS0EQK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);