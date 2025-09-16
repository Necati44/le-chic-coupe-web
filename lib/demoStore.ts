// lib/demoStore.ts
export type DemoApptStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED';

export type DemoAppt = {
  id: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  serviceId: string;
  serviceName: string;
  durationMin: number;
  priceCents?: number;
  staffId?: string;
  staffName?: string;
  customerUid?: string;
  createdAt: string; // ISO
  status: DemoApptStatus;
};

const KEY = 'demo.appts.v1';

function read(): DemoAppt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function write(list: DemoAppt[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(list));
  // pour que d'autres onglets/clients se sync
  window.dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: localStorage.getItem(KEY) ?? '' }));
}

export function getDemoAppointments(): DemoAppt[] {
  return read().sort((a,b)=> a.startAt.localeCompare(b.startAt));
}

export function addDemoAppointment(appt: Omit<DemoAppt,'id'|'createdAt'|'status'>): DemoAppt {
  const id = 'demo_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
  const createdAt = new Date().toISOString();
  const full: DemoAppt = { ...appt, id, createdAt, status: 'CONFIRMED' };
  const list = read();
  list.push(full);
  write(list);
  return full;
}

export function removeDemoAppointment(id: string) {
  const list = read().filter(a => a.id !== id);
  write(list);
}

export function clearDemoAppointments() {
  write([]);
}
