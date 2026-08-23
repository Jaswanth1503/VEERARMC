import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && rawKey && rawKey !== 'private-key') {
    try {
      const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (error) {
      console.warn('[Firebase Admin Warning] Initialization error:', error);
    }
  }

  // Fallback initialize without crashing
  try {
    return initializeApp({ projectId: projectId || 'veera-rmc-prod' });
  } catch (e) {
    return null;
  }
}

export const getSafeAdminAuth = () => {
  try {
    const app = getAdminApp();
    return app ? getAuth(app) : null;
  } catch (e) {
    return null;
  }
};

export const getSafeAdminDb = () => {
  try {
    const app = getAdminApp();
    return app ? getFirestore(app) : null;
  } catch (e) {
    return null;
  }
};
