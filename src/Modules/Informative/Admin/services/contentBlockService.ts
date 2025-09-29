// src/Modules/Informative/services/contentBlockService.ts
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001', // Misma base URL que Ferias
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export interface ContentBlock {
  id: number;
  page: string;
  section: string;
  block_key: string;
  text_content: string | null;
  image_url: string | null;
  lastUpdated: string;
}

export interface UpdateContentBlockDto {
  text_content?: string;
  image_url?: string;
}

export interface PageContent {
  [section: string]: {
    [blockKey: string]: string | null;
  };
}

// GET content block by natural key
export const useContentBlock = (page: string, section: string, blockKey: string) => {
  return useQuery<ContentBlock, Error>({
    queryKey: ['contentBlock', page, section, blockKey],
    queryFn: async () => {
      const res = await client.get(`/content/${page}/${section}/${blockKey}`);
      return res.data;
    },
    enabled: !!(page && section && blockKey),
  });
};

// GET all content blocks for a page
export const usePageContent = (page: string) => {
  return useQuery<PageContent, Error>({
    queryKey: ['pageContent', page],
    queryFn: async () => {
      const res = await client.get(`/content/page/${page}`);
      return res.data;
    },
    enabled: !!page,
  });
};

// GET content blocks for a specific section
export const useSectionContent = (page: string, section: string) => {
  return useQuery<Record<string, string | null>, Error>({
    queryKey: ['sectionContent', page, section],
    queryFn: async () => {
      const res = await client.get(`/content/${page}/${section}`);
      return res.data;
    },
    enabled: !!(page && section),
  });
};

// UPDATE content block by natural key
export const useUpdateContentBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      page, 
      section, 
      blockKey, 
      data 
    }: { 
      page: string; 
      section: string; 
      blockKey: string; 
      data: UpdateContentBlockDto 
    }) => {
      const res = await client.patch(`/content/${page}/${section}/${blockKey}`, data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['contentBlock', variables.page, variables.section, variables.blockKey] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['pageContent', variables.page] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['sectionContent', variables.page, variables.section] 
      });
    },
  });
};

// CREATE content block (por si acaso)
export const useCreateContentBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      page: string;
      section: string;
      block_key: string;
      text_content?: string;
      image_url?: string;
    }) => {
      const res = await client.post('/content', data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pageContent', variables.page] });
      queryClient.invalidateQueries({ 
        queryKey: ['sectionContent', variables.page, variables.section] 
      });
    },
  });
};

// BATCH UPDATE content blocks
export const useUpdateContentBlocksBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blocks: Array<{
      page: string;
      section: string;
      block_key: string;
      text_content?: string;
      image_url?: string;
    }>) => {
      const res = await client.post('/content/batch', blocks);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate all content queries since we don't know which pages were affected
      queryClient.invalidateQueries({ queryKey: ['pageContent'] });
      queryClient.invalidateQueries({ queryKey: ['sectionContent'] });
      queryClient.invalidateQueries({ queryKey: ['contentBlock'] });
    },
  });
};