// ================= HERO =================
export interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  lastUpdated: string;
}

export const getHeroSection = async (): Promise<HeroSection> => {
  const local = localStorage.getItem('heroSection');
  if (local) return JSON.parse(local);

  return {
    id: 'hero',
    title: 'Tamarindo Park Foundation',
    subtitle: 'Tu voz, nuestro proyecto',
    description: 'Transformando comunidades a través del desarrollo sostenible integral',
    backgroundImage: 'https://example.com/path/to/hero-image.jpg',
    lastUpdated: new Date().toISOString(),
  };
};

// ================= VALUE PROPOSITION =================
export interface ValuePropositionData {
  id: string;
  sectionTitle: string;
  mission: { title: string; content: string };
  vision: { title: string; content: string };
  impact: { title: string; tags: string[] };
  dimensions: { title: string; tags: string[] };
  lastUpdated: string;
}

export const getValueProposition = async (): Promise<ValuePropositionData> => {
  const local = localStorage.getItem('valueProposition');
  if (local) return JSON.parse(local);

  return {
    id: 'value_proposition',
    sectionTitle: 'Nuestra Propuesta de Valor',
    mission: {
      title: 'Misión',
      content: 'Transformar de manera integral la coexistencia entre las comunidades y su entorno, mediante proyectos y programas que fortalecen las dimensiones cultural, ambiental y social.',
    },
    vision: {
      title: 'Meta',
      content: 'Ser una ONG referente en desarrollo sostenible integral en pro del desarrollo de comunidades o sectores en condición de vulnerabilidad.',
    },
    impact: {
      title: 'Impacto',
      tags: ['Social', 'Cultural', 'Ambiental'],
    },
    dimensions: {
      title: 'Dimensiones',
      tags: ['Desarrollo Local', 'Educación', 'Prevención', 'Conservación'],
    },
    lastUpdated: new Date().toISOString(),
  };
};

// ================= ESTADÍSTICAS =================
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/env';

/** Datos que el backend /stats provee para la vista pública.
 *  - waste_kg:      kg de residuos recolectados (agregado desde actividades en el backend)
 *  - workshops:     cantidad de talleres realizados (agregado desde actividades en el backend)
 *  - beneficiaries: total de personas en el sistema
 *                   (donadores + voluntarios + usuarios admin + emprendedores)
 *
 *  Árboles se calcula en el frontend desde las actividades.
 *  Población Estudiantil es editable desde el módulo informativo.
 */
export interface PublicStatsData {
  waste_kg:      number;
  workshops:     number;
  beneficiaries: number;
  /** Árboles plantados según el backend (puede ser 0 si el endpoint no lo provee). */
  trees_planted: number;
}

// Alias para compatibilidad con cualquier import existente
export type StatsSectionData = PublicStatsData;

const statsClient = axios.create({ baseURL: API_BASE_URL });

const fetchPublicStats = async (): Promise<PublicStatsData> => {
  const { data } = await statsClient.get('/stats');
  return {
    waste_kg:      Number(data.waste_kg      ?? 0),
    workshops:     Number(data.workshops     ?? 0),
    beneficiaries: Number(data.beneficiaries ?? data.people_count ?? 0),
    // El backend puede exponer el total de árboles como trees_planted, treesPlanted
    // o dentro de activities_summary; probamos varios nombres posibles.
    trees_planted: Number(
      data.trees_planted ??
      data.treesPlanted  ??
      data.trees         ??
      0
    ),
  };
};

export const usePublicStats = () =>
  useQuery<PublicStatsData>({
    queryKey: ['public-stats'],
    queryFn: fetchPublicStats,
    // staleTime: 0 → data siempre stale → refetch inmediato en cada mount.
    // En TanStack Query v5, si staleTime > 0 con initialData, los ceros del
    // placeholder se quedan sin actualizar hasta que expira el staleTime.
    staleTime: 0,
  });

export const getStatsSection = fetchPublicStats;

// ================= INVOLÚCRATE =================
export interface InvolveCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  buttonText: string;
}

export interface InvolveSection {
  id: string;
  title: string;
  description: string;
  cards: InvolveCard[];
}
export interface ImpactItem {
  label: string;
  value: string;
}

export interface ImpactSection {
  title: string;
  items: ImpactItem[];
}

export interface DimensionItem {
  title: string;
  description: string;
}

export interface DimensionSection {
  title: string;
  dimensiones: DimensionItem[];
}

