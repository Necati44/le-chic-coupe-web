import { getApiBase, getToken } from './storage';

export type HttpMethod = 'GET'|'POST'|'PUT'|'PATCH'|'DELETE';

// lib/apiClient.ts
export async function apiFetch(path: string, method: string = 'GET', body?: any) {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('idToken') : null;
  const debug = process.env.NEXT_PUBLIC_DEBUG_API === '1';

  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`; // ok même si le guard utilise le cookie

  if (debug) {
    console.groupCollapsed(`[apiFetch] → ${method} ${url}`);
    const safeHeaders = { ...headers, Authorization: token ? `Bearer …${token.slice(-6)}` : '(none)' };
    console.log('headers:', safeHeaders);
    console.log('payload:', body);
    console.groupEnd();
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include', // ⬅️ ENVOIE LES COOKIES (session)
    });
  } catch (e) {
    if (debug) console.error('[apiFetch] network error:', e);
    return { ok: false, status: 0, data: { error: 'network', detail: String(e) } };
  }

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (debug) {
    console.groupCollapsed(`[apiFetch] ← ${method} ${url} — ${res.status}`);
    const preview = typeof data === 'string' ? data.slice(0, 500) : JSON.stringify(data)?.slice(0, 500);
    console.log('response preview:', preview);
    console.groupEnd();
  }

  return { ok: res.ok, status: res.status, data };
}


