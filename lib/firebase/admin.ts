import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'project-id',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'client-email',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 'private-key',
      }),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error', error);
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
