import React, { useEffect, useMemo, useState } from 'react'; 

//Components
import Header from '../components/Header';
import Hero from '../components/Hero';
import ValueProposition from '../components/ValueProposition';
import StatsSection from '../components/StatsSection';
import News from '../components/News';
import Events from '../components/Events';
import Projects from '../components/Projects';
import Schools from '../components/Schools';
import Entrepreneurs from '../components/Entrepreneurs';
import Involve from '../components/Involve';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import FairsPublic from '../components/Fairs';

// global styles
import '../styles/public-view.css';

//Component styles
import '../styles/Header.module.css'; 
import '../styles/Hero.module.css';
import '../styles/ValueProposition.module.css';
import '../styles/StatsSection.module.css';
import '../styles/News.module.css'; 
import '../styles/Events.module.css';
import '../styles/Projects.module.css';
import '../styles/Schools.module.css';
import '../styles/Entrepreneurs.module.css';
import '../styles/Involve.module.css';
import '../styles/Newsletter.module.css';
import '../styles/Footer.module.css';
import '../styles/Fairs.module.css';

import type {
  HeroSection,
  ValuePropositionData,
  StatsSectionData,
  NewsItem,
  EventItem,
  ProjectItem,
  SchoolItem,
  EntrepreneurItem,
  InvolveSection,
  NewsletterSection,
} from '../../services/informativeService';

// Mantener estas secciones tal cual (NO editables desde backend)
import {
  getNews,
  getEvents,
  getProjects,
  getSchools,
  getEntrepreneurs,
} from '../../services/informativeService';

// EDITABLES desde backend Informativo
import { usePageContent } from '../../Admin/services/contentBlockService';

const PublicView: React.FC = () => {
  // ========= Secciones que se mantienen como están (informativeService) =========
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [eventsData, setEventsData] = useState<EventItem[]>([]);
  const [projectsData, setProjectsData] = useState<ProjectItem[]>([]);
  const [schoolsData, setSchoolsData] = useState<SchoolItem[]>([]);
  const [entrepreneursData, setEntrepreneursData] = useState<EntrepreneurItem[]>([]);

  useEffect(() => {
    getNews().then(setNewsData);
    getEvents().then(setEventsData);
    getProjects().then(setProjectsData);
    getSchools().then(setSchoolsData);
    getEntrepreneurs().then(setEntrepreneursData);
  }, []);

  // ========= Secciones EDITABLES (consumen backend Informativo) =========
  // Estructura de respuesta: { [section: string]: { [block_key: string]: string | null } }
  const { data: pageData, isLoading, error } = usePageContent('home');

  // Helper para acceder a una sección concreta
  const section = (name: string): Record<string, string | null> => (pageData?.[name] ?? {});

  // HERO (editable)
  const heroData: HeroSection | null = useMemo(() => {
    const s = section('hero');
    if (!pageData) return null;
    return {
      id: 'hero',
      title: (s['title'] ?? '') as string,
      subtitle: (s['subtitle'] ?? '') as string,
      description: (s['description'] ?? '') as string,
      backgroundImage: (s['background'] ?? '') as string,
      lastUpdated: new Date().toISOString(),
    };
  }, [pageData]);

  // VALUE PROPOSITION (editable) — CORREGIDO
  const valueData: ValuePropositionData | null = useMemo(() => {
    const s = section('value_proposition');
    if (!pageData) return null;

    return {
      id: 'value_proposition',
      sectionTitle: 'Nuestra Propuesta de Valor',
      mission: {
        title: 'Misión',
        content: String(s['mission'] ?? ''),
      },
      // En admin usan goal/vision; mostramos preferentemente 'vision' y si no, 'goal'
      vision: {
        title: 'Meta',
        content: String(s['vision'] ?? s['goal'] ?? ''),
      },
      // placeholders seguros; el componente los puede completar con los helpers actuales
      impact: { title: 'Impacto', tags: [] },
      dimensions: { title: 'Dimensiones', tags: [] },
      lastUpdated: new Date().toISOString(),
    };
  }, [pageData]);

  // STATS (editable)
  const statsData: StatsSectionData | null = useMemo(() => {
    const s = section('statistics');
    if (!pageData) return null;

    const items: { key: string; title: string; value: string; description?: string }[] = [
      { key: 'involved_people', title: 'Personas Involucradas', value: String(s['involved_people'] ?? '') },
      { key: 'wokshops_content', title: 'Talleres', value: String(s['wokshops_content'] ?? ''), description: 'Contenido' },
    ];

    // Métrica personalizada (opcional)
    const customName = (s['custom_stat_name'] ?? '') as string;
    const customValue = (s['custom_stat_value'] ?? '') as string;
    if (customName && customValue) {
      items.push({ key: 'custom', title: customName, value: customValue });
    }

    return { title: 'Estadísticas', items: items.filter(it => it.value) };
  }, [pageData]);

  // INVOLVE (editable)
  const involveData: InvolveSection | null = useMemo(() => {
    const s = section('involve');
    if (!pageData) return null;
    return {
      id: 'involve',
      title: '¡Involúcrate con Nosotros!',
      description: (s['description'] ?? '') as string,
      // Tarjetas se mantienen estáticas (aún no son editables en backend)
      cards: [
        { icon: '🤝', title: 'Voluntariado', description: 'Únete como voluntario en nuestras actividades.', buttonText: 'Quiero ser voluntario' },
        { icon: '💚', title: 'Donaciones', description: 'Aporta recursos para ampliar nuestro impacto.', buttonText: 'Donar ahora' },
        { icon: '🏫', title: 'Aliados', description: 'Colabora con nosotros desde tu organización.', buttonText: 'Ser aliado' },
      ],
    };
  }, [pageData]);

  // NEWSLETTER (editable)
  const newsletterData: NewsletterSection | null = useMemo(() => {
    const s = section('newsletter');
    if (!pageData) return null;
    return {
      title: 'Mantente Informado',
      description: (s['description'] ?? '') as string,
      disclaimer: 'No compartiremos tu correo. Puedes darte de baja cuando quieras.',
      placeholder: 'Ingresa tu correo',
      buttonText: 'Suscribirme',
    };
  }, [pageData]);

  // Estados de carga/error SOLO para secciones editables
  if (isLoading) {
    return (
      <>
        <Header />
        <main style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <p>Cargando contenido…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <p>Ocurrió un error cargando el contenido.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        {heroData && <Hero data={heroData} />}

        {valueData && <ValueProposition data={valueData} />}

        {statsData && <StatsSection data={statsData} />}

        {/* Secciones que se mantienen como están (consumo de informativeService) */}
        {eventsData.length > 0 && <Events data={eventsData} />}

        {projectsData.length > 0 && <Projects data={projectsData} />}

        {schoolsData.length > 0 && <Schools data={schoolsData} />}

        <FairsPublic />

        <Entrepreneurs />

        {newsData.length > 0 && <News data={newsData} />}

        {involveData && <Involve data={involveData} />}

        {newsletterData && <Newsletter data={newsletterData} />}
      </main>
      <Footer />
    </>
  );
};

export default PublicView;
