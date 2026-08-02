import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };

export async function signInWithGoogle() {
  // Support local development test bypasses
  if (import.meta.env.DEV && window.localStorage.getItem('vh-dev-bypass') === 'true') {
    const mockEmail = window.localStorage.getItem('vh-dev-email') || 'test-onboard@gmail.com';
    return {
      user: {
        email: mockEmail,
        displayName: 'Test User',
      },
      idToken: `dev-google:${mockEmail}`,
    };
  }

  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  
  return {
    user: result.user,
    idToken,
  };
}
