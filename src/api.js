export async function request(path = '', options = {}) {
 const response = await fetch('/api/assets' + path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
 if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || `Request failed (${response.status})`); }
 return response.status === 204 ? null : response.json();
}