export const getInvolucrateSection = async (): Promise<InvolveSection> => {
  const local = localStorage.getItem('involucrateSection');
  if (local) return JSON.parse(local);

  return {
    id: 'involucrate',
    title: '¡Involúcrate con Nosotros!',
    description: 'Únete a nuestra misión de transformar comunidades.',
    cards: [
      {
        id: 'volunteer',
        icon: '🤝',
        title: 'Ser Voluntario',
        description: 'Participa en nuestras actividades y campañas.',
        buttonText: 'Quiero ser Voluntario',
      },
      {
        id: 'donation',
        icon: '💝',
        title: 'Hacer una Donación',
        description: 'Apoya nuestros proyectos con una contribución.',
        buttonText: 'Quiero Donar',
      },
      {
        id: 'entrepreneur',
        icon: '🚀',
        title: 'Ser Emprendedor',
        description: 'Forma parte de nuestra red de emprendedores locales.',
        buttonText: 'Registrar Emprendimiento',
      },
      {
        id: 'project',
        icon: '📋',
        title: 'Solicitar Proyecto',
        description: '¿Tu comunidad necesita un proyecto? Envíanos tu propuesta.',
        buttonText: 'Proponer Proyecto',
      },
    ],
  };
};

// ================= IMPACTO =================
export const getImpactSection = async (): Promise<{ title: string; items: { label: string; value: string }[] }> => {
  const local = localStorage.getItem('impactSection');
  if (local) return JSON.parse(local);

  return {
    title: 'Impacto',
    items: [
      { label: 'Social', value: 'Fortalecimiento comunitario' },
      { label: 'Cultural', value: 'Preservación y promoción' },
      { label: 'Ambiental', value: 'Conservación y educación' },
    ],
  };
};

// ================= DIMENSIONES =================
export const getDimensionesSection = async (): Promise<{ title: string; dimensiones: { title: string; description: string }[] }> => {
  const local = localStorage.getItem('dimensionesSection');
  if (local) return JSON.parse(local);

  return {
    title: 'Dimensiones',
    dimensiones: [
      { title: 'Desarrollo Local', description: 'Proyectos comunitarios' },
      { title: 'Educación', description: 'Formación y capacitación' },
      { title: 'Prevención', description: 'Estrategias preventivas' },
      { title: 'Conservación', description: 'Protección ambiental' },
    ],
  };
};

// ================= MANTENTE INFORMADO =================
export interface NewsletterSection {
  title: string;
  description: string;
  disclaimer: string;
  placeholder: string;
  buttonText: string;
}

export const getNewsletter = async (): Promise<NewsletterSection> => {
  const local = localStorage.getItem('mantenteInformadoSection');
  if (local) return JSON.parse(local);

  return {
    title: 'Mantente Informado',
    description: 'Suscríbete a nuestro boletín para recibir noticias, eventos y oportunidades.',
    disclaimer: 'Nos comprometemos a respetar tu privacidad.',
    placeholder: 'Ingresa tu correo electrónico',
    buttonText: 'Suscribirme',
  };
};

// ================= NOTICIAS =================
export interface NewsItem {
  date: string;
  title: string;
  content: string;
}

export const getNews = async (): Promise<NewsItem[]> => {
  return [
    {
      date: '15 de Junio, 2025',
      title: 'Exitosa Campaña de Reforestación en Tamarindo',
      content: 'Más de 200 voluntarios participaron en la plantación de 500 árboles nativos en la zona costera de Tamarindo.',
    },
    {
      date: '10 de Junio, 2025',
      title: 'Nueva Estación de Reciclaje Instalada',
      content: 'La Escuela Pacífico Verde recibió una nueva estación de reciclaje que beneficiará a más de 300 estudiantes.',
    },
    {
      date: '5 de Junio, 2025',
      title: 'Feria de Emprendedores Locales',
      content: 'La primera feria de emprendedores locales reunió a 25 artesanos y comerciantes de la región.',
    },
  ];
};

// ================= EVENTOS =================
export interface EventItem {
  date: string;
  title: string;
  description: string;
}

