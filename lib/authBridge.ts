// lib/authBridge.ts
export async function ensureBackendSession(idToken: string) {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  const debug = process.env.NEXT_PUBLIC_DEBUG_API === '1';
  const url = `${base}/auth/login`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
    body: JSON.stringify({ idToken }),
    credentials: 'include', // ⬅️ important pour recevoir le cookie "session"
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (debug) {
    console.groupCollapsed('[authBridge] /auth/login');
    console.log('status:', res.status);
    console.log('response:', data);
    console.groupEnd();
  }

  return { ok: res.ok, status: res.status, data };
}
