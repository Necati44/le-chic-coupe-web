// components/MeProvider.tsx
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
  const [bridgedFor, setBridgedFor] = useState<string|null>(null);
  const debug = process.env.NEXT_PUBLIC_DEBUG_API === '1';

  useEffect(()=> {
    const unsub = useFirebaseAuth(async (t)=>{
      setToken(t);
      if (t) saveToken(t); else clearToken();
    });
    return ()=>unsub();
  },[]);

  useEffect(()=> {
    (async ()=>{
      setLoading(true);
      if (!token) { setMe(null); setLoading(false); return; }

      if (bridgedFor !== token) {
        const bridged = await ensureBackendSession(token);
        if (!bridged.ok) {
          if (debug) console.warn('[MeProvider] /auth/login failed:', bridged);
          setMe(null); setLoading(false); return;
        }
        setBridgedFor(token);
      }

      const r = await apiFetch('/auth/me','GET'); // ← important
      setMe(r.ok ? r.data.uid : null);
      setLoading(false);
    })();
  },[token, bridgedFor]);

  return <MeCtx.Provider value={{ me, token, loading }}>{children}</MeCtx.Provider>;
}
export const useMe = () => useContext(MeCtx);
