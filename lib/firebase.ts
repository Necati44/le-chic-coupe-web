import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth, connectAuthEmulator, GoogleAuthProvider,
  signInWithPopup, signOut, signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';

let app: FirebaseApp | null = null;
let emulatorConfigured = false;

function shouldUseAuthEmulator(): boolean {
  if (typeof window !== 'undefined') {
    const flag = localStorage.getItem('useAuthEmulator');
    if (flag === '1') return true;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return true;
  }
  return process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR === '1';
}

export function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    app = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    });
  }
  return app!;
}

export function getFirebaseAuth(){
  const auth = getAuth(getFirebaseApp());
  if (typeof window !== 'undefined' && shouldUseAuthEmulator() && !emulatorConfigured) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      emulatorConfigured = true;
      localStorage.setItem('useAuthEmulator', '1');
      console.log('[Auth] Connected to emulator http://localhost:9099');
    } catch (e) {
      console.warn('[Auth] Emulator connect failed:', e);
    }
  }
  return auth;
}

export function useFirebaseAuth(onToken:(token:string|null)=>void){
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, async (user)=>{
    const t = user ? await user.getIdToken() : null;
    onToken(t);
  });
}

export async function signInWithGoogle(){
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return await cred.user.getIdToken();
}

export async function signInWithEmail(email:string, pwd:string){
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, pwd);
  return await cred.user.getIdToken();
}

export async function doSignOut(){
  const auth = getFirebaseAuth();
  await signOut(auth);
}

// Permet de basculer l’émulateur proprement (reload nécessaire pour reconfigurer tôt)
export function setUseAuthEmulator(enabled:boolean){
  if (typeof window === 'undefined') return;
  localStorage.setItem('useAuthEmulator', enabled ? '1' : '0');
  window.location.reload();
}