export const getEvents = async (): Promise<EventItem[]> => {
  const local = localStorage.getItem('events');
  if (local) return JSON.parse(local);

  return [
 {
    date: '3 de Agosto',
    title: 'Jornada de Reforestación',
    description: 'Siembra de árboles nativos en zona protegida. Punto de encuentro: Parque Ecológico, 7:00 AM',
  },
  {
    date: '6 de Agosto',
    title: 'Clínica de Surf para Principiantes',
    description: 'Lecciones gratuitas de surf para todas las edades. Playa Grande, 8:00 AM',
  },
  {
    date: '10 de Agosto',
    title: 'Taller de Fotografía de Naturaleza',
    description: 'Aprende técnicas para capturar la flora y fauna local. Centro Cultural, 3:00 PM',
  },
  {
    date: '13 de Agosto',
    title: 'Cine al Aire Libre',
    description: 'Proyección de película familiar. Parque Central, 6:30 PM',
  },
  {
    date: '18 de Agosto',
    title: 'Feria de Salud Comunitaria',
    description: 'Chequeos médicos y charlas de prevención. Salón Comunal, 9:00 AM',
  },
  {
    date: '22 de Agosto',
    title: 'Noche de Talentos Locales',
    description: 'Presentaciones de música, danza y poesía. Teatro Municipal, 7:00 PM',
  },
  {
    date: '27 de Agosto',
    title: 'Rally de Bicicletas',
    description: 'Competencia recreativa en circuito urbano. Punto de partida: Plaza Central, 8:00 AM',
  },
  {
    date: '31 de Agosto',
    title: 'Mercado Verde',
    description: 'Venta de productos orgánicos y artesanías ecológicas. Plaza del Pueblo, 9:00 AM',
  },

  // === SEPTIEMBRE ===
  {
    date: '4 de Septiembre',
    title: 'Charla de Conservación de Tortugas Marinas',
    description: 'Conferencia sobre protección de tortugas en la región. Centro de Visitantes, 4:00 PM',
  },
  {
    date: '10 de Septiembre',
    title: 'Festival de Música Folclórica',
    description: 'Bandas y grupos de danza tradicionales en vivo. Parque Central, 5:00 PM',
  },
  {
    date: '15 de Septiembre',
    title: 'Desfile de Independencia',
    description: 'Celebración con carrozas, bandas y comparsas. Calle Principal, 10:00 AM',
  },
  {
    date: '25 de Septiembre',
    title: 'Taller de Compostaje Avanzado',
    description: 'Aprende técnicas para compostaje comunitario. Centro Comunitario, 2:00 PM',
  },

  // === OCTUBRE ===
  {
    date: '2 de Octubre',
    title: 'Competencia de Pesca Artesanal',
    description: 'Concurso en la costa local con premiación. Muelle Principal, 6:00 AM',
  },
  {
    date: '8 de Octubre',
    title: 'Caminata Nocturna Guiada',
    description: 'Recorrido para observar fauna nocturna. Reserva Natural, 7:00 PM',
  },
  {
    date: '14 de Octubre',
    title: 'Feria del Café',
    description: 'Exposición y degustación de cafés de la región. Plaza Central, 9:00 AM',
  },
  {
    date: '20 de Octubre',
    title: 'Jornada de Limpieza Submarina',
    description: 'Buceo para recolección de desechos en arrecifes. Playa Langosta, 8:00 AM',
  },
  {
    date: '25 de Octubre',
    title: 'Festival de Comida Callejera',
    description: 'Puestos gastronómicos con platillos locales e internacionales. Avenida Central, 12:00 PM',
  },
  {
    date: '30 de Octubre',
    title: 'Noche de Leyendas',
    description: 'Cuentos y narraciones de historias locales. Museo Histórico, 6:00 PM',
  },

  // === NOVIEMBRE ===
  {
    date: '5 de Noviembre',
    title: 'Carrera Atlética 5K y 10K',
    description: 'Competencia abierta para todas las edades. Inscripciones en línea y en el Parque Central, 6:00 AM',
  },
  {
    date: '18 de Noviembre',
    title: 'Exposición de Pintura Local',
    description: 'Muestra de artistas emergentes de la región. Galería Cultural, 4:00 PM',
  },

  // === DICIEMBRE ===
  {
    date: '1 de Diciembre',
    title: 'Feria Navideña Artesanal',
    description: 'Venta de regalos hechos a mano. Plaza Central, 9:00 AM',
  },
  {
    date: '3 de Diciembre',
    title: 'Maratón de Zumba Solidaria',
    description: 'Clases de zumba para recaudar fondos. Salón Comunal, 5:00 PM',
  },
  {
    date: '5 de Diciembre',
    title: 'Concierto Coral de Navidad',
    description: 'Presentación de coros locales. Iglesia Principal, 7:00 PM',
  },
  {
    date: '8 de Diciembre',
    title: 'Torneo de Voleibol de Playa',
    description: 'Competencia amistosa en Playa Tamarindo, 8:00 AM',
  },
  {
    date: '10 de Diciembre',
    title: 'Taller de Elaboración de Panetones',
    description: 'Aprende a preparar panetones navideños. Centro Cultural, 3:00 PM',
  },
  {
    date: '12 de Diciembre',
    title: 'Noche de Villancicos',
    description: 'Recorrido musical por las calles del pueblo. Inicio: Parque Central, 6:00 PM',
  },
  {
    date: '15 de Diciembre',
    title: 'Festival de Luces',
    description: 'Desfile nocturno con carrozas iluminadas. Avenida Principal, 7:00 PM',
  },
  {
    date: '18 de Diciembre',
    title: 'Cine Navideño Infantil',
    description: 'Proyección de película navideña para niños. Biblioteca Municipal, 4:00 PM',
  },
  {
    date: '21 de Diciembre',
    title: 'Taller de Manualidades Navideñas',
    description: 'Elaboración de adornos con materiales reciclados. Centro Comunitario, 2:00 PM',
  },
  {
    date: '24 de Diciembre',
    title: 'Misa de Gallo',
    description: 'Celebración religiosa tradicional de Navidad. Iglesia del Pueblo, 10:00 PM',
  },
  {
    date: '28 de Diciembre',
    title: 'Fiesta de Fin de Año',
    description: 'Baile y música en vivo para despedir el año. Plaza Central, 9:00 PM',
  },
  {
    date: '31 de Diciembre',
    title: 'Fuegos Artificiales de Año Nuevo',
    description: 'Espectáculo de luces para recibir el nuevo año. Malecón, 12:00 AM',
  },
  ];
};

