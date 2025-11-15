
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const isDev = process.env.NODE_ENV === 'development';
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    if(isDev) {
      // Point to the emulators on localhost.
      // Make sure you're running the emulators!
      connectAuthEmulator(getAuth(app), 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(getFirestore(app), '127.0.0.1', 8080);
      connectDatabaseEmulator(getDatabase(app), '127.0.0.1', 9000);
    }
    return getSdks(app);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    database: getDatabase(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
