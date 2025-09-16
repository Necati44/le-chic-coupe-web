'use client'

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

function fmt(d:string){ return new Date(d).toLocaleString(); }

export default function MyAppointments(){
  const [list, setList] = useState<any[]|null>(null);

  useEffect(()=>{
    (async ()=>{
      try{
        const r = await apiFetch('/appointments/:id','GET');
        if (r.ok) setList(r.data); else setList([]);
      }catch{ setList([]); }
    })();
  },[]);

  if (!list) return <div className="small">Chargement…</div>;
  if (!list.length) return <div className="small">Aucun rendez-vous.</div>;

  return (
    <div className="grid">
      {list.map((a,i)=> (
        <div key={i} className="service">
          <div style={{flex:1}}>
            <strong>{a?.service?.name || a?.serviceId || 'Service'}</strong>
            <div className="small">{fmt(a.startAt)} → {fmt(a.endAt)}</div>
          </div>
          <div className="small">{a?.staff?.name || a?.staffId}</div>
        </div>
      ))}
    </div>
  );
}