// ================= PROYECTOS =================
import type { Project } from '../../Projects/Services/ProjectsServices';

export interface ProjectItem {
  title: string;
  description: string;
  location: string;
  image: string;
  startDate: string;
}

// Función helper para mapear Project del backend a ProjectItem para el frontend público
export const mapProjectToProjectItem = (project: Project): ProjectItem => {
  const image = project.url_1 ||
                project.url_2 ||
                project.url_3 ||
                project.url_4 ||
                project.url_5 ||
                project.url_6 ||
                '🌱';

  // Formatear fecha de inicio
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return {
    title: project.Name,
    description: project.Description,
    location: project.Location,
    image: image,
    startDate: formatDate(project.Start_date),
  };
};


export const getProjects = async (): Promise<ProjectItem[]> => {
  // Retorna array vacío por defecto
  // El componente debe usar el hook usePublicProjects directamente
  return [];
};

// ================= ESCUELAS =================
export interface SchoolItem {
  name: string;
  community: string;
  level: string;
  description: string;
  kgRecycled: number;
  students: number;
  participation: number;
}

export const getSchools = async (): Promise<SchoolItem[]> => {
  const local = localStorage.getItem('schools');
  if (local) return JSON.parse(local);

  return [
    {
      name: 'Escuela Pacífico Verde',
      community: 'Tamarindo',
      level: 'Primaria',
      description: 'Líderes en el programa de reciclaje escolar con excelentes resultados.',
      kgRecycled: 450,
      students: 250,
      participation: 95,
    },
    {
      name: 'Escuela Vista Mar',
      community: 'Santa Cruz',
      level: 'Primaria',
      description: 'Comprometidos con la educación ambiental y el reciclaje responsable.',
      kgRecycled: 320,
      students: 180,
      participation: 88,
    },
    {
      name: 'Escuela Bosque Seco',
      community: 'Nicoya',
      level: 'Primaria',
      description: 'Nuevos participantes con gran entusiasmo por el programa.',
      kgRecycled: 180,
      students: 120,
      participation: 75,
    },
  ];
};

// ================= EMPRENDEDORES =================
export interface EntrepreneurItem {
  name: string;
  person: string;
  role: string;
  type: string;
  description: string;
  image?: string;
  contacts: { label: string; link: string }[];
}

export const getEntrepreneurs = async (): Promise<EntrepreneurItem[]> => {
  const local = localStorage.getItem('entrepreneurs');
  if (local) return JSON.parse(local);

  return [
    {
      name: 'Alfarería Tradicional María',
      person: 'María González',
      role: 'Emprendedora',
      type: 'Artesanía',
      description: 'Creación de piezas únicas en barro siguiendo técnicas ancestrales.',
      image: '🏺 Artesanía en Barro',
      contacts: [
        { label: 'WhatsApp', link: '#' },
        { label: 'Facebook', link: '#' },
      ],
    },
    {
      name: 'Sabores de Mi Tierra',
      person: 'Carmen Rojas',
      role: 'Emprendedora',
      type: 'Gastronomía',
      description: 'Comida típica costarricense preparada con ingredientes locales.',
      image: '🍲 Comida Tradicional',
      contacts: [
        { label: 'Pedidos', link: '#' },
        { label: 'Instagram', link: '#' },
      ],
    },
    {
      name: 'Hilos y Tradiciones',
      person: 'Ana Vásquez',
      role: 'Emprendedora',
      type: 'Textil',
      description: 'Confección de vestimenta tradicional y moderna con telas locales.',
      image: '👗 Vestimenta Local',
      contacts: [
        { label: 'Catálogo', link: '#' },
        { label: 'Contacto', link: '#' },
      ],
    },
  ];
};


