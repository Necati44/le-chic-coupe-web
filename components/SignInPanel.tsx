'use client'

import { useState, useEffect } from 'react';
import { signInWithEmail, signInWithGoogle, doSignOut, setUseAuthEmulator } from '@/lib/firebase';
import { useMe } from '@/components/MeProvider';

export default function SignInPanel(){
  const { me, token } = useMe();
  const [email, setEmail] = useState('customer@lechiccoupe.fr');
  const [pwd, setPwd] = useState('P4ssword!');
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

  return (
    <div>
      {!token && (
        <>
          <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div>
              <div className="label">Email</div>
              <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div>
              <div className="label">Mot de passe</div>
              <input className="input" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} />
            </div>
          </div>
          <div className="row" style={{marginTop:12}}>
            <button className="btn" onClick={async()=>{ setBusy(true); try{ await signInWithEmail(email, pwd); } finally{ setBusy(false); }}} disabled={busy}>Se connecter</button>
            <button className="btn secondary" onClick={async()=>{ setBusy(true); try{ await signInWithGoogle(); } finally{ setBusy(false); }}} disabled={busy}>Google</button>
          </div>
        </>
      )}

      {token && (
        <div className="row" style={{marginTop:12}}>
          <span className="small">Connecté{me?.email ? `: ${me.email}` : ''}</span>
          <div style={{flex:1}} />
          <button className="btn secondary" onClick={async()=>{ setBusy(true); try{ await doSignOut(); } finally{ setBusy(false); }}} disabled={busy}>Se déconnecter</button>
        </div>
      )}
    </div>
  );
}
