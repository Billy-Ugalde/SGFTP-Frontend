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
      { label: 'Social', value: 'Beneficios para la comunidad y cohesión social' },
      { label: 'Cultural', value: 'Rescate y fortalecimiento de la identidad local' },
      { label: 'Ambiental', value: 'Protección de recursos naturales y sostenibilidad' },
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
      { title: 'Desarrollo Local', description: 'Programas que promueven la autosuficiencia y crecimiento comunitario.' },
      { title: 'Educación', description: 'Acceso a conocimientos y formación para todos los sectores.' },
      { title: 'Prevención', description: 'Prevención de riesgos sociales y ambientales.' },
      { title: 'Conservación', description: 'Protección y regeneración del medio ambiente local.' },
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
      date: '12 de Julio',
      title: 'Jornada de Limpieza Costera',
      description: 'Limpieza de playas y áreas costeras. Punto de encuentro: Playa Tamarindo, 7:00 AM',
    },
    {
      date: '18 de Julio',
      title: 'Taller de Compostaje',
      description: 'Aprende técnicas de compostaje doméstico. Centro Comunitario, 2:00 PM',
    },
    {
      date: '25 de Julio',
      title: 'Feria de Artesanías',
      description: 'Exposición y venta de productos artesanales locales. Plaza Central, 9:00 AM',
    },
  ];
};

// ================= PROYECTOS =================
export interface ProjectItem {
  title: string;
  description: string;
  impact: string;
  location: string;
  image: string;
}

export const getProjects = async (): Promise<ProjectItem[]> => {
  return [
    {
      title: 'Reforestación Costera 2024',
      description: 'Plantación de 800 árboles nativos en la zona costera para combatir la erosión y restaurar el ecosistema local.',
      impact: '5 hectáreas restauradas, 150 voluntarios participantes',
      location: 'Tamarindo',
      image: '🌱 Imagen del Proyecto',
    },
    {
      title: 'Estaciones de Reciclaje Escolares',
      description: 'Instalación de 15 estaciones de reciclaje en escuelas de la región con programas educativos.',
      impact: '1,200 estudiantes beneficiados, 3 toneladas de material reciclado',
      location: 'Santa Cruz',
      image: '♻️ Imagen del Proyecto',
    },
    {
      title: 'Feria de Emprendedores',
      description: 'Organización de ferias mensuales para promover el comercio local y las tradiciones artesanales.',
      impact: '50 emprendedores apoyados, incremento del 30% en ventas locales',
      location: 'Nicoya',
      image: '🏘️ Imagen del Proyecto',
    },
  ];
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


