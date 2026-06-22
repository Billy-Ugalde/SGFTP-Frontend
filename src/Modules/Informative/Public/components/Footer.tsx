import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import footerStyles from '../styles/Footer.module.css';

import presidentaImg from '../../../../assets/Presidenta.jpg';
import tesoreraImg from '../../../../assets/Tesorera.jpg';
import directorImg from '../../../../assets/Director_ejecutivo.jpg';
import secretarioImg from '../../../../assets/Secretario.jpg';
import vocalImg from '../../../../assets/Vocal.jpg';
import vicepresidentaIMg from '../../../../assets/Vicepresidenta.jpg';

import devBrandon from '../../../../assets/Brandon.png';
import devJose from '../../../../assets/Jose.png';
import devRoberto from '../../../../assets/Roberto.png';
import devSebastian from '../../../../assets/Sebastian.png';
import devBilly from '../../../../assets/Billy.png';

import { useSectionContent } from '../../Admin/services/contentBlockService';
import { useContactInfo } from '../../Admin/services/contactInfoService';
let _formatPhoneForDisplay: ((v: string | null | undefined) => string) | null = null;
const loadPhoneFormatter = () =>
  _formatPhoneForDisplay
    ? Promise.resolve(_formatPhoneForDisplay)
    : import('../../../../shared/utils/phone.utils').then(m => {
        _formatPhoneForDisplay = m.formatPhoneForDisplay;
        return m.formatPhoneForDisplay;
      });

const API_BASE: string = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';

const getProxyImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('/images/proxy')) return url;
  if (url.includes('drive.google.com')) return `${API_BASE}/images/proxy?url=${encodeURIComponent(url)}`;
  return url;
};

const processImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.includes('drive.google.com')) return getProxyImageUrl(trimmed);
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${API_BASE}${trimmed.startsWith('/') ? trimmed : '/' + trimmed}`;
};

type Member = { name: string; role: string; photo?: string | null };

const boardFallback: Member[] = [
  { name: 'Sra. Lizbeth Cerdas Dinarte', role: 'Presidenta', photo: presidentaImg },
  { name: 'Yuly Viviana Arenas Vargas', role: 'Vice-Presidenta', photo: vicepresidentaIMg },
  { name: 'Brandon Barrantes Corea', role: 'Director ejecutivo', photo: directorImg },
  { name: 'Melissa Vargas Vargas', role: 'Tesorera', photo: tesoreraImg },
  { name: 'Carlos Roberto Pizarro Barrantes', role: 'Secretario', photo: secretarioImg },
  { name: 'Leonel Francisco Peralta Barrantes', role: 'Vocal', photo: vocalImg },
  { name: 'Leonel Francisco Peralta Barrantes', role: 'Representante Ejecutivo', photo: vocalImg },
  { name: 'Carlos Roberto Pizarro Barrantes', role: 'Representante Municipal', photo: secretarioImg },
  { name: 'Brandon Barrantes Corea', role: 'Coordinador', photo: directorImg },
];

const devTeam: Member[] = [
  { name: 'Roberto Campos Calvo', role: 'Estudiante — UNA', photo: devRoberto },
  { name: 'Sebastian Campos Calvo', role: 'Estudiante — UNA', photo: devSebastian },
  { name: 'Brandon Núñez Corrales', role: 'Estudiante — UNA', photo: devBrandon },
  { name: 'Jose Andres Picado Zamora', role: 'Estudiante — UNA', photo: devJose },
  { name: 'Billy Fabián Ugalde Villagra', role: 'Estudiante — UNA', photo: devBilly },
];

const Footer: React.FC = () => {
  const [showTeam, setShowTeam] = useState(false);
  const [showUna, setShowUna] = useState(false);
  const [formattedPhone, setFormattedPhone] = useState<string>('');

  useEffect(() => {
    document.body.style.overflow = showTeam || showUna ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showTeam, showUna]);

  const { data: boardData } = useSectionContent('home', 'board_members');
  const { data: contactInfo } = useContactInfo();

  const boardResolved: Member[] = React.useMemo(() => {
    const get = (k: string) => { const v = boardData?.[k]; return v == null ? '' : String(v).trim(); };
    const getPhoto = (photoKey: string, fallback: string | null | undefined) => {
      const url = get(photoKey);
      if (url) { const p = processImageUrl(url); if (p) return p; }
      return fallback || null;
    };
    return [
      { name: get('president_name') || boardFallback[0].name, role: boardFallback[0].role, photo: getPhoto('president_photo', boardFallback[0].photo) },
      { name: get('vice_president_name') || boardFallback[1].name, role: boardFallback[1].role, photo: getPhoto('vice_president_photo', boardFallback[1].photo) },
      { name: get('director_name') || boardFallback[2].name, role: boardFallback[2].role, photo: getPhoto('director_photo', boardFallback[2].photo) },
      { name: get('treasurer_name') || boardFallback[3].name, role: boardFallback[3].role, photo: getPhoto('treasurer_photo', boardFallback[3].photo) },
      { name: get('secretary_name') || boardFallback[4].name, role: boardFallback[4].role, photo: getPhoto('secretary_photo', boardFallback[4].photo) },
      { name: get('vocal_name') || boardFallback[5].name, role: boardFallback[5].role, photo: getPhoto('vocal_photo', boardFallback[5].photo) },
      { name: get('executive_representative_name') || boardFallback[6].name, role: boardFallback[6].role, photo: getPhoto('executive_representative_photo', boardFallback[6].photo) },
      { name: get('municipal_representative_name') || boardFallback[7].name, role: boardFallback[7].role, photo: getPhoto('municipal_representative_photo', boardFallback[7].photo) },
      { name: get('coordinator_name') || boardFallback[8].name, role: boardFallback[8].role, photo: getPhoto('coordinator_photo', boardFallback[8].photo) },
    ].filter(m => m.name.trim().length > 0);
  }, [boardData]);

  const rawPhone = (contactInfo?.phone as string | undefined) ?? '';
  useEffect(() => {
    if (!rawPhone) { setFormattedPhone('+506 2653-1234'); return; }
    loadPhoneFormatter().then(fmt => setFormattedPhone(fmt(rawPhone) || '+506 2653-1234'));
  }, [rawPhone]);

  const contactResolved = React.useMemo(() => ({
    email: (contactInfo?.email ?? 'info@tamarindoparkfoundation.com') as string,
    phone: formattedPhone || rawPhone || '+506 2653-1234',
    address: (contactInfo?.address ?? 'Tamarindo, Guanacaste, Costa Rica') as string,
  }), [contactInfo, formattedPhone, rawPhone]);

  const gm = (contactInfo?.google_maps_url ?? '') as string;
  const addressLink = React.useMemo(() =>
    gm && /^https?:\/\//i.test(gm)
      ? <a href={gm} target="_blank" rel="noopener noreferrer" className={footerStyles.footerContactLink} aria-label={`Abrir mapa de ${contactResolved.address}`}>{contactResolved.address}</a>
      : <span>{contactResolved.address}</span>
    , [gm, contactResolved.address]);

  const linksResolved = React.useMemo(() => ({
    fb: (contactInfo?.facebook_url ?? 'https://www.facebook.com/TamarindoParkFoundation') as string,
    ig: (contactInfo?.instagram_url ?? 'https://www.instagram.com/tamarindoparkfoundation/') as string,
    wa: (contactInfo?.whatsapp_url ?? 'https://api.whatsapp.com/send?phone=50664612741') as string,
    yt: (contactInfo?.youtube_url ?? 'https://www.youtube.com/@TamarindoParkFoundation') as string,
  }), [contactInfo]);

  const Modal = ({ id, title, members, onClose }: { id: string; title: string; members: Member[]; onClose: () => void }) => (
    <div className={footerStyles.footerModal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby={id}>
      <div className={footerStyles.footerModalCard} onClick={(e) => e.stopPropagation()}>
        <button className={footerStyles.footerModalClose} onClick={onClose} aria-label="Cerrar">✕</button>
        <div className={footerStyles.footerModalHead}><h3 id={id}>{title}</h3></div>
        <div className={footerStyles.teamGrid}>
          {members.map((m, i) => (
            <div key={i} className={footerStyles.memberCard}>
              <div className={footerStyles.memberAvatar}>
                {m.photo ? <img src={m.photo} alt={m.name} loading="lazy" decoding="async" /> : <div aria-hidden="true" />}
              </div>
              <div className={footerStyles.memberName}>{m.name}</div>
              <div className={footerStyles.memberRole}>{m.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.footerContent}>

        {/* ── Grid superior: 4 columnas ── */}
        <div className={footerStyles.footerTop}>

          {/* Columna 1: Marca + Contacto + Redes */}
          <div className={footerStyles.footerBrand}>
            <a href="#hero" className={footerStyles.footerLogo}>
              <div className={footerStyles.footerDot} />
              <span className={footerStyles.footerName}>Tamarindo Park Foundation</span>
            </a>
            <p className={footerStyles.footerAbout}>
              Transformando comunidades a través del desarrollo sostenible, integral y participativo en la región de Guanacaste, Costa Rica.
            </p>
            <div className={footerStyles.footerContact}>
              <a href={`mailto:${contactResolved.email}`} className={footerStyles.footerContactLink}>{contactResolved.email}</a>
              <a href={`tel:${contactResolved.phone.replace(/[\s-]/g, '')}`} className={footerStyles.footerContactLink}>{contactResolved.phone}</a>
              {addressLink}
            </div>
            <div className={footerStyles.footerSocials}>
              <a className={footerStyles.socialLink} href={linksResolved.wa} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <path d="M20.52 3.48A11.77 11.77 0 0 0 12.04 0C5.49 0 .2 5.29.2 11.84c0 2.08.54 4.1 1.56 5.9L0 24l6.42-1.67a11.75 11.75 0 0 0 5.62 1.44h.01c6.55 0 11.84-5.29 11.84-11.84 0-3.17-1.23-6.16-3.37-8.45zm-8.48 18.1h-.01a9.85 9.85 0 0 1-5.02-1.38l-.36-.21-3.81.99 1.02-3.71-.24-.38A9.83 9.83 0 0 1 2.2 11.84c0-5.42 4.41-9.83 9.85-9.83 2.63 0 5.1 1.02 6.96 2.88a9.78 9.78 0 0 1 2.88 6.95c0 5.43-4.41 9.84-9.85 9.84zm5.4-7.35c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5 0 1.47 1.08 2.89 1.23 3.09.15.2 2.13 3.26 5.16 4.57.72.31 1.29.5 1.73.64.73.23 1.39.2 1.92.12.59-.09 1.77-.72 2.02-1.43.25-.71.25-1.31.17-1.44-.07-.13-.27-.2-.57-.35z" />
                </svg>
              </a>
              <a className={footerStyles.socialLink} href={linksResolved.ig} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.06 1.96.24 2.64.52a5.3 5.3 0 0 1 1.92 1.25 5.3 5.3 0 0 1 1.25 1.92c.28.68.46 1.47.52 2.64.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.24 1.96-.52 2.64a5.3 5.3 0 0 1-1.25 1.92 5.3 5.3 0 0 1-1.92 1.25c-.68.28-1.47.46-2.64.52-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.06-1.96-.24-2.64-.52a5.3 5.3 0 0 1-1.92-1.25 5.3 5.3 0 0 1-1.25-1.92c-.28-.68-.46-1.47-.52-2.64C2.2 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.06-1.17.24-1.96.52-2.64A5.3 5.3 0 0 1 4.04 2.59 5.3 5.3 0 0 1 5.96 1.35c.68-.28 1.47-.46 2.64-.52C9.87 2.21 10.25 2.2 12 2.2zm0 1.8c-3.17 0-3.55.01-4.8.07-1.03.05-1.6.22-1.97.36-.5.19-.86.42-1.25.81-.39.39-.62.75-.81 1.25-.14.37-.31.94-.36 1.97-.06 1.25-.07 1.63-.07 4.8s.01 3.55.07 4.8c.05 1.03.22 1.6.36 1.97.19.5.42.86.81 1.25.39.39.75.62 1.25.81.37.14.94.31 1.97.36 1.25.06 1.63.07 4.8.07s3.55-.01 4.8-.07c1.03-.05 1.6-.22 1.97-.36.5-.19.86-.42 1.25-.81.39-.39.62-.75.81-1.25.14-.37.31-.94.36-1.97.06-1.25.07-1.63.07-4.8s-.01-3.55-.07-4.8c-.05-1.03-.22-1.6-.36-1.97-.19-.5-.42-.86-.81-1.25a3.5 3.5 0 0 0-1.25-.81c-.37-.14-.94-.31-1.97-.36-1.25-.06-1.63-.07-4.8-.07zm0 3.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4zm0 7.7a3 3 0 1 0 .001-6.001A3 3 0 0 0 12 15zm5.98-8.69a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2z" />
                </svg>
              </a>
              <a className={footerStyles.socialLink} href={linksResolved.fb} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <path d="M22.68 0H1.32C.59 0 0 .59 0 1.32v21.36C0 23.41.59 24 1.32 24h11.49v-9.29H9.69v-3.62h3.12V8.41c0-3.1 1.9-4.79 4.67-4.79 1.33 0 2.47.1 2.8.14v3.25h-1.92c-1.5 0-1.79.71-1.79 1.76v2.31h3.57l-.47 3.62h-3.1V24h6.08c.73 0 1.32-.59 1.32-1.32V1.32C24 .59 23.41 0 22.68 0z" />
                </svg>
              </a>
              <a className={footerStyles.socialLink} href={linksResolved.yt} aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Columna 2: Capítulos */}
          <div className={footerStyles.footerCol}>
            <h4 className={footerStyles.footerColTitle}>Capítulos</h4>
            <ul className={footerStyles.footerNavList}>
              <li><a href="#propuesta" className={footerStyles.footerNavLink}>Propuesta de Valor</a></li>
              <li><a href="#stats" className={footerStyles.footerNavLink}>Impacto</a></li>
              <li><a href="#eventos" className={footerStyles.footerNavLink}>Próximas Actividades</a></li>
              <li><a href="#proyectos" className={footerStyles.footerNavLink}>Proyectos</a></li>
              <li><a href="#realizadas" className={footerStyles.footerNavLink}>Actividades Realizadas</a></li>
              <li><a href="#donaciones" className={footerStyles.footerNavLink}>Donaciones</a></li>
              <li><a href="#become-volunteer" className={footerStyles.footerNavLink}>Voluntariado</a></li>
              <li><a href="#schools" className={footerStyles.footerNavLink}>Escuelas Participantes</a></li>
            </ul>
          </div>

          {/* Columna 3: Comunidad */}
          <div className={footerStyles.footerCol}>
            <h4 className={footerStyles.footerColTitle}>Comunidad</h4>
            <ul className={footerStyles.footerNavList}>
              <li><a href="#fairs" className={footerStyles.footerNavLink}>Ferias</a></li>
              <li><a href="#emprendedores" className={footerStyles.footerNavLink}>Emprendedores</a></li>
              <li><a href="#become-entrepreneur" className={footerStyles.footerNavLink}>Emprendimiento</a></li>
              <li><a href="#noticias" className={footerStyles.footerNavLink}>Noticias</a></li>
              <li><a href="#involve" className={footerStyles.footerNavLink}>Involúcrate</a></li>
              <li><Link to="/aviso-de-privacidad" className={footerStyles.footerNavLink}>Aviso de Privacidad</Link></li>
            </ul>
          </div>

          {/* Columna 4: Institución */}
          <div className={footerStyles.footerCol}>
            <h4 className={footerStyles.footerColTitle}>Institución</h4>
            <p className={footerStyles.footerInstitutionText}>
              Fundación sin fines de lucro registrada en Costa Rica, comprometida con la transparencia.
            </p>
            <div className={footerStyles.footerBadges}>
              <button className={`${footerStyles.footerBadge} ${footerStyles.footerBadgeJ}`} onClick={() => setShowTeam(true)}>
                Junta Directiva
              </button>
              <button className={`${footerStyles.footerBadge} ${footerStyles.footerBadgeU}`} onClick={() => setShowUna(true)}>
                Equipo UNA
              </button>
            </div>
          </div>

        </div>

        {/* ── Barra inferior ── */}
        <div className={footerStyles.footerBottom}>
          <p className={footerStyles.footerCopy}>© 2025 Fundación Tamarindo Park. Todos los derechos reservados.</p>
          <p className={footerStyles.footerCopy}>tamarindoparkfoundation.org</p>
        </div>

      </div>

      {showTeam && <Modal id="team-title" title="Junta Directiva" members={boardResolved} onClose={() => setShowTeam(false)} />}
      {showUna && <Modal id="una-title" title="Equipo de Desarrollo — UNA" members={devTeam} onClose={() => setShowUna(false)} />}
    </footer>
  );
};

export default Footer;
