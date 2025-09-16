'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/lib/firebase';
import { saveToken, clearToken, getToken } from '@/lib/storage';
import { apiFetch } from '@/lib/apiClient';
import { ensureBackendSession } from '@/lib/authBridge';

type Me = any;
type Ctx = { me: Me|null; token: string|null; loading: boolean; };
const MeCtx = createContext<Ctx>({ me:null, token:null, loading:true });

export function MeProvider({ children }: { children: React.ReactNode }){
  const [token, setToken] = useState<string|null>(getToken() || null);
  const [me, setMe] = useState<Me|null>(null);
  const [loading, setLoading] = useState(true);
  const debug = process.env.NEXT_PUBLIC_DEBUG_API === '1';

  // 1) Écoute Firebase → met à jour idToken
  useEffect(()=> {
    const unsub = useFirebaseAuth(async (t)=>{
      setToken(t);
      if (t) saveToken(t); else clearToken();
    });
    return ()=>unsub();
  },[]);

  // 2) Quand on a un idToken, on crée la session backend puis on charge /users/me
  useEffect(()=> {
    (async ()=>{
      setLoading(true);
      if (!token) { setMe(null); setLoading(false); return; }

      // Échange idToken → cookie "session"
      const bridged = await ensureBackendSession(token);
      if (!bridged.ok) {
        if (debug) console.warn('[MeProvider] /auth/login failed:', bridged);
        setMe(null); setLoading(false); return;
      }

      // Maintenant que le cookie est posé, on peut appeler /users/me
      const r = await apiFetch('/users/me','GET');
      if (debug) console.log('[MeProvider] /users/me →', r.status, r.data);
      setMe(r.ok ? r.data : null);
      setLoading(false);
    })();
  },[token]);

  return <MeCtx.Provider value={{ me, token, loading }}>{children}</MeCtx.Provider>;
}

export const useMe = () => useContext(MeCtx);
