
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "moodlight-lah48",
  appId: "1:39982483307:web:ee9bb2e583603b5581ae2e",
  storageBucket: "moodlight-lah48.firebasestorage.app",
  apiKey: "AIzaSyAN5ZXE5kFJAbljbqR5rq-_xGbfQ22SskM",
  authDomain: "moodlight-lah48.firebaseapp.com",
  databaseURL: "https://moodlight-lah48-default-rtdb.firebaseio.com",
  // measurementId is optional and can be an empty string if you're not using Analytics or haven't configured it
  measurementId: "", 
  messagingSenderId: "39982483307",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database service
const database = getDatabase(app);

// Export the 'database' object so you can use it in other parts of your app
export { database };
