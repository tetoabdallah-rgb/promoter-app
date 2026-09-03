// js/firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyBx9HhOL7ZDmp9c1Trmuc0syg23rT85zWw",
    authDomain: "promoter-app-c2a18.firebaseapp.com",
    projectId: "promoter-app-c2a18",
    storageBucket: "promoter-app-c2a18.firebasestorage.app",
    messagingSenderId: "926632289614",
    appId: "1:926632289614:web:2d1cf4407eaef3bfe4aa1f"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();
let currentUser = null;

