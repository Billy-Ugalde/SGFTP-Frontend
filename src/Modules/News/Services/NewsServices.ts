import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const newsClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  withCredentials: true,
});

export type NewsStatus = 'published' | 'draft' | 'archived';

export interface News {
  id_news: number;
  title: string;
  content: string;
  image_url?: string | null;
  author: string;
  status: NewsStatus;
  lastUpdated: string;
}

export interface CreateNewsDto {
  title: string;
  content: string;
  image_url?: string | null;
  author: string;
}

export interface UpdateNewsDto {
  title?: string;
  content?: string;
  image_url?: string | null;
  author?: string;
  status?: NewsStatus;
}

export const getNews = async (): Promise<News[]> => {
  const { data } = await newsClient.get('/news');
  return data;
};

export const getNewsOne = async (id: number): Promise<News> => {
  const { data } = await newsClient.get(`/news/${id}`);
  return data;
};

const toFormData = (dto: CreateNewsDto | UpdateNewsDto, file?: File | null) => {
  const fd = new FormData();
  fd.append('news', JSON.stringify(dto));
  if (file) fd.append('file', file);
  return fd;
};

export const createNews = async ({
  dto,
  file,
}: {
  dto: CreateNewsDto;
  file?: File | null;
}) => {
  const { data } = await newsClient.post('/news', toFormData(dto, file), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data as News;
};

export const updateNews = async ({
  id,
  dto,
  file,
}: {
  id: number;
  dto: UpdateNewsDto;
  file?: File | null;
}) => {
  const { data } = await newsClient.patch(
    `/news/${id}`,
    toFormData(dto, file),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data as News;
};

export const setNewsStatus = async ({
  id,
  status,
}: {
  id: number;
  status: NewsStatus;
}) => {
  const { data } = await newsClient.patch(`/news/${id}/status`, { status });
  return data as News;
};

export const useNews = () =>
  useQuery({ queryKey: ['news'], queryFn: getNews });

export const useNewsOne = (id: number) =>
  useQuery({
    queryKey: ['news', id],
    queryFn: () => getNewsOne(id),
    enabled: Number.isFinite(id),
  });

export const useAddNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNews,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
};

export const useUpdateNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateNews,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['news', res.id_news] });
    },
  });
};

export const useSetNewsStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setNewsStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
};
