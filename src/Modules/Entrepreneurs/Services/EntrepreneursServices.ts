import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Entrepreneur,
  CreateCompleteEntrepreneurDto,
  UpdateCompleteEntrepreneurDto,
  EntrepreneurFormData,
  EntrepreneurUpdateData
} from '../Types';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true
});


const getValueOrUndefined = (value: string | undefined): string | undefined => {
  return value === '' ? undefined : value;
};

// Helper function to transform form data to backend DTO
export const transformFormDataToDto = (formData: EntrepreneurFormData): CreateCompleteEntrepreneurDto => {

  const validPhones = formData.phones
    .filter(phone => phone.number && phone.number.trim() !== '')
    .map(phone => ({
      number: phone.number.trim(),
      type: phone.type,
      is_primary: phone.is_primary
    }));

  // Validar que los 3 archivos existan
  if (!(formData.url_1 instanceof File) ||
    !(formData.url_2 instanceof File) ||
    !(formData.url_3 instanceof File)) {
    throw new Error('Debes subir exactamente 3 imágenes.');
  }
  const files = [formData.url_1, formData.url_2, formData.url_3];

  return {
    person: {
      first_name: formData.first_name,
      second_name: formData.second_name,
      first_lastname: formData.first_lastname,
      second_lastname: formData.second_lastname,
      email: formData.email,
      phones: validPhones
    },
    entrepreneur: {
      experience: formData.experience,
      facebook_url: getValueOrUndefined(formData.facebook_url),
      instagram_url: getValueOrUndefined(formData.instagram_url),
    },
    entrepreneurship: {
      name: formData.entrepreneurship_name,
      description: formData.description,
      location: formData.location,
      category: formData.category,
      approach: formData.approach
    },
    files: [formData.url_1, formData.url_2, formData.url_3]
  };
};
// Helper function to transform form data to backend DTO for updates
export const transformUpdateDataToDto = (
  formData: EntrepreneurUpdateData
): UpdateCompleteEntrepreneurDto => {
  const dto: UpdateCompleteEntrepreneurDto = {};

  if (
    formData.first_name ||
    formData.second_name ||
    formData.first_lastname ||
    formData.second_lastname ||
    formData.email ||
    formData.phones
  ) {
    dto.person = {};
    if (formData.first_name) dto.person.first_name = formData.first_name;
    if (formData.second_name !== undefined) {
      dto.person.second_name =
        formData.second_name.trim() === '' ? null : formData.second_name;
    }
    if (formData.first_lastname) dto.person.first_lastname = formData.first_lastname;
    if (formData.second_lastname) dto.person.second_lastname = formData.second_lastname;
    if (formData.email) dto.person.email = formData.email;

    if (formData.phones) {
      const filteredPhones = formData.phones.filter(
        (phone) => phone.number && phone.number.trim() !== ''
      );

      if (filteredPhones.length > 0) {
        dto.person.phones = filteredPhones.map((phone, index) => ({
          number: phone.number,
          type: index === 0 ? 'personal' : 'business',
          is_primary: phone.is_primary,
        }));
      }
    }
  }

  if (
    formData.experience !== undefined ||
    formData.facebook_url !== undefined ||
    formData.instagram_url !== undefined
  ) {
    dto.entrepreneur = {};

    if (formData.experience !== undefined) {
      dto.entrepreneur.experience = formData.experience;
    }

    if (formData.facebook_url !== undefined) {
      dto.entrepreneur.facebook_url =
        formData.facebook_url.trim() === '' ? null : formData.facebook_url;
    }

    if (formData.instagram_url !== undefined) {
      dto.entrepreneur.instagram_url =
        formData.instagram_url.trim() === '' ? null : formData.instagram_url;
    }
  }

  if (
    formData.entrepreneurship_name ||
    formData.description ||
    formData.location ||
    formData.category ||
    formData.approach ||
    formData.url_1 ||
    formData.url_2 ||
    formData.url_3
  ) {
    dto.entrepreneurship = {};
    if (formData.entrepreneurship_name) dto.entrepreneurship.name = formData.entrepreneurship_name;
    if (formData.description) dto.entrepreneurship.description = formData.description;
    if (formData.location) dto.entrepreneurship.location = formData.location;
    if (formData.category) dto.entrepreneurship.category = formData.category;
    if (formData.approach) dto.entrepreneurship.approach = formData.approach;
  }

 // NUEVA LÓGICA: Separar archivos y conservar URLs existentes
  const files: File[] = [];
  // Conservar URLs que no cambiaron y marcar las que sí cambiaron
  (['url_1', 'url_2', 'url_3'] as const).forEach((field) => {
    const value = formData[field];
    if (value instanceof File) {
      files.push(value);
      // Agregar metadatos para saber qué campo corresponde a cada archivo
      if (!dto.entrepreneurship) dto.entrepreneurship = {};
      (dto.entrepreneurship as any)[field] = `__FILE_REPLACE_${field.toUpperCase()}__`;
    } else if (typeof value === 'string' && value.trim() !== '') {
      if (!dto.entrepreneurship) dto.entrepreneurship = {};
      dto.entrepreneurship[field] = value;
    }
  });

  if (files.length > 0) {
    dto.files = files;
  }
  return dto;
};


