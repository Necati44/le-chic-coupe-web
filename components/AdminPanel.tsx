'use client'

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

export default function AdminPanel(){
  const [tab, setTab] = useState<'rdv'|'dispos'>('rdv');
  const [appointments, setAppointments] = useState<any[]|null>(null);
  const [bulk, setBulk] = useState(JSON.stringify({
    staffId: 'uid-staff-001',
    slots: [
      { weekday:'MON', start:'09:00', end:'12:00' },
      { weekday:'MON', start:'14:00', end:'18:00' },
      { weekday:'TUE', start:'10:00', end:'16:00' },
    ]
  }, null, 2));
  const [log, setLog] = useState<string>('');

  useEffect(()=>{
    if (tab !== 'rdv') return;
    (async ()=>{
      try{
        // ENDPOINT: adapte si nécessaire
        const r = await apiFetch('/appointments?salon=1','GET');
        if (r.ok) setAppointments(r.data); else setAppointments([]);
      }catch{ setAppointments([]); }
    })();
  },[tab]);

  async function sendBulk(){
    try{
      const payload = JSON.parse(bulk);
      const r = await apiFetch('/staff-availabilities/bulk-upsert','POST',payload);
      setLog('Status '+r.status+'\n'+JSON.stringify(r.data, null, 2));
    } catch(e:any){
      setLog('Erreur: '+(e?.message||String(e)));
    }
  }

  return (
    <div>
      <div className="row" style={{marginBottom:12}}>
        <button className={"btn "+(tab==='rdv'?'':'secondary')} onClick={()=>setTab('rdv')}>Rendez-vous</button>
        <button className={"btn "+(tab==='dispos'?'':'secondary')} onClick={()=>setTab('dispos')}>Dispos (bulk)</button>
      </div>

      {tab==='rdv' && (
        <div className="grid">
          {!appointments ? <div className="small">Chargement…</div> :
            !appointments.length ? <div className="small">Aucun RDV.</div> :
            appointments.map((a,i)=>(
              <div className="service" key={i}>
                <div style={{flex:1}}>
                  <strong>{a?.service?.name || a?.serviceId}</strong>
                  <div className="small">{new Date(a.startAt).toLocaleString()} → {new Date(a.endAt).toLocaleString()}</div>
                </div>
                <div className="small">{a?.customer?.name || a?.customerId}</div>
                <div className="small">{a?.staff?.name || a?.staffId}</div>
              </div>
            ))
          }
        </div>
      )}

      {tab==='dispos' && (
        <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:12}}>
          <div>
            <div className="label">Payload (JSON)</div>
            <textarea className="textarea mono" value={bulk} onChange={e=>setBulk(e.target.value)} />
            <div className="row" style={{marginTop:8}}>
              <button className="btn" onClick={sendBulk}>Envoyer</button>
            </div>
          </div>
          <div>
            <div className="label">Réponse</div>
            <pre className="mono" style={{whiteSpace:'pre-wrap'}}>{log || '—'}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
