import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfxCAWcZZUY8_srM0spa4CKUXJcofB5c0",
  authDomain: "fir-artist-managements.firebaseapp.com",
  projectId: "fir-artist-managements",
  storageBucket: "fir-artist-managements.firebasestorage.app",
  messagingSenderId: "807687107633",
  appId: "1:807687107633:web:819288939f6006582dd110"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore
const db = getFirestore(app);

// Export Users collection reference
const Artist = collection(db, "Artist");
const Users = collection(db, "Users");
const Ratings = collection(db, "Ratings");
export { Artist,Users,Ratings};
