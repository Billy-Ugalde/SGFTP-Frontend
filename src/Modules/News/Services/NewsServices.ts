import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config/env';

const client = axios.create({
  baseURL: API_BASE_URL,
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
  publicationDate: string;
  lastUpdated: string;
}

// ✅ Solo imagen local (archivo). Sin URL en el payload del FE.
export interface CreateNewsInput {
  title: string;
  content: string;
  author: string;
  status?: NewsStatus;
  file?: File; // requerido por el form al crear; opcional acá para reusar tipos
}

export interface UpdateNewsInput {
  title?: string;
  content?: string;
  author?: string;
  status?: NewsStatus;
  file?: File; // si se reemplaza imagen en edición
}

function toFormDataNews(input: CreateNewsInput | UpdateNewsInput) {
  const { file, ...rest } = input as any;

  // Limpia campos vacíos
  const json: Record<string, any> = { ...rest };
  Object.keys(json).forEach((k) => {
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
  published: () => ['news', 'published'] as const,
  item: (id: number) => ['news', 'item', id] as const,
};

// Hook para admin - requiere autenticación, trae todas las noticias
export const useNews = () =>
  useQuery({
    queryKey: NEWS_KEYS.list(),
    queryFn: async () => (await client.get<NewsBE[]>('/news')).data,
  });

// Hook público - sin autenticación, solo noticias publicadas
export const usePublishedNews = () =>
  useQuery({
    queryKey: NEWS_KEYS.published(),
    queryFn: async () => {
      // Cliente público sin credenciales
      const publicClient = axios.create({
        baseURL: API_BASE_URL,
        withCredentials: false,
      });
      const response = await publicClient.get<NewsBE[]>('/news/published');
      return response.data;
    },
    staleTime: 0,
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

    // UI optimista solo en el item individual, NO en la lista.
    // Actualizar la lista optimistamente causaría que el item desaparezca del filtro
    // activo (ej. filtro "draft"), lo que desmontaría el StatusButton y cerraría el modal.
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: NEWS_KEYS.item(id) });

      const prevItem = qc.getQueryData<NewsBE>(NEWS_KEYS.item(id));
      if (prevItem) {
        qc.setQueryData<NewsBE>(NEWS_KEYS.item(id), { ...prevItem, status });
      }

      return { prevItem, id };
    },

    // Rollback si hay error
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      if (ctx.prevItem) qc.setQueryData<NewsBE>(NEWS_KEYS.item(ctx.id), ctx.prevItem);
    },

    // Asegura consistencia final
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: NEWS_KEYS.list() });
      qc.invalidateQueries({ queryKey: NEWS_KEYS.item(vars.id) });
      qc.invalidateQueries({ queryKey: NEWS_KEYS.published() });
    },
  });
};
