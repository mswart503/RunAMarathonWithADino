    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
    import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDeNjkitXJAP8j2QKrd8I6FINd-Dy7bn8c",
        authDomain: "runamarathonwithadino.firebaseapp.com",
        projectId: "runamarathonwithadino",
        storageBucket: "runamarathonwithadino.firebasestorage.app",
        messagingSenderId: "114240133350",
        appId: "1:114240133350:web:c912050fee7f78df160327",
        measurementId: "G-GLHFQV2NTV"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    // Initialize Cloud Firestore and get a reference to the service
    const db = getFirestore(app);

    // Make db globally available (for now, for testing)
    window.db = db;
