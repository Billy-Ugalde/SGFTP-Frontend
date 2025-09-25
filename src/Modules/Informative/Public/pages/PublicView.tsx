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

// Secciones NO editables (seguir usando el service local)
import {
  getNews,
  getEvents,
  getProjects,
  getSchools,
  getEntrepreneurs,
  getStatsSection,
} from '../../services/informativeService';
import AddEntrepreneurButton from '../../../Entrepreneurs/Components/AddEntrepreneurButton';

// EDITABLES desde backend Informativo
import { usePageContent } from '../../Admin/services/contentBlockService';

const PublicView: React.FC = () => {
  // ========= Secciones que se mantienen como están (informativeService) =========
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [eventsData, setEventsData] = useState<EventItem[]>([]);
  const [projectsData, setProjectsData] = useState<ProjectItem[]>([]);
  const [schoolsData, setSchoolsData] = useState<SchoolItem[]>([]);
  const [entrepreneursData, setEntrepreneursData] = useState<EntrepreneurItem[]>([]);
  const [baseStats, setBaseStats] = useState<StatsSectionData | null>(null); // base visual de estadísticas

  useEffect(() => {
    getNews().then(setNewsData);
    getEvents().then(setEventsData);
    getProjects().then(setProjectsData);
    getSchools().then(setSchoolsData);
    getEntrepreneurs().then(setEntrepreneursData);
    getStatsSection().then(setBaseStats);
  }, []);

  // ========= Secciones EDITABLES (consumen backend Informativo) =========
  const { data: pageData, isLoading, error } = usePageContent('home');
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

  // VALUE PROPOSITION (editable)
  const valueData: ValuePropositionData | null = useMemo(() => {
    const s = section('value_proposition');
    if (!pageData) return null;

    return {
      id: 'value_proposition',
      sectionTitle: 'Nuestra Propuesta de Valor',
      mission: { title: 'Misión', content: String(s['mission'] ?? '') },
      vision: { title: 'Meta', content: String(s['vision'] ?? s['goal'] ?? '') },
      impact: { title: 'Impacto', tags: [] },
      dimensions: { title: 'Dimensiones', tags: [] },
      lastUpdated: new Date().toISOString(),
    };
  }, [pageData]);

  // IMPACTO (editable)
  const backendImpactItems = useMemo(() => {
    const s = section('impact');
    if (!pageData) return [];
    return [
      s['social_impact'] ? { label: 'Impacto Social', value: String(s['social_impact']) } : null,
      s['cultural_impact'] ? { label: 'Impacto Cultural', value: String(s['cultural_impact']) } : null,
      s['environmental_impact'] ? { label: 'Impacto Ambiental', value: String(s['environmental_impact']) } : null,
    ].filter(Boolean) as Array<{ label: string; value?: string }>;
  }, [pageData]);

  // DIMENSIONES (editable)
  const backendDimensionItems = useMemo(() => {
    const s = section('dimensions');
    if (!pageData) return [];
    return [
      s['local_development'] ? { title: 'Desarrollo Local', description: String(s['local_development']) } : null,
      s['education'] ? { title: 'Educación', description: String(s['education']) } : null,
      s['prevention'] ? { title: 'Prevención', description: String(s['prevention']) } : null,
      s['conservation'] ? { title: 'Conservación', description: String(s['conservation']) } : null,
    ].filter(Boolean) as Array<{ title: string; description?: string }>;
  }, [pageData]);

  // === Descripciones de secciones (editable) ===
  const schoolsDescription = useMemo(() => String(section('participating_schools')['description'] ?? ''), [pageData]);
  const entrepreneursDescription = useMemo(() => String(section('entrepreneurs')['description'] ?? ''), [pageData]);
  const fairsDescription = useMemo(() => String(section('fairs')['description'] ?? ''), [pageData]);
  const involveDescription = useMemo(() => String(section('involve')['description'] ?? ''), [pageData]);
  const newsletterDescription = useMemo(() => String(section('newsletter')['description'] ?? ''), [pageData]);

  // --- Backend (Admin) de estadísticas: SOLO lo editable (desc personas/talleres + card Árboles) ---
  const backendStatsEditable = useMemo(() => {
    const s = section('statistics');
    if (!pageData) return null;

    const peopleDesc = s['involved_people'] || '';
    const workshopsDesc = s['wokshops_content'] || ''; // (typo tal cual en Admin)
    const treesTitle = (s['custom_stat_name'] || '') as string;
    const treesValue = (s['custom_stat_value'] || '') as string;

    return {
      peopleDesc: String(peopleDesc || ''),
      workshopsDesc: String(workshopsDesc || ''),
      treesTitle: treesTitle ? String(treesTitle) : '',
      treesValue: treesValue ? String(treesValue) : '',
    };
  }, [pageData]);

  // STATS (merge): conserva DISEÑO base del service y sobrescribe SOLO lo editable
  const statsItems = useMemo(() => {
    const baseItems = baseStats?.items ?? [];
    if (!backendStatsEditable) return baseItems;

    return baseItems.map((it) => {
      if (it.key === 'talleres' && backendStatsEditable.workshopsDesc) {
        return { ...it, description: backendStatsEditable.workshopsDesc };
      }
      if (it.key === 'personas' && backendStatsEditable.peopleDesc) {
        return { ...it, description: backendStatsEditable.peopleDesc };
      }
      if (it.key === 'arboles') {
        let changed = { ...it };
        if (backendStatsEditable.treesTitle) changed.title = backendStatsEditable.treesTitle;
        if (backendStatsEditable.treesValue) changed.value = backendStatsEditable.treesValue;
        return changed;
      }
      return it;
    });
  }, [baseStats, backendStatsEditable]);

  // INVOLVE (editable)
  const involveData: InvolveSection | null = useMemo(() => {
    if (!pageData) return null;
    return {
      id: 'involve',
      title: '¡Involúcrate con Nosotros!',
      description: involveDescription,
      cards: [
        { icon: '🤝', title: 'Voluntariado', description: 'Únete como voluntario en nuestras actividades.', buttonText: 'Quiero ser voluntario' },
        { icon: '💚', title: 'Donaciones', description: 'Aporta recursos para ampliar nuestro impacto.', buttonText: 'Donar ahora' },
        { icon: '🏫', title: 'Aliados', description: 'Colabora con nosotros desde tu organización.', buttonText: 'Ser aliado' },
      ],
    };
  }, [pageData, involveDescription]);

  // NEWSLETTER (editable)
  const newsletterData: NewsletterSection | null = useMemo(() => {
    if (!pageData) return null;
    return {
      title: 'Mantente Informado',
      description: newsletterDescription,
      disclaimer: 'No compartiremos tu correo. Puedes darte de baja cuando quieras.',
      placeholder: 'Ingresa tu correo',
      buttonText: 'Suscribirme',
    };
  }, [pageData, newsletterDescription]);

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

        {valueData && (
          <ValueProposition
            data={{
              ...valueData,
              impactItems: backendImpactItems,
              dimensionItems: backendDimensionItems,
            }}
          />
        )}

        {statsItems.length > 0 && <StatsSection items={statsItems} />}

        {/* No editables (listas) */}
        {eventsData.length > 0 && <Events data={eventsData} />}

        {projectsData.length > 0 && <Projects data={projectsData} />}

        {/* Escuelas ahora con descripción editable */}
        {schoolsData.length > 0 && <Schools data={schoolsData} description={schoolsDescription} />}

        {/* Ferias ahora con descripción editable */}
        <FairsPublic description={fairsDescription} />
        

        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <AddEntrepreneurButton />
        </div>
       {/* Emprendedores ahora con descripción editable */}
        <Entrepreneurs subtitle={entrepreneursDescription} />

        {newsData.length > 0 && <News data={newsData} />}

        {involveData && <Involve data={involveData} />}

        {newsletterData && <Newsletter data={newsletterData} />}
      </main>
      <Footer />
    </>
  );
};

export default PublicView;
