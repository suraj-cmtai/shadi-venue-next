import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";


// Load Firebase service account credentials
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");

// Initialize Firebase App (Only if not already initialized)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    });
}

// Export Firebase services
const db = getFirestore();
const auth = getAuth();
const adminStorage = getStorage(); // Firebase Storage

export { db, auth, adminStorage };