// convierte DTO → FormData (para enviar al backend)
export const transformEntrepreneurToFormData = (
  data: CreateCompleteEntrepreneurDto | UpdateCompleteEntrepreneurDto
): FormData => {
  const fd = new FormData();

  if (data.person) fd.append("person", JSON.stringify(data.person));
  if (data.entrepreneur) fd.append("entrepreneur", JSON.stringify(data.entrepreneur));
  if (data.entrepreneurship) fd.append("entrepreneurship", JSON.stringify(data.entrepreneurship));

  if (data.files && data.files.length > 0) {
    data.files.forEach(file => fd.append("files", file));
  }

  if (data.urls && data.urls.length > 0) {
    fd.append("urls", JSON.stringify(data.urls));
  }

  return fd;
};


// Get all entrepreneurs (approved)
export const useEntrepreneurs = () => {
  return useQuery<Entrepreneur[], Error>({
    queryKey: ['entrepreneurs'],
    queryFn: async () => {
      const res = await client.get('/entrepreneurs');
      return res.data;
    },
  });
};

export const useEntrepreneurById = (id?: number) => {
  return useQuery<Entrepreneur, Error>({
    queryKey: ['entrepreneurs', 'detail', id],
    queryFn: async () => {
      const res = await client.get(`/entrepreneurs/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEntrepreneurByUserEmail = (userEmail?: string) => {
  return useQuery<Entrepreneur | null, Error>({
    queryKey: ['entrepreneur-by-email', userEmail],
    queryFn: async () => {
      if (!userEmail) {
        throw new Error('Email de usuario requerido');
      }

      console.log('🔍 Buscando entrepreneur por email:', userEmail);

      try {
        const response = await client.get('/entrepreneurs');
        const entrepreneurs: Entrepreneur[] = response.data;

        console.log('📋 Entrepreneurs encontrados:', entrepreneurs.length);

        const entrepreneur = entrepreneurs.find(
          ent => ent.person?.email?.toLowerCase() === userEmail.toLowerCase()
        );

        console.log('🎯 Entrepreneur encontrado:', entrepreneur ? 'SÍ' : 'NO');
        console.log('📊 Datos del entrepreneur:', entrepreneur);

        return entrepreneur || null;

      } catch (error: any) {
        console.error('❌ Error buscando entrepreneur:', error);

        if (error?.response?.status === 404) {
          return null;
        }

        throw error;
      }
    },
    enabled: !!userEmail,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get pending entrepreneur requests
export const usePendingEntrepreneurs = () => {
  return useQuery<Entrepreneur[], Error>({
    queryKey: ['entrepreneurs', 'pending'],
    queryFn: async () => {
      const res = await client.get('/entrepreneurs/pending');
      return res.data;
    },
  });
};

// Add a new entrepreneur
export const useAddEntrepreneur = (isAdmin: boolean) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEntrepreneur: CreateCompleteEntrepreneurDto) => {
      if (!newEntrepreneur.files || newEntrepreneur.files.length !== 3) {
        throw new Error("Debes subir exactamente 3 imágenes.");
      }
      const url = isAdmin ? "/entrepreneurs" : "/entrepreneurs/public";
      const res = await client.post(url, transformEntrepreneurToFormData(newEntrepreneur));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurs"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurs", "pending"] });
    },
  });
};

// Update an existing entrepreneur (ADMIN)
export const useUpdateEntrepreneur = (id_entrepreneur: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updateData: UpdateCompleteEntrepreneurDto) => {
      if (updateData.files && updateData.files.length > 0) {
        const res = await client.put(`/entrepreneurs/${id_entrepreneur}`, transformEntrepreneurToFormData(updateData));
        return res.data;
      }
      const res = await client.put(`/entrepreneurs/${id_entrepreneur}`, updateData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurs"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurs", "pending"] });
    },
  });
};

// Update own entrepreneur (public endpoint)
export const useUpdateOwnEntrepreneur = (id_entrepreneur: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updateData: UpdateCompleteEntrepreneurDto) => {
      // Si vienen archivos, usamos FormData
      if (updateData.files && updateData.files.length > 0) {
        const res = await client.put(
          `/entrepreneurs/public/${id_entrepreneur}`,
          transformEntrepreneurToFormData(updateData)
        );
        return res.data;
      }
      // Sin archivos, JSON directo
      const res = await client.put(
        `/entrepreneurs/public/${id_entrepreneur}`,
        updateData
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurs"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurs", "pending"] });
    },
  });
};

// Update entrepreneur status (approve/reject)
export const useUpdateEntrepreneurStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id_entrepreneur,
      status,
    }: {
      id_entrepreneur: number;
      status: 'approved' | 'rejected';
    }) => {
      const res = await client.patch(
        `/entrepreneurs/${id_entrepreneur}/status`,
        { status },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs'] });
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs', 'pending'] });
    },
  });
};

// Toggle entrepreneur active/inactive
export const useToggleEntrepreneurActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id_entrepreneur,
      active,
    }: {
      id_entrepreneur: number;
      active: boolean;
    }) => {
      const res = await client.patch(
        `/entrepreneurs/${id_entrepreneur}/toggle-active`,
        { active },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs'] });
    },
  });
};

// Delete entrepreneur
export const useDeleteEntrepreneur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id_entrepreneur: number) => {
      await client.delete(`/entrepreneurs/${id_entrepreneur}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs'] });
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs', 'pending'] });
    },
  });
};



// Normaliza posibles formatos de respuesta
function normalizeToArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}
function emailEq(a?: string, b?: string) {
  return (a ?? '').toLowerCase().trim() === (b ?? '').toLowerCase().trim();
}

