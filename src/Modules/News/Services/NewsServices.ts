import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type NewsStatus = 'published' | 'draft' | 'archived';

export interface News {
  id_news: number;
  title: string;
  content: string;
  image_url?: string;
  author: string;
  status: NewsStatus;
  lastUpdated: string; // ISO
}

export interface CreateNewsDto {
  title: string;
  content: string;
  author: string;
  image_url?: string;
}

export interface UpdateNewsDto {
  title?: string;
  content?: string;
  author?: string;
  image_url?: string;
  status?: NewsStatus;
}

// NOTA: si ya tienes un cliente axios central (apiConfig), impórtalo aquí en lugar de este:
const client = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
});

const toFormData = (dto: CreateNewsDto | UpdateNewsDto, file?: File) => {
  const fd = new FormData();
  fd.append('news', JSON.stringify(dto));
  if (file) fd.append('file', file);
  return fd;
};

export const useNews = () =>
  useQuery<News[]>({
    queryKey: ['news'],
    queryFn: async () => (await client.get('/news')).data,
  });

export const useNewsOne = (id_news?: number) =>
  useQuery<News>({
    queryKey: ['news', id_news],
    enabled: !!id_news,
    queryFn: async () => (await client.get(`/news/${id_news}`)).data,
  });

export const useAddNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { dto: CreateNewsDto; file?: File }) =>
      (await client.post('/news', toFormData(p.dto, p.file), { headers: { 'Content-Type': 'multipart/form-data' } })).data as News,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
};

export const useUpdateNews = (id_news: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { dto: UpdateNewsDto; file?: File }) =>
      (await client.patch(`/news/${id_news}`, toFormData(p.dto, p.file), { headers: { 'Content-Type': 'multipart/form-data' } })).data as News,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['news', id_news] });
    },
  });
};

export const useSetNewsStatus = (id_news: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: NewsStatus) =>
      (await client.patch(`/news/${id_news}/status`, { status })).data as News,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['news', id_news] });
    },
  });
};

// disponible pero no usar en UI (auditoría). Archivar en lugar de borrar.
export const useDeleteNews = (id_news: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => { await client.delete(`/news/${id_news}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
};
