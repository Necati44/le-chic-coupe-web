// components/NavBar.tsx
'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMe } from '@/components/MeProvider';
import { doSignOut, signInWithEmail } from '@/lib/firebase';

export default function NavBar(){
  const { me, token } = useMe();
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(()=> { setMounted(true); }, []);

  const isStaff = (me?.role||'').toString().toLowerCase().match(/owner|staff/);

  return (
    <div className="card" style={{marginBottom:12}}>
      <div className="header">
        <div className="brand">
          <span className="dot" />
          <Link href="/">Le Chic Coupé</Link>
        </div>
        <div className="nav">
          <Link href="/book">Réserver</Link>
          <Link href="/profile">Mon espace</Link>
          {isStaff && <Link href="/admin">Back-office</Link>}
        </div>

        <div className="row" style={{minWidth:300, justifyContent:'flex-end'}}>
          {!mounted ? (
            // 🔒 Markup stable pendant l’hydratation (évite mismatch)
            <div style={{height:36}} aria-hidden="true" />
          ) : token ? (
            <button className="btn secondary" disabled={busy}
              onClick={async ()=>{ setBusy(true); try{ await doSignOut(); } finally{ setBusy(false);} }}>
              Se déconnecter
            </button>
          ) : (
            <>
              <Link href="/signin" className="btn">Se connecter</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