export async function fetchEntrepreneurByEmail(
  email: string,
): Promise<Entrepreneur | null> {
  if (!email) return null;

  const tryGet = async (url: string, params?: any) => {
    try {
      const { data } = await client.get(url, { params });
      return data;
    } catch {
      return null;
    }
  };

  const attempts = [
    await tryGet('/entrepreneurs', { email }),
    await tryGet('/entrepreneurs', { search: email }),
    await tryGet('/entrepreneurs', { q: email }),
  ];

  for (const data of attempts) {
    if (!data) continue;
    if (data?.person?.email && emailEq(data.person.email, email)) {
      return data as Entrepreneur;
    }
    const list = normalizeToArray(data);
    const match = list.find((e: any) => emailEq(e?.person?.email, email));
    if (match) return match as Entrepreneur;
  }

  const big = await tryGet('/entrepreneurs', { limit: 1000 });
  const list = normalizeToArray(big);
  const match = list.find((e: any) => emailEq(e?.person?.email, email));
  return (match as Entrepreneur) ?? null;
}

export const useEntrepreneurByEmail = (email?: string) => {
  return useQuery<Entrepreneur | null, Error>({
    enabled: !!email,
    queryKey: ['entrepreneurs', 'byEmail', email],
    queryFn: async () => (email ? fetchEntrepreneurByEmail(email) : null),
    staleTime: 5 * 60 * 1000,
  });
};
