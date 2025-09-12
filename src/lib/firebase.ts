// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  projectId: "moodlight-lah48",
  appId: "1:39982483307:web:ee9bb2e583603b5581ae2e",
  storageBucket: "moodlight-lah48.firebasestorage.app",
  apiKey: "AIzaSyAN5ZXE5kFJAbljbqR5rq-_xGbfQ22SskM",
  authDomain: "moodlight-lah48.firebaseapp.com",
  databaseURL: "https://moodlight-lah48-default-rtdb.firebaseio.com",
  measurementId: "",
  messagingSenderId: "39982483307",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
