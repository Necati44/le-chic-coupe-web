'use client'

import { useEffect, useState } from 'react';
import { DemoAppt, getDemoAppointments, removeDemoAppointment, clearDemoAppointments } from '@/lib/demoStore';

function fmtDate(iso: string){
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday:'short', year:'numeric', month:'short', day:'numeric' });
}
function fmtTime(iso: string){
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });
}

export default function DemoAppointmentsList(){
  const [items, setItems] = useState<DemoAppt[]>([]);

  useEffect(()=>{
    const sync = ()=> setItems(getDemoAppointments());
    sync();
    window.addEventListener('storage', sync);
    return ()=> window.removeEventListener('storage', sync);
  },[]);

  if (items.length === 0) {
    return <div className="small">Aucun créneau.</div>;
  }

  return (
    <div>
      <div className="row" style={{marginBottom:8}}>
        <div className="label" style={{margin:0}}>Mes créneaux</div>
        <div style={{flex:1}} />
        <button className="btn secondary" onClick={()=>{ clearDemoAppointments(); setItems([]); }}>Vider</button>
      </div>

      <div className="grid" style={{gridTemplateColumns:'1fr', gap:8}}>
        {items.map(a=>(
          <div key={a.id} className="card">
            <div className="header">
              <div className="title">{a.serviceName} {a.durationMin ? `(${a.durationMin} min)` : ''}</div>
              <div className="small">{a.status}</div>
            </div>
            <div className="body">
              <div className="small">{fmtDate(a.startAt)} • {fmtTime(a.startAt)} — {fmtTime(a.endAt)}</div>
              {a.staffName && <div className="small">Avec: {a.staffName}</div>}
              <div className="small mono" style={{opacity:0.7}}>id: {a.id}</div>
            </div>
            <div className="footer">
              <button className="btn secondary" onClick={()=>{ removeDemoAppointment(a.id); setItems(getDemoAppointments()); }}>
                Annuler
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
