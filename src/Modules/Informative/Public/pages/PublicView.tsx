import React, { useEffect, useState } from 'react';
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
import '../styles/public-view.css';
import '../styles/PublicViewHelper.css'
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
} from '../../services/informativeService';



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
        {heroData && <Hero data={heroData} />}

        {valueData && <ValueProposition data={valueData} />}

        {statsData && <StatsSection data={statsData} />}

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
