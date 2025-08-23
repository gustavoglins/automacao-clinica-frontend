// Generic API client para conversar com o backend (fallback: Supabase direto)
// Usa VITE_API_BASE_URL (pode ser absoluto ou relativo). Se ausente, isBackendEnabled = false.

const _rawBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';
export const API_BASE_URL = _rawBase.replace(/\/$/, '');
export const isBackendEnabled = !!API_BASE_URL;

export class ApiError extends Error {
  status: number;
  details?: unknown;
  data?: unknown;
  constructor(
    status: number,
    message: string,
    details?: unknown,
    data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.data = data;
  }
}

export interface RequestOptions<Body = unknown, Q = Record<string, unknown>> {
  method?: string;
  headers?: Record<string, string>;
  body?: Body;
  query?: Q;
  signal?: AbortSignal;
  noThrow?: boolean; // opcional: retornar objeto mesmo em erro HTTP
}

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

function serializeQuery(query?: Record<string, QueryValue>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) {
      v.forEach((item) => {
        if (item !== undefined && item !== null && item !== '')
          params.append(k, String(item));
      });
    } else {
      params.append(k, String(v));
    }
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Base absoluta
  if (API_BASE_URL) {
    // Evitar duplicar /api quando base já termina com /api e o path também inicia com /api
    if (API_BASE_URL.endsWith('/api') && cleanPath.startsWith('/api/')) {
      return `${API_BASE_URL}${cleanPath.substring(4)}${serializeQuery(query)}`; // remove prefixo /api duplicado
    }
    if (API_BASE_URL.endsWith('/api') && cleanPath === '/api') {
      return `${API_BASE_URL}${serializeQuery(query)}`; // exatamente igual, não duplica
    }
    return `${API_BASE_URL}${cleanPath}${serializeQuery(query)}`;
  }
  return cleanPath + serializeQuery(query);
}

async function request<T, B = unknown, Q = Record<string, unknown>>(
  path: string,
  {
    method = 'GET',
    headers = {},
    body,
    query,
    signal,
    noThrow,
  }: RequestOptions<B, Q> = {}
): Promise<T> {
  if (!isBackendEnabled)
    throw new ApiError(
      0,
      'Backend API não configurado (VITE_API_BASE_URL ausente)'
    );
  const url = buildUrl(path, query as Record<string, QueryValue>);
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    signal,
  };
  if (body !== undefined) init.body = JSON.stringify(body);

  let resp: Response;
  try {
    resp = await fetch(url, init);
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ApiError(0, 'Requisição cancelada');
    }
    throw new ApiError(0, 'Falha de rede ou CORS', e);
  }

  // Tentar parsear JSON (ou texto) de forma resiliente
  let payload: unknown = null;
  const raw = await resp.text();
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }
  }

  if (!resp.ok) {
    const extracted = ((): { message: string; details?: unknown } => {
      if (payload && typeof payload === 'object') {
        const p = payload as Record<string, unknown>;
        const message = (p.error ||
          p.message ||
          resp.statusText ||
          'Erro desconhecido') as string;
        return { message, details: p.details };
      }
      return { message: resp.statusText || 'Erro desconhecido' };
    })();
    if (noThrow) return payload as T; // opção para consumidor lidar
    throw new ApiError(
      resp.status,
      extracted.message,
      extracted.details,
      payload
    );
  }
  return payload as T;
}

// Helpers HTTP
export const apiGet = <T, Q = Record<string, unknown>>(
  path: string,
  query?: Q,
  opts?: Omit<RequestOptions, 'query' | 'method' | 'body'>
) => request<T, undefined, Q>(path, { ...opts, query, method: 'GET' });
export const apiPost = <T, B = unknown>(
  path: string,
  body?: B,
  opts?: Omit<RequestOptions, 'body' | 'method'>
) => request<T, B>(path, { ...opts, body, method: 'POST' });
export const apiPut = <T, B = unknown>(
  path: string,
  body?: B,
  opts?: Omit<RequestOptions, 'body' | 'method'>
) => request<T, B>(path, { ...opts, body, method: 'PUT' });
export const apiPatch = <T, B = unknown>(
  path: string,
  body?: B,
  opts?: Omit<RequestOptions, 'body' | 'method'>
) => request<T, B>(path, { ...opts, body, method: 'PATCH' });
export const apiDelete = <T>(
  path: string,
  opts?: Omit<RequestOptions, 'method' | 'body' | 'query'>
) => request<T, undefined>(path, { ...opts, method: 'DELETE' });

// Tenta backend e faz fallback
export async function tryBackend<T>(
  fn: () => Promise<T>,
  fallback: () => Promise<T>,
  options: { silent?: boolean } = {}
): Promise<T> {
  if (!isBackendEnabled) return fallback();
  try {
    return await fn();
  } catch (e) {
    if (!options.silent)
      console.warn('[apiClient] backend falhou, fallback supabase ->', e);
    return fallback();
  }
}

// Pequeno helper para paginação simples
export interface Paginated<T> {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}
export function buildPaginationParams(page?: number, pageSize?: number) {
  const q: Record<string, number> = {};
  if (page !== undefined) q.page = page;
  if (pageSize !== undefined) q.pageSize = pageSize;
  return q;
}
