import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001', // o import.meta.env.VITE_API_URL
  withCredentials: true,
});

export type NewsStatus = 'draft' | 'published' | 'archived';

export interface NewsBE {
  id_news: number;
  title: string;
  content: string;
  image_url: string | null; // lo sigue devolviendo el backend (URL de Drive)
  author: string;
  status: NewsStatus;
  sendNewsletter: boolean;
  newsletterSent: boolean;
  publicationDate: string;
  lastUpdated: string;
}

// ✅ Solo imagen local (archivo). Sin URL en el payload del FE.
export interface CreateNewsInput {
  title: string;
  content: string;
  author: string;
  status?: NewsStatus;
  sendNewsletter?: boolean;
  file?: File; // requerido por el form al crear; opcional acá para reusar tipos
}

export interface UpdateNewsInput {
  title?: string;
  content?: string;
  author?: string;
  status?: NewsStatus;
  sendNewsletter?: boolean;
  file?: File; // si se reemplaza imagen en edición
}

function toFormDataNews(input: CreateNewsInput | UpdateNewsInput) {
  const { file, ...rest } = input as any;

  // Limpia campos vacíos (pero mantiene booleans false)
  const json: Record<string, any> = { ...rest };
  Object.keys(json).forEach((k) => {
    // Keep false boolean values, only remove empty strings, undefined, and null
    if (json[k] === '' || json[k] === undefined || json[k] === null) delete json[k];
  });

  const fd = new FormData();
  // 👇 clave EXACTA que espera el backend
  fd.append('news', JSON.stringify(json));

  // Adjunta imagen si existe (clave 'file' para FileInterceptor('file'))
  if (file instanceof File) {
    fd.append('file', file, file.name);
  }

  return fd;
}

export const NEWS_KEYS = {
  all: ['news'] as const,
  list: () => ['news', 'list'] as const,
  item: (id: number) => ['news', 'item', id] as const,
};

export const useNews = () =>
  useQuery({
    queryKey: NEWS_KEYS.list(),
    queryFn: async () => (await client.get<NewsBE[]>('/news')).data,
  });

export const useNewsById = (id: number | string) =>
  useQuery({
    queryKey: NEWS_KEYS.item(Number(id)),
    queryFn: async () => (await client.get<NewsBE>(`/news/${id}`)).data,
    enabled: !!id,
  });

export const useAddNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateNewsInput) => {
      const fd = toFormDataNews(payload); // multipart con 'news' + (opcional) 'file'
      const res = await client.post<NewsBE>('/news', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NEWS_KEYS.list() });
    },
  });
};

export const useUpdateNews = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateNewsInput) => {
      const fd = toFormDataNews(payload);
      const res = await client.patch<NewsBE>(`/news/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NEWS_KEYS.item(id) });
      qc.invalidateQueries({ queryKey: NEWS_KEYS.list() });
    },
  });
};

/**
 * Actualiza el estado de la noticia con UI optimista:
 * - Cambia el estado en cache de la lista y del item inmediatamente (píldora y contadores).
 * - Si falla, hace rollback.
 * - Al final invalida queries para asegurar consistencia con el backend.
 */
export const useUpdateNewsStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: NewsStatus }) =>
      (await client.patch<NewsBE>(`/news/${id}/status`, { status })).data,

    // UI optimista
    onMutate: async ({ id, status }) => {
      // Cancela refetches en curso para que no pisen el optimista
      await qc.cancelQueries({ queryKey: NEWS_KEYS.list() });
      await qc.cancelQueries({ queryKey: NEWS_KEYS.item(id) });

      // Snapshot de caches previas
      const prevList = qc.getQueryData<NewsBE[]>(NEWS_KEYS.list());
      const prevItem = qc.getQueryData<NewsBE>(NEWS_KEYS.item(id));

      // Actualiza lista (esto hace que la píldora y contadores cambien al instante)
      if (prevList) {
        qc.setQueryData<NewsBE[]>(
          NEWS_KEYS.list(),
          prevList.map((n) => (n.id_news === id ? { ...n, status } : n))
        );
      }

      // Actualiza el item (si está cacheado) para mantener coherencia
      if (prevItem) {
        qc.setQueryData<NewsBE>(NEWS_KEYS.item(id), { ...prevItem, status });
      }

      return { prevList, prevItem, id };
    },

    // Rollback si hay error
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      if (ctx.prevList) qc.setQueryData<NewsBE[]>(NEWS_KEYS.list(), ctx.prevList);
      if (ctx.prevItem) qc.setQueryData<NewsBE>(NEWS_KEYS.item(ctx.id), ctx.prevItem);
    },

    // Asegura consistencia final
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: NEWS_KEYS.list() });
      qc.invalidateQueries({ queryKey: NEWS_KEYS.item(vars.id) });
    },
  });
};
