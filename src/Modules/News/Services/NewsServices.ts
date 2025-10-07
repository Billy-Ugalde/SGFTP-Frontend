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
  image_url: string | null;
  author: string;
  status: NewsStatus;
  publicationDate: string;
  lastUpdated: string;
}

// ✅ Alineado al DTO actual
export interface CreateNewsInput {
  title: string;
  content: string;
  author: string;
  status?: NewsStatus;
  image_url: string; // requerido por DTO (IsUrl)
}

export interface UpdateNewsInput {
  title?: string;
  content?: string;
  author?: string;
  status?: NewsStatus;
  image_url?: string;
}

function toFormDataNews(input: CreateNewsInput | UpdateNewsInput) {
  // limpiamos vacíos para no mandar claves en blanco
  const json: Record<string, any> = { ...input };
  Object.keys(json).forEach((k) => {
    if (json[k] === undefined || json[k] === null || json[k] === '') delete json[k];
  });
  const fd = new FormData();
  // 👇 clave EXACTA que espera el backend
  fd.append('news', JSON.stringify(json));
  // NO adjuntamos 'file' porque el formulario no maneja archivos
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
      const fd = toFormDataNews(payload); // 👈 SIEMPRE multipart con campo 'news'
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
      const fd = toFormDataNews(payload); // 👈 igual en update
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

export const useUpdateNewsStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: NewsStatus }) =>
      (await client.patch<NewsBE>(`/news/${id}/status`, { status })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NEWS_KEYS.list() });
    },
  });
};
