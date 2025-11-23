
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let app: any = null;
let auth: any = null;
let db: any = null;
let appId = 'metriq360-offline';

try {
  const configStr = typeof window !== 'undefined' ? window.__firebase_config : undefined;
  
  if (configStr) {
    const firebaseConfig = JSON.parse(configStr);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    if (window.__app_id) {
      appId = window.__app_id;
    }
  } else {
    // Silent fail for offline mode
    console.log("Offline mode active: No Firebase config detected.");
  }
} catch (e) {
  console.log("Starting in offline mode.");
}

export { auth, db, appId };
