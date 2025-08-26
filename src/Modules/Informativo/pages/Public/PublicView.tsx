import React, { useEffect, useState } from 'react';

import Header from '../../components/Header';
import Hero from '../../components/Hero';
import ValueProposition from '../../components/ValueProposition';
import StatsSection from '../../components/StatsSection';
import News from '../../components/News';
import Events from '../../components/Events';
import Projects from '../../components/Projects';
import Schools from '../../components/Schools';
import Entrepreneurs from '../../components/Entrepreneurs';
import Involve from '../../components/Involve';
import Newsletter from '../../components/Newsletter';
import Footer from '../../components/Footer';

import '../../styles/public-view.css';

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
} from '../../services/informativoService';

import {
  getHeroSection,
  getValueProposition,
  getStatsSection,
  getNews,
  getEvents,
  getProjects,
  getSchools,
  getEntrepreneurs,
  getInvolucrateSection,
  getNewsletter,
} from '../../services/informativoService';

// Placeholder simple para Ferias (por ahora)
const FairsPlaceholder: React.FC = () => (
  <section id="fairs" className="section">
    <h2 className="section-title">Ferias</h2>
    <div className="info-card" style={{ textAlign: 'center' }}>
      Próximamente…
    </div>
  </section>
);

const PublicView: React.FC = () => {
  const [heroData, setHeroData] = useState<HeroSection | null>(null);
  const [valueData, setValueData] = useState<ValuePropositionData | null>(null);
  const [statsData, setStatsData] = useState<StatsSectionData | null>(null);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [eventsData, setEventsData] = useState<EventItem[]>([]);
  const [projectsData, setProjectsData] = useState<ProjectItem[]>([]);
  const [schoolsData, setSchoolsData] = useState<SchoolItem[]>([]);
  const [entrepreneursData, setEntrepreneursData] = useState<EntrepreneurItem[]>([]);
  const [involveData, setInvolveData] = useState<InvolveSection | null>(null);
  const [newsletterData, setNewsletterData] = useState<NewsletterSection | null>(null);

  useEffect(() => {
    getHeroSection().then(setHeroData);
    getValueProposition().then(setValueData);
    getStatsSection().then(setStatsData);
    getNews().then(setNewsData);
    getEvents().then(setEventsData);
    getProjects().then(setProjectsData);
    getSchools().then(setSchoolsData);
    getEntrepreneurs().then(setEntrepreneursData);
    getInvolucrateSection().then(setInvolveData);
    getNewsletter().then(setNewsletterData);
  }, []);

  return (
    <>
      <Header />
      <main>
        {/* Hero (siempre arriba) */}
        {heroData && <Hero data={heroData} />}

        {/* 1) Propuesta de Valor */}
        {valueData && <ValueProposition data={valueData} />}

        {/* 2) Estadísticas */}
        {statsData && <StatsSection data={statsData} />}

        {/* 3) Próximos Eventos */}
        {eventsData.length > 0 && <Events data={eventsData} />}

        {/* 4) Proyectos (no se excluye) */}
        {projectsData.length > 0 && <Projects data={projectsData} />}

        {/* 5) Escuelas */}
        {schoolsData.length > 0 && <Schools data={schoolsData} />}

        {/* 6) Ferias (placeholder por ahora) */}
        <FairsPlaceholder />

        {/* 7) Emprendedores */}
        {entrepreneursData.length > 0 && <Entrepreneurs data={entrepreneursData} />}

        {/* 8) Noticias */}
        {newsData.length > 0 && <News data={newsData} />}

        {/* 9) Involúcrate */}
        {involveData && <Involve data={involveData} />}

        {/* Newsletter opcional al final */}
        {newsletterData && <Newsletter data={newsletterData} />}
      </main>
      <Footer />
    </>
  );
};

export default PublicView;
