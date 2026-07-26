// js/firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyAxXU5MePdVP1OcOyzitl0Jy5jMGrWtTSE",
    authDomain: "salesproapp-ba56b.firebaseapp.com",
    projectId: "salesproapp-ba56b",
    storageBucket: "salesproapp-ba56b.firebasestorage.app",
    messagingSenderId: "954558106678",
    appId: "1:954558106678:web:666ce1e645b3c9bbe01c97",
    measurementId: "G-FPFPWB7VV5"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

/* Offline persistence disabled */
});
const db = firebase.firestore();
const auth = firebase.auth();
let currentUser = null;
