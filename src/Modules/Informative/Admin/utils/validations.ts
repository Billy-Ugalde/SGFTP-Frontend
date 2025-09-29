// src/Modules/Informative/utils/validations.ts (continuando)
export const TEXT_LIMITS = {
  // Hero section
  title: { min: 3, max: 80 },
  subtitle: { min: 3, max: 120 },
  description: { min: 10, max: 300 },
  
  // Value proposition
  mission: { min: 20, max: 500 },
  vision: { min: 20, max: 500 },
  goal: { min: 20, max: 500 },
  
  // Impact section
  social_impact: { min: 15, max: 250 },
  cultural_impact: { min: 15, max: 250 },
  environmental_impact: { min: 15, max: 250 },
  
  // Dimensions
  local_development: { min: 15, max: 250 },
  education: { min: 15, max: 250 },
  prevention: { min: 15, max: 250 },
  conservation: { min: 15, max: 250 },
  
  // Statistics
  stat_value: { min: 1, max: 20 },
  stat_name: { min: 3, max: 50 },
  
  // Newsletter
  newsletter_description: { min: 10, max: 200 }, // newsletter description
  
  // Board members
  president_name: { min: 3, max: 60 },
  vice_president_name: { min: 3, max: 60 },
  secretary_name: { min: 3, max: 60 },
  treasurer_name: { min: 3, max: 60 },
  director_name: { min: 3, max: 60 },
  administrator_name: { min: 3, max: 60 },
};

// Validaciones para texto
export const validateTextContent = (value: string, blockKey: string): string | null => {
  if (!value || value.trim() === '') {
    return 'Este campo es requerido';
  }

  const limits = TEXT_LIMITS[blockKey as keyof typeof TEXT_LIMITS];
  if (!limits) {
    // Si no hay límites específicos, usar validación básica
    if (value.trim().length < 3) return 'Mínimo 3 caracteres';
    if (value.trim().length > 500) return 'Máximo 500 caracteres';
    return null;
  }

  const length = value.trim().length;
  if (length < limits.min) {
    return `Mínimo ${limits.min} caracteres (actual: ${length})`;
  }
  if (length > limits.max) {
    return `Máximo ${limits.max} caracteres (actual: ${length})`;
  }

  return null; // Sin errores
};

// Validaciones para URLs de imágenes
export const validateImageUrl = (url: string): string | null => {
  if (!url || url.trim() === '') {
    return 'URL de imagen es requerida';
  }

  // Verificar formato URL básico
  try {
    new URL(url);
  } catch {
    return 'Formato de URL inválido';
  }

  // Verificar extensiones permitidas
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const hasValidExtension = validExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );

  if (!hasValidExtension) {
    return 'Solo se permiten imágenes: jpg, jpeg, png, webp';
  }

  return null; // Sin errores
};

// Validaciones para Contact Info
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return 'Email es requerido';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Formato de email inválido';
  }

  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone || phone.trim() === '') {
    return 'Teléfono es requerido';
  }

  // Formato flexible para números internacionales
  const phoneRegex = /^[\+]?[1-9][\d]{7,14}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return 'Formato de teléfono inválido (ej: +506 1234 5678)';
  }

  return null;
};

export const validateSocialUrl = (url: string, platform: string): string | null => {
  if (!url || url.trim() === '') {
    return `URL de ${platform} es requerida`;
  }

  try {
    const urlObj = new URL(url);
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        if (!urlObj.hostname.includes('facebook.com')) {
          return 'URL debe ser de Facebook (facebook.com)';
        }
        break;
      case 'instagram':
        if (!urlObj.hostname.includes('instagram.com')) {
          return 'URL debe ser de Instagram (instagram.com)';
        }
        break;
      case 'youtube':
        if (!urlObj.hostname.includes('youtube.com')) {
          return 'URL debe ser de YouTube (youtube.com)';
        }
        break;
      case 'whatsapp':
        if (!urlObj.hostname.includes('whatsapp.com')) {
          return 'URL debe ser de WhatsApp (whatsapp.com)';
        }
        break;
      case 'maps':
        if (!urlObj.hostname.includes('google.com') && !urlObj.hostname.includes('maps.google.com')) {
          return 'URL debe ser de Google Maps';
        }
        break;
    }
  } catch {
    return 'Formato de URL inválido';
  }

  return null;
};