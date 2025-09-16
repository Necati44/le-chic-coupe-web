export function getApiBase(): string {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return localStorage.getItem('apiBase') ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
}
export function setApiBase(v: string){
  if (typeof window === 'undefined') return;
  localStorage.setItem('apiBase', v);
}
export function saveToken(t:string){
  if (typeof window === 'undefined') return;
  localStorage.setItem('idToken', t);
}
export function getToken(): string{
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('idToken') ?? '';
}
export function clearToken(){
  if (typeof window === 'undefined') return;
  localStorage.removeItem('idToken');
}
