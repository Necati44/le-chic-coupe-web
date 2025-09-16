'use client'

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { useSearchParams } from 'next/navigation';
import { useMe } from '@/components/MeProvider';

type Service = { id:string; name:string; durationMinutes:number; price?:number; description?:string };
type Staff = { id:string; name:string; role?:string };

function toIsoDate(d:Date){ return d.toISOString().slice(0,10); }
function fmtHHMM(x:string){ if (/^\d{2}:\d{2}$/.test(x)) return x; const d=new Date(x); return isNaN(d.getTime())? String(x): d.toTimeString().slice(0,5); }
function itemsOf(json:any): any[] {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.items)) return json.items;
  if (json && Array.isArray(json.slots)) return json.slots;
  return [];
}
function getCustomerId(me:any): string | null {
  if (!me) return null;
  const id =
    me.id ?? me.userId ?? me.customerId ??
    me.uid ?? me.firebaseUid ??
    me.user?.id ?? me.user?.uid ?? me.user?.firebaseUid ?? null;
  return typeof id === 'string' ? id : null;
}
function roleOf(me:any): 'owner'|'staff'|'customer'|null {
  const r = me?.role ? String(me.role).toLowerCase() : null;
  if (!r) return null;
  if (r.includes('owner')) return 'owner';
  if (r.includes('staff')) return 'staff';
  if (r.includes('customer')) return 'customer';
  return r as any;
}

function prismaIdOf(me:any): string | null {
  // On récupère un id Prisma si possible, puis on force en string
  const raw =
    me?.id ?? me?.userId ?? me?.customerId ??
    me?.user?.id ?? me?.uid ?? null;
  if (raw == null) return null;
  return typeof raw === 'string' ? raw : String(raw);
}

