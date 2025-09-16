'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMe } from '@/components/MeProvider';
import { doSignOut, signInWithEmail, signInWithGoogle, setUseAuthEmulator } from '@/lib/firebase';

export default function NavBar(){
  const { me, token } = useMe();
  const [emu, setEmu] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(()=>{
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('useAuthEmulator') === '1'
        || window.location.hostname === 'localhost'
        || window.location.hostname === '127.0.0.1';
      setEmu(v);
    }
  },[]);

  const isStaff = me?.role === 'owner' || me?.role === 'staff';

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
          {token ? (
            <button className="btn secondary" disabled={busy} onClick={async ()=>{ setBusy(true); try{ await doSignOut(); } finally{ setBusy(false); }}}>
              Se déconnecter
            </button>
          ) : (
            <>
              <Link href="/signin">
                <button className="btn">
                  Se connecter
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
