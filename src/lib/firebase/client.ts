
// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// This function ensures that we initialize the app only once
function getFirebaseInstances() {
    if (getApps().length === 0) {
        // Initialize the app if it's not already initialized
        app = initializeApp(firebaseConfig);
    } else {
        // Get the default app if it's already been initialized
        app = getApp();
    }
    auth = getAuth(app);
    firestore = getFirestore(app);
    return { app, auth, firestore };
}

// In a client-side only context, we can call it directly
if (typeof window !== 'undefined') {
    const instances = getFirebaseInstances();
    app = instances.app;
    auth = instances.auth;
    firestore = instances.firestore;
}

export { app, auth, firestore, getFirebaseInstances };
