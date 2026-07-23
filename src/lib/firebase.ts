import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

const databaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId || "(default)";

// Initialize Firestore with native IndexedDB persistent local cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalAutoDetectLongPolling: true
}, databaseId);

export const auth = getAuth(app);
