'use client'

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

export default function ProfilePanel(){
  const [me, setMe] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(()=>{
    (async ()=>{
      try{
        const r = await apiFetch('/auth/me','GET');
        if (r.ok) { setMe(r.data); setName(r.data?.name||''); setPhone(r.data?.phone||''); }
      }catch{}
    })();
  },[]);

  async function save(){
    setBusy(true);
    try{
      const r = await apiFetch('/me','PUT',{ name, phone });
      if (!r.ok) return alert('Erreur: '+r.status);
      setMe(r.data); alert('Profil mis à jour.');
    } finally{ setBusy(false); }
  }

  if (!me) return <div className="small">Connecte-toi pour voir ton profil.</div>;

  return (
    <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <div>
        <div className="label">Nom affiché</div>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} />
      </div>
      <div>
        <div className="label">Téléphone</div>
        <input className="input" value={phone} onChange={e=>setPhone(e.target.value)} />
      </div>
      <div style={{gridColumn:'1 / -1'}}>
        <button className="btn" onClick={save} disabled={busy}>Enregistrer</button>
      </div>
    </div>
  );
}
