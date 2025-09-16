'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Service = { id:string; name:string; durationMinutes:number; price?:number; description?:string };

export default function ServicesList(){
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      setError(null);
      try{
        const baseEnv = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
        const base = baseEnv.replace(/\/$/, '');
        // Si base est vide, l'appel deviendra /services et tapera le domaine du front → souvent 404/CORS.
        // On loggue pour debug.
        console.log('[ServicesList] API base =', base || '(vide)');
        const url = `${base}/services`.replace('//services','/services');
        const res = await fetch(url, { headers: { 'Accept': 'application/json' }});

        if (!res.ok) {
          const text = await res.text().catch(()=> '');
          throw new Error(`HTTP ${res.status} on ${url} — ${text}`);
        }

        const json = await res.json().catch(()=> null);
        // Accepte soit un tableau direct, soit un objet paginé { items: [...] }
        const items = Array.isArray(json) ? json : Array.isArray(json?.items) ? json.items : [];
        if (!Array.isArray(items)) {
          throw new Error(`Format inattendu pour /services. Reçu: ${JSON.stringify(json)?.slice(0,300)}…`);
        }

        // Mapping champs API → UI
        const mapped: Service[] = items.map((s:any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          durationMinutes: s.durationMin ?? s.durationMinutes ?? 30,
          price: s.priceCents != null ? s.priceCents / 100 : s.price,
        }));

        setData(mapped);
      } catch(e:any){
        console.error(e);
        setError(e?.message || 'Failed to fetch');
      } finally{
        setLoading(false);
      }
    }
    load();
  },[]);

  if (loading) return <div className="small">Chargement des services…</div>;
  if (error) return (
    <div className="small" style={{color:'#b91c1c'}}>
      Erreur lors du chargement des services : {error}<br/>
      <span className="small">Vérifie <code className="mono">NEXT_PUBLIC_API_BASE_URL</code> et le CORS côté API.</span>
    </div>
  );
  if (!data?.length) return <div className="small">Aucun service pour le moment.</div>;

  return (
    <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))'}}>
      {data.map(s=> (
        <div className="service" key={s.id}>
          <div style={{flex:1}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
              <strong>{s.name}</strong>
              {s.price!=null && <span className="badge">{s.price.toFixed(2)} €</span>}
            </div>
            <div className="small">{s.description || '—'}</div>
          </div>
          <div>
            <div className="small">{s.durationMinutes} min</div>
            <Link href={`/book?serviceId=${encodeURIComponent(s.id)}`}><button className="btn" style={{marginTop:8}}>Réserver</button></Link>
          </div>
        </div>
      ))}
    </div>
  );
}