export default function BookingFlow(){
  const { me, token, loading: meLoading } = useMe();
  const customerId = getCustomerId(me);

  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const params = useSearchParams();
  const initialService = params.get('serviceId') || '';
  const [selectedService, setSelectedService] = useState<string>(initialService);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [date, setDate] = useState<string>(toIsoDate(new Date()));
  const [slots, setSlots] = useState<{ startAt:string; endAt:string; staffId?:string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Services + staff (publics)
  useEffect(()=>{
    (async ()=>{
      try{
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/,'');
        const [sv, st] = await Promise.all([
          fetch(`${base}/services`, { headers: { 'Accept':'application/json' }}),
          fetch(`${base}/users/staff`, { headers: { 'Accept':'application/json' }}),
        ]);
        const servicesJson = sv.ok ? await sv.json().catch(()=>null) : null;
        const staffJson    = st.ok ? await st.json().catch(()=>null)    : null;

        const servicesMapped: Service[] = itemsOf(servicesJson).map((s:any)=>({
          id: s.id,
          name: s.name,
          description: s.description,
          durationMinutes: s.durationMin ?? s.durationMinutes ?? 30,
          price: s.priceCents != null ? s.priceCents/100 : s.price
        }));
        const staffMapped: Staff[] = itemsOf(staffJson).map((u:any)=>({
          id:  u.id ?? u.uid ?? u.userId ?? u.staffId,
          name: (u.name ?? u.displayName ?? [u.firstName, u.lastName].filter(Boolean).join(' ')) || 'Membre du staff',
          role: u.role
        })).filter(u=>u.id);

        setServices(servicesMapped);
        setStaff(staffMapped);
        if (initialService && !servicesMapped.some(s=> s.id === initialService)) setSelectedService('');
      } catch(e){
        console.error('[BookingFlow] load services/staff error:', e);
        setServices([]); setStaff([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Créneaux via public endpoint
  useEffect(()=>{
    (async ()=>{
      if (!selectedService || !date) { setSlots([]); return; }
      setLoadingSlots(true);
      try{
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/,'');
        const qs = new URLSearchParams({ date, serviceId: selectedService, ...(selectedStaff ? { staffId: selectedStaff } : {}) });
        const url = `${base}/public/availabilities/day?${qs.toString()}`;
        const r = await fetch(url, { headers: { 'Accept':'application/json' }});
        if (!r.ok) throw new Error(`HTTP ${r.status} on ${url} — ${await r.text().catch(()=> '')}`);
        const raw = itemsOf(await r.json().catch(()=> null));
        const mapped = raw.map((s:any)=>({ startAt: s.startAt ?? s.start, endAt: s.endAt ?? s.end, staffId: s.staffId ?? s.staff?.id }))
                          .filter(s=> s.startAt && s.endAt);
        setSlots(mapped);
      } catch(e){
        console.error('[BookingFlow] load slots error:', e);
        setSlots([]);
      } finally{
        setLoadingSlots(false);
      }
    })();
  },[date, selectedService, selectedStaff]);

  async function book(slot:{startAt:string; endAt:string; staffId?:string}){
    console.log('book test');
    if (!selectedService) return alert('Choisis un service.');
    if (!token) return alert('Connecte-toi pour réserver.');
    if (meLoading) return alert('Chargement de ta session… réessaie dans une seconde.');

    const role = (me?.role || '').toString().toLowerCase();
    console.log('me: ' + me?.uid)
    const selfId = prismaIdOf(me);
    const staffToUse = selectedStaff || slot.staffId;

    const payload: any = {
      serviceId: selectedService,
      startAt: slot.startAt,
      endAt: slot.endAt,
      ...(staffToUse ? { staffId: staffToUse } : {}),
    };

    // Client: on N’ENVOIE PAS customerId (le contrôleur le déduira).
    // Staff/Owner: on l’envoie, en string.
    if (role.includes('owner') || role.includes('staff')) {
      if (!selfId) return alert('Ton compte staff/owner ne remonte pas d’ID client (ouvre “Mon espace” puis réessaie).');
      payload.customerId = String(selfId); // ⬅️ forçage en string
    }

    console.log('selfid: ' + selfId)
    console.log(payload.customerId);
    console.log(payload);

    const res = await apiFetch('/appointments','POST', payload);
    if (!res.ok) return alert('Erreur: '+res.status+' '+JSON.stringify(res.data));
    alert('Réservation confirmée !');
  }

  return (
    <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:16}}>
      <div>
        <div className="label">Service</div>
        <select className="select" value={selectedService} onChange={e=> setSelectedService(e.target.value)}>
          <option value="">— Choisir —</option>
          {services.map(s=> <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>)}
        </select>
      </div>
      <div>
        <div className="label">Coiffeur / Coiffeuse</div>
        <select className="select" value={selectedStaff} onChange={e=> setSelectedStaff(e.target.value)}>
          <option value="">— Indifférent —</option>
          {staff.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div>
        <div className="label">Date</div>
        <input className="input" type="date" value={date} onChange={e=> setDate(e.target.value)} />
      </div>

      <div style={{gridColumn:'1 / -1'}}>
        <div className="label">Créneaux disponibles</div>
        <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))'}}>
          {meLoading && (
            <div className="small" style={{gridColumn:'1 / -1', marginBottom:8}}>
              Connexion en cours…
            </div>
          )}
          {!meLoading && !token && (
            <div className="small" style={{gridColumn:'1 / -1', marginBottom:8}}>
              Tu dois être connecté pour réserver. <a href="/signin">Se connecter</a>
            </div>
          )}
          {!meLoading && token && !customerId && (
            <div className="small" style={{gridColumn:'1 / -1', marginBottom:8}}>
              Ton compte est connecté mais l’identifiant client est manquant. Ouvre <a href="/profile">Mon espace</a> puis réessaie.
            </div>
          )}

          {loadingSlots && <div className="small" style={{gridColumn:'1 / -1'}}>Chargement des créneaux…</div>}
          {!loadingSlots && slots.length === 0 && <div className="small" style={{gridColumn:'1 / -1'}}>Aucun créneau ce jour.</div>}

          {!loadingSlots && slots.map((s,i)=>(
            <button
              key={i}
              className="btn"
              onClick={()=> book(s)}
              disabled={!token || meLoading || !customerId}
            >
              {fmtHHMM(s.startAt)} — {fmtHHMM(s.endAt)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
