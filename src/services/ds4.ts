const API_URL = import.meta.env.DEV ? '/ds4-api' : 'https://ds4-demo-5w8lmtds.on-forge.com/api';
const TOKEN_KEY = 'ds4_token';

export interface Ds4User {
  id?: number;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface Ds4Order {
  id: number;
  numero_orden: string;
  iva: number | string;
  total: number | string;
  customer?: {
    id?: number;
    name?: string;
  };
}

function extraerToken(respuesta: unknown): string {
  if (typeof respuesta === 'string') return respuesta.trim();
  if (respuesta && typeof respuesta === 'object') {
    const datos = respuesta as Record<string, unknown>;
    const token = datos.token ?? datos.access_token ?? datos.plainTextToken;
    if (typeof token === 'string') return token.trim();
  }
  return '';
}

async function leerRespuesta(respuesta: Response): Promise<unknown> {
  const texto = await respuesta.text();
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

function mensajeDeError(datos: unknown, predeterminado: string): string {
  if (datos && typeof datos === 'object') {
    const mensaje = (datos as Record<string, unknown>).message;
    if (typeof mensaje === 'string' && mensaje.trim()) return mensaje;
  }
  return predeterminado;
}

export async function iniciarSesionDs4(email: string, password: string): Promise<Ds4User> {
  const respuesta = await fetch(`${API_URL}/sanctum/token`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, device_name: 'pedidos-app' }),
  });
  const datos = await leerRespuesta(respuesta);
  if (!respuesta.ok) throw new Error(mensajeDeError(datos, 'No se pudo iniciar sesión.'));

  const token = extraerToken(datos);
  if (!token) throw new Error('La API no devolvió un token válido.');
  sessionStorage.setItem(TOKEN_KEY, token);

  try {
    return await cargarUsuarioDs4();
  } catch (error) {
    sessionStorage.removeItem(TOKEN_KEY);
    throw error;
  }
}

export async function cargarUsuarioDs4(): Promise<Ds4User> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('Inicia sesión para consultar la API.');

  const respuesta = await fetch(`${API_URL}/user`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const datos = await leerRespuesta(respuesta);
  if (!respuesta.ok) {
    if (respuesta.status === 401) sessionStorage.removeItem(TOKEN_KEY);
    throw new Error(mensajeDeError(datos, 'No se pudo consultar el usuario.'));
  }
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new Error('La API devolvió un usuario inválido.');
  }
  return datos as Ds4User;
}

export async function cargarOrdenesDs4(): Promise<Ds4Order[]> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('Inicia sesión para consultar los pedidos.');

  const respuesta = await fetch(`${API_URL}/orders`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const datos = await leerRespuesta(respuesta);
  if (!respuesta.ok) {
    if (respuesta.status === 401) sessionStorage.removeItem(TOKEN_KEY);
    throw new Error(mensajeDeError(datos, 'No se pudieron cargar los pedidos.'));
  }
  if (!datos || typeof datos !== 'object' || !Array.isArray((datos as Record<string, unknown>).data)) {
    throw new Error('La API devolvió una lista de pedidos inválida.');
  }
  return (datos as { data: Ds4Order[] }).data;
}

export function haySesionDs4(): boolean {
  return Boolean(sessionStorage.getItem(TOKEN_KEY));
}

export function cerrarSesionDs4(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}
