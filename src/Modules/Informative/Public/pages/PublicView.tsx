import React, { useEffect, useMemo, useState, startTransition } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ValueProposition from '../components/ValueProposition';
import StatsSection from '../components/StatsSection';

const SectionIndicator = React.lazy(() => import('../components/SectionIndicator'));
const NewsTicker       = React.lazy(() => import('../components/NewsTicker'));

// Componentes below-fold: lazy-loaded para reducir bundle inicial
const News               = React.lazy(() => import('../components/News'));
const Events             = React.lazy(() => import('../components/Events'));
const Projects           = React.lazy(() => import('../components/Projects'));
const Activities         = React.lazy(() => import('../components/Activities'));
const Schools            = React.lazy(() => import('../components/Schools'));
const Entrepreneurs      = React.lazy(() => import('../components/Entrepreneurs'));
const Involve            = React.lazy(() => import('../components/Involve'));
const Newsletter         = React.lazy(() => import('../components/Newsletter'));
const Footer             = React.lazy(() => import('../components/Footer'));
const FairsPublic        = React.lazy(() => import('../components/Fairs'));
const BecomeEntrepreneurCTA = React.lazy(() => import('../components/BecomeEntrepreneurCTA'));
const BecomeVolunteerCTA = React.lazy(() => import('../components/BecomeVolunteerCTA'));
const DonationSection    = React.lazy(() => import('../components/DonationSection'));

const VolunteerPublicForm   = React.lazy(() => import('../../../Volunteers/Components/VolunteerPublicForm'));
const DonationPublicForm    = React.lazy(() => import('../components/DonationPublicForm'));
const AddEntrepreneurForm   = React.lazy(() => import('../../../Entrepreneurs/Components/AddEntrepreneurForm'));
const GenericModal          = React.lazy(() => import('../../../Entrepreneurs/Components/GenericModal'));

import '../styles/public-view.css';

import type {
  HeroSection,
  ValuePropositionData,
  InvolveSection,
  NewsletterSection,
} from '../../services/informativeService';

import { usePublicStats } from '../../services/informativeService';
import { usePageContent } from '../../Admin/services/contentBlockService';
import { usePublicProjects } from '../../../Projects/Services/ProjectsServices';
import { usePublicActivities, usePublicDisplayActivities, type Activity } from '../../../Activities/Services/ActivityService';

const API_BASE: string = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';

const processImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.includes('/images/proxy')) return trimmed;
  if (trimmed.includes('drive.google.com')) {
    return `${API_BASE}/images/proxy?url=${encodeURIComponent(trimmed)}`;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${API_BASE}${trimmed.startsWith('/') ? trimmed : '/' + trimmed}`;
};

const PublicView: React.FC = () => {
  const { data: baseStats } = usePublicStats();
  const { data: backendProjects } = usePublicProjects();
  const { data: backendActivities } = usePublicActivities();
  const { data: backendDisplayActivities } = usePublicDisplayActivities();

  const schoolActivities = useMemo((): Activity[] => {
    if (!backendDisplayActivities || !Array.isArray(backendDisplayActivities)) return [];
    return (backendDisplayActivities as Activity[]).filter(a => a.IsFavorite === 'school');
  }, [backendDisplayActivities]);

  useEffect(() => {
    const scrollToHash = (hash: string, attempt = 0) => {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempt < 20) {
        setTimeout(() => scrollToHash(hash, attempt + 1), 100);
      }
    };

    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) scrollToHash(hash);
    };

    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    return () => { window.removeEventListener('hashchange', handleHashScroll); };
  }, []);

  const { data: pageData, isLoading, error } = usePageContent('home');
  const section = (name: string): Record<string, string | null> => (pageData?.[name] ?? {});

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

  const heroBgUrl = useMemo(() => processImageUrl(heroData?.backgroundImage), [heroData?.backgroundImage]);

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

  const backendImpactItems = useMemo(() => {
    const s = section('impact');
    if (!pageData) return [];
    return [
      s['social_impact'] ? { label: 'Impacto Social', value: String(s['social_impact']) } : null,
      s['cultural_impact'] ? { label: 'Impacto Cultural', value: String(s['cultural_impact']) } : null,
      s['environmental_impact'] ? { label: 'Impacto Ambiental', value: String(s['environmental_impact']) } : null,
    ].filter(Boolean) as Array<{ label: string; value?: string }>;
  }, [pageData]);

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

  const schoolsDescription      = useMemo(() => String(section('participating_schools')['description'] ?? ''), [pageData]);
  const entrepreneursDescription = useMemo(() => String(section('entrepreneurs')['description'] ?? ''), [pageData]);
  const fairsDescription         = useMemo(() => String(section('fairs')['description'] ?? ''), [pageData]);
  const involveDescription       = useMemo(() => String(section('involve')['description'] ?? ''), [pageData]);
  const newsletterDescription    = useMemo(() => String(section('newsletter')['description'] ?? ''), [pageData]);

  const backendStatsEditable = useMemo(() => {
    const s = section('statistics');
    if (!pageData) return null;
    return {
      peopleDesc:    String(s['involved_people'] || ''),
      workshopsDesc: String(s['wokshops_content'] || ''),
      treesTitle:    String(s['custom_stat_name'] || ''),
      treesValue:    String(s['custom_stat_value'] || ''),
    };
  }, [pageData]);

  const statsItems = useMemo(() => {
    const dynamicItems = (baseStats?.items ?? []).map((it) => {
      if (it.key === 'talleres' && backendStatsEditable?.workshopsDesc) return { ...it, description: backendStatsEditable.workshopsDesc };
      if (it.key === 'personas' && backendStatsEditable?.peopleDesc) return { ...it, description: backendStatsEditable.peopleDesc };
      return it;
    });
    const arbolesItem = {
      key: 'arboles',
      title: backendStatsEditable?.treesTitle || 'Árboles Plantados',
      value: backendStatsEditable?.treesValue || '0',
    };
    if (dynamicItems.length === 0) return [arbolesItem];
    return [dynamicItems[0], arbolesItem, ...dynamicItems.slice(1)].filter(Boolean);
  }, [baseStats, backendStatsEditable]);

  const involveData: InvolveSection | null = useMemo(() => {
    if (!pageData) return null;
    return {
      id: 'involve',
      title: '¡Involúcrate con Nosotros!',
      description: involveDescription,
      cards: [
        { id: 'volunteer', icon: '🤝', title: 'Voluntariado', description: 'Únete como voluntario en nuestras actividades.', buttonText: 'Quiero ser voluntario' },
        { id: 'entrepeneur', icon: '💚', title: 'Emprendedores', description: 'Únete como emprendedor y participa en ferias.', buttonText: 'Unirme como emprendedor' },
        { id: 'donor', icon: '💛', title: 'Donaciones', description: 'Apoya nuestra misión con una donación y transforma vidas.', buttonText: 'Quiero donar' },
      ],
    };
  }, [pageData, involveDescription]);

  const newsletterData: NewsletterSection | null = useMemo(() => {
    if (!pageData) return null;
    return {
      title: 'Mantente Informado',
      description: newsletterDescription,
      disclaimer: 'Tu información es manejada con completa confidencialidad.',
      placeholder: 'Ingresa tu correo',
      buttonText: 'Suscribirme',
    };
  }, [pageData, newsletterDescription]);

  const [belowFoldReady, setBelowFoldReady] = useState(false);
  const [openVolunteerForm, setOpenVolunteerForm]     = useState(false);
  const [openEntrepreneurForm, setOpenEntrepreneurForm] = useState(false);
  const [openDonationForm, setOpenDonationForm]       = useState(false);

  useEffect(() => {
    if (!isLoading && pageData) {
      startTransition(() => setBelowFoldReady(true));
    }
  }, [isLoading, pageData]);

  if (isLoading || error) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--mid)', fontFamily: 'var(--fn-s)', fontStyle: 'italic' }}>
            {isLoading ? 'Cargando contenido…' : 'Ocurrió un error cargando el contenido.'}
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        {heroData && <Hero data={heroData} backgroundImageUrl={heroBgUrl} />}

        {valueData && (
          <ValueProposition
            data={{ ...valueData, impactItems: backendImpactItems, dimensionItems: backendDimensionItems }}
          />
        )}

        {statsItems.length > 0 && <StatsSection items={statsItems} />}

        {belowFoldReady && (
          <>
            <React.Suspense fallback={null}>
              <Events data={Array.isArray(backendActivities) ? backendActivities as any[] : []} />
            </React.Suspense>

            <React.Suspense fallback={null}>
              <Projects projects={backendProjects || []} />
            </React.Suspense>

            <React.Suspense fallback={null}>
              <Activities data={Array.isArray(backendDisplayActivities) ? backendDisplayActivities as any[] : []} />
            </React.Suspense>

            <React.Suspense fallback={null}>
              <DonationSection
                onDonateClick={() => setOpenDonationForm(true)}
                accountsImage={section('donate')['accounts_info']}
              />
            </React.Suspense>

            <React.Suspense fallback={null}>
              <BecomeVolunteerCTA onButtonClick={() => setOpenVolunteerForm(true)} />
            </React.Suspense>

            {schoolActivities.length > 0 && (
              <React.Suspense fallback={null}>
                <Schools activities={schoolActivities} description={schoolsDescription} />
              </React.Suspense>
            )}

            <React.Suspense fallback={null}>
              <FairsPublic description={fairsDescription} />
            </React.Suspense>

            <React.Suspense fallback={null}>
              <Entrepreneurs subtitle={entrepreneursDescription} onRegisterClick={() => setOpenEntrepreneurForm(true)} />
            </React.Suspense>

            <React.Suspense fallback={null}>
              <BecomeEntrepreneurCTA onButtonClick={() => setOpenEntrepreneurForm(true)} />
            </React.Suspense>

            <React.Suspense fallback={null}>
              <News />
            </React.Suspense>

            {involveData && (
              <React.Suspense fallback={null}>
                <Involve
                  data={involveData}
                  onVolunteerClick={() => setOpenVolunteerForm(true)}
                  onEntrepreneurClick={() => setOpenEntrepreneurForm(true)}
                  onDonorClick={() => setOpenDonationForm(true)}
                />
              </React.Suspense>
            )}

            {newsletterData && (
              <React.Suspense fallback={null}>
                <Newsletter data={newsletterData} />
              </React.Suspense>
            )}

            {openVolunteerForm && (
              <React.Suspense fallback={null}>
                <VolunteerPublicForm onClose={() => setOpenVolunteerForm(false)} />
              </React.Suspense>
            )}

            {openEntrepreneurForm && (
              <React.Suspense fallback={null}>
                <GenericModal show={openEntrepreneurForm} onClose={() => setOpenEntrepreneurForm(false)} title="Formulario de Emprendedor" size="xl" maxHeight={true}>
                  <AddEntrepreneurForm onSuccess={() => setOpenEntrepreneurForm(false)} />
                </GenericModal>
              </React.Suspense>
            )}

            {openDonationForm && (
              <React.Suspense fallback={null}>
                <DonationPublicForm onClose={() => setOpenDonationForm(false)} />
              </React.Suspense>
            )}
          </>
        )}
      </main>

      <React.Suspense fallback={null}>
        <Footer />
      </React.Suspense>

      {belowFoldReady && (
        <>
          <React.Suspense fallback={null}>
            <SectionIndicator />
          </React.Suspense>
          <React.Suspense fallback={null}>
            <NewsTicker />
          </React.Suspense>
        </>
      )}
    </>
  );
};

export default PublicView;
